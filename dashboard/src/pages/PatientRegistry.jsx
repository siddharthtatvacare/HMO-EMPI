import { useState, useEffect, useMemo } from 'react';
import Panel from '../components/Panel';
import DataTable from '../components/DataTable';
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
      metabolicScore: cdm?.metabolicScore ?? '—',
    };
  }), []);

  if (selectedPatient) {
    return <PatientDetail patientId={selectedPatient} onBack={() => setSelectedPatient(null)} />;
  }

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Patient Name' },
    { key: 'gender', label: 'Gender' },
    { key: 'age', label: 'Age' },
    { key: 'specialisation', label: 'Spec.' },
    { key: 'center', label: 'Center', render: v => v?.replace('Aventus - ', '') },
    { key: 'doctor', label: 'Doctor' },
    { key: 'enrollDate', label: 'Enrolled' },
    { key: 'consultCount', label: 'Consults' },
    { key: 'pharmaCount', label: 'Rx Orders' },
    { key: 'diagCount', label: 'Diag.' },
    { key: 'cdmEnrolled', label: 'CDM' },
    { key: 'metabolicScore', label: 'Score' },
  ];

  return (
    <div>
      <div className="section-label">Patient Registry — 1,000 Patients</div>
      <Panel>
        <DataTable
          columns={columns}
          data={enriched}
          searchKeys={['name', 'id', 'doctor', 'center', 'specialisation']}
          onRowClick={row => setSelectedPatient(row.id)}
          pageSize={20}
        />
      </Panel>
    </div>
  );
}
