import React, { useState } from 'react';
import { Plus, Minus, Bed, AlertTriangle, Activity } from 'lucide-react';
import './BedController.css';

const initialBeds = {
  trauma: { label: 'Trauma Bays', icon: <AlertTriangle size={32} />, available: 1, total: 4, color: 'red' },
  standard: { label: 'Standard ER', icon: <Activity size={32} />, available: 12, total: 30, color: 'teal' },
  icu: { label: 'ICU Beds', icon: <Bed size={32} />, available: 3, total: 15, color: 'purple' },
};

const BedController = () => {
  const [beds, setBeds] = useState(initialBeds);

  const updateBed = (type, delta) => {
    setBeds(prev => {
      const current = prev[type].available;
      const total = prev[type].total;
      const newValue = Math.max(0, Math.min(total, current + delta));
      return { ...prev, [type]: { ...prev[type], available: newValue } };
    });
  };

  return (
    <div className="bed-controller">
      <div className="page-header mb-8">
        <h1 className="page-title">Bed Controller</h1>
        <p className="page-subtitle">Instantly update available bed counts. This reflects directly on the dispatcher radar.</p>
      </div>

      <div className="beds-grid">
        {Object.entries(beds).map(([key, data]) => (
          <div key={key} className={`bed-control-card color-${data.color}`}>
            <div className="card-header">
              <div className="icon-wrapper">
                {data.icon}
              </div>
              <h2 className="bed-label">{data.label}</h2>
            </div>

            <div className="card-body">
              <div className="count-display">
                <span className="current-count">{data.available}</span>
                <span className="total-count">/ {data.total}</span>
              </div>
              <span className="availability-label">Available</span>
            </div>

            <div className="card-actions">
              <button 
                className="btn-control btn-minus"
                onClick={() => updateBed(key, -1)}
                disabled={data.available === 0}
              >
                <Minus size={48} />
              </button>
              <button 
                className="btn-control btn-plus"
                onClick={() => updateBed(key, 1)}
                disabled={data.available === data.total}
              >
                <Plus size={48} />
              </button>
            </div>
            
            {/* Warning Indicator */}
            {data.available === 0 && (
              <div className="zero-warning">
                <AlertTriangle size={16} /> CAPACITY REACHED
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default BedController;
