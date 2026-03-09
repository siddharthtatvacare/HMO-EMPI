import { useEffect, useRef } from 'react';
import DataTable from './DataTable';
import RiskBadge from './RiskBadge';

const PATIENT_COLUMNS = [
  { key: 'name', label: 'Patient Name' },
  { key: 'age', label: 'Age' },
  { key: 'gender', label: 'Gender' },
  { key: 'employer', label: 'Employer' },
  { key: 'riskCohort', label: 'Risk Cohort', render: (val) => <RiskBadge cohort={val} /> },
  { key: 'profilesOffQ2', label: 'Prof. Off' },
  { key: 'totalClaims', label: 'Total Claims', render: (val) => '₱' + (val || 0).toLocaleString() },
  { key: 'isCDM', label: 'CDM', render: (val) => (
    <span style={{ color: val ? 'var(--green)' : 'var(--text-muted)', fontWeight: val ? 600 : 400 }}>
      {val ? 'Yes' : 'No'}
    </span>
  )},
];

export default function DrillDownPanel({ title, data, columns, onClose, onPatientClick, searchKeys }) {
  const panelRef = useRef(null);

  useEffect(() => {
    function handleEsc(e) { if (e.key === 'Escape') onClose(); }
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  // Prepare data: add profilesOffQ2 for patient data if not present
  const displayData = data.map(row => ({
    ...row,
    profilesOffQ2: row.profilesOffQ2 ?? row.profilesOff?.q2 ?? row.profilesOff ?? '—',
  }));

  const cols = columns || PATIENT_COLUMNS;
  const patientNameCol = cols.find(c => c.key === 'name');
  const finalColumns = onPatientClick && patientNameCol && !patientNameCol._wrapped
    ? cols.map(c => c.key === 'name' ? {
        ...c,
        _wrapped: true,
        render: (val, row) => (
          <span style={{ color: 'var(--accent)', cursor: 'pointer', fontWeight: 600 }}
            onClick={(e) => { e.stopPropagation(); onPatientClick(row.id); }}>
            {val}
          </span>
        ),
      } : c)
    : cols;

  return (
    <div className="drilldown-overlay" onClick={onClose}>
      <div className="drilldown-panel" ref={panelRef} onClick={e => e.stopPropagation()}>
        <div className="drilldown-header">
          <div className="drilldown-title">{title}</div>
          <div className="drilldown-meta">{displayData.length} records</div>
          <button className="drilldown-close" onClick={onClose}>✕</button>
        </div>
        <div className="drilldown-body">
          <DataTable
            columns={finalColumns}
            data={displayData}
            pageSize={15}
            searchKeys={searchKeys || ['name', 'employer', 'riskCohort']}
          />
        </div>
      </div>
    </div>
  );
}

// Re-export default columns for use in pages
export { PATIENT_COLUMNS };
