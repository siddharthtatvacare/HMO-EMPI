import KpiCard from '../components/KpiCard';
import Panel from '../components/Panel';
import DataTable from '../components/DataTable';
import { StatusBadge } from '../components/Badge';
import {
  getPatientById, getConsultationsForPatient, getPharmacyOrdersForPatient,
  getDiagnosticOrdersForPatient, getCDMRecordForPatient
} from '../data/store';

export default function PatientDetail({ patientId, onBack }) {
  const patient = getPatientById(patientId);
  if (!patient) return <div className="panel">Patient not found.</div>;

  const consults = getConsultationsForPatient(patientId);
  const pharma = getPharmacyOrdersForPatient(patientId);
  const diag = getDiagnosticOrdersForPatient(patientId);
  const cdm = getCDMRecordForPatient(patientId);

  const totalSpent = pharma.reduce((s, o) => s + o.amount, 0);
  const totalCovered = pharma.reduce((s, o) => s + o.walletDeduction, 0);

  return (
    <div>
      <button className="back-btn" onClick={onBack}>← Back to list</button>

      <div className="patient-header">
        <div className="patient-avatar">{patient.name.charAt(0)}</div>
        <div>
          <h2 className="patient-name">{patient.name}</h2>
          <div className="patient-meta">
            {patient.id} &bull; {patient.gender}, {patient.age}y &bull; {patient.specialisation} &bull; {patient.center.replace('Aventus - ', '')}
          </div>
          <div className="patient-meta">
            {patient.phone} &bull; {patient.email}
          </div>
          <div className="patient-meta">
            Doctor: {patient.doctor} &bull; Enrolled: {patient.enrollDate}
          </div>
        </div>
      </div>

      <div className="kpi-row five">
        <KpiCard label="Consultations" value={consults.length} color="" />
        <KpiCard label="Pharmacy Orders" value={pharma.length} color="blue" />
        <KpiCard label="Diagnostic Orders" value={diag.length} color="purple" />
        <KpiCard label="Total Rx Value" value={`₱${totalSpent.toLocaleString(undefined, {maximumFractionDigits: 0})}`} color="" />
        <KpiCard label="Unilabs Covered" value={`₱${totalCovered.toLocaleString(undefined, {maximumFractionDigits: 0})}`} color="green" />
      </div>

      {cdm && (
        <>
          <div className="section-label">CDM — Chronic Disease Management</div>
          <div className="kpi-row five">
            <KpiCard label="Metabolic Score" value={cdm.metabolicScore}
              sub={`Initial: ${cdm.initialScore}`}
              color={cdm.metabolicScore > cdm.initialScore ? 'green' : 'red'} />
            <KpiCard label="Diet Consults" value={cdm.dietConsultationsBooked} color="accent" />
            <KpiCard label="Physio Consults" value={cdm.physioConsultationsBooked} color="blue" />
            <KpiCard label="Meal Logs" value={cdm.mealLoggingCount} color="green" />
            <KpiCard label="Exercise Logs" value={cdm.exerciseLoggingCount} color="purple" />
          </div>
        </>
      )}

      <div className="section-label">Consultations</div>
      <Panel>
        <DataTable
          columns={[
            { key: 'consultationId', label: 'ID' },
            { key: 'doctorName', label: 'Doctor' },
            { key: 'callType', label: 'Type' },
            { key: 'specialisation', label: 'Spec.' },
            { key: 'requestStatus', label: 'Status', render: v => <StatusBadge status={v} /> },
            { key: 'requestDate', label: 'Requested' },
            { key: 'appointmentDate', label: 'Appointment' },
            { key: 'prescriptionUrl', label: 'Rx', render: v => v ? '✓' : '—' },
          ]}
          data={consults}
          pageSize={10}
        />
      </Panel>

      {pharma.length > 0 && (
        <>
          <div className="section-label">Pharmacy Orders</div>
          <Panel>
            <DataTable
              columns={[
                { key: 'orderId', label: 'Order' },
                { key: 'medicine', label: 'Medicine' },
                { key: 'medicineStatus', label: 'Coverage', render: v => <StatusBadge status={v} /> },
                { key: 'rxApprovalStatus', label: 'Rx', render: v => <StatusBadge status={v} /> },
                { key: 'orderStatus', label: 'Status', render: v => <StatusBadge status={v} /> },
                { key: 'amount', label: 'Amount', render: v => `₱${v?.toLocaleString()}` },
                { key: 'walletDeduction', label: 'Covered', render: v => v > 0 ? `₱${v?.toLocaleString()}` : '—' },
                { key: 'coPay', label: 'Co-Pay', render: v => v > 0 ? `₱${v?.toLocaleString()}` : '—' },
              ]}
              data={pharma}
              pageSize={10}
            />
          </Panel>
        </>
      )}

      {diag.length > 0 && (
        <>
          <div className="section-label">Diagnostic Orders</div>
          <Panel>
            <DataTable
              columns={[
                { key: 'orderId', label: 'Order' },
                { key: 'test', label: 'Test' },
                { key: 'type', label: 'Type' },
                { key: 'cartStatus', label: 'Cart', render: v => <StatusBadge status={v} /> },
                { key: 'detailedStatus', label: 'Status', render: v => <StatusBadge status={v} /> },
                { key: 'orderOn', label: 'Ordered' },
                { key: 'deliveredDate', label: 'Delivered' },
              ]}
              data={diag}
              pageSize={10}
            />
          </Panel>
        </>
      )}
    </div>
  );
}
