import KpiCard from '../components/KpiCard';
import Panel from '../components/Panel';
import ChartWrapper from '../components/ChartWrapper';
import DataTable from '../components/DataTable';
import { cdmRecords, cdmMetrics, patients } from '../data/store';

const COLORS = {
  primary: '#1B2A4A', accent: '#048A81', green: '#00875A', amber: '#C27D2E',
  blue: '#0052CC', purple: '#6554C0', red: '#DE350B'
};

export default function CDMPage({ onPatientClick }) {
  const m = cdmMetrics;

  const scoreLabels = Object.keys(m.scoreDistribution);
  const scoreValues = Object.values(m.scoreDistribution);

  const columns = [
    { key: 'patientName', label: 'Patient' },
    { key: 'age', label: 'Age' },
    { key: 'initialScore', label: 'Initial Score' },
    { key: 'metabolicScore', label: 'Current Score', render: (v) => {
      const color = v > 70 ? COLORS.green : v > 50 ? COLORS.amber : COLORS.red;
      return <strong style={{ color }}>{v}</strong>;
    }},
    { key: 'dietPlanAssignedDate', label: 'Diet Plan' },
    { key: 'physioPlanAssignedDate', label: 'Physio Plan' },
    { key: 'dietConsultationsBooked', label: 'Diet Consults' },
    { key: 'physioConsultationsBooked', label: 'Physio Consults' },
    { key: 'mealLoggingCount', label: 'Meal Logs' },
    { key: 'exerciseLoggingCount', label: 'Exercise Logs' },
  ];

  return (
    <div>
      <div className="section-label">CDM Overview</div>
      <div className="kpi-row five">
        <KpiCard label="CDM Enrolled" value={m.total.toLocaleString()}
          sub={`${((m.total / patients.length) * 100).toFixed(1)}% of all patients`} color="" />
        <KpiCard label="Avg. Metabolic Score" value={m.avgMetabolicScore}
          sub={`Initial: ${m.avgInitialScore}`} color="accent" />
        <KpiCard label="Improved Scores" value={m.improved.toLocaleString()}
          sub={`${m.improvementRate}%`} color="green" />
        <KpiCard label="Total Diet Consults" value={m.totalDietConsults.toLocaleString()}
          sub={`Avg: ${(m.totalDietConsults / m.total).toFixed(1)} per patient`} color="blue" />
        <KpiCard label="Total Physio Consults" value={m.totalPhysioConsults.toLocaleString()}
          sub={`Avg: ${(m.totalPhysioConsults / m.total).toFixed(1)} per patient`} color="purple" />
      </div>

      <div className="section-label">Engagement Metrics</div>
      <div className="kpi-row four">
        <KpiCard label="Total Meal Logs" value={m.totalMealLogs.toLocaleString()} sub={`Avg: ${m.avgMealLogs}/patient`} color="green" />
        <KpiCard label="Total Exercise Logs" value={m.totalExerciseLogs.toLocaleString()} sub={`Avg: ${m.avgExerciseLogs}/patient`} color="blue" />
        <KpiCard label="Not Enrolled" value={(patients.length - m.total).toLocaleString()}
          sub="Opportunity for outreach" color="amber" />
        <KpiCard label="Score Declined" value={(m.total - m.improved).toLocaleString()}
          sub="Need coaching review" color="red" />
      </div>

      <div className="chart-grid two">
        <Panel title="Metabolic Score Distribution" dotColor={COLORS.accent} tag="Bar Chart">
          <ChartWrapper type="bar" height={250} data={{
            labels: scoreLabels,
            datasets: [{
              label: 'Patients',
              data: scoreValues,
              backgroundColor: [COLORS.red, COLORS.amber, COLORS.blue, COLORS.green, COLORS.accent]
            }]
          }} />
        </Panel>
        <Panel title="Center-wise CDM Performance" dotColor={COLORS.blue} tag="Bar Chart">
          <ChartWrapper type="bar" height={250} data={{
            labels: Object.keys(m.byCenter).map(l => l.replace('Aventus - ', '')),
            datasets: [
              {
                label: 'Enrolled',
                data: Object.values(m.byCenter).map(c => c.count),
                backgroundColor: COLORS.primary
              },
              {
                label: 'Avg Score',
                data: Object.values(m.byCenter).map(c => parseFloat(c.avgScore)),
                backgroundColor: COLORS.accent,
                yAxisID: 'y1'
              }
            ]
          }} options={{
            scales: {
              y: { position: 'left', title: { display: true, text: 'Enrolled' } },
              y1: { position: 'right', title: { display: true, text: 'Avg Score' }, grid: { drawOnChartArea: false } }
            }
          }} />
        </Panel>
      </div>

      <div className="chart-grid two">
        <Panel title="Diet vs Physio Consultations" dotColor={COLORS.green} tag="Doughnut">
          <ChartWrapper type="doughnut" height={220} data={{
            labels: ['Diet Consultations', 'Physio Consultations'],
            datasets: [{
              data: [m.totalDietConsults, m.totalPhysioConsults],
              backgroundColor: [COLORS.green, COLORS.purple]
            }]
          }} />
        </Panel>
        <Panel title="Meal vs Exercise Logging" dotColor={COLORS.purple} tag="Doughnut">
          <ChartWrapper type="doughnut" height={220} data={{
            labels: ['Meal Logs', 'Exercise Logs'],
            datasets: [{
              data: [m.totalMealLogs, m.totalExerciseLogs],
              backgroundColor: [COLORS.accent, COLORS.blue]
            }]
          }} />
        </Panel>
      </div>

      <div className="section-label">CDM Patient Records</div>
      <Panel>
        <DataTable
          columns={columns}
          data={cdmRecords}
          searchKeys={['patientName']}
          onRowClick={row => onPatientClick(row.patientId)}
        />
      </Panel>
    </div>
  );
}
