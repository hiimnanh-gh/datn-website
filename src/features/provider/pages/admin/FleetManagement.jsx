import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Truck, 
  Search, 
  ShieldCheck, 
  Settings, 
  DollarSign, 
  Star, 
  MessageSquare,
  UploadCloud,
  CheckCircle2
} from 'lucide-react';
import './FleetManagement.css';

// Initial Fleet data
const INITIAL_FLEET = [
  { id: 'AMB-101', type: 'Advanced Life Support (ALS)', plate: '29A-987.65', status: 'Available', crew: 'John D., Sarah M.' },
  { id: 'AMB-102', type: 'Basic Life Support (BLS)', plate: '51F-123.45', status: 'Dispatched', crew: 'Mike R., Tom B.' },
  { id: 'AMB-104', type: 'Bariatric Unit', plate: '30H-443.21', status: 'Available', crew: 'Emily W., David L.' },
  { id: 'AMB-105', type: 'Neonatal Unit', plate: '51G-887.11', status: 'Available', crew: 'Dr. Smith, Nurse Kelly' },
];

// Initial Public Reviews
const MOCK_REVIEWS = [
  { id: 'R-1', unit: 'AMB-101', user: 'Lê Minh Hùng', rating: 5, comment: 'Đội ngũ y tế xử lý tai nạn nhanh chóng, nhân viên tận tình.', date: 'Today' },
  { id: 'R-2', unit: 'AMB-102', user: 'Trần Thị Thảo', rating: 4, comment: 'Xe sạch sẽ, tuy nhiên tài xế đi đường hơi dằn xóc.', date: 'Yesterday' },
  { id: 'R-3', unit: 'AMB-104', user: 'Phan Văn Đạt', rating: 5, comment: 'Hỗ trợ nâng chuyển bệnh nhân nặng rất tốt. Đầy đủ trang bị.', date: '3 days ago' },
];

const FleetManagement = () => {
  const [fleet, setFleet] = useState(INITIAL_FLEET);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Registration Form States
  const [newPlate, setNewPlate] = useState('');
  const [newType, setNewType] = useState('Advanced Life Support (ALS)');
  const [newCrew, setNewCrew] = useState('');
  const [fileName, setFileName] = useState('');
  const [onboardSuccess, setOnboardSuccess] = useState('');

  // Storefront Config States
  const [alsBase, setAlsBase] = useState(300.00);
  const [blsBase, setBlsBase] = useState(150.00);
  const [mileagePremium, setMileagePremium] = useState(4.50);
  const [configSuccess, setConfigSuccess] = useState(false);

  // Handle doc upload simulation
  const handleDocChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFileName(e.target.files[0].name);
    }
  };

  // Register New Ambulance Unit
  const handleRegisterAmbulance = (e) => {
    e.preventDefault();
    if (!newPlate.trim()) return;

    const newId = `AMB-${100 + fleet.length + 2}`;
    const newUnit = {
      id: newId,
      type: newType,
      plate: newPlate,
      status: 'Available',
      crew: newCrew || 'Unassigned'
    };

    setFleet([...fleet, newUnit]);
    setOnboardSuccess(`Ambulance unit ${newId} (${newPlate}) registered successfully!`);
    setNewPlate('');
    setNewCrew('');
    setFileName('');

    setTimeout(() => setOnboardSuccess(''), 4000);
  };

  // Remove Ambulance Unit
  const handleRemoveUnit = (id) => {
    setFleet(fleet.filter(unit => unit.id !== id));
  };

  // Save Storefront Fares configuration
  const handleSaveConfig = (e) => {
    e.preventDefault();
    setConfigSuccess(true);
    setTimeout(() => setConfigSuccess(false), 3000);
  };

  const filteredFleet = fleet.filter(unit => 
    unit.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
    unit.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    unit.plate.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fleet-management-v2 text-slate-100 p-6 space-y-6 font-sans">
      
      {/* ── Page Header ── */}
      <div className="flex flex-wrap justify-between items-center gap-4 border-b border-slate-800 pb-5 text-left">
        <div>
          <h1 className="text-2xl font-bold tracking-wider font-mono text-white uppercase flex items-center gap-2">
            <Truck className="text-blue-500" size={24} />
            Fleet & Storefront Registry
          </h1>
          <p className="text-xs text-slate-500 mt-1 uppercase font-mono tracking-widest">
            Onboard Ambulances · Configure Service Fare Models
          </p>
        </div>
      </div>

      {/* ── Top Workspace: Register Form & Storefront Config ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left">
        
        {/* Ambulance Onboarding Form (Col: 7) */}
        <div className="lg:col-span-7 bg-slate-900/40 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between shadow-2xl">
          <div>
            <h2 className="text-sm font-bold font-mono tracking-wider text-white uppercase flex items-center gap-1.5 mb-2">
              <Plus className="text-blue-400" size={18} />
              Register New Ambulance
            </h2>
            <p className="text-xs text-slate-500 mb-4">Onboard emergency units by filling credentials and certificates.</p>
            
            {onboardSuccess && (
              <div className="mb-4 p-3 bg-emerald-950/60 border border-emerald-900 text-emerald-400 text-xs rounded-lg flex items-center gap-2">
                <CheckCircle2 size={16} />
                <span>{onboardSuccess}</span>
              </div>
            )}

            <form onSubmit={handleRegisterAmbulance} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* License Plate */}
                <div>
                  <label className="text-[9px] font-bold font-mono text-slate-500 uppercase tracking-wider block mb-1">License Plate</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 51F-123.45"
                    value={newPlate}
                    onChange={(e) => setNewPlate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-xs text-white rounded-lg px-3 py-2.5 outline-none focus:border-blue-500 transition-all font-mono"
                  />
                </div>

                {/* Vehicle type */}
                <div>
                  <label className="text-[9px] font-bold font-mono text-slate-500 uppercase tracking-wider block mb-1">Ambulance Class Type</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-xs text-white rounded-lg px-3 py-2.5 outline-none focus:border-blue-500 transition-all font-mono"
                  >
                    <option value="Advanced Life Support (ALS)">Advanced Life Support (ALS)</option>
                    <option value="Basic Life Support (BLS)">Basic Life Support (BLS)</option>
                    <option value="Bariatric Unit">Bariatric Rescue Unit</option>
                    <option value="Neonatal Unit">Neonatal Care Unit</option>
                  </select>
                </div>
              </div>

              {/* Crew assignment */}
              <div>
                <label className="text-[9px] font-bold font-mono text-slate-500 uppercase tracking-wider block mb-1">Crew Assignments</label>
                <input
                  type="text"
                  placeholder="e.g. John Doe (ALS), Sarah Smith (BLS)"
                  value={newCrew}
                  onChange={(e) => setNewCrew(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-xs text-white rounded-lg px-3 py-2.5 outline-none focus:border-blue-500 transition-all font-mono"
                />
              </div>

              {/* Upload Registration Docs */}
              <div>
                <label className="text-[9px] font-bold font-mono text-slate-500 uppercase tracking-wider block mb-1">Registration & Medical License Docs</label>
                <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-800 hover:border-slate-700 bg-slate-950 rounded-xl p-4 cursor-pointer transition-all">
                  <UploadCloud className="text-slate-500 mb-2" size={24} />
                  <span className="text-xs text-slate-400 font-semibold">
                    {fileName ? fileName : 'Upload registration certificate.pdf'}
                  </span>
                  <span className="text-[9px] text-slate-600 font-mono mt-1">PDF or image file · Max 5MB</span>
                  <input
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg"
                    onChange={handleDocChange}
                    className="hidden"
                  />
                </label>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-mono text-xs font-bold py-3.5 rounded-xl transition-all shadow-lg active:scale-98"
              >
                ONBOARD VEHICLE UNIT
              </button>
            </form>
          </div>
        </div>

        {/* Storefront Fare Configuration (Col: 5) */}
        <div className="lg:col-span-5 bg-slate-900/40 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between shadow-2xl">
          <div>
            <h2 className="text-sm font-bold font-mono tracking-wider text-white uppercase flex items-center gap-1.5 mb-2">
              <Settings className="text-blue-400" size={18} />
              Storefront Base Fares
            </h2>
            <p className="text-xs text-slate-500 mb-4">Set pricing rules visible to dispatch operators on matching feeds.</p>

            {configSuccess && (
              <div className="mb-4 p-3 bg-emerald-950/60 border border-emerald-900 text-emerald-400 text-xs rounded-lg flex items-center gap-2">
                <CheckCircle2 size={16} />
                <span>Base fares and mileage configuration updated successfully!</span>
              </div>
            )}

            <form onSubmit={handleSaveConfig} className="space-y-4">
              {/* ALS Base */}
              <div>
                <div className="flex justify-between items-center mb-1 font-mono text-[10px]">
                  <span className="text-slate-500 uppercase font-bold">ALS Base Rate</span>
                  <span className="text-white font-bold">${alsBase.toLocaleString()}</span>
                </div>
                <input
                  type="range"
                  min={100}
                  max={1000}
                  step={50}
                  value={alsBase}
                  onChange={(e) => setAlsBase(parseInt(e.target.value))}
                  className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>

              {/* BLS Base */}
              <div>
                <div className="flex justify-between items-center mb-1 font-mono text-[10px]">
                  <span className="text-slate-500 uppercase font-bold">BLS Base Rate</span>
                  <span className="text-white font-bold">${blsBase.toLocaleString()}</span>
                </div>
                <input
                  type="range"
                  min={50}
                  max={500}
                  step={25}
                  value={blsBase}
                  onChange={(e) => setBlsBase(parseInt(e.target.value))}
                  className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>

              {/* Mileage Rate */}
              <div>
                <div className="flex justify-between items-center mb-1 font-mono text-[10px]">
                  <span className="text-slate-500 uppercase font-bold">Mileage Premium (per km)</span>
                  <span className="text-white font-bold">${mileagePremium.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min={1.00}
                  max={15.00}
                  step={0.50}
                  value={mileagePremium}
                  onChange={(e) => setMileagePremium(parseFloat(e.target.value))}
                  className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-200 font-mono text-xs font-bold py-3.5 rounded-xl transition-all shadow-lg active:scale-98"
              >
                SAVE PRICING CONFIG
              </button>
            </form>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-850 text-[10px] text-slate-500 font-mono flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-blue-400" />
            <span>Fares undergo compliance review by super admin</span>
          </div>
        </div>

      </div>

      {/* ── Active Fleet List and Public Reviews Feed ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left">
        
        {/* Fleet Datatable (Col: 7) */}
        <div className="lg:col-span-7 bg-slate-900/40 border border-slate-800 p-5 rounded-2xl shadow-2xl flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-sm font-bold font-mono tracking-wider text-white uppercase">Active Fleet Registry</h2>
              <div className="relative flex items-center bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1">
                <Search size={14} className="text-slate-500 mr-2" />
                <input
                  type="text"
                  placeholder="Filter fleet..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-transparent border-none outline-none text-xs text-slate-350 w-[120px] font-mono"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-850 text-slate-400 font-mono text-[10px] tracking-wider uppercase">
                    <th className="py-2.5 px-3">Unit ID</th>
                    <th className="py-2.5 px-3">License Plate</th>
                    <th className="py-2.5 px-3">Class Class</th>
                    <th className="py-2.5 px-3">Assigned Crew</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFleet.map((unit) => (
                    <tr key={unit.id} className="border-b border-slate-850 hover:bg-slate-900/50 transition-colors">
                      <td className="py-3.5 px-3 font-mono font-bold text-blue-400">{unit.id}</td>
                      <td className="py-3.5 px-3 font-mono text-slate-200">{unit.plate}</td>
                      <td className="py-3.5 px-3 text-slate-300">{unit.type}</td>
                      <td className="py-3.5 px-3 text-slate-400">{unit.crew}</td>
                      <td className="py-3.5 px-3 text-right">
                        <button 
                          onClick={() => handleRemoveUnit(unit.id)}
                          className="text-red-500 hover:text-red-400 p-1 rounded hover:bg-red-950/20 transition-all ml-auto block"
                        >
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Public Feedback Ratings Feed (Col: 5) */}
        <div className="lg:col-span-5 bg-slate-900/40 border border-slate-800 p-5 rounded-2xl shadow-2xl">
          <h2 className="text-sm font-bold font-mono tracking-wider text-white uppercase mb-1">Public Ratings & Feedback</h2>
          <p className="text-xs text-slate-500 mb-4">Live feedback posted by dispatch operators and clients.</p>

          <div className="space-y-4 max-h-[300px] overflow-y-auto scrollbar-thin pr-1">
            {MOCK_REVIEWS.map((rev) => (
              <div key={rev.id} className="p-3.5 bg-slate-950 border border-slate-850 rounded-xl space-y-2 hover:border-slate-850 transition-colors">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-bold text-xs text-slate-200">{rev.user}</span>
                    <span className="text-[10px] text-slate-500 font-mono block mt-0.5">
                      Vehicle: <span className="text-blue-400 font-semibold">{rev.unit}</span>
                    </span>
                  </div>
                  <div className="flex gap-0.5 text-yellow-400 text-xs">
                    {Array.from({ length: rev.rating }).map((_, i) => (
                      <Star key={i} size={12} fill="currentColor" />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-slate-400 italic font-mono leading-relaxed">
                  "{rev.comment}"
                </p>
                <div className="text-[9px] text-slate-500 font-mono text-right">{rev.date}</div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};

export default FleetManagement;
