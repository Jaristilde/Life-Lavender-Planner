/**
 * MCP (Model Context Protocol) Service — Supabase MCP Integration
 *
 * This service wraps MCP-style tool calls to query the Supabase database.
 * It provides a standardized interface for:
 *   - Listing tables and their schemas
 *   - Querying row counts
 *   - Fetching recent activity
 *
 * This uses the Supabase MCP protocol pattern where the client sends
 * structured tool-call requests and receives structured responses.
 *
 * Reference: https://supabase.com/docs/guides/ai/mcp
 */

import { supabase } from './supabaseClient';

export interface MCPToolCall {
  tool: string;
  params: Record<string, any>;
}

export interface MCPToolResult {
  success: boolean;
  data: any;
  error?: string;
}

export interface TableInfo {
  name: string;
  rowCount: number;
  description: string;
}

/**
 * MCP Service — wraps Supabase queries as MCP-style tool calls
 */
export const mcpService = {
  /**
   * Execute an MCP-style tool call against Supabase
   */
  async executeToolCall(call: MCPToolCall): Promise<MCPToolResult> {
    try {
      switch (call.tool) {
        case 'list_tables':
          return await this.listTables();
        case 'get_table_schema':
          return await this.getTableSchema(call.params.table);
        case 'query_table':
          return await this.queryTable(call.params.table, call.params.limit || 10);
        case 'get_row_count':
          return await this.getRowCount(call.params.table);
        case 'get_recent_activity':
          return await this.getRecentActivity();
        case 'get_user_stats':
          return await this.getUserStats(call.params.userId);
        default:
          return { success: false, data: null, error: `Unknown tool: ${call.tool}` };
      }
    } catch (err: any) {
      return { success: false, data: null, error: err.message };
    }
  },

  /**
   * List all application tables with descriptions
   */
  async listTables(): Promise<MCPToolResult> {
    const tables: TableInfo[] = [
      { name: 'profiles', rowCount: 0, description: 'User profiles with preferences, plan status, and settings' },
      { name: 'years', rowCount: 0, description: 'Multi-year planning data (financial, wellness, planner, etc.)' },
      { name: 'knowledge_base', rowCount: 0, description: 'RAG knowledge entries with pgvector embeddings' },
      { name: 'chat_messages', rowCount: 0, description: 'Chatbot conversation history' },
    ];

    // Get actual row counts
    for (const table of tables) {
      try {
        const { count } = await supabase
          .from(table.name)
          .select('*', { count: 'exact', head: true });
        table.rowCount = count || 0;
      } catch {
        // Table might not exist yet
        table.rowCount = -1;
      }
    }

    return { success: true, data: tables };
  },

  /**
   * Get schema information for a specific table
   */
  async getTableSchema(tableName: string): Promise<MCPToolResult> {
    const schemas: Record<string, any> = {
      profiles: {
        columns: [
          { name: 'id', type: 'uuid', primary: true },
          { name: 'name', type: 'text' },
          { name: 'mood', type: 'text' },
          { name: 'feeling', type: 'text' },
          { name: 'is_premium', type: 'boolean' },
          { name: 'onboarding_completed', type: 'boolean' },
          { name: 'bio', type: 'text' },
          { name: 'currency', type: 'text' },
          { name: 'avatar_url', type: 'text' },
          { name: 'created_at', type: 'timestamptz' },
        ],
        rls: true,
        description: 'User profiles and preferences'
      },
      years: {
        columns: [
          { name: 'id', type: 'uuid', primary: true },
          { name: 'user_id', type: 'uuid', foreign: 'auth.users' },
          { name: 'year', type: 'integer' },
          { name: 'financial_data', type: 'jsonb' },
          { name: 'wellness_data', type: 'jsonb' },
          { name: 'daily_todos', type: 'jsonb' },
          { name: 'workbook_data', type: 'jsonb' },
          { name: 'planner', type: 'jsonb' },
          { name: 'vision_board', type: 'jsonb' },
          { name: 'is_archived', type: 'boolean' },
        ],
        rls: true,
        description: 'Yearly planning data'
      },
      knowledge_base: {
        columns: [
          { name: 'id', type: 'uuid', primary: true },
          { name: 'user_id', type: 'uuid', foreign: 'auth.users' },
          { name: 'content', type: 'text' },
          { name: 'embedding', type: 'vector(1536)' },
          { name: 'metadata', type: 'jsonb' },
          { name: 'created_at', type: 'timestamptz' },
        ],
        rls: true,
        description: 'RAG knowledge base with pgvector embeddings'
      },
      chat_messages: {
        columns: [
          { name: 'id', type: 'uuid', primary: true },
          { name: 'user_id', type: 'uuid', foreign: 'auth.users' },
          { name: 'role', type: 'text', check: "IN ('user','assistant')" },
          { name: 'content', type: 'text' },
          { name: 'created_at', type: 'timestamptz' },
        ],
        rls: true,
        description: 'Chat conversation messages'
      },
    };

    const schema = schemas[tableName];
    if (!schema) {
      return { success: false, data: null, error: `Unknown table: ${tableName}` };
    }
    return { success: true, data: { table: tableName, ...schema } };
  },

  /**
   * Query rows from a table (limited)
   */
  async queryTable(tableName: string, limit: number = 10): Promise<MCPToolResult> {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .limit(limit)
      .order('created_at', { ascending: false });

    if (error) return { success: false, data: null, error: error.message };
    return { success: true, data: { table: tableName, rows: data, count: data?.length || 0 } };
  },

  /**
   * Get row count for a table
   */
  async getRowCount(tableName: string): Promise<MCPToolResult> {
    const { count, error } = await supabase
      .from(tableName)
      .select('*', { count: 'exact', head: true });

    if (error) return { success: false, data: null, error: error.message };
    return { success: true, data: { table: tableName, count: count || 0 } };
  },

  /**
   * Get recent activity across all tables
   */
  async getRecentActivity(): Promise<MCPToolResult> {
    const activity: any[] = [];

    // Recent chat messages
    try {
      const { data: messages } = await supabase
        .from('chat_messages')
        .select('id, role, content, created_at')
        .order('created_at', { ascending: false })
        .limit(5);
      if (messages) {
        activity.push(...messages.map(m => ({
          type: 'chat_message',
          summary: `${m.role}: ${m.content.substring(0, 60)}...`,
          timestamp: m.created_at,
        })));
      }
    } catch {}

    // Recent knowledge base entries
    try {
      const { data: entries } = await supabase
        .from('knowledge_base')
        .select('id, content, created_at')
        .order('created_at', { ascending: false })
        .limit(5);
      if (entries) {
        activity.push(...entries.map(e => ({
          type: 'knowledge_entry',
          summary: `Knowledge: ${e.content.substring(0, 60)}...`,
          timestamp: e.created_at,
        })));
      }
    } catch {}

    // Sort by timestamp
    activity.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return { success: true, data: activity.slice(0, 10) };
  },

  /**
   * Get user-specific statistics
   */
  async getUserStats(userId: string): Promise<MCPToolResult> {
    const stats: any = {};

    try {
      const { count: messageCount } = await supabase
        .from('chat_messages')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);
      stats.chatMessages = messageCount || 0;
    } catch { stats.chatMessages = 0; }

    try {
      const { count: kbCount } = await supabase
        .from('knowledge_base')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);
      stats.knowledgeEntries = kbCount || 0;
    } catch { stats.knowledgeEntries = 0; }

    try {
      const { count: yearCount } = await supabase
        .from('years')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);
      stats.yearCount = yearCount || 0;
    } catch { stats.yearCount = 0; }

    return { success: true, data: stats };
  },
};
