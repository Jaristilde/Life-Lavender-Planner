
import React, { useState } from 'react';
import { YearData, Priority } from '../types';
import { Coffee, Dumbbell, Map, CheckCircle2, Plus, Clock, Trash2, CheckSquare, Square, X, Sparkles, Footprints, Flame, Timer, Waves, Bike } from 'lucide-react';

const WORKOUT_TYPES = [
  { name: 'Yoga', icon: <Sparkles size={20} />, color: 'bg-purple-100 text-purple-600' },
  { name: 'Pilates', icon: <Dumbbell size={20} />, color: 'bg-indigo-100 text-indigo-600' },
  { name: 'Walking', icon: <Footprints size={20} />, color: 'bg-green-100 text-green-600' },
  { name: 'Running', icon: <Flame size={20} />, color: 'bg-orange-100 text-orange-600' },
  { name: 'Strength', icon: <Dumbbell size={20} />, color: 'bg-blue-100 text-blue-600' },
  { name: 'HIIT', icon: <Timer size={20} />, color: 'bg-red-100 text-red-600' },
  { name: 'Cycling', icon: <Bike size={20} />, color: 'bg-cyan-100 text-cyan-600' },
  { name: 'Swimming', icon: <Waves size={20} />, color: 'bg-sky-100 text-sky-600' },
];

const WellnessTracker: React.FC<{ data: YearData; updateData: (d: YearData) => void }> = ({ data, updateData }) => {
  const [newTask, setNewTask] = useState('');
  const [newChecklistItem, setNewChecklistItem] = useState<Record<string, string>>({});
  const [isWorkoutModalOpen, setIsWorkoutModalOpen] = useState(false);
  const [selectedWorkout, setSelectedWorkout] = useState(WORKOUT_TYPES[0]);
  const [workoutDuration, setWorkoutDuration] = useState(30);

  const w = data.wellness;

  const updateWellness = (newW: Partial<typeof w>) => {
    updateData({ ...data, wellness: { ...w, ...newW } });
  };

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    const task = {
      id: Math.random().toString(),
      text: newTask,
      completed: false,
      priority: 'medium' as Priority,
      category: 'General'
    };
    updateWellness({ dailyToDos: [task, ...w.dailyToDos] });
    setNewTask('');
  };

  const toggleTask = (id: string) => {
    updateWellness({
      dailyToDos: w.dailyToDos.map(t => t.id === id ? { ...t, completed: !t.completed } : t)
    });
  };

  const handleLogWorkout = () => {
    const workout = {
      id: Math.random().toString(),
      date: new Date().toISOString().split('T')[0],
      type: selectedWorkout.name,
      duration: workoutDuration,
      completed: true
    };
    updateWellness({ workouts: [workout, ...w.workouts] });
    setIsWorkoutModalOpen(false);
  };

  const addMeTime = (type: string) => {
    const entry = {
      id: Math.random().toString(),
      date: new Date().toISOString().split('T')[0],
      type,
      hours: 1
    };
    updateWellness({ meTime: [entry, ...w.meTime] });
  };

  const addChecklistItem = (vacId: string) => {
    const text = newChecklistItem[vacId];
    if (!text?.trim()) return;
    
    const newList = w.vacations.map(v => {
      if (v.id === vacId) {
        return { 
          ...v, 
          checklist: [...(v.checklist || []), { text: text.trim(), done: false }] 
        };
      }
      return v;
    });
    
    updateWellness({ vacations: newList });
    setNewChecklistItem({ ...newChecklistItem, [vacId]: '' });
  };

  const toggleChecklistItem = (vacId: string, itemIndex: number) => {
    const newList = w.vacations.map(v => {
      if (v.id === vacId) {
        const newChecklist = [...v.checklist];
        newChecklist[itemIndex] = { ...newChecklist[itemIndex], done: !newChecklist[itemIndex].done };
        return { ...v, checklist: newChecklist };
      }
      return v;
    });
    updateWellness({ vacations: newList });
  };

  const removeChecklistItem = (vacId: string, itemIndex: number) => {
    const newList = w.vacations.map(v => {
      if (v.id === vacId) {
        const newChecklist = v.checklist.filter((_, i) => i !== itemIndex);
        return { ...v, checklist: newChecklist };
      }
      return v;
    });
    updateWellness({ vacations: newList });
  };

  const removeVacation = (vacId: string) => {
    updateWellness({ vacations: w.vacations.filter(v => v.id !== vacId) });
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header>
        <h1 className="text-4xl font-bold mb-1">Wellness Tracker</h1>
        <p className="text-gray-500 italic">"Pour into yourself so you can overflow into the world."</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Daily To-Dos */}
        <div className="paper-card p-8 flex flex-col h-[600px]">
          <div className="flex items-center gap-3 mb-6">
            <CheckCircle2 className="text-[#B19CD9]" />
            <h2 className="text-xl font-bold">Daily Rituals</h2>
          </div>
          
          <form onSubmit={addTask} className="mb-6">
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="What's your priority today?"
                className="flex-1 px-4 py-2 bg-[#F8F7FC] border border-[#E6D5F0] rounded-xl outline-none focus:ring-2 focus:ring-[#B19CD9]"
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
              />
              <button className="p-2 bg-[#B19CD9] text-white rounded-xl shadow-lg shadow-[#B19CD9]/20">
                <Plus />
              </button>
            </div>
          </form>

          <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2">
            {w.dailyToDos.map(task => (
              <div 
                key={task.id} 
                className={`flex items-center gap-3 p-3 rounded-xl border border-[#eee] transition-all cursor-pointer ${task.completed ? 'bg-[#F8F7FC] opacity-60' : 'bg-white'}`}
                onClick={() => toggleTask(task.id)}
              >
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${task.completed ? 'bg-[#B19CD9] border-[#B19CD9]' : 'border-[#E6D5F0]'}`}>
                  {task.completed && <div className="w-2 h-2 bg-white rounded-full" />}
                </div>
                <span className={`flex-1 font-medium ${task.completed ? 'line-through text-gray-400' : 'text-gray-700'}`}>{task.text}</span>
                <button onClick={(e) => { e.stopPropagation(); updateWellness({ dailyToDos: w.dailyToDos.filter(t => t.id !== task.id) })}}>
                   <Trash2 size={14} className="text-gray-300 hover:text-red-400" />
                </button>
              </div>
            ))}
            {w.dailyToDos.length === 0 && (
              <div className="text-center py-12 text-gray-400 italic">No tasks yet.</div>
            )}
          </div>
        </div>

        {/* Workout Tracker */}
        <div className="paper-card p-8 lg:col-span-2">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <Dumbbell className="text-[#B19CD9]" />
              <h2 className="text-xl font-bold">Movement Log</h2>
            </div>
            <button 
              onClick={() => setIsWorkoutModalOpen(true)}
              className="px-4 py-2 bg-[#E6D5F0] text-[#7B68A6] rounded-xl font-bold text-sm hover:bg-[#B19CD9] hover:text-white transition-all shadow-sm"
            >
              Log Workout
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {w.workouts.map(workout => (
              <div key={workout.id} className="p-4 bg-[#F8F7FC] rounded-2xl flex items-center justify-between border border-[#E6D5F0]/30 group relative">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl shadow-sm ${WORKOUT_TYPES.find(t => t.name === workout.type)?.color || 'bg-white text-[#B19CD9]'}`}>
                    {WORKOUT_TYPES.find(t => t.name === workout.type)?.icon || <Dumbbell size={20} />}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-700">{workout.type}</h4>
                    <p className="text-xs text-gray-400">{workout.date} • {workout.duration} mins</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="bg-[#D1F7E9] text-[#10B981] text-[10px] font-bold px-2 py-1 rounded-full uppercase">Done</div>
                  <button 
                    onClick={() => updateWellness({ workouts: w.workouts.filter(ww => ww.id !== workout.id) })}
                    className="text-gray-300 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
            {w.workouts.length === 0 && (
              <div className="col-span-2 text-center py-12 text-gray-400 border-2 border-dashed border-[#eee] rounded-2xl">
                Ready to move your body? Log your first workout!
              </div>
            )}
          </div>
        </div>

        {/* Me-Time Tracker */}
        <div className="paper-card p-8 lg:col-span-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Coffee className="text-[#B19CD9]" />
                <h2 className="text-xl font-bold">Me-Time Rituals</h2>
              </div>
              <p className="text-sm text-gray-500">Track how much you invest in your own happiness.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {['Reading', 'Meditation', 'Spa', 'Nature', 'Hobby'].map(type => (
                <button 
                  key={type}
                  onClick={() => addMeTime(type)}
                  className="px-4 py-2 bg-white border border-[#E6D5F0] rounded-xl text-sm font-medium hover:bg-[#E6D5F0] transition-colors"
                >
                  + {type}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-8 flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
            {w.meTime.map(item => (
              <div key={item.id} className="min-w-[150px] p-4 bg-white border border-[#eee] rounded-2xl shadow-sm">
                <span className="text-[10px] font-bold text-[#B19CD9] uppercase mb-1 block">{item.type}</span>
                <div className="flex items-center gap-2 mb-2">
                  <Clock size={16} className="text-gray-400" />
                  <span className="text-lg font-bold">{item.hours}h</span>
                </div>
                <span className="text-[10px] text-gray-400">{item.date}</span>
              </div>
            ))}
            {w.meTime.length === 0 && (
              <p className="text-gray-400 italic">Self-care isn't selfish. Take a moment for yourself today.</p>
            )}
          </div>
        </div>

        {/* Vacation Planner */}
        <div className="paper-card p-8 lg:col-span-3">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <Map className="text-[#B19CD9]" />
              <h2 className="text-xl font-bold">Future Escapes</h2>
            </div>
            <button 
              onClick={() => {
                const vac = { id: Math.random().toString(), destination: 'Dream Destination', date: '', budget: 0, checklist: [] };
                updateWellness({ vacations: [...w.vacations, vac] });
              }}
              className="text-[#7B68A6] font-bold text-sm hover:underline"
            >
              Plan New Trip
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {w.vacations.map(vac => (
              <div key={vac.id} className="paper-card bg-[#F8F7FC] border-[#E6D5F0] overflow-hidden flex flex-col">
                <div className="h-24 bg-[#B19CD9]/10 flex items-center justify-between px-6">
                  <div className="flex items-center gap-3">
                    <Map size={32} className="text-[#B19CD9]" />
                    <input 
                      className="text-xl font-bold bg-transparent border-none outline-none w-full"
                      value={vac.destination}
                      onChange={(e) => {
                        const newList = [...w.vacations];
                        const idx = newList.findIndex(v => v.id === vac.id);
                        newList[idx].destination = e.target.value;
                        updateWellness({ vacations: newList });
                      }}
                    />
                  </div>
                  <button 
                    onClick={() => removeVacation(vac.id)}
                    className="text-gray-400 hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <div className="mb-6">
                    <label className="text-[10px] font-bold uppercase text-gray-400 tracking-widest block mb-1">Budget</label>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400 font-bold">$</span>
                      <input 
                        type="number"
                        className="bg-transparent border-none outline-none font-bold text-lg"
                        value={vac.budget}
                        onChange={(e) => {
                          const newList = [...w.vacations];
                          const idx = newList.findIndex(v => v.id === vac.id);
                          newList[idx].budget = Number(e.target.value);
                          updateWellness({ vacations: newList });
                        }}
                      />
                    </div>
                  </div>

                  <div className="flex-1">
                    <label className="text-[10px] font-bold uppercase text-gray-400 tracking-widest block mb-3">Packing Checklist</label>
                    <div className="space-y-2 mb-4 max-h-[200px] overflow-y-auto custom-scrollbar pr-2">
                      {vac.checklist?.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-3 group">
                          <button 
                            onClick={() => toggleChecklistItem(vac.id, idx)}
                            className={`transition-colors ${item.done ? 'text-[#10B981]' : 'text-gray-300'}`}
                          >
                            {item.done ? <CheckSquare size={18} /> : <Square size={18} />}
                          </button>
                          <span className={`flex-1 text-sm ${item.done ? 'line-through text-gray-400 italic' : 'text-gray-700'}`}>
                            {item.text}
                          </span>
                          <button 
                            onClick={() => removeChecklistItem(vac.id, idx)}
                            className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 transition-all"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                      {(!vac.checklist || vac.checklist.length === 0) && (
                        <p className="text-xs text-gray-400 italic">No items added yet.</p>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      <input 
                        type="text"
                        placeholder="Add item..."
                        className="flex-1 text-xs px-3 py-2 bg-white border border-[#E6D5F0] rounded-lg outline-none focus:ring-1 focus:ring-[#B19CD9]"
                        value={newChecklistItem[vac.id] || ''}
                        onChange={(e) => setNewChecklistItem({ ...newChecklistItem, [vac.id]: e.target.value })}
                        onKeyDown={(e) => e.key === 'Enter' && addChecklistItem(vac.id)}
                      />
                      <button 
                        onClick={() => addChecklistItem(vac.id)}
                        className="p-2 bg-[#B19CD9] text-white rounded-lg hover:bg-[#7B68A6] transition-colors"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>

                  <button className="mt-8 w-full py-3 bg-white border border-[#E6D5F0] rounded-xl font-bold text-[#7B68A6] hover:bg-[#E6D5F0] transition-colors">
                    Manage Itinerary
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Workout Selection Modal */}
      {isWorkoutModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="w-full max-w-lg bg-white rounded-[32px] shadow-2xl overflow-hidden">
            <div className="p-8">
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#E6D5F0] rounded-xl"><Dumbbell className="text-[#7B68A6]" /></div>
                  <h2 className="serif text-2xl font-bold text-[#7B68A6]">Log Movement</h2>
                </div>
                <button onClick={() => setIsWorkoutModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <X size={20} className="text-gray-400" />
                </button>
              </div>

              <div className="space-y-8">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block mb-4 text-center">Select Movement Type</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {WORKOUT_TYPES.map(type => (
                      <button 
                        key={type.name}
                        onClick={() => setSelectedWorkout(type)}
                        className={`flex flex-col items-center gap-3 p-4 rounded-2xl border-2 transition-all ${selectedWorkout.name === type.name ? 'border-[#B19CD9] bg-[#B19CD9]/5 text-[#7B68A6]' : 'border-transparent bg-[#F8F7FC] text-gray-400 hover:bg-[#E6D5F0]'}`}
                      >
                        <div className={`p-2 rounded-lg ${selectedWorkout.name === type.name ? 'bg-white' : 'bg-gray-100'}`}>
                          {type.icon}
                        </div>
                        <span className="text-xs font-bold">{type.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Duration (Minutes)</label>
                    <span className="text-xl font-bold text-[#7B68A6]">{workoutDuration} min</span>
                  </div>
                  <input 
                    type="range"
                    min="5"
                    max="120"
                    step="5"
                    className="w-full h-2 bg-[#F8F7FC] rounded-lg appearance-none cursor-pointer accent-[#B19CD9] border border-[#eee]"
                    value={workoutDuration}
                    onChange={(e) => setWorkoutDuration(Number(e.target.value))}
                  />
                  <div className="flex justify-between text-[10px] font-bold text-gray-300 uppercase">
                    <span>5m</span>
                    <span>120m</span>
                  </div>
                </div>

                <button 
                  onClick={handleLogWorkout}
                  className="w-full py-4 bg-[#B19CD9] text-white font-bold rounded-2xl hover:bg-[#7B68A6] transition-all shadow-lg shadow-[#B19CD9]/20"
                >
                  Log Completed {selectedWorkout.name}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WellnessTracker;
