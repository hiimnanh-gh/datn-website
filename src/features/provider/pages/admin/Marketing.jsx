import React, { useState } from 'react';
import { Megaphone, Plus, Image as ImageIcon, Send, Clock, CheckCircle2 } from 'lucide-react';
import './Marketing.css';

const INITIAL_CAMPAIGNS = [
  { id: 1, title: 'Summer Safety Tips', status: 'PUBLISHED', date: 'Jun 10, 2026', views: 1205 },
  { id: 2, title: 'New Fleet Expansion: Neonatal Units', status: 'DRAFT', date: 'Pending', views: 0 },
  { id: 3, title: 'CPR Certification Drive', status: 'SCHEDULED', date: 'Jul 01, 2026', views: 0 },
];

const Marketing = () => {
  const [campaigns] = useState(INITIAL_CAMPAIGNS);

  const getStatusIcon = (status) => {
    switch(status) {
      case 'PUBLISHED': return <CheckCircle2 size={16} className="text-emerald-500" />;
      case 'DRAFT': return <ImageIcon size={16} className="text-slate-400" />;
      case 'SCHEDULED': return <Clock size={16} className="text-blue-500" />;
      default: return null;
    }
  };

  return (
    <div className="marketing-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Marketing & Promotions</h1>
          <p className="page-subtitle">Manage public articles and service announcements.</p>
        </div>
        <button className="btn-create">
          <Plus size={18} />
          <span>New Campaign</span>
        </button>
      </div>

      <div className="marketing-grid">
        {/* Composer Section */}
        <div className="composer-card">
          <div className="composer-header">
            <Megaphone className="text-orange-600" size={20} />
            <h2 className="text-lg font-semibold text-slate-800">Quick Draft</h2>
          </div>
          <div className="composer-body">
            <input 
              type="text" 
              placeholder="Campaign Title..." 
              className="composer-input font-bold"
            />
            <textarea 
              placeholder="Write your promotional content here..." 
              className="composer-textarea"
              rows={6}
            />
            <div className="composer-footer">
              <button className="btn-icon-text">
                <ImageIcon size={18} />
                <span>Add Media</span>
              </button>
              <div className="composer-actions">
                <button className="btn-secondary">Save Draft</button>
                <button className="btn-primary">
                  <Send size={16} />
                  <span>Publish</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Existing Campaigns */}
        <div className="campaigns-list">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Recent Campaigns</h2>
          <div className="campaigns-wrapper">
            {campaigns.map(camp => (
              <div key={camp.id} className="campaign-card">
                <div className="campaign-info">
                  <div className="flex items-center gap-2 mb-1">
                    {getStatusIcon(camp.status)}
                    <span className={`status-text status-${camp.status.toLowerCase()}`}>
                      {camp.status}
                    </span>
                  </div>
                  <h3 className="campaign-title">{camp.title}</h3>
                  <div className="campaign-meta">
                    <span>{camp.date}</span>
                    <span className="bullet">&bull;</span>
                    <span>{camp.views} views</span>
                  </div>
                </div>
                <button className="btn-outline-small">Manage</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Marketing;
