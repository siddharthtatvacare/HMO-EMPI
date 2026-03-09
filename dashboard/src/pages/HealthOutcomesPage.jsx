import { useState, useMemo } from 'react';
import KpiCard from '../components/KpiCard';
import Panel from '../components/Panel';
import ChartWrapper from '../components/ChartWrapper';
import SectionHeader from '../components/SectionHeader';
import RiskBadge from '../components/RiskBadge';
import DrillDownPanel from '../components/DrillDownPanel';
import { behavioralMetrics, cdmEffectivenessMetrics, riskMetrics, cdmMetrics, patients, cdmRecords } from '../data/store';
import { RISK_COHORTS } from '../data/constants';

const COHORT_COLORS = Object.fromEntries(RISK_COHORTS.map(c => [c.label, c.color]));
const COHORT_ORDER = ['Extremely Low', 'Low', 'At Risk', 'High', 'Extremely High'];

const BEHAVIOR_KEYS = [
  { key: 'exercisePerWeek', label: 'Exercise/Week', unit: 'sessions' },
  { key: 'mealsLoggedPerDay', label: 'Meals Logged/Day', unit: 'meals' },
  { key: 'waterLitersPerDay', label: 'Water/Day', unit: 'liters' },
  { key: 'sleepHoursPerNight', label: 'Sleep/Night', unit: 'hours' },
  { key: 'stressLevel', label: 'Stress Level', unit: '1-5' },
  { key: 'medicationAdherence', label: 'Med Adherence', unit: '%' },
];

export default function HealthOutcomesPage({ onPatientClick }) {
  const [drillDown, setDrillDown] = useState(null);

  const { byCohort } = behavioralMetrics;
  const { comparison, butterflyData } = cdmEffectivenessMetrics;
  const { cdmEnrolled, total, byCohortPatients } = riskMetrics;

  const cdmPatientIds = new Set(cdmRecords.map(r => r.patientId));
  const cdmPatientList = patients.filter(p => cdmPatientIds.has(p.id));
  const improverIds = new Set(cdmRecords.filter(r => r.isImprover).map(r => r.patientId));
  const declinerIds = new Set(cdmRecords.filter(r => !r.isImprover).map(r => r.patientId));

  // Section A: Behavioral mini-charts
  const behaviorCharts = useMemo(() =>
    BEHAVIOR_KEYS.map(({ key, label, unit }) => ({
      label,
      unit,
      data: {
        labels: COHORT_ORDER.map(c => c.split(' ').map(w => w[0]).join('')),
        datasets: [{
          data: COHORT_ORDER.map(c => byCohort[c]?.[key] || 0),
          backgroundColor: COHORT_ORDER.map(c => COHORT_COLORS[c]),
          borderRadius: 3,
          barThickness: 18,
        }]
      }
    }))
  , [byCohort]);

  const miniChartOptions = {
    plugins: { legend: { display: false }, tooltip: { enabled: true } },
    scales: {
      x: { grid: { display: false }, ticks: { font: { size: 8 } } },
      y: { grid: { color: '#F1F3F5' }, ticks: { font: { size: 9 } }, beginAtZero: true },
    }
  };

  // Section B: CDM vs Non-CDM comparison
  const comparisonChartData = useMemo(() => ({
    labels: COHORT_ORDER,
    datasets: [
      {
        label: 'CDM — Avg Claims',
        data: COHORT_ORDER.map(c => comparison[c]?.cdm?.avgClaims || 0),
        backgroundColor: 'var(--accent)',
        borderRadius: 3,
      },
      {
        label: 'Non-CDM — Avg Claims',
        data: COHORT_ORDER.map(c => comparison[c]?.nonCdm?.avgClaims || 0),
        backgroundColor: '#9CA3AF',
        borderRadius: 3,
      },
    ]
  }), [comparison]);

  const comparisonOptions = {
    plugins: { legend: { position: 'bottom', labels: { font: { size: 10 } } } },
    scales: {
      x: { grid: { display: false }, ticks: { font: { size: 9 } } },
      y: { grid: { color: '#F1F3F5' }, ticks: { font: { size: 10 }, callback: v => '₱' + (v / 1000).toFixed(0) + 'K' } },
    }
  };

  // Butterfly chart data
  const butterflyChartData = useMemo(() => ({
    labels: ['Coaching Sessions', 'Diet Adherence %', 'Exercise Adherence %', 'Logging Rate %'],
    datasets: [
      {
        label: `Improvers (${butterflyData.improvers.count})`,
        data: [
          butterflyData.improvers.coachingSessions,
          butterflyData.improvers.dietAdherence,
          butterflyData.improvers.exerciseAdherence,
          butterflyData.improvers.loggingRate,
        ],
        backgroundColor: '#00875A',
        borderRadius: 3,
      },
      {
        label: `Decliners (${butterflyData.decliners.count})`,
        data: [
          butterflyData.decliners.coachingSessions,
          butterflyData.decliners.dietAdherence,
          butterflyData.decliners.exerciseAdherence,
          butterflyData.decliners.loggingRate,
        ],
        backgroundColor: '#DE350B',
        borderRadius: 3,
      },
    ]
  }), [butterflyData]);

  const butterflyOptions = {
    indexAxis: 'y',
    plugins: { legend: { position: 'bottom', labels: { font: { size: 10 } } } },
    scales: {
      x: { grid: { display: false }, ticks: { font: { size: 10 } } },
      y: { grid: { display: false }, ticks: { font: { size: 10 } } },
    }
  };

  // Met Score distribution
  const metScoreData = useMemo(() => {
    const dist = cdmMetrics.scoreDistribution || {};
    const bands = Object.keys(dist);
    const bandColors = ['#DE350B', '#E8590C', '#C27D2E', '#00875A', '#0E6B5E'];
    return {
      labels: bands.map(b => b.replace(/\(.*\)/, '').trim()),
      datasets: [{
        data: bands.map(b => dist[b] || 0),
        backgroundColor: bandColors.slice(0, bands.length),
        borderRadius: 3,
        barThickness: 24,
      }]
    };
  }, []);

  const metScoreOptions = {
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false }, ticks: { font: { size: 10 } } },
      y: { grid: { color: '#F1F3F5' }, ticks: { font: { size: 10 } } },
    }
  };

  // Low-risk vs High-risk comparison panel
  const lowRisk = byCohort['Extremely Low'] || {};
  const highRisk = byCohort['Extremely High'] || {};

  // Drill-down click handlers
  function handleComparisonClick({ datasetIndex, index }) {
    const cohort = COHORT_ORDER[index];
    const isCDM = datasetIndex === 0;
    const filtered = patients.filter(p => p.riskCohort === cohort && (isCDM ? cdmPatientIds.has(p.id) : !cdmPatientIds.has(p.id)));
    setDrillDown({
      title: `${isCDM ? 'CDM' : 'Non-CDM'} Patients — ${cohort}`,
      data: filtered,
    });
  }

  function handleButterflyClick({ datasetIndex }) {
    const isImprovers = datasetIndex === 0;
    const ids = isImprovers ? improverIds : declinerIds;
    setDrillDown({
      title: isImprovers ? 'CDM Improvers' : 'CDM Decliners',
      data: patients.filter(p => ids.has(p.id)),
    });
  }

  function handleMetScoreClick({ index }) {
    const dist = cdmMetrics.scoreDistribution || {};
    const bands = Object.keys(dist);
    const band = bands[index];
    if (!band) return;
    // Parse range from band label
    const ranges = {
      'Critical (<215)': [0, 215],
      'Poor (215-309)': [215, 310],
      'Moderate (310-429)': [310, 430],
      'Good (430-525)': [430, 526],
      'Excellent (>525)': [525, 999],
    };
    const [min, max] = ranges[band] || [0, 999];
    const cdmLookup = {};
    cdmRecords.forEach(r => { cdmLookup[r.patientId] = r; });
    const filtered = cdmPatientList.filter(p => {
      const score = cdmLookup[p.id]?.metabolicScore?.current;
      return score >= min && score < max;
    });
    setDrillDown({
      title: `Met Score: ${band}`,
      data: filtered,
    });
  }

  function handleBehaviorChartClick(chartIndex, { index }) {
    const cohort = COHORT_ORDER[index];
    if (cohort && byCohortPatients?.[cohort]) {
      setDrillDown({
        title: `${cohort} Risk — ${BEHAVIOR_KEYS[chartIndex].label}`,
        data: byCohortPatients[cohort],
      });
    }
  }

  return (
    <div>
      {/* KPI Row */}
      <div className="kpi-row four">
        <KpiCard label="CDM Enrolled" value={cdmEnrolled.toLocaleString()} sub={`${((cdmEnrolled / total) * 100).toFixed(0)}% of population`} color="accent"
          onClick={() => setDrillDown({ title: 'CDM Enrolled Patients', data: cdmPatientList })} />
        <KpiCard label="CDM Improvers" value={butterflyData.improvers.count.toLocaleString()} sub={`${((butterflyData.improvers.count / (butterflyData.improvers.count + butterflyData.decliners.count)) * 100).toFixed(0)}% of CDM`} color="green"
          onClick={() => setDrillDown({ title: 'CDM Improvers', data: patients.filter(p => improverIds.has(p.id)) })} />
        <KpiCard label="CDM Decliners" value={butterflyData.decliners.count.toLocaleString()} sub="Need intervention" color="red"
          onClick={() => setDrillDown({ title: 'CDM Decliners', data: patients.filter(p => declinerIds.has(p.id)) })} />
        <KpiCard label="Avg Met Score" value={cdmMetrics.avgMetabolicScore || '—'} sub="CDM enrolled only (raw 157-616)" color="blue"
          onClick={() => setDrillDown({ title: 'All CDM Patients (by Met Score)', data: cdmPatientList })} />
      </div>

      {/* Section A: All Patients — Behavioral */}
      <SectionHeader label="Section A — All Patients: Behavioral Insights" color="#0052CC" description="App behavioral data across all 1,000 members" />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 16 }}>
        {behaviorCharts.map(({ label, data }, chartIdx) => (
          <Panel key={label} title={label}>
            <ChartWrapper type="bar" data={data} options={miniChartOptions} height={140}
              onElementClick={(info) => handleBehaviorChartClick(chartIdx, info)} />
          </Panel>
        ))}
      </div>

      {/* Low vs High risk comparison */}
      <Panel title="Low-Risk vs High-Risk Behavioral Comparison">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, fontSize: 11 }}>
          <div>
            <div style={{ fontWeight: 700, marginBottom: 8, color: '#0E6B5E' }}>Extremely Low Risk ({lowRisk.count || 0})</div>
            {BEHAVIOR_KEYS.map(({ key, label, unit }) => (
              <div key={key} style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', borderBottom: '1px solid #F1F3F5' }}>
                <span>{label}</span>
                <span style={{ fontWeight: 600 }}>{lowRisk[key] || '—'} {unit}</span>
              </div>
            ))}
          </div>
          <div>
            <div style={{ fontWeight: 700, marginBottom: 8, color: '#DE350B' }}>Extremely High Risk ({highRisk.count || 0})</div>
            {BEHAVIOR_KEYS.map(({ key, label, unit }) => (
              <div key={key} style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', borderBottom: '1px solid #F1F3F5' }}>
                <span>{label}</span>
                <span style={{ fontWeight: 600 }}>{highRisk[key] || '—'} {unit}</span>
              </div>
            ))}
          </div>
        </div>
      </Panel>

      {/* Section B: CDM Only */}
      <SectionHeader label="Section B — CDM Overlay: Effectiveness" color="#048A81" description={`${cdmEnrolled} CDM-enrolled patients only`} />

      <div className="chart-grid two">
        <Panel title="CDM vs Non-CDM — Average Claims by Risk Cohort">
          <ChartWrapper type="bar" data={comparisonChartData} options={comparisonOptions} height={260} onElementClick={handleComparisonClick} />
        </Panel>

        <Panel title="Improvers vs Decliners — Avg Engagement">
          <ChartWrapper type="bar" data={butterflyChartData} options={butterflyOptions} height={260} onElementClick={handleButterflyClick} />
        </Panel>
      </div>

      <div className="chart-grid two">
        <Panel title="Metabolic Score Distribution (CDM Only)">
          <ChartWrapper type="bar" data={metScoreData} options={metScoreOptions} height={200} onElementClick={handleMetScoreClick} />
        </Panel>

        <Panel title="CDM vs Non-CDM — Biomarker Improvement Rate">
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table" style={{ fontSize: 10 }}>
              <thead>
                <tr>
                  <th>Cohort</th>
                  <th style={{ textAlign: 'center' }}>CDM Count</th>
                  <th style={{ textAlign: 'center' }}>CDM Biomarker ↑</th>
                  <th style={{ textAlign: 'center' }}>Non-CDM Count</th>
                  <th style={{ textAlign: 'center' }}>Non-CDM Biomarker ↑</th>
                </tr>
              </thead>
              <tbody>
                {COHORT_ORDER.map(cohort => {
                  const c = comparison[cohort];
                  return (
                    <tr key={cohort} style={{ cursor: 'pointer' }} onClick={() => {
                      setDrillDown({
                        title: `${cohort} — CDM & Non-CDM Patients`,
                        data: patients.filter(p => p.riskCohort === cohort),
                      });
                    }}>
                      <td><RiskBadge cohort={cohort} /></td>
                      <td style={{ textAlign: 'center' }}>{c?.cdm?.count || 0}</td>
                      <td style={{ textAlign: 'center', fontWeight: 600, color: 'var(--green)' }}>{c?.cdm?.biomarkerImproved || 0}%</td>
                      <td style={{ textAlign: 'center' }}>{c?.nonCdm?.count || 0}</td>
                      <td style={{ textAlign: 'center', fontWeight: 600 }}>{c?.nonCdm?.biomarkerImproved || 0}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>

      {/* Drill-Down Panel */}
      {drillDown && (
        <DrillDownPanel
          title={drillDown.title}
          data={drillDown.data}
          columns={drillDown.columns}
          onClose={() => setDrillDown(null)}
          onPatientClick={onPatientClick}
        />
      )}
    </div>
  );
}
