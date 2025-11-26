import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { Truck, Wrench, Activity, Fuel, Gauge, AlertTriangle, User, CheckCircle, Plus, Search, Filter } from 'lucide-react';

const FleetCommand = () => {
  const [fleet, setFleet] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newUnitData, setNewUnitData] = useState({ name: '', category: 'Truck', status: 'available' });

  useEffect(() => {
    fetchFleet();
  }, []);

  const fetchFleet = async () => {
    try {
      const res = await api.get('/equipment');
      setFleet(Array.isArray(res.data.data) ? res.data.data : []);
      setLoading(false);
    } catch (e) { console.error("Fleet Load Error", e); }
  };

  const createUnit = async () => {
      try {
          const res = await api.post('/equipment', { 
              ...newUnitData, 
              ownership: 'owned', 
              costRateBase: 50,
              userId: '1' // Placeholder or derive from context
          });
          setFleet(prev => [...prev, res.data]);
          setShowCreate(false);
      } catch(e) { alert('Failed to add unit'); }
  };

  const TelemetryGauge = ({ icon: Icon, value, label, color }) => (
      <div className="bg-black/40 rounded-xl p-4 border border-white/5 flex items-center gap-4">
          <div className={`p-3 rounded-full bg-${color}-500/20 text-${color}-400`}>
              <Icon size={20} />
          </div>
          <div>
              <div className="text-2xl font-bold text-white font-mono">{value}</div>
              <div className="text-[10px] uppercase text-gray-500 font-bold tracking-wider">{label}</div>
          </div>
      </div>
  );

  if (loading) return <div className="h-screen flex items-center justify-center bg-stone-950 text-indigo-500 font-mono">INITIALIZING FLEET COMMAND...</div>;

  return (
    <div className="min-h-screen bg-stone-950 p-8 font-sans text-gray-100 animate-fade-in">
        
        {/* HEADER */}
        <div className="flex justify-between items-center mb-8">
            <div>
                <h1 className="text-4xl font-black text-white tracking-tight flex items-center gap-3">
                    <Truck size={40} className="text-indigo-500" /> FLEET COMMAND
                </h1>
                <p className="text-gray-400 mt-2 font-medium">Live Logistics & Asset Intelligence</p>
            </div>
            <button 
                onClick={() => setShowCreate(true)}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-900/30 transition-all flex items-center gap-2"
            >
                <Plus size={20}/> Add Unit
            </button>
        </div>

        {/* GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {fleet.map(unit => (
                <div 
                    key={unit.id}
                    onClick={() => setSelectedUnit(unit)}
                    className="group bg-stone-900/60 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:border-indigo-500/50 hover:bg-stone-900/80 transition-all cursor-pointer relative overflow-hidden"
                >
                    <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-indigo-500 to-transparent opacity-50" />
                    
                    <div className="flex justify-between items-start mb-6">
                        <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400 border border-indigo-500/20 group-hover:scale-110 transition-transform">
                            <Truck size={24} />
                        </div>
                        <span className={`px-3 py-1 rounded text-[10px] font-black uppercase tracking-wider ${unit.status === 'available' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                            {unit.status}
                        </span>
                    </div>

                    <h3 className="text-xl font-bold text-white mb-1">{unit.name}</h3>
                    <p className="text-xs text-gray-500 uppercase font-bold mb-4">{unit.category}</p>

                    <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-white/5">
                        <div>
                            <div className="text-[10px] text-gray-500 uppercase">Odometer</div>
                            <div className="font-mono text-sm text-white">{(unit.hoursUsed * 40).toLocaleString()} km</div>
                        </div>
                        <div>
                            <div className="text-[10px] text-gray-500 uppercase">Fuel</div>
                            <div className="font-mono text-sm text-emerald-400">{unit.fuelLevel || 100}%</div>
                        </div>
                    </div>
                </div>
            ))}
        </div>

        {/* TELEMETRY MODAL */}
        {selectedUnit && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-8 animate-fade-in" onClick={() => setSelectedUnit(null)}>
                <div className="bg-stone-900 w-full max-w-4xl rounded-3xl border border-white/10 shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
                    <div className="p-8 border-b border-white/10 flex justify-between items-center bg-gradient-to-r from-stone-900 to-stone-800">
                        <div>
                            <div className="text-indigo-500 font-bold uppercase text-xs tracking-widest mb-1">Live Telemetry Feed</div>
                            <h2 className="text-3xl font-black text-white">{selectedUnit.name}</h2>
                        </div>
                        <div className="flex gap-3">
                            <button className="px-4 py-2 bg-stone-800 hover:bg-stone-700 rounded-lg text-sm font-bold border border-white/5">History</button>
                            <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-bold shadow-lg">Dispatch</button>
                        </div>
                    </div>

                    <div className="p-8">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <TelemetryGauge icon={Gauge} value="0 km/h" label="Current Speed" color="indigo" />
                            <TelemetryGauge icon={Fuel} value={`${selectedUnit.fuelLevel}%`} label="Fuel Level" color="emerald" />
                            <TelemetryGauge icon={Activity} value="98%" label="Engine Health" color="blue" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="bg-black/20 rounded-2xl p-6 border border-white/5">
                                <h3 className="text-gray-400 font-bold uppercase text-xs mb-4">Maintenance Status</h3>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm text-gray-300">Next Service</span>
                                    <span className="text-sm font-mono text-white">{(selectedUnit.serviceInterval - (selectedUnit.hoursUsed % selectedUnit.serviceInterval))} hrs remaining</span>
                                </div>
                                <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                                    <div className="h-full bg-emerald-500 w-3/4" />
                                </div>
                            </div>

                            <div className="bg-black/20 rounded-2xl p-6 border border-white/5">
                                <h3 className="text-gray-400 font-bold uppercase text-xs mb-4">Driver Assignment</h3>
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-stone-700 flex items-center justify-center">
                                        <User size={20} className="text-gray-400"/>
                                    </div>
                                    <div>
                                        <div className="font-bold text-white">Unassigned</div>
                                        <button className="text-xs text-indigo-400 font-bold hover:text-indigo-300 uppercase">Assign Driver</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* CREATE MODAL */}
        {showCreate && (
            <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
                <div className="bg-stone-900 p-8 rounded-2xl border border-white/10 w-96">
                    <h2 className="text-xl font-bold text-white mb-4">Add New Unit</h2>
                    <input 
                        className="w-full bg-stone-800 p-3 rounded-lg mb-3 text-white" 
                        placeholder="Unit Name (e.g. Truck 05)"
                        value={newUnitData.name}
                        onChange={e => setNewUnitData({...newUnitData, name: e.target.value})}
                    />
                    <select 
                        className="w-full bg-stone-800 p-3 rounded-lg mb-6 text-white"
                        value={newUnitData.category}
                        onChange={e => setNewUnitData({...newUnitData, category: e.target.value})}
                    >
                        <option>Truck</option>
                        <option>Excavator</option>
                        <option>Crane</option>
                        <option>Van</option>
                    </select>
                    <button onClick={createUnit} className="w-full bg-indigo-600 py-3 rounded-lg text-white font-bold">Deploy Unit</button>
                    <button onClick={() => setShowCreate(false)} className="w-full mt-2 text-gray-500 text-sm">Cancel</button>
                </div>
            </div>
        )}

    </div>
  );
};

export default FleetCommand;
