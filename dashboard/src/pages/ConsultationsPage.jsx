import KpiCard from '../components/KpiCard';
import Panel from '../components/Panel';
import ChartWrapper from '../components/ChartWrapper';
import DataTable from '../components/DataTable';
import { StatusBadge } from '../components/Badge';
import { consultations, consultationMetrics } from '../data/store';

const COLORS = {
  primary: '#1B2A4A', accent: '#048A81', green: '#00875A', amber: '#C27D2E',
  blue: '#0052CC', purple: '#6554C0'
};

export default function ConsultationsPage({ onPatientClick }) {
  const m = consultationMetrics;

  const topDoctors = Object.entries(m.byDoctor)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  const months = Object.keys(m.byMonth).sort();

  const columns = [
    { key: 'consultationId', label: 'ID' },
    { key: 'patientName', label: 'Patient' },
    { key: 'gender', label: 'Gender' },
    { key: 'doctorName', label: 'Doctor' },
    { key: 'centerName', label: 'Center', render: v => v?.replace('Aventus - ', '') },
    { key: 'callType', label: 'Call Type' },
    { key: 'specialisation', label: 'Spec.' },
    { key: 'requestStatus', label: 'Status', render: v => <StatusBadge status={v} /> },
    { key: 'requestDate', label: 'Requested' },
    { key: 'appointmentDate', label: 'Appointment' },
    { key: 'prescriptionUrl', label: 'Rx', render: v => v ? '✓' : '—' },
  ];

  return (
    <div>
      <div className="section-label">Consultation Overview</div>
      <div className="kpi-row five">
        <KpiCard label="Total Consultations" value={m.total.toLocaleString()} color="" />
        <KpiCard label="Confirmed" value={m.confirmed.toLocaleString()} sub={`${m.confirmRate}%`} color="green" />
        <KpiCard label="Cancelled" value={m.cancelled.toLocaleString()} sub={`${(100 - parseFloat(m.confirmRate)).toFixed(1)}%`} color="red" />
        <KpiCard label="With Prescription" value={m.withPrescription.toLocaleString()} sub={`${m.prescriptionRate}% of confirmed`} color="blue" />
        <KpiCard label="Unique Doctors" value={Object.keys(m.byDoctor).length} color="purple" />
      </div>

      <div className="chart-grid two">
        <Panel title="Monthly Consultation Trend" dotColor={COLORS.primary} tag="Bar Chart">
          <ChartWrapper type="bar" height={250} data={{
            labels: months.map(m => {
              const [y, mo] = m.split('-');
              return new Date(y, mo - 1).toLocaleString('default', { month: 'short', year: '2-digit' });
            }),
            datasets: [{
              label: 'Consultations',
              data: months.map(m2 => consultationMetrics.byMonth[m2]),
              backgroundColor: COLORS.primary
            }]
          }} />
        </Panel>
        <Panel title="Top 10 Doctors by Volume" dotColor={COLORS.accent} tag="Horizontal Bar">
          <ChartWrapper type="bar" height={250} data={{
            labels: topDoctors.map(([name]) => name.replace('Dr. ', '')),
            datasets: [{
              label: 'Consultations',
              data: topDoctors.map(([, count]) => count),
              backgroundColor: COLORS.accent
            }]
          }} options={{ indexAxis: 'y' }} />
        </Panel>
      </div>

      <div className="chart-grid three">
        <Panel title="By Center" dotColor={COLORS.blue} tag="Doughnut">
          <ChartWrapper type="doughnut" height={200} data={{
            labels: Object.keys(m.byCenter).map(l => l.replace('Aventus - ', '')),
            datasets: [{
              data: Object.values(m.byCenter),
              backgroundColor: [COLORS.primary, COLORS.accent, COLORS.blue]
            }]
          }} />
        </Panel>
        <Panel title="By Specialisation" dotColor={COLORS.purple} tag="Doughnut">
          <ChartWrapper type="doughnut" height={200} data={{
            labels: Object.keys(m.bySpecialisation),
            datasets: [{
              data: Object.values(m.bySpecialisation),
              backgroundColor: [COLORS.green, COLORS.amber, COLORS.purple]
            }]
          }} />
        </Panel>
        <Panel title="By Call Type" dotColor={COLORS.green} tag="Pie">
          <ChartWrapper type="pie" height={200} data={{
            labels: Object.keys(m.byCallType),
            datasets: [{
              data: Object.values(m.byCallType),
              backgroundColor: [COLORS.primary, COLORS.accent]
            }]
          }} />
        </Panel>
      </div>

      <div className="section-label">Consultation Records</div>
      <Panel>
        <DataTable
          columns={columns}
          data={consultations}
          searchKeys={['patientName', 'doctorName', 'consultationId', 'centerName']}
          onRowClick={row => onPatientClick(row.patientId)}
        />
      </Panel>
    </div>
  );
}
