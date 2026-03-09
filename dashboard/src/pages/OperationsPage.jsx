import { useState } from 'react';
import ConsultationsPage from './ConsultationsPage';
import PharmacyPage from './PharmacyPage';
import DiagnosticsPage from './DiagnosticsPage';

const SUB_TABS = [
  { id: 'consultations', label: 'Consultations' },
  { id: 'pharmacy', label: 'Pharmacy' },
  { id: 'diagnostics', label: 'Diagnostics' },
];

export default function OperationsPage({ onPatientClick }) {
  const [activeSubTab, setActiveSubTab] = useState('consultations');

  return (
    <div>
      <div className="sub-tab-nav">
        {SUB_TABS.map(tab => (
          <button
            key={tab.id}
            className={`sub-tab-btn ${activeSubTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveSubTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="sub-tab-content">
        {activeSubTab === 'consultations' && <ConsultationsPage onPatientClick={onPatientClick} />}
        {activeSubTab === 'pharmacy' && <PharmacyPage onPatientClick={onPatientClick} />}
        {activeSubTab === 'diagnostics' && <DiagnosticsPage onPatientClick={onPatientClick} />}
      </div>
    </div>
  );
}
