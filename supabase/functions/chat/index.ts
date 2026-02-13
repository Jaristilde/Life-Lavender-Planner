/**
 * Supabase Edge Function: chat
 *
 * RAG-powered chat endpoint that:
 * 1. Generates embedding for the user's message
 * 2. Queries knowledge_base using match_knowledge() for relevant context
 * 3. Sends context + message + history to an LLM
 * 4. Stores both user and assistant messages in chat_messages
 *
 * Deploy: supabase functions deploy chat --no-verify-jwt
 *
 * POST /chat
 * Body: { "message": "string", "history": [{ "role": "user"|"assistant", "content": "string" }] }
 * Returns: { "response": "string", "sources": [] }
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { message, history = [] } = await req.json();
    if (!message) {
      return new Response(
        JSON.stringify({ error: 'Message is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Store user message
    await supabase.from('chat_messages').insert({
      user_id: user.id,
      role: 'user',
      content: message,
    });

    // Step 1: Try to generate embedding for similarity search
    let relevantContext: string[] = [];
    const openaiKey = Deno.env.get('OPENAI_API_KEY');

    if (openaiKey) {
      try {
        // Generate embedding for the query
        const embRes = await fetch('https://api.openai.com/v1/embeddings', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openaiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'text-embedding-3-small',
            input: message,
          }),
        });
        const embData = await embRes.json();
        const queryEmbedding = embData.data?.[0]?.embedding;

        if (queryEmbedding) {
          // Query with pgvector similarity
          const { data: matches } = await supabase.rpc('match_knowledge', {
            query_embedding: queryEmbedding,
            match_threshold: 0.5,
            match_count: 5,
          });
          if (matches) {
            relevantContext = matches.map((m: any) => m.content);
          }
        }
      } catch (e) {
        console.error('Embedding search failed:', e);
      }
    }

    // Fallback: keyword-based search if no embedding results
    if (relevantContext.length === 0) {
      const { data: textMatches } = await supabase.rpc('search_knowledge_by_text', {
        search_query: message,
        result_limit: 5,
      });
      if (textMatches) {
        relevantContext = textMatches.map((m: any) => m.content);
      }
    }

    // Step 2: Generate response using LLM (or smart fallback)
    let assistantResponse = '';
    const anthropicKey = Deno.env.get('ANTHROPIC_API_KEY');

    if (openaiKey) {
      // Use OpenAI
      try {
        const systemPrompt = `You are Lavender, a warm and knowledgeable financial wellness assistant for the Lavender Life Planner app. You help users with budgeting, debt payoff, savings, self-care, goal setting, and using the app's features. Be encouraging, practical, and concise.

${relevantContext.length > 0 ? `Use this context to inform your response:\n${relevantContext.join('\n\n')}` : ''}`;

        const chatRes = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openaiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              { role: 'system', content: systemPrompt },
              ...history.slice(-10),
              { role: 'user', content: message },
            ],
            max_tokens: 500,
            temperature: 0.7,
          }),
        });
        const chatData = await chatRes.json();
        assistantResponse = chatData.choices?.[0]?.message?.content || '';
      } catch (e) {
        console.error('OpenAI chat failed:', e);
      }
    } else if (anthropicKey) {
      // Use Anthropic
      try {
        const systemPrompt = `You are Lavender, a warm financial wellness assistant. ${relevantContext.length > 0 ? `Context:\n${relevantContext.join('\n\n')}` : ''}`;
        const chatRes = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'x-api-key': anthropicKey,
            'anthropic-version': '2023-06-01',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'claude-sonnet-4-5-20250929',
            max_tokens: 500,
            system: systemPrompt,
            messages: [
              ...history.slice(-10),
              { role: 'user', content: message },
            ],
          }),
        });
        const chatData = await chatRes.json();
        assistantResponse = chatData.content?.[0]?.text || '';
      } catch (e) {
        console.error('Anthropic chat failed:', e);
      }
    }

    // Fallback: format knowledge base results as a helpful response
    if (!assistantResponse && relevantContext.length > 0) {
      assistantResponse = `Great question! Here's what I know:\n\n${relevantContext[0]}\n\n${relevantContext.length > 1 ? `Additionally:\n${relevantContext[1]}` : ''}`;
    } else if (!assistantResponse) {
      assistantResponse = "I'd love to help! Could you try rephrasing your question? I'm best at answering questions about budgeting, saving, debt payoff, the planner features, wellness tips, and goal setting.";
    }

    // Store assistant response
    await supabase.from('chat_messages').insert({
      user_id: user.id,
      role: 'assistant',
      content: assistantResponse,
    });

    return new Response(
      JSON.stringify({
        response: assistantResponse,
        sources: relevantContext.slice(0, 3),
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
