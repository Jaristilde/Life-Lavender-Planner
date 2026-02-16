
import React, { useState } from 'react';
import { FinancialData, Debt } from '../types';
import { Plus, Trash2, BrainCircuit, Wallet, PieChart as ChartIcon, CreditCard, X, Save } from 'lucide-react';
import { generateWeeklyPriorities } from '../services/geminiService';

interface FinancialHubProps {
  financialData: FinancialData;
  updateFinancialData: (data: FinancialData) => void;
  isPremium: boolean;
  isArchived?: boolean;
}

const handleInputFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
  setTimeout(() => {
    e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, 300);
};

const parseMoneyInput = (value: string): number => {
  const cleaned = value.replace(/[^0-9.]/g, '');
  const noLeadingZeros = cleaned.replace(/^0+(?=\d)/, '');
  return parseFloat(noLeadingZeros) || 0;
};

const FinancialHub: React.FC<FinancialHubProps> = ({ financialData, updateFinancialData, isPremium, isArchived }) => {
  const [loadingAI, setLoadingAI] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newExpenseType, setNewExpenseType] = useState<'fixed' | 'variable'>('variable');
  const [newExpenseForm, setNewExpenseForm] = useState({ name: '', budget: 0, amount: 0 });

  // Safe Fallback for data
  const f = financialData || {
    income: 0,
    fixedExpenses: [],
    variableExpenses: [],
    debts: [],
    savingsGoals: [],
    weeklyPriorities: []
  };

  const fixedExpenses = f.fixedExpenses ?? [];
  const variableExpenses = f.variableExpenses ?? [];
  const debts = f.debts ?? [];

  const updateFinancial = (newF: Partial<FinancialData>) => {
    if (isArchived) return;
    updateFinancialData({ ...f, ...newF });
  };

  const handleIncomeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateFinancial({ income: parseMoneyInput(e.target.value) });
  };

  const handleAddExpense = () => {
    if (!newExpenseForm.name.trim()) return;

    const newExpense = {
      id: Math.random().toString(36).substr(2, 9),
      name: newExpenseForm.name,
      amount: newExpenseForm.amount,
      budget: newExpenseForm.budget
    };

    if (newExpenseType === 'fixed') {
      updateFinancial({ fixedExpenses: [...(f.fixedExpenses ?? []), newExpense] });
    } else {
      updateFinancial({ variableExpenses: [...(f.variableExpenses ?? []), newExpense] });
    }

    setShowAddModal(false);
    setNewExpenseForm({ name: '', budget: 0, amount: 0 });
  };

  const handleAIPriorities = async () => {
    setLoadingAI(true);
    const priorities = await generateWeeklyPriorities(f, "Lovely User");
    const newItems = (priorities || []).map((p: string) => ({ id: Math.random().toString(), text: p, completed: false }));
    updateFinancial({ weeklyPriorities: newItems });
    setLoadingAI(false);
  };

  const totalFixed = (fixedExpenses || []).reduce((s, e) => s + (e?.amount ?? 0), 0);
  const totalVariableBudget = (variableExpenses || []).reduce((s, e) => s + (e?.budget ?? 0), 0);
  const totalVariableSpent = (variableExpenses || []).reduce((s, e) => s + (e?.amount ?? 0), 0);
  const totalSpent = totalFixed + totalVariableSpent;

  return (
    <div className="space-y-10">
      <header className="sticky z-10 bg-[#F8F7FC] pb-2 flex flex-col md:flex-row items-start md:items-center justify-between gap-3" style={{ top: 'calc(33px + env(safe-area-inset-top))' }}>
        <div>
          <h1 className="text-xl md:text-3xl font-bold mb-0.5">Financial Hub</h1>
          <p className="text-gray-500 text-sm">Manage your wealth with intention and grace.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setNewExpenseType('variable');
              setShowAddModal(true);
            }}
            className="flex items-center gap-1.5 bg-[#B19CD9] text-white px-4 py-2 rounded-xl hover:bg-opacity-90 transition-all shadow-sm text-sm font-bold"
          >
            <Plus size={16} />
            Add Expense
          </button>
          {isPremium && (
            <button
              onClick={handleAIPriorities}
              disabled={loadingAI}
              className="flex items-center gap-1.5 bg-[#7B68A6] text-white px-4 py-2 rounded-xl hover:bg-opacity-90 transition-all shadow-sm text-sm font-bold disabled:opacity-50"
            >
              <BrainCircuit size={16} />
              {loadingAI ? 'Analyzing...' : 'AI Priorities'}
            </button>
          )}
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="paper-card p-8 space-y-6">
          <div className="flex items-center gap-3 border-b border-[#eee] pb-4">
            <Wallet className="text-[#B19CD9]" />
            <h2 className="text-base font-bold">Monthly Snapshot</h2>
          </div>
          
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2 block">Total Monthly Income</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
              <input
                type="text"
                inputMode="decimal"
                value={f.income || ''}
                placeholder="0"
                readOnly={isArchived}
                onChange={handleIncomeChange}
                onFocus={handleInputFocus}
                className="w-full pl-10 pr-4 py-3 bg-[#F8F7FC] border border-[#E6D5F0] rounded-xl text-xl font-bold focus:ring-2 focus:ring-[#B19CD9] outline-none"
                style={{ fontSize: '16px' }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4">
            <div className="p-4 bg-[#F8F7FC] rounded-xl">
              <span className="text-xs font-semibold text-gray-400 block mb-1">Total Fixed</span>
              <span className="text-xl font-bold">${(totalFixed ?? 0).toLocaleString()}</span>
            </div>
            <div className="p-4 bg-[#F8F7FC] rounded-xl">
              <span className="text-xs font-semibold text-gray-400 block mb-1">Variable Budget</span>
              <span className="text-xl font-bold">${(totalVariableBudget ?? 0).toLocaleString()}</span>
            </div>
          </div>

          <div className="p-6 bg-[#B19CD9]/10 rounded-2xl">
            <div className="flex justify-between items-center mb-2">
               <span className="text-sm font-bold text-[#7B68A6]">Total Spent</span>
               <span className="text-sm font-bold text-[#7B68A6]">${(totalSpent ?? 0).toLocaleString()}</span>
            </div>
            <div className="h-2 w-full bg-white rounded-full overflow-hidden">
               <div 
                 className="h-full bg-[#B19CD9] transition-all" 
                 style={{ width: `${Math.min(((totalSpent ?? 0) / (f.income || 1)) * 100, 100)}%` }} 
               />
            </div>
            <p className="text-[10px] text-gray-400 mt-2 uppercase tracking-widest text-center">
              {Math.round(((totalSpent ?? 0) / (f.income || 1)) * 100)}% of income utilized
            </p>
          </div>
        </div>

        <div className="paper-card p-8 lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <ChartIcon className="text-[#B19CD9]" />
              <h2 className="text-base font-bold">Expense Breakdown</h2>
            </div>
          </div>

          <div className="space-y-8">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-4 px-2">Fixed Expenses</h3>
              <div className="space-y-3">
                {(fixedExpenses || []).map((exp, idx) => (
                  <div key={exp?.id || idx} className="flex items-center gap-4 bg-[#F8F7FC] p-3 rounded-xl border border-transparent hover:border-[#E6D5F0] transition-all">
                    <input
                      className="flex-1 bg-transparent border-none outline-none font-medium"
                      value={exp?.name || ''}
                      readOnly={isArchived}
                      onFocus={handleInputFocus}
                      onChange={(e) => {
                        const newList = [...(f.fixedExpenses ?? [])];
                        newList[idx] = { ...newList[idx], name: e.target.value };
                        updateFinancial({ fixedExpenses: newList });
                      }}
                    />
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                      <input
                        type="text"
                        inputMode="decimal"
                        className="w-24 pl-6 pr-3 py-1 bg-white border border-[#E6D5F0] rounded-lg outline-none focus:ring-1 focus:ring-[#B19CD9]"
                        value={exp?.amount || ''}
                        placeholder="0"
                        readOnly={isArchived}
                        onFocus={handleInputFocus}
                        onChange={(e) => {
                          const newList = [...(f.fixedExpenses ?? [])];
                          newList[idx] = { ...newList[idx], amount: parseMoneyInput(e.target.value) };
                          updateFinancial({ fixedExpenses: newList });
                        }}
                      />
                    </div>
                    <button 
                      onClick={() => updateFinancial({ fixedExpenses: (f.fixedExpenses ?? []).filter(i => i.id !== exp.id) })}
                      disabled={isArchived}
                      className="text-gray-300 hover:text-red-400 transition-colors disabled:opacity-30"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
                {(fixedExpenses || []).length === 0 && (
                  <p className="text-center text-gray-400 text-sm italic py-4">No fixed expenses yet.</p>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-4 px-2">Variable & Lifestyle</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(variableExpenses || []).map((exp, idx) => (
                  <div key={exp?.id || idx} className="paper-card p-4 bg-white border-[#E6D5F0] hover:shadow-md transition-shadow">
                    <div className="flex justify-between mb-3">
                      <input
                        className="font-bold text-gray-700 bg-transparent border-none focus:outline-none"
                        value={exp?.name || ''}
                        readOnly={isArchived}
                        onFocus={handleInputFocus}
                        onChange={(e) => {
                          const newList = [...(f.variableExpenses ?? [])];
                          newList[idx] = { ...newList[idx], name: e.target.value };
                          updateFinancial({ variableExpenses: newList });
                        }}
                      />
                      <button 
                        onClick={() => updateFinancial({ variableExpenses: (f.variableExpenses ?? []).filter(i => i.id !== exp.id) })}
                        disabled={isArchived}
                        className="disabled:opacity-30"
                      >
                        <Trash2 size={14} className="text-gray-300 hover:text-red-400" />
                      </button>
                    </div>
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <label className="text-[10px] uppercase font-bold text-gray-400">Budget</label>
                        <input
                          type="text"
                          inputMode="decimal"
                          className="w-full text-sm font-medium border-b border-[#eee] focus:border-[#B19CD9] outline-none pb-1"
                          value={exp?.budget || ''}
                          placeholder="0"
                          readOnly={isArchived}
                          onFocus={handleInputFocus}
                          onChange={(e) => {
                            const newList = [...(f.variableExpenses ?? [])];
                            newList[idx] = { ...newList[idx], budget: parseMoneyInput(e.target.value) };
                            updateFinancial({ variableExpenses: newList });
                          }}
                        />
                      </div>
                      <div className="flex-1">
                        <label className="text-[10px] uppercase font-bold text-gray-400">Actual</label>
                        <input
                          type="text"
                          inputMode="decimal"
                          className="w-full text-sm font-medium border-b border-[#eee] focus:border-[#B19CD9] outline-none pb-1"
                          value={exp?.amount || ''}
                          placeholder="0"
                          readOnly={isArchived}
                          onFocus={handleInputFocus}
                          onChange={(e) => {
                            const newList = [...(f.variableExpenses ?? [])];
                            newList[idx] = { ...newList[idx], amount: parseMoneyInput(e.target.value) };
                            updateFinancial({ variableExpenses: newList });
                          }}
                        />
                      </div>
                    </div>
                    <div className="mt-4 h-1.5 w-full bg-[#F8F7FC] rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${(exp?.amount ?? 0) > (exp?.budget ?? 0) ? 'bg-red-400' : 'bg-[#B19CD9]'}`} 
                        style={{ width: `${Math.min(((exp?.amount ?? 0) / (exp?.budget || 1)) * 100, 100)}%` }} 
                      />
                    </div>
                  </div>
                ))}
                {(variableExpenses || []).length === 0 && (
                  <p className="col-span-2 text-center text-gray-400 text-sm italic py-4">No variable expenses yet.</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="paper-card p-8 lg:col-span-3">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <CreditCard className="text-[#B19CD9]" />
              <h2 className="text-base font-bold">Debt Payoff Tracker</h2>
            </div>
            <button 
              onClick={() => {
                const newDebt: Debt = {
                  id: Math.random().toString(),
                  name: 'New Debt',
                  balance: 0,
                  interestRate: 0,
                  minimumPayment: 0,
                  targetDate: '',
                  payments: []
                };
                updateFinancial({ debts: [...(f.debts ?? []), newDebt] });
              }}
              disabled={isArchived}
              className="px-4 py-2 bg-[#E6D5F0] text-[#7B68A6] rounded-xl font-bold text-sm hover:bg-[#B19CD9] hover:text-white transition-all disabled:opacity-30"
            >
              Add Debt Account
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {(debts || []).map((debt, idx) => (
              <div key={debt?.id || idx} className="paper-card p-6 bg-gradient-to-br from-white to-[#F8F7FC] border-[#E6D5F0]">
                <input
                  className="text-lg font-bold bg-transparent border-none outline-none mb-4 w-full"
                  value={debt?.name || ''}
                  readOnly={isArchived}
                  onFocus={handleInputFocus}
                  onChange={(e) => {
                    const newList = [...(f.debts ?? [])];
                    newList[idx] = { ...newList[idx], name: e.target.value };
                    updateFinancial({ debts: newList });
                  }}
                />
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-gray-400 uppercase">Balance</span>
                    <input
                      type="text"
                      inputMode="decimal"
                      className="w-24 text-right font-bold border-b border-transparent focus:border-[#B19CD9] outline-none"
                      value={debt?.balance || ''}
                      placeholder="0"
                      readOnly={isArchived}
                      onFocus={handleInputFocus}
                      onChange={(e) => {
                        const newList = [...(f.debts ?? [])];
                        newList[idx] = { ...newList[idx], balance: parseMoneyInput(e.target.value) };
                        updateFinancial({ debts: newList });
                      }}
                    />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-gray-400 uppercase">Interest Rate</span>
                    <div className="flex items-center">
                      <input
                        type="text"
                        inputMode="decimal"
                        className="w-12 text-right text-sm border-b border-transparent focus:border-[#B19CD9] outline-none"
                        value={debt?.interestRate || ''}
                        placeholder="0"
                        readOnly={isArchived}
                        onFocus={handleInputFocus}
                        onChange={(e) => {
                          const newList = [...(f.debts ?? [])];
                          newList[idx] = { ...newList[idx], interestRate: parseMoneyInput(e.target.value) };
                          updateFinancial({ debts: newList });
                        }}
                      />
                      <span className="text-sm ml-1">%</span>
                    </div>
                  </div>
                </div>
                <div className="mt-6 pt-6 border-t border-[#eee]">
                   <button 
                     onClick={() => updateFinancial({ debts: (f.debts ?? []).filter(d => d.id !== debt.id) })}
                     disabled={isArchived}
                     className="text-xs font-bold text-red-300 hover:text-red-500 uppercase tracking-widest disabled:opacity-30"
                   >
                     Close Account
                   </button>
                </div>
              </div>
            ))}
            {(debts || []).length === 0 && (
              <p className="col-span-full text-center text-gray-400 text-sm italic py-8 border-2 border-dashed border-[#eee] rounded-2xl">
                No debt accounts tracked yet. Focus on freedom.
              </p>
            )}
          </div>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white rounded-[32px] p-8 shadow-2xl space-y-6">
            <h2 className="text-2xl serif font-bold text-[#7B68A6]">Add Expense</h2>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase">Name</label>
                <input
                  className="w-full p-4 bg-[#F8F7FC] border rounded-2xl outline-none"
                  value={newExpenseForm.name}
                  onFocus={handleInputFocus}
                  onChange={e => setNewExpenseForm({...newExpenseForm, name: e.target.value})}
                />
              </div>
              <div className="flex gap-4">
                 <div className="flex-1">
                   <label className="text-xs font-bold text-gray-400 uppercase">Budget/Amount</label>
                   <input
                    type="text"
                    inputMode="decimal"
                    className="w-full p-4 bg-[#F8F7FC] border rounded-2xl outline-none"
                    value={newExpenseForm.budget || ''}
                    placeholder="0"
                    onFocus={handleInputFocus}
                    onChange={e => {
                      const val = parseMoneyInput(e.target.value);
                      setNewExpenseForm({...newExpenseForm, budget: val, amount: val});
                    }}
                   />
                 </div>
                 <div className="flex-1">
                    <label className="text-xs font-bold text-gray-400 uppercase">Category</label>
                    <select 
                      className="w-full p-4 bg-[#F8F7FC] border rounded-2xl outline-none"
                      value={newExpenseType}
                      onChange={e => setNewExpenseType(e.target.value as any)}
                    >
                      <option value="fixed">Fixed</option>
                      <option value="variable">Variable</option>
                    </select>
                 </div>
              </div>
            </div>
            <div className="flex gap-4">
               <button onClick={() => setShowAddModal(false)} className="flex-1 py-4 border rounded-2xl font-bold">Cancel</button>
               <button onClick={handleAddExpense} className="flex-1 py-4 bg-[#B19CD9] text-white rounded-2xl font-bold shadow-lg">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinancialHub;
