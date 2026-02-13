/**
 * Database Explorer — MCP Server Integration Component
 *
 * Demonstrates the Supabase MCP (Model Context Protocol) integration
 * by providing a UI to explore database tables, schemas, and activity.
 *
 * Uses services/mcpService.ts which wraps MCP-style tool calls.
 */

import React, { useState, useEffect } from 'react';
import { Database, Table, Activity, RefreshCw, ChevronRight, Loader2, Server, Shield } from 'lucide-react';
import { mcpService, TableInfo } from '../services/mcpService';

interface DatabaseExplorerProps {
  userId: string;
}

const DatabaseExplorer: React.FC<DatabaseExplorerProps> = ({ userId }) => {
  const [tables, setTables] = useState<TableInfo[]>([]);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [tableSchema, setTableSchema] = useState<any>(null);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [userStats, setUserStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'tables' | 'activity' | 'stats'>('tables');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [tablesResult, activityResult, statsResult] = await Promise.all([
        mcpService.executeToolCall({ tool: 'list_tables', params: {} }),
        mcpService.executeToolCall({ tool: 'get_recent_activity', params: {} }),
        mcpService.executeToolCall({ tool: 'get_user_stats', params: { userId } }),
      ]);

      if (tablesResult.success) setTables(tablesResult.data);
      if (activityResult.success) setRecentActivity(activityResult.data);
      if (statsResult.success) setUserStats(statsResult.data);
    } catch (err) {
      console.error('MCP load error:', err);
    }
    setLoading(false);
  };

  const loadSchema = async (tableName: string) => {
    setSelectedTable(tableName);
    const result = await mcpService.executeToolCall({ tool: 'get_table_schema', params: { table: tableName } });
    if (result.success) setTableSchema(result.data);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold serif text-[#7B68A6] mb-1 flex items-center gap-3">
            <Database size={32} /> Database Explorer
          </h1>
          <p className="text-gray-500 italic">Supabase MCP Server Integration — explore your database</p>
        </div>
        <button
          onClick={loadData}
          className="flex items-center gap-2 px-4 py-2 bg-[#E6D5F0] text-[#7B68A6] font-bold rounded-xl text-xs hover:bg-[#B19CD9] hover:text-white transition-all"
        >
          <RefreshCw size={14} /> Refresh
        </button>
      </header>

      {/* MCP Protocol Badge */}
      <div className="paper-card p-4 bg-gradient-to-r from-[#7B68A6]/5 to-[#B19CD9]/5 flex items-center gap-4">
        <div className="p-2 bg-[#E6D5F0] rounded-xl">
          <Server size={20} className="text-[#7B68A6]" />
        </div>
        <div className="flex-1">
          <p className="text-xs font-bold text-[#7B68A6] uppercase tracking-widest">MCP Server: Supabase</p>
          <p className="text-[10px] text-gray-400">Connected via Model Context Protocol — querying PostgreSQL database</p>
        </div>
        <div className="flex items-center gap-1 px-3 py-1 bg-[#D1F7E9] rounded-full">
          <div className="w-2 h-2 bg-[#10B981] rounded-full animate-pulse" />
          <span className="text-[10px] font-bold text-[#10B981]">Connected</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {(['tables', 'activity', 'stats'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
              activeTab === tab
                ? 'bg-[#7B68A6] text-white shadow-md'
                : 'bg-white text-gray-400 hover:text-[#7B68A6] border border-[#eee]'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={32} className="text-[#B19CD9] animate-spin" />
        </div>
      ) : (
        <>
          {/* Tables Tab */}
          {activeTab === 'tables' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tables.map(table => (
                <button
                  key={table.name}
                  onClick={() => loadSchema(table.name)}
                  className={`paper-card p-6 text-left hover:border-[#B19CD9] transition-all group ${
                    selectedTable === table.name ? 'border-[#B19CD9] bg-[#F8F7FC]' : ''
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Table size={16} className="text-[#B19CD9]" />
                      <span className="font-bold text-gray-700 text-sm">{table.name}</span>
                    </div>
                    <ChevronRight size={16} className="text-gray-300 group-hover:text-[#B19CD9] transition-colors" />
                  </div>
                  <p className="text-xs text-gray-400 mb-3">{table.description}</p>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 bg-[#E6D5F0] text-[#7B68A6] rounded-lg text-[10px] font-bold">
                      {table.rowCount >= 0 ? `${table.rowCount} rows` : 'Not created'}
                    </span>
                    <span className="px-2 py-1 bg-[#D1F7E9] text-[#10B981] rounded-lg text-[10px] font-bold flex items-center gap-1">
                      <Shield size={10} /> RLS
                    </span>
                  </div>
                </button>
              ))}

              {/* Schema Detail */}
              {tableSchema && (
                <div className="md:col-span-2 paper-card p-6 space-y-4">
                  <h3 className="font-bold text-[#7B68A6] flex items-center gap-2">
                    <Table size={18} /> {tableSchema.table} — Schema
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-[#E6D5F0]">
                          <th className="text-left py-2 px-3 font-bold text-gray-400 uppercase tracking-widest">Column</th>
                          <th className="text-left py-2 px-3 font-bold text-gray-400 uppercase tracking-widest">Type</th>
                          <th className="text-left py-2 px-3 font-bold text-gray-400 uppercase tracking-widest">Info</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tableSchema.columns.map((col: any) => (
                          <tr key={col.name} className="border-b border-gray-50 hover:bg-[#F8F7FC]">
                            <td className="py-2 px-3 font-mono font-bold text-gray-700">{col.name}</td>
                            <td className="py-2 px-3 text-[#B19CD9] font-mono">{col.type}</td>
                            <td className="py-2 px-3">
                              {col.primary && <span className="px-1.5 py-0.5 bg-[#D4AF37]/20 text-[#D4AF37] rounded text-[10px] font-bold mr-1">PK</span>}
                              {col.foreign && <span className="px-1.5 py-0.5 bg-[#3B82F6]/20 text-[#3B82F6] rounded text-[10px] font-bold">FK → {col.foreign}</span>}
                              {col.check && <span className="px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded text-[10px] font-bold">{col.check}</span>}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Activity Tab */}
          {activeTab === 'activity' && (
            <div className="paper-card p-6 space-y-4">
              <h3 className="font-bold text-[#7B68A6] flex items-center gap-2">
                <Activity size={18} /> Recent Activity
              </h3>
              {recentActivity.length === 0 ? (
                <p className="text-center text-gray-400 italic py-8">No recent activity found. Start using the chatbot or add knowledge base entries!</p>
              ) : (
                <div className="space-y-3">
                  {recentActivity.map((item, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 bg-[#F8F7FC] rounded-xl">
                      <div className={`w-2 h-2 rounded-full mt-1.5 ${item.type === 'chat_message' ? 'bg-[#B19CD9]' : 'bg-[#D4AF37]'}`} />
                      <div className="flex-1">
                        <p className="text-xs font-bold text-gray-600">{item.summary}</p>
                        <p className="text-[10px] text-gray-400">{new Date(item.timestamp).toLocaleString()}</p>
                      </div>
                      <span className="px-2 py-1 bg-white text-gray-400 rounded-lg text-[10px] font-bold">{item.type}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Stats Tab */}
          {activeTab === 'stats' && userStats && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="paper-card p-6 text-center">
                <p className="text-3xl font-bold text-[#7B68A6]">{userStats.chatMessages || 0}</p>
                <p className="text-xs text-gray-400 mt-2 font-bold uppercase tracking-widest">Chat Messages</p>
              </div>
              <div className="paper-card p-6 text-center">
                <p className="text-3xl font-bold text-[#D4AF37]">{userStats.knowledgeEntries || 0}</p>
                <p className="text-xs text-gray-400 mt-2 font-bold uppercase tracking-widest">Knowledge Entries</p>
              </div>
              <div className="paper-card p-6 text-center">
                <p className="text-3xl font-bold text-[#10B981]">{userStats.yearCount || 0}</p>
                <p className="text-xs text-gray-400 mt-2 font-bold uppercase tracking-widest">Planning Years</p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default DatabaseExplorer;
