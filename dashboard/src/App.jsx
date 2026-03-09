import { useState } from 'react';
import ExecutiveSummary from './pages/ExecutiveSummary';
import ConsultationsPage from './pages/ConsultationsPage';
import PharmacyPage from './pages/PharmacyPage';
import DiagnosticsPage from './pages/DiagnosticsPage';
import CDMPage from './pages/CDMPage';
import PatientRegistry from './pages/PatientRegistry';
import './App.css';

const TABS = [
  { id: 'executive', label: 'Executive Summary' },
  { id: 'consultations', label: 'Consultations' },
  { id: 'pharmacy', label: 'Pharmacy' },
  { id: 'diagnostics', label: 'Diagnostics' },
  { id: 'cdm', label: 'CDM' },
  { id: 'patients', label: 'Patient Registry' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('executive');

  function handleDrillDown(tab) {
    setActiveTab(tab);
  }

  function handlePatientClick(patientId) {
    setActiveTab('patients');
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('selectPatient', { detail: patientId }));
    }, 50);
  }

  return (
    <>
      <div className="top-header">
        <div className="top-header-left">
          <div className="logo">IC</div>
          <div>
            <div className="brand-title">Intellicare — Platform Analytics Dashboard</div>
            <div className="brand-sub">Healthcare Analytics &bull; Philippines</div>
          </div>
        </div>
        <div className="top-header-right">
          Last Refreshed: <strong>09 Mar 2026, 10:00</strong><br />
          Data: 1,000 patients &bull; Sep 2025 – Mar 2026
        </div>
      </div>

      <div className="tab-nav">
        {TABS.map(tab => (
          <button
            key={tab.id}
            className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="tab-content">
        {activeTab === 'executive' && <ExecutiveSummary onDrillDown={handleDrillDown} />}
        {activeTab === 'consultations' && <ConsultationsPage onPatientClick={handlePatientClick} />}
        {activeTab === 'pharmacy' && <PharmacyPage onPatientClick={handlePatientClick} />}
        {activeTab === 'diagnostics' && <DiagnosticsPage onPatientClick={handlePatientClick} />}
        {activeTab === 'cdm' && <CDMPage onPatientClick={handlePatientClick} />}
        {activeTab === 'patients' && <PatientRegistry />}
      </div>
    </>
  );
}
