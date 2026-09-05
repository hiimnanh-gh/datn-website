import { useState } from 'react';
import { Megaphone, Plus, Image as ImageIcon, Send, Clock, CheckCircle2 } from 'lucide-react';
import './Marketing.css';

const Marketing = () => {
  const [campaigns] = useState([]);

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
            {campaigns.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-xl border border-slate-200 text-slate-500">
                <Megaphone size={32} className="mx-auto mb-2 text-slate-300" />
                <p className="font-semibold text-slate-700 text-sm">Chưa có chiến dịch truyền thông</p>
                <p className="text-xs text-slate-400 mt-1">Backend chưa cung cấp API lưu trữ chiến dịch truyền thông (Backend Gap) hoặc chưa có dữ liệu.</p>
              </div>
            ) : (
              campaigns.map(camp => (
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
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Marketing;
