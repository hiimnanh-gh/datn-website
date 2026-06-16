import React, { useState } from 'react';
import { Search, Calendar, Filter, CheckCircle2 } from 'lucide-react';
import './HandoverLogs.css';

const logsData = [
  { id: 'LOG-001', time: '08:14 AM', patientId: 'PT-8912', complaint: 'Chest Pain', provider: 'City EMS', status: 'Received' },
  { id: 'LOG-002', time: '09:30 AM', patientId: 'PT-8913', complaint: 'MVA Trauma', provider: 'County Fire', status: 'Received' },
  { id: 'LOG-003', time: '10:45 AM', patientId: 'PT-8914', complaint: 'Stroke Protocol', provider: 'Metro Rescue', status: 'Received' },
  { id: 'LOG-004', time: '11:20 AM', patientId: 'PT-8915', complaint: 'Fall / Fracture', provider: 'First Response', status: 'Received' },
  { id: 'LOG-005', time: '01:05 PM', patientId: 'PT-8916', complaint: 'Shortness of Breath', provider: 'City EMS', status: 'Received' },
];

const HandoverLogs = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLogs = logsData.filter(log => 
    log.patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.complaint.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.provider.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="handover-logs">
      <div className="page-header">
        <div>
          <h1 className="page-title">Handover Logs</h1>
          <p className="page-subtitle">History of patients successfully received during your shift.</p>
        </div>
        <div className="header-actions">
          <button className="btn-secondary">
            <Calendar size={18} />
            Today
          </button>
          <button className="btn-secondary">
            <Filter size={18} />
            Filter
          </button>
        </div>
      </div>

      <div className="table-container">
        <div className="table-toolbar">
          <div className="search-box">
            <Search className="search-icon" size={18} />
            <input 
              type="text" 
              placeholder="Search by Patient ID, Complaint, or Provider..." 
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="shift-summary">
            <span className="summary-label">Total Received:</span>
            <span className="summary-value">{logsData.length}</span>
          </div>
        </div>

        <div className="table-wrapper">
          <table className="logs-table">
            <thead>
              <tr>
                <th>Time</th>
                <th>Log ID</th>
                <th>Patient ID</th>
                <th>Chief Complaint</th>
                <th>Provider</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log) => (
                <tr key={log.id}>
                  <td className="font-medium text-slate-800">{log.time}</td>
                  <td className="text-slate-500 font-mono text-xs">{log.id}</td>
                  <td className="font-semibold text-teal-700">{log.patientId}</td>
                  <td className="text-slate-800">{log.complaint}</td>
                  <td>
                    <span className="provider-badge">
                      {log.provider}
                    </span>
                  </td>
                  <td>
                    <span className="status-badge received">
                      <CheckCircle2 size={14} />
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan="6" className="empty-state">
                    No handover logs found matching "{searchTerm}"
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

export default HandoverLogs;
