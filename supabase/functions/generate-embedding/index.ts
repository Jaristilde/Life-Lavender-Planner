/**
 * Supabase Edge Function: generate-embedding
 *
 * Generates text embeddings and stores them in the knowledge_base table.
 * Uses OpenAI's text-embedding-3-small model (or falls back to keyword indexing).
 *
 * Deploy: supabase functions deploy generate-embedding --no-verify-jwt
 * (Use --no-verify-jwt only for testing; remove in production)
 *
 * POST /generate-embedding
 * Body: { "content": "string", "metadata": {} }
 * Returns: { "id": "uuid", "embedding_generated": true }
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client with user's JWT
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user from JWT
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body
    const { content, metadata = {} } = await req.json();
    if (!content || typeof content !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Content is required and must be a string' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Try to generate embedding via OpenAI
    let embedding: number[] | null = null;
    const openaiKey = Deno.env.get('OPENAI_API_KEY');

    if (openaiKey) {
      try {
        const embeddingResponse = await fetch('https://api.openai.com/v1/embeddings', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openaiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'text-embedding-3-small',
            input: content,
          }),
        });

        const embeddingData = await embeddingResponse.json();
        if (embeddingData.data?.[0]?.embedding) {
          embedding = embeddingData.data[0].embedding;
        }
      } catch (e) {
        console.error('OpenAI embedding failed, storing without embedding:', e);
      }
    }

    // Store in knowledge_base
    const insertData: any = {
      user_id: user.id,
      content,
      metadata,
    };
    if (embedding) {
      insertData.embedding = embedding;
    }

    const { data, error } = await supabase
      .from('knowledge_base')
      .insert(insertData)
      .select('id')
      .single();

    if (error) {
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        id: data.id,
        embedding_generated: !!embedding,
        message: embedding
          ? 'Content stored with embedding'
          : 'Content stored without embedding (no OpenAI key configured)',
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
