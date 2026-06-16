import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  LineChart, Line
} from 'recharts';
import { Users, Ambulance, Clock, TrendingUp } from 'lucide-react';
import './AdminDashboard.css';

const inboundData = [
  { name: 'Mon', patients: 45 },
  { name: 'Tue', patients: 52 },
  { name: 'Wed', patients: 38 },
  { name: 'Thu', patients: 65 },
  { name: 'Fri', patients: 48 },
  { name: 'Sat', patients: 70 },
  { name: 'Sun', patients: 61 },
];

const providerData = [
  { name: 'City EMS', volume: 120 },
  { name: 'Metro Rescue', volume: 85 },
  { name: 'First Response', volume: 60 },
  { name: 'County Fire', volume: 45 },
];

const AdminDashboard = () => {
  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1 className="page-title">Admin Dashboard</h1>
        <p className="page-subtitle">Overview of hospital operations and inbound metrics.</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon-wrapper bg-teal-100 text-teal-600">
            <Users size={24} />
          </div>
          <div className="stat-info">
            <p className="stat-label">Total Inbound (Week)</p>
            <h3 className="stat-value">379</h3>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-wrapper bg-blue-100 text-blue-600">
            <Ambulance size={24} />
          </div>
          <div className="stat-info">
            <p className="stat-label">Active Transports</p>
            <h3 className="stat-value">12</h3>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-wrapper bg-orange-100 text-orange-600">
            <Clock size={24} />
          </div>
          <div className="stat-info">
            <p className="stat-label">Avg Handover Time</p>
            <h3 className="stat-value">14m</h3>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-wrapper bg-purple-100 text-purple-600">
            <TrendingUp size={24} />
          </div>
          <div className="stat-info">
            <p className="stat-label">Diversion Rate</p>
            <h3 className="stat-value">4.2%</h3>
          </div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <h2 className="chart-title">Inbound Patients by Day</h2>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={inboundData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" tick={{fill: '#64748b'}} />
                <YAxis stroke="#64748b" tick={{fill: '#64748b'}} />
                <RechartsTooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Line type="monotone" dataKey="patients" stroke="#0D9488" strokeWidth={3} dot={{r: 4, fill: '#0D9488'}} activeDot={{r: 6}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-card">
          <h2 className="chart-title">Top Providers by Volume</h2>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={providerData} layout="vertical" margin={{ top: 5, right: 20, bottom: 5, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={true} vertical={false} />
                <XAxis type="number" stroke="#64748b" tick={{fill: '#64748b'}} />
                <YAxis dataKey="name" type="category" stroke="#64748b" tick={{fill: '#64748b', fontSize: 12}} width={100} />
                <RechartsTooltip cursor={{fill: '#f1f5f9'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="volume" fill="#0284c7" radius={[0, 4, 4, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
