import React, { useState } from 'react';
import { Search, Plus, Edit2, Trash2, Truck } from 'lucide-react';
import './FleetManagement.css';

const INITIAL_FLEET = [
  { id: 'AMB-101', type: 'Advanced Life Support (ALS)', status: 'AVAILABLE', crew: 'John D., Sarah M.' },
  { id: 'AMB-102', type: 'Basic Life Support (BLS)', status: 'DISPATCHED', crew: 'Mike R., Tom B.' },
  { id: 'AMB-103', type: 'Advanced Life Support (ALS)', status: 'MAINTENANCE', crew: 'Unassigned' },
  { id: 'AMB-104', type: 'Bariatric Unit', status: 'AVAILABLE', crew: 'Emily W., David L.' },
  { id: 'AMB-105', type: 'Neonatal Unit', status: 'AVAILABLE', crew: 'Dr. Smith, Nurse Kelly' },
];

const FleetManagement = () => {
  const [fleet, setFleet] = useState(INITIAL_FLEET);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredFleet = fleet.filter(unit => 
    unit.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
    unit.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status) => {
    switch(status) {
      case 'AVAILABLE': return <span className="badge badge-success">Available</span>;
      case 'DISPATCHED': return <span className="badge badge-warning">Dispatched</span>;
      case 'MAINTENANCE': return <span className="badge badge-danger">Maintenance</span>;
      default: return <span className="badge">{status}</span>;
    }
  };

  return (
    <div className="fleet-management">
      <div className="page-header">
        <div>
          <h1 className="page-title">Fleet Management</h1>
          <p className="page-subtitle">Manage your ambulances and crew assignments.</p>
        </div>
        <button className="btn-add-unit">
          <Plus size={18} />
          <span>Add New Unit</span>
        </button>
      </div>

      <div className="fleet-card">
        <div className="fleet-toolbar">
          <div className="search-bar">
            <Search size={18} className="search-icon" />
            <input 
              type="text" 
              placeholder="Search by ID or Type..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        <div className="table-responsive">
          <table className="fleet-table">
            <thead>
              <tr>
                <th>Unit ID</th>
                <th>Type</th>
                <th>Current Status</th>
                <th>Assigned Crew</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredFleet.length > 0 ? (
                filteredFleet.map(unit => (
                  <tr key={unit.id}>
                    <td>
                      <div className="unit-id-cell">
                        <Truck size={16} className="text-slate-400" />
                        <span className="font-semibold">{unit.id}</span>
                      </div>
                    </td>
                    <td>{unit.type}</td>
                    <td>{getStatusBadge(unit.status)}</td>
                    <td>{unit.crew}</td>
                    <td>
                      <div className="action-buttons">
                        <button className="btn-icon btn-edit" title="Edit Unit">
                          <Edit2 size={16} />
                        </button>
                        <button className="btn-icon btn-delete" title="Remove Unit">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="empty-state">
                    No units found matching "{searchTerm}"
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FleetManagement;
