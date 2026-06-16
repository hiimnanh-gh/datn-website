import React, { useState } from 'react';
import { Plus, Search, MoreVertical, Edit2, Trash2 } from 'lucide-react';
import './StaffManagement.css';

const initialStaff = [
  { id: 1, name: 'Dr. Sarah Jenkins', email: 's.jenkins@citygeneral.org', role: 'HOSPITAL_ADMIN', status: 'Active' },
  { id: 2, name: 'Dr. John Carter', email: 'j.carter@citygeneral.org', role: 'HOSPITAL_STAFF', status: 'Active' },
  { id: 3, name: 'Nurse Mary Smith', email: 'm.smith@citygeneral.org', role: 'HOSPITAL_STAFF', status: 'Inactive' },
  { id: 4, name: 'Admin Robert King', email: 'r.king@citygeneral.org', role: 'HOSPITAL_ADMIN', status: 'Active' },
];

const StaffManagement = () => {
  const [staff, setStaff] = useState(initialStaff);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredStaff = staff.filter(person => 
    person.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    person.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="staff-management">
      <div className="page-header">
        <div>
          <h1 className="page-title">Staff Management</h1>
          <p className="page-subtitle">Manage portal access for your hospital personnel.</p>
        </div>
        <button className="btn-primary">
          <Plus size={18} />
          Add Staff
        </button>
      </div>

      <div className="table-container">
        <div className="table-toolbar">
          <div className="search-box">
            <Search className="search-icon" size={18} />
            <input 
              type="text" 
              placeholder="Search by name or email..." 
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="table-wrapper">
          <table className="staff-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStaff.map((person) => (
                <tr key={person.id}>
                  <td className="font-medium text-slate-800">{person.name}</td>
                  <td className="text-slate-500">{person.email}</td>
                  <td>
                    <span className={`role-badge ${person.role === 'HOSPITAL_ADMIN' ? 'role-admin' : 'role-staff'}`}>
                      {person.role.replace('HOSPITAL_', '')}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${person.status === 'Active' ? 'status-active' : 'status-inactive'}`}>
                      {person.status}
                    </span>
                  </td>
                  <td className="actions-cell">
                    <button className="action-btn text-blue-600 hover:bg-blue-50">
                      <Edit2 size={16} />
                    </button>
                    <button className="action-btn text-red-600 hover:bg-red-50">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredStaff.length === 0 && (
                <tr>
                  <td colSpan="5" className="empty-state">
                    No staff found matching "{searchTerm}"
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

export default StaffManagement;
