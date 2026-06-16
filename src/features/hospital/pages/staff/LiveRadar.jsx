import React, { useState } from 'react';
import { Ambulance, Clock, Activity, AlertTriangle, ShieldAlert } from 'lucide-react';
import './LiveRadar.css';

const incomingAmbulances = [
  { id: 'EMS-104', provider: 'City EMS', eta: '4 min', status: 'Critical', chiefComplaint: 'Cardiac Arrest', vitals: 'HR 140, BP 90/60' },
  { id: 'RES-02', provider: 'Metro Rescue', eta: '12 min', status: 'Stable', chiefComplaint: 'Broken Leg', vitals: 'HR 85, BP 120/80' },
  { id: 'EMS-209', provider: 'County Fire', eta: '18 min', status: 'Urgent', chiefComplaint: 'Severe Allergic Reaction', vitals: 'HR 110, BP 100/70' },
];

const LiveRadar = () => {
  const [isAccepting, setIsAccepting] = useState(true);

  return (
    <div className="live-radar">
      <div className="radar-header">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <Activity className="text-teal-600 animate-pulse" /> Live ER Radar
          </h1>
          <p className="page-subtitle">Real-time incoming transports and facility status.</p>
        </div>
        
        <div className="status-toggle-wrapper">
          <span className="status-label">Facility Status:</span>
          <button 
            className={`status-btn ${isAccepting ? 'status-accepting' : 'status-divert'}`}
            onClick={() => setIsAccepting(!isAccepting)}
          >
            {isAccepting ? (
              <><Activity size={18} /> ACCEPTING PATIENTS</>
            ) : (
              <><ShieldAlert size={18} /> DIVERT / OVERLOAD</>
            )}
          </button>
        </div>
      </div>

      <div className="radar-grid">
        {/* Left Side: Incoming Ambulances */}
        <div className="radar-main">
          <div className="section-header">
            <h2 className="section-title">Incoming Transports ({incomingAmbulances.length})</h2>
          </div>
          
          <div className="ambulance-list">
            {incomingAmbulances.map((amb) => (
              <div key={amb.id} className={`ambulance-card ${amb.status === 'Critical' ? 'border-red-500 bg-red-50' : 'border-slate-200 bg-white'}`}>
                <div className="card-top">
                  <div className="amb-id">
                    <Ambulance size={20} className={amb.status === 'Critical' ? 'text-red-600' : 'text-teal-600'} />
                    <span className="font-bold text-slate-800">{amb.id}</span>
                    <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">{amb.provider}</span>
                  </div>
                  <div className={`eta-badge ${amb.status === 'Critical' ? 'text-red-700 bg-red-100' : 'text-teal-700 bg-teal-100'}`}>
                    <Clock size={14} />
                    ETA: {amb.eta}
                  </div>
                </div>
                
                <div className="card-body">
                  <div className="patient-info">
                    <h3 className="complaint">{amb.chiefComplaint}</h3>
                    <div className="vitals">
                      <Activity size={14} className="text-slate-400" />
                      <span>{amb.vitals}</span>
                    </div>
                  </div>
                  <div className="status-indicator">
                    <span className={`status-dot ${
                      amb.status === 'Critical' ? 'bg-red-500 animate-pulse' : 
                      amb.status === 'Urgent' ? 'bg-orange-500' : 'bg-green-500'
                    }`}></span>
                    <span className="text-sm font-medium text-slate-700">{amb.status}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Quick Bed Summary */}
        <div className="radar-sidebar">
          <div className="section-header">
            <h2 className="section-title">Quick Bed Summary</h2>
          </div>
          
          <div className="bed-summary-cards">
            <div className="summary-card">
              <div className="summary-header text-red-600">
                <AlertTriangle size={20} />
                <span>Trauma Bays</span>
              </div>
              <div className="summary-body">
                <div className="bed-count">
                  <span className="count-value text-red-600">1</span>
                  <span className="count-total">/ 4</span>
                </div>
                <span className="count-label">Available</span>
              </div>
            </div>

            <div className="summary-card">
              <div className="summary-header text-teal-600">
                <Activity size={20} />
                <span>Standard ER</span>
              </div>
              <div className="summary-body">
                <div className="bed-count">
                  <span className="count-value text-teal-600">12</span>
                  <span className="count-total">/ 30</span>
                </div>
                <span className="count-label">Available</span>
              </div>
            </div>

            <div className="summary-card">
              <div className="summary-header text-purple-600">
                <Activity size={20} />
                <span>ICU Beds</span>
              </div>
              <div className="summary-body">
                <div className="bed-count">
                  <span className="count-value text-purple-600">3</span>
                  <span className="count-total">/ 15</span>
                </div>
                <span className="count-label">Available</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveRadar;
