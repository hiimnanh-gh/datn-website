import React, { useState } from 'react';
import { AlertCircle, Activity, MapPin, Clock, ArrowRight, Truck } from 'lucide-react';
import './MissionControl.css';

const INCOMING_REQUESTS = [
  { id: 'INC-901', patient: 'Anonymous', complaint: 'Severe Chest Pain', location: '123 Main St', eta: '5 mins', urgency: 'CRITICAL' },
  { id: 'INC-902', patient: 'Anonymous', complaint: 'Fall / Fracture', location: '45 Oak Ave', eta: '12 mins', urgency: 'HIGH' },
];

const ACTIVE_MISSIONS = [
  { id: 'INC-855', unit: 'AMB-101', type: 'Flow 1 (Direct)', status: 'EN ROUTE TO SCENE', location: '78 Pine St', time: '4m ago' },
  { id: 'INC-850', unit: 'AMB-102', type: 'Flow 2 (Assigned)', status: 'AT HOSPITAL', location: 'City General', time: '15m ago' },
];

const AVAILABLE_UNITS = [
  { id: 'AMB-104', type: 'Bariatric Unit', eta: '3 mins' },
  { id: 'AMB-105', type: 'Neonatal Unit', eta: '5 mins' },
];

const MissionControl = () => {
  const [incoming, setIncoming] = useState(INCOMING_REQUESTS);
  const [active, setActive] = useState(ACTIVE_MISSIONS);
  const [selectedIncident, setSelectedIncident] = useState(null);

  const handleAssignUnit = (unitId) => {
    if (!selectedIncident) return;
    // Move from incoming to active
    const newActive = {
      id: selectedIncident.id,
      unit: unitId,
      type: 'Flow 2 (Assigned)',
      status: 'DISPATCHED',
      location: selectedIncident.location,
      time: 'Just now'
    };
    setActive([newActive, ...active]);
    setIncoming(incoming.filter(inc => inc.id !== selectedIncident.id));
    setSelectedIncident(null);
  };

  return (
    <div className="mission-control">
      <div className="page-header">
        <div>
          <h1 className="page-title">Mission Control</h1>
          <p className="page-subtitle">Monitor live operations and manage incoming dispatch requests.</p>
        </div>
        <div className="live-indicator">
          <span className="pulse-dot"></span>
          <span>LIVE TRACKING</span>
        </div>
      </div>

      <div className="mission-grid">
        {/* Incoming Requests (Flow 2) */}
        <div className="incoming-section">
          <div className="section-header">
            <div className="flex items-center gap-2">
              <AlertCircle className="text-orange-600" />
              <h2>Incoming Requests (Needs Assignment)</h2>
            </div>
            <span className="badge-count">{incoming.length}</span>
          </div>

          <div className="request-list">
            {incoming.length === 0 ? (
              <div className="empty-state">No pending requests.</div>
            ) : (
              incoming.map(inc => (
                <div key={inc.id} className="request-card">
                  <div className="request-header">
                    <span className="req-id">{inc.id}</span>
                    <span className={`urgency-badge urgency-${inc.urgency.toLowerCase()}`}>{inc.urgency}</span>
                  </div>
                  <div className="req-details">
                    <div className="detail-row"><Activity size={14} /> <span>{inc.complaint}</span></div>
                    <div className="detail-row"><MapPin size={14} /> <span>{inc.location}</span></div>
                    <div className="detail-row"><Clock size={14} /> <span>{inc.eta} to scene</span></div>
                  </div>
                  <button 
                    className="btn-assign-trigger"
                    onClick={() => setSelectedIncident(inc)}
                  >
                    Assign Vehicle <ArrowRight size={16} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Active Missions (Flow 1 & 2) */}
        <div className="active-section">
          <div className="section-header">
            <div className="flex items-center gap-2">
              <Truck className="text-slate-800" />
              <h2>Active Missions</h2>
            </div>
            <span className="badge-count bg-slate-800 text-white">{active.length}</span>
          </div>

          <div className="active-list">
            {active.length === 0 ? (
              <div className="empty-state">No active missions.</div>
            ) : (
              active.map(mission => (
                <div key={mission.id} className="active-card">
                  <div className="active-card-left">
                    <div className="mission-unit">{mission.unit}</div>
                    <div className="mission-flow">{mission.type}</div>
                  </div>
                  <div className="active-card-center">
                    <div className="mission-id">{mission.id}</div>
                    <div className="mission-loc"><MapPin size={12} /> {mission.location}</div>
                  </div>
                  <div className="active-card-right">
                    <div className="mission-status">{mission.status}</div>
                    <div className="mission-time">{mission.time}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Assignment Modal overlay */}
      {selectedIncident && (
        <div className="modal-overlay">
          <div className="assignment-modal">
            <div className="modal-header">
              <h3>Assign Unit to {selectedIncident.id}</h3>
              <button className="btn-close" onClick={() => setSelectedIncident(null)}>&times;</button>
            </div>
            <div className="modal-body">
              <p className="mb-4 text-sm text-slate-600">Select an available unit to dispatch to <strong>{selectedIncident.location}</strong>.</p>
              <div className="unit-options">
                {AVAILABLE_UNITS.map(unit => (
                  <div key={unit.id} className="unit-option" onClick={() => handleAssignUnit(unit.id)}>
                    <div className="unit-info">
                      <Truck className="text-orange-600" />
                      <div>
                        <div className="font-bold">{unit.id}</div>
                        <div className="text-xs text-slate-500">{unit.type}</div>
                      </div>
                    </div>
                    <div className="unit-eta">{unit.eta} away</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MissionControl;
