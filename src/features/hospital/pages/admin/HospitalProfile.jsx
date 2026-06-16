import React, { useState } from 'react';
import { Save, Building, MapPin, Phone, Mail } from 'lucide-react';
import './HospitalProfile.css';

const HospitalProfile = () => {
  const [capabilities, setCapabilities] = useState({
    trauma: true,
    stroke: false,
    maternity: true,
    pediatric: false,
    cardiac: true,
  });

  const toggleCapability = (key) => {
    setCapabilities(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="hospital-profile">
      <div className="page-header">
        <div>
          <h1 className="page-title">Hospital Profile</h1>
          <p className="page-subtitle">Manage your facility details and capabilities.</p>
        </div>
        <button className="btn-save">
          <Save size={18} />
          Save Changes
        </button>
      </div>

      <div className="profile-grid">
        {/* Basic Info */}
        <div className="profile-card">
          <h2 className="card-title">General Information</h2>
          <div className="form-group">
            <label className="form-label">Hospital Name</label>
            <div className="input-wrapper">
              <Building className="input-icon" size={18} />
              <input type="text" className="form-input" defaultValue="City General Hospital" />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Address</label>
            <div className="input-wrapper">
              <MapPin className="input-icon" size={18} />
              <input type="text" className="form-input" defaultValue="123 Medical Center Blvd" />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group flex-1">
              <label className="form-label">Contact Phone</label>
              <div className="input-wrapper">
                <Phone className="input-icon" size={18} />
                <input type="tel" className="form-input" defaultValue="(555) 123-4567" />
              </div>
            </div>
            <div className="form-group flex-1">
              <label className="form-label">Email</label>
              <div className="input-wrapper">
                <Mail className="input-icon" size={18} />
                <input type="email" className="form-input" defaultValue="admin@citygeneral.org" />
              </div>
            </div>
          </div>
        </div>

        {/* Capabilities */}
        <div className="profile-card">
          <h2 className="card-title">Medical Capabilities</h2>
          <p className="card-description">Toggle the specialized services available at your facility. This updates your status on the ER Radar.</p>
          
          <div className="capabilities-list">
            <div className="capability-item">
              <div className="capability-info">
                <span className="capability-name">Trauma Center Level 1</span>
                <span className="capability-desc">Comprehensive regional resource</span>
              </div>
              <button 
                className={`toggle-switch ${capabilities.trauma ? 'active' : ''}`}
                onClick={() => toggleCapability('trauma')}
              >
                <span className="toggle-slider"></span>
              </button>
            </div>

            <div className="capability-item">
              <div className="capability-info">
                <span className="capability-name">Primary Stroke Center</span>
                <span className="capability-desc">Certified stroke care</span>
              </div>
              <button 
                className={`toggle-switch ${capabilities.stroke ? 'active' : ''}`}
                onClick={() => toggleCapability('stroke')}
              >
                <span className="toggle-slider"></span>
              </button>
            </div>

            <div className="capability-item">
              <div className="capability-info">
                <span className="capability-name">Maternity Unit</span>
                <span className="capability-desc">Labor, delivery, and NICU</span>
              </div>
              <button 
                className={`toggle-switch ${capabilities.maternity ? 'active' : ''}`}
                onClick={() => toggleCapability('maternity')}
              >
                <span className="toggle-slider"></span>
              </button>
            </div>

            <div className="capability-item">
              <div className="capability-info">
                <span className="capability-name">Pediatric ER</span>
                <span className="capability-desc">Dedicated pediatric emergency</span>
              </div>
              <button 
                className={`toggle-switch ${capabilities.pediatric ? 'active' : ''}`}
                onClick={() => toggleCapability('pediatric')}
              >
                <span className="toggle-slider"></span>
              </button>
            </div>

            <div className="capability-item">
              <div className="capability-info">
                <span className="capability-name">Cardiac Cath Lab</span>
                <span className="capability-desc">24/7 STEMI receiving center</span>
              </div>
              <button 
                className={`toggle-switch ${capabilities.cardiac ? 'active' : ''}`}
                onClick={() => toggleCapability('cardiac')}
              >
                <span className="toggle-slider"></span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HospitalProfile;
