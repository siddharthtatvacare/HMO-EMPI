import { useState } from 'react';
import PopulationRiskPage from './pages/PopulationRiskPage';
import HealthOutcomesPage from './pages/HealthOutcomesPage';
import EcosystemRetentionPage from './pages/EcosystemRetentionPage';
import FinancialIntelligencePage from './pages/FinancialIntelligencePage';
import OperationsPage from './pages/OperationsPage';
import PatientRegistry from './pages/PatientRegistry';
import './App.css';

const TABS = [
  { id: 'population-risk', label: 'Population Risk Overview' },
  { id: 'health-outcomes', label: 'Health Outcomes' },
  { id: 'ecosystem', label: 'Ecosystem Retention' },
  { id: 'financial', label: 'Financial Intelligence' },
  { id: 'operations', label: 'Operations' },
  { id: 'patients', label: 'Patient Registry' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('population-risk');

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
            <div className="brand-title">Intellicare — HMO EMPI Dashboard</div>
            <div className="brand-sub">Enterprise Master Patient Index &bull; Philippines</div>
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
        {activeTab === 'population-risk' && <PopulationRiskPage onDrillDown={handleDrillDown} onPatientClick={handlePatientClick} />}
        {activeTab === 'health-outcomes' && <HealthOutcomesPage onPatientClick={handlePatientClick} />}
        {activeTab === 'ecosystem' && <EcosystemRetentionPage onPatientClick={handlePatientClick} />}
        {activeTab === 'financial' && <FinancialIntelligencePage onPatientClick={handlePatientClick} />}
        {activeTab === 'operations' && <OperationsPage onPatientClick={handlePatientClick} />}
        {activeTab === 'patients' && <PatientRegistry />}
      </div>
    </>
  );
}
