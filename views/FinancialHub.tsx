
import React, { useState } from 'react';
import { YearData, Debt } from '../types';
import { Plus, Trash2, BrainCircuit, Wallet, PieChart as ChartIcon, CreditCard, X, Save } from 'lucide-react';
import { generateWeeklyPriorities } from '../services/geminiService';

const FinancialHub: React.FC<{ data: YearData; updateData: (d: YearData) => void; isPremium: boolean }> = ({ data, updateData, isPremium }) => {
  const [loadingAI, setLoadingAI] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newExpenseType, setNewExpenseType] = useState<'fixed' | 'variable'>('variable');
  const [newExpenseForm, setNewExpenseForm] = useState({ name: '', budget: 0, amount: 0 });

  const f = data.financial;

  const updateFinancial = (newF: Partial<typeof f>) => {
    if (data.isArchived) return;
    updateData({ ...data, financial: { ...f, ...newF } });
  };

  const handleIncomeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateFinancial({ income: Number(e.target.value) });
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
      updateFinancial({ fixedExpenses: [...f.fixedExpenses, newExpense] });
    } else {
      updateFinancial({ variableExpenses: [...f.variableExpenses, newExpense] });
    }

    setShowAddModal(false);
    setNewExpenseForm({ name: '', budget: 0, amount: 0 });
  };

  const handleAIPriorities = async () => {
    setLoadingAI(true);
    const priorities = await generateWeeklyPriorities(f, "Lovely User");
    const newItems = priorities.map((p: string) => ({ id: Math.random().toString(), text: p, completed: false }));
    updateFinancial({ weeklyPriorities: newItems });
    setLoadingAI(false);
  };

  const totalFixed = f.fixedExpenses.reduce((s, e) => s + e.amount, 0);
  const totalVariableBudget = f.variableExpenses.reduce((s, e) => s + e.budget, 0);
  const totalSpent = totalFixed + f.variableExpenses.reduce((s, e) => s + e.amount, 0);

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold mb-1">Financial Hub</h1>
          <p className="text-gray-500">Manage your wealth with intention and grace.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => {
              setNewExpenseType('variable');
              setShowAddModal(true);
            }}
            className="flex items-center gap-2 bg-[#B19CD9] text-white px-5 py-3 rounded-xl hover:bg-opacity-90 transition-all shadow-lg shadow-[#B19CD9]/20"
          >
            <Plus size={20} />
            Add Expense
          </button>
          {isPremium && (
            <button 
              onClick={handleAIPriorities}
              disabled={loadingAI}
              className="flex items-center gap-2 bg-[#7B68A6] text-white px-5 py-3 rounded-xl hover:bg-opacity-90 transition-all shadow-lg shadow-[#7B68A6]/20 disabled:opacity-50"
            >
              <BrainCircuit size={20} />
              {loadingAI ? 'Analyzing...' : 'AI Weekly Priorities'}
            </button>
          )}
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Income & Summary */}
        <div className="paper-card p-8 space-y-6">
          <div className="flex items-center gap-3 border-b border-[#eee] pb-4">
            <Wallet className="text-[#B19CD9]" />
            <h2 className="text-xl font-bold">Monthly Snapshot</h2>
          </div>
          
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2 block">Total Monthly Income</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
              <input 
                type="number" 
                value={f.income}
                readOnly={data.isArchived}
                onChange={handleIncomeChange}
                className="w-full pl-10 pr-4 py-3 bg-[#F8F7FC] border border-[#E6D5F0] rounded-xl text-xl font-bold focus:ring-2 focus:ring-[#B19CD9] outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4">
            <div className="p-4 bg-[#F8F7FC] rounded-xl">
              <span className="text-xs font-semibold text-gray-400 block mb-1">Total Fixed</span>
              <span className="text-xl font-bold">${totalFixed.toLocaleString()}</span>
            </div>
            <div className="p-4 bg-[#F8F7FC] rounded-xl">
              <span className="text-xs font-semibold text-gray-400 block mb-1">Variable Budget</span>
              <span className="text-xl font-bold">${totalVariableBudget.toLocaleString()}</span>
            </div>
          </div>

          <div className="p-6 bg-[#B19CD9]/10 rounded-2xl">
            <div className="flex justify-between items-center mb-2">
               <span className="text-sm font-bold text-[#7B68A6]">Total Spent</span>
               <span className="text-sm font-bold text-[#7B68A6]">${totalSpent.toLocaleString()}</span>
            </div>
            <div className="h-2 w-full bg-white rounded-full overflow-hidden">
               <div 
                 className="h-full bg-[#B19CD9] transition-all" 
                 style={{ width: `${Math.min((totalSpent / (f.income || 1)) * 100, 100)}%` }} 
               />
            </div>
            <p className="text-[10px] text-gray-400 mt-2 uppercase tracking-widest text-center">
              {Math.round((totalSpent / (f.income || 1)) * 100)}% of income utilized
            </p>
          </div>
        </div>

        {/* Expenses List */}
        <div className="paper-card p-8 lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <ChartIcon className="text-[#B19CD9]" />
              <h2 className="text-xl font-bold">Expense Breakdown</h2>
            </div>
          </div>

          <div className="space-y-8">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-4 px-2">Fixed Expenses</h3>
              <div className="space-y-3">
                {f.fixedExpenses.map((exp, idx) => (
                  <div key={exp.id} className="flex items-center gap-4 bg-[#F8F7FC] p-3 rounded-xl border border-transparent hover:border-[#E6D5F0] transition-all">
                    <input 
                      className="flex-1 bg-transparent border-none outline-none font-medium"
                      value={exp.name}
                      readOnly={data.isArchived}
                      onChange={(e) => {
                        const newList = [...f.fixedExpenses];
                        newList[idx].name = e.target.value;
                        updateFinancial({ fixedExpenses: newList });
                      }}
                    />
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                      <input 
                        type="number"
                        className="w-24 pl-6 pr-3 py-1 bg-white border border-[#E6D5F0] rounded-lg outline-none focus:ring-1 focus:ring-[#B19CD9]"
                        value={exp.amount}
                        readOnly={data.isArchived}
                        onChange={(e) => {
                          const newList = [...f.fixedExpenses];
                          newList[idx].amount = Number(e.target.value);
                          updateFinancial({ fixedExpenses: newList });
                        }}
                      />
                    </div>
                    <button 
                      onClick={() => updateFinancial({ fixedExpenses: f.fixedExpenses.filter(i => i.id !== exp.id) })}
                      disabled={data.isArchived}
                      className="text-gray-300 hover:text-red-400 transition-colors disabled:opacity-30"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-4 px-2">Variable & Lifestyle</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {f.variableExpenses.map((exp, idx) => (
                  <div key={exp.id} className="paper-card p-4 bg-white border-[#E6D5F0] hover:shadow-md transition-shadow">
                    <div className="flex justify-between mb-3">
                      <input 
                        className="font-bold text-gray-700 bg-transparent border-none focus:outline-none"
                        value={exp.name}
                        readOnly={data.isArchived}
                        onChange={(e) => {
                          const newList = [...f.variableExpenses];
                          newList[idx].name = e.target.value;
                          updateFinancial({ variableExpenses: newList });
                        }}
                      />
                      <button 
                        onClick={() => updateFinancial({ variableExpenses: f.variableExpenses.filter(i => i.id !== exp.id) })}
                        disabled={data.isArchived}
                        className="disabled:opacity-30"
                      >
                        <Trash2 size={14} className="text-gray-300 hover:text-red-400" />
                      </button>
                    </div>
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <label className="text-[10px] uppercase font-bold text-gray-400">Budget</label>
                        <input 
                          type="number"
                          className="w-full text-sm font-medium border-b border-[#eee] focus:border-[#B19CD9] outline-none pb-1"
                          value={exp.budget}
                          readOnly={data.isArchived}
                          onChange={(e) => {
                            const newList = [...f.variableExpenses];
                            newList[idx].budget = Number(e.target.value);
                            updateFinancial({ variableExpenses: newList });
                          }}
                        />
                      </div>
                      <div className="flex-1">
                        <label className="text-[10px] uppercase font-bold text-gray-400">Actual</label>
                        <input 
                          type="number"
                          className="w-full text-sm font-medium border-b border-[#eee] focus:border-[#B19CD9] outline-none pb-1"
                          value={exp.amount}
                          readOnly={data.isArchived}
                          onChange={(e) => {
                            const newList = [...f.variableExpenses];
                            newList[idx].amount = Number(e.target.value);
                            updateFinancial({ variableExpenses: newList });
                          }}
                        />
                      </div>
                    </div>
                    <div className="mt-4 h-1.5 w-full bg-[#F8F7FC] rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${exp.amount > exp.budget ? 'bg-red-400' : 'bg-[#B19CD9]'}`} 
                        style={{ width: `${Math.min((exp.amount / (exp.budget || 1)) * 100, 100)}%` }} 
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Debt Tracker */}
        <div className="paper-card p-8 lg:col-span-3">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <CreditCard className="text-[#B19CD9]" />
              <h2 className="text-xl font-bold">Debt Payoff Tracker</h2>
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
                updateFinancial({ debts: [...f.debts, newDebt] });
              }}
              disabled={data.isArchived}
              className="px-4 py-2 bg-[#E6D5F0] text-[#7B68A6] rounded-xl font-bold text-sm hover:bg-[#B19CD9] hover:text-white transition-all disabled:opacity-30"
            >
              Add Debt Account
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {f.debts.map((debt, idx) => (
              <div key={debt.id} className="paper-card p-6 bg-gradient-to-br from-white to-[#F8F7FC] border-[#E6D5F0]">
                <input 
                  className="text-lg font-bold bg-transparent border-none outline-none mb-4 w-full"
                  value={debt.name}
                  readOnly={data.isArchived}
                  onChange={(e) => {
                    const newList = [...f.debts];
                    newList[idx].name = e.target.value;
                    updateFinancial({ debts: newList });
                  }}
                />
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-gray-400 uppercase">Balance</span>
                    <input 
                      type="number"
                      className="w-24 text-right font-bold border-b border-transparent focus:border-[#B19CD9] outline-none"
                      value={debt.balance}
                      readOnly={data.isArchived}
                      onChange={(e) => {
                        const newList = [...f.debts];
                        newList[idx].balance = Number(e.target.value);
                        updateFinancial({ debts: newList });
                      }}
                    />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-gray-400 uppercase">Interest Rate</span>
                    <div className="flex items-center">
                      <input 
                        type="number"
                        className="w-12 text-right text-sm border-b border-transparent focus:border-[#B19CD9] outline-none"
                        value={debt.interestRate}
                        readOnly={data.isArchived}
                        onChange={(e) => {
                          const newList = [...f.debts];
                          newList[idx].interestRate = Number(e.target.value);
                          updateFinancial({ debts: newList });
                        }}
                      />
                      <span className="text-sm ml-1">%</span>
                    </div>
                  </div>
                </div>
                <div className="mt-6 pt-6 border-t border-[#eee]">
                   <button 
                     onClick={() => updateFinancial({ debts: f.debts.filter(d => d.id !== debt.id) })}
                     disabled={data.isArchived}
                     className="text-xs font-bold text-red-300 hover:text-red-500 uppercase tracking-widest disabled:opacity-30"
                   >
                     Close Account
                   </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add Expense Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8">
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#E6D5F0] rounded-xl"><Plus className="text-[#7B68A6]" /></div>
                  <h2 className="serif text-2xl font-bold text-[#7B68A6]">New Budget Category</h2>
                </div>
                <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <X size={20} className="text-gray-400" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="flex p-1 bg-[#F8F7FC] rounded-2xl">
                  <button 
                    onClick={() => setNewExpenseType('variable')}
                    className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${newExpenseType === 'variable' ? 'bg-white shadow-sm text-[#7B68A6]' : 'text-gray-400'}`}
                  >
                    Variable
                  </button>
                  <button 
                    onClick={() => setNewExpenseType('fixed')}
                    className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${newExpenseType === 'fixed' ? 'bg-white shadow-sm text-[#7B68A6]' : 'text-gray-400'}`}
                  >
                    Fixed
                  </button>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase text-gray-400 tracking-widest">Category Name</label>
                  <input 
                    className="w-full p-4 bg-[#F8F7FC] border border-[#E6D5F0] rounded-2xl outline-none focus:ring-2 focus:ring-[#B19CD9]"
                    placeholder="e.g. Shopping, Rent, Gifts..."
                    value={newExpenseForm.name}
                    onChange={(e) => setNewExpenseForm({ ...newExpenseForm, name: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase text-gray-400 tracking-widest">
                      {newExpenseType === 'fixed' ? 'Amount' : 'Budget Target'}
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                      <input 
                        type="number"
                        className="w-full pl-8 pr-4 py-3 bg-[#F8F7FC] border border-[#E6D5F0] rounded-2xl outline-none focus:ring-2 focus:ring-[#B19CD9]"
                        value={newExpenseForm.budget}
                        onChange={(e) => setNewExpenseForm({ ...newExpenseForm, budget: Number(e.target.value) })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase text-gray-400 tracking-widest">Initial Spent</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                      <input 
                        type="number"
                        className="w-full pl-8 pr-4 py-3 bg-[#F8F7FC] border border-[#E6D5F0] rounded-2xl outline-none focus:ring-2 focus:ring-[#B19CD9]"
                        value={newExpenseForm.amount}
                        onChange={(e) => setNewExpenseForm({ ...newExpenseForm, amount: Number(e.target.value) })}
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <button 
                    onClick={handleAddExpense}
                    className="w-full py-4 bg-[#B19CD9] text-white font-bold rounded-2xl hover:bg-[#7B68A6] transition-all shadow-lg shadow-[#B19CD9]/20 flex items-center justify-center gap-2"
                  >
                    <Save size={18} />
                    Create Category
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinancialHub;
