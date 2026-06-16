import React from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar
} from 'recharts';
import { Truck, Clock, TrendingUp, DollarSign } from 'lucide-react';
import './ProviderDashboard.css';

const revenueData = [
  { name: 'Mon', revenue: 4500 },
  { name: 'Tue', revenue: 5200 },
  { name: 'Wed', revenue: 3800 },
  { name: 'Thu', revenue: 6500 },
  { name: 'Fri', revenue: 4800 },
  { name: 'Sat', revenue: 7000 },
  { name: 'Sun', revenue: 6100 },
];

const transportTypeData = [
  { name: 'Emergency', volume: 120 },
  { name: 'Inter-facility', volume: 85 },
  { name: 'Bariatric', volume: 20 },
  { name: 'Neonatal', volume: 15 },
];

const ProviderDashboard = () => {
  return (
    <div className="provider-dashboard">
      <div className="dashboard-header">
        <h1 className="page-title">Analytics Dashboard</h1>
        <p className="page-subtitle">Overview of your fleet's performance and revenue metrics.</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon-wrapper bg-blue-100 text-blue-600">
            <Truck size={24} />
          </div>
          <div className="stat-info">
            <p className="stat-label">Total Transports (Week)</p>
            <h3 className="stat-value">240</h3>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-wrapper bg-orange-100 text-orange-600">
            <Clock size={24} />
          </div>
          <div className="stat-info">
            <p className="stat-label">Avg Chute Time</p>
            <h3 className="stat-value">1m 45s</h3>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-wrapper bg-emerald-100 text-emerald-600">
            <DollarSign size={24} />
          </div>
          <div className="stat-info">
            <p className="stat-label">Est. Revenue</p>
            <h3 className="stat-value">$37,900</h3>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-wrapper bg-purple-100 text-purple-600">
            <TrendingUp size={24} />
          </div>
          <div className="stat-info">
            <p className="stat-label">Growth (MoM)</p>
            <h3 className="stat-value">+12.5%</h3>
          </div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <h2 className="chart-title">Revenue Trend (Last 7 Days)</h2>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" tick={{fill: '#64748b'}} />
                <YAxis stroke="#64748b" tick={{fill: '#64748b'}} tickFormatter={(value) => `$${value}`} />
                <RechartsTooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value) => [`$${value}`, 'Revenue']}
                />
                <Area type="monotone" dataKey="revenue" stroke="#10b981" fillOpacity={1} fill="url(#colorRevenue)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-card">
          <h2 className="chart-title">Transports by Service Type</h2>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={transportTypeData} layout="vertical" margin={{ top: 5, right: 20, bottom: 5, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={true} vertical={false} />
                <XAxis type="number" stroke="#64748b" tick={{fill: '#64748b'}} />
                <YAxis dataKey="name" type="category" stroke="#64748b" tick={{fill: '#64748b', fontSize: 12}} width={100} />
                <RechartsTooltip cursor={{fill: '#f1f5f9'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="volume" fill="#f97316" radius={[0, 4, 4, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProviderDashboard;
