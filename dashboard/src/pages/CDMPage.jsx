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
    { key: 'isImprover', label: 'Status', render: (v) => (
      <strong style={{ color: v ? COLORS.green : COLORS.red }}>{v ? '↑ Improving' : '↓ Declining'}</strong>
    )},
    { key: 'metabolicScore', label: 'Met Score', render: (v) => {
      if (!v) return '—';
      const color = v.current > 430 ? COLORS.green : v.current > 310 ? COLORS.amber : COLORS.red;
      return <span>{v.initial} → <strong style={{ color }}>{v.current}</strong></span>;
    }},
    { key: 'coachingSessions', label: 'Coaching' },
    { key: 'dietPlanAdherence', label: 'Diet Adh.', render: (v) => (
      <span style={{ fontWeight: 600, color: v >= 70 ? COLORS.green : v >= 40 ? COLORS.amber : COLORS.red }}>{v}%</span>
    )},
    { key: 'exercisePlanAdherence', label: 'Exercise Adh.', render: (v) => (
      <span style={{ fontWeight: 600, color: v >= 65 ? COLORS.green : v >= 35 ? COLORS.amber : COLORS.red }}>{v}%</span>
    )},
    { key: 'mealLoggingRate', label: 'Meal Log %', render: (v) => `${v}%` },
    { key: 'exerciseLoggingRate', label: 'Exercise Log %', render: (v) => `${v}%` },
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

      <div className="section-label">Adherence & Engagement</div>
      <div className="kpi-row five">
        <KpiCard label="Avg Diet Adherence" value={`${m.avgDietAdherence}%`}
          sub="To caloric plan" color={m.avgDietAdherence >= 60 ? 'green' : 'amber'} />
        <KpiCard label="Avg Exercise Adherence" value={`${m.avgExerciseAdherence}%`}
          sub="To workout plan" color={m.avgExerciseAdherence >= 55 ? 'green' : 'amber'} />
        <KpiCard label="Avg Daily Steps" value={m.avgDailySteps?.toLocaleString() || '—'}
          sub="NEAT indicator" color="accent" />
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
        <Panel title="Avg Adherence: Diet vs Exercise" dotColor={COLORS.purple} tag="Bar">
          <ChartWrapper type="bar" height={220} data={{
            labels: ['Diet Adherence', 'Exercise Adherence', 'Meal Logging', 'Exercise Logging'],
            datasets: [{
              label: 'Avg %',
              data: [m.avgDietAdherence, m.avgExerciseAdherence, m.avgMealLoggingRate, m.avgExerciseLoggingRate],
              backgroundColor: [COLORS.green, COLORS.accent, COLORS.blue, COLORS.purple],
              borderRadius: 3,
            }]
          }} options={{
            plugins: { legend: { display: false } },
            scales: { y: { max: 100, ticks: { callback: v => v + '%' } } }
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
