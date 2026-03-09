import { useState, useEffect, useMemo } from 'react';
import Panel from '../components/Panel';
import DataTable from '../components/DataTable';
import RiskBadge from '../components/RiskBadge';
import PatientDetail from './PatientDetail';
import { patients, consultations, pharmacyOrders, diagnosticOrders, cdmRecords } from '../data/store';

export default function PatientRegistry() {
  const [selectedPatient, setSelectedPatient] = useState(null);

  useEffect(() => {
    function handler(e) { setSelectedPatient(e.detail); }
    window.addEventListener('selectPatient', handler);
    return () => window.removeEventListener('selectPatient', handler);
  }, []);

  const enriched = useMemo(() => patients.map(p => {
    const numConsults = consultations.filter(c => c.patientId === p.id).length;
    const numPharma = pharmacyOrders.filter(o => o.patientId === p.id).length;
    const numDiag = diagnosticOrders.filter(o => o.patientId === p.id).length;
    const cdm = cdmRecords.find(r => r.patientId === p.id);
    return {
      ...p,
      consultCount: numConsults,
      pharmaCount: numPharma,
      diagCount: numDiag,
      cdmEnrolled: cdm ? 'Yes' : 'No',
      metScoreValue: cdm?.metabolicScore?.current ?? null,
      metScoreLabel: cdm?.metabolicScore?.label ?? '—',
      profilesOffQ2: p.profilesOff?.q2 ?? '—',
    };
  }), []);

  if (selectedPatient) {
    return <PatientDetail patientId={selectedPatient} onBack={() => setSelectedPatient(null)} />;
  }

  const columns = [
    { key: 'name', label: 'Patient Name' },
    { key: 'age', label: 'Age' },
    { key: 'gender', label: 'Gender' },
    { key: 'employer', label: 'Employer' },
    { key: 'riskCohort', label: 'Risk Cohort', render: (val) => <RiskBadge cohort={val} /> },
    { key: 'profilesOffQ2', label: 'Prof. Off' },
    { key: 'center', label: 'Center', render: (val) => val?.replace('Aventus - ', '') },
    { key: 'cdmEnrolled', label: 'CDM', render: (val) => (
      <span style={{ color: val === 'Yes' ? 'var(--green)' : 'var(--text-muted)', fontWeight: val === 'Yes' ? 600 : 400 }}>
        {val}
      </span>
    )},
    { key: 'metScoreLabel', label: 'Met Score' },
    { key: 'consultCount', label: 'Consults' },
    { key: 'pharmaCount', label: 'Rx' },
    { key: 'diagCount', label: 'Diag.' },
    { key: 'enrollDate', label: 'Enrolled' },
  ];

  return (
    <div>
      <div className="section-label">Patient Registry — 1,000 Patients</div>
      <Panel>
        <DataTable
          columns={columns}
          data={enriched}
          searchKeys={['name', 'employer', 'doctor', 'center', 'riskCohort']}
          onRowClick={row => setSelectedPatient(row.id)}
          pageSize={20}
        />
      </Panel>
    </div>
  );
}
