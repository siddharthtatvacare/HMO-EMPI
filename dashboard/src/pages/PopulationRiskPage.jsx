import { useState, useMemo } from 'react';
import KpiCard from '../components/KpiCard';
import Panel from '../components/Panel';
import ChartWrapper from '../components/ChartWrapper';
import InfoButton from '../components/InfoButton';
import RiskBadge from '../components/RiskBadge';
import DataTable from '../components/DataTable';
import DrillDownPanel from '../components/DrillDownPanel';
import { riskMetrics, patients } from '../data/store';
import { RISK_COHORTS } from '../data/constants';

const COHORT_COLORS = Object.fromEntries(RISK_COHORTS.map(c => [c.label, c.color]));
const COHORT_ORDER = ['Extremely Low', 'Low', 'At Risk', 'High', 'Extremely High'];
const PROFILE_LABELS = {
  hba1c: 'HbA1c',
  lipidProfile: 'Lipid Profile',
  bloodGlucose: 'Blood Glucose',
  kidneyProfile: 'Kidney Profile',
  liverFunction: 'Liver Function',
};

export default function PopulationRiskPage({ onDrillDown, onPatientClick }) {
  const [drillDown, setDrillDown] = useState(null);

  const {
    total, cdmEnrolled, biomarkersAllNormal, highAndExtHigh,
    highRiskNotCDM, byCohort, byCohortPatients, heatmap, employerRisk, migration
  } = riskMetrics;

  // KPI data with click handlers
  const kpis = [
    { label: 'Total Population', value: total.toLocaleString(), sub: 'Active members', color: 'blue',
      onClick: () => setDrillDown({ title: 'All Patients', data: patients }) },
    { label: 'CDM Enrolled', value: cdmEnrolled.toLocaleString(), sub: `${((cdmEnrolled / total) * 100).toFixed(0)}% of population`, color: 'accent',
      onClick: () => setDrillDown({ title: 'CDM Enrolled Patients', data: patients.filter(p => p.isCDM) }) },
    { label: 'All Biomarkers Normal', value: biomarkersAllNormal.toLocaleString(), sub: `${((biomarkersAllNormal / total) * 100).toFixed(0)}% of population`, color: 'green',
      onClick: () => setDrillDown({ title: 'Patients with All Biomarkers Normal (0 Profiles Off)', data: patients.filter(p => p.profilesOff.q2 === 0) }) },
    { label: 'High + Ext. High Risk', value: highAndExtHigh.toLocaleString(), sub: `${((highAndExtHigh / total) * 100).toFixed(0)}% of population`, color: 'red',
      onClick: () => setDrillDown({ title: 'High + Extremely High Risk Patients', data: patients.filter(p => p.riskCohort === 'High' || p.riskCohort === 'Extremely High') }) },
    { label: 'High Risk NOT in CDM', value: highRiskNotCDM.toLocaleString(), sub: 'Action required', color: 'red',
      onClick: () => setDrillDown({ title: 'High-Risk Patients NOT Enrolled in CDM', data: patients.filter(p => (p.riskCohort === 'High' || p.riskCohort === 'Extremely High') && !p.isCDM) }) },
  ];

  // Risk pyramid data
  const pyramidData = useMemo(() => ({
    labels: COHORT_ORDER,
    datasets: [{
      data: COHORT_ORDER.map(c => byCohort[c] || 0),
      backgroundColor: COHORT_ORDER.map(c => COHORT_COLORS[c]),
      borderRadius: 3,
      barThickness: 28,
    }]
  }), [byCohort]);

  const pyramidOptions = {
    indexAxis: 'y',
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => `${ctx.raw} patients (${((ctx.raw / total) * 100).toFixed(1)}%)`
        }
      }
    },
    scales: {
      x: { grid: { display: false }, ticks: { font: { size: 10 } } },
      y: { grid: { display: false }, ticks: { font: { size: 10, weight: 600 } } },
    }
  };

  // Employer stacked bar data (top 10)
  const top10Employers = employerRisk.slice(0, 10);
  const employerChartData = useMemo(() => ({
    labels: top10Employers.map(e => e.name.length > 20 ? e.name.slice(0, 18) + '…' : e.name),
    datasets: COHORT_ORDER.map(cohort => ({
      label: cohort,
      data: top10Employers.map(e => e.byCohort[cohort] || 0),
      backgroundColor: COHORT_COLORS[cohort],
      borderRadius: 2,
    }))
  }), [employerRisk]);

  const employerChartOptions = {
    indexAxis: 'y',
    plugins: {
      legend: { position: 'bottom', labels: { font: { size: 9 }, padding: 8, boxWidth: 10 } },
    },
    scales: {
      x: { stacked: true, grid: { display: false }, ticks: { font: { size: 10 } } },
      y: { stacked: true, grid: { display: false }, ticks: { font: { size: 9 } } },
    }
  };

  // Q-over-Q migration data
  const migrationData = useMemo(() => ({
    labels: COHORT_ORDER,
    datasets: [
      {
        label: 'Q1 (Baseline)',
        data: COHORT_ORDER.map(c => migration.q1[c] || 0),
        backgroundColor: COHORT_ORDER.map(c => COHORT_COLORS[c] + '66'),
        borderColor: COHORT_ORDER.map(c => COHORT_COLORS[c]),
        borderWidth: 1,
        borderRadius: 3,
      },
      {
        label: 'Q2 (Current)',
        data: COHORT_ORDER.map(c => migration.q2[c] || 0),
        backgroundColor: COHORT_ORDER.map(c => COHORT_COLORS[c]),
        borderRadius: 3,
      },
    ]
  }), [migration]);

  const migrationOptions = {
    plugins: {
      legend: { position: 'bottom', labels: { font: { size: 10 }, padding: 10 } },
    },
    scales: {
      x: { grid: { display: false }, ticks: { font: { size: 9 } } },
      y: { grid: { color: '#F1F3F5' }, ticks: { font: { size: 10 } } },
    }
  };

  // CDM enrollment gap table — high-risk not-in-CDM patients
  const gapPatients = useMemo(() =>
    patients
      .filter(p => (p.riskCohort === 'High' || p.riskCohort === 'Extremely High') && !p.isCDM)
      .map(p => ({
        id: p.id,
        name: p.name,
        age: p.age,
        employer: p.employer,
        riskCohort: p.riskCohort,
        profilesOff: p.profilesOff.q2,
        center: p.center,
      }))
  , []);

  const gapColumns = [
    { key: 'name', label: 'Patient', render: (val, row) => (
      <span style={{ color: 'var(--accent)', cursor: 'pointer', fontWeight: 600 }}
        onClick={() => onPatientClick?.(row.id)}>{val}</span>
    )},
    { key: 'age', label: 'Age' },
    { key: 'employer', label: 'Employer' },
    { key: 'riskCohort', label: 'Risk Cohort', render: (val) => <RiskBadge cohort={val} /> },
    { key: 'profilesOff', label: 'Profiles Off' },
    { key: 'center', label: 'Center' },
  ];

  // Chart click handlers
  function handlePyramidClick({ index }) {
    const cohort = COHORT_ORDER[index];
    if (cohort && byCohortPatients[cohort]) {
      setDrillDown({ title: `${cohort} Risk Patients`, data: byCohortPatients[cohort] });
    }
  }

  function handleEmployerClick({ index }) {
    const employer = top10Employers[index];
    if (employer) {
      setDrillDown({
        title: `Patients — ${employer.name}`,
        data: patients.filter(p => p.employer === employer.name),
      });
    }
  }

  function handleHeatmapClick(cohort, profile) {
    const cohortPats = byCohortPatients[cohort] || [];
    const filtered = cohortPats.filter(p => p.biomarkers.q2[profile]?.off);
    setDrillDown({
      title: `${cohort} — ${PROFILE_LABELS[profile]} Abnormal`,
      data: filtered,
    });
  }

  return (
    <div>
      {/* KPI Row */}
      <div className="kpi-row five">
        {kpis.map((kpi, i) => (
          <KpiCard key={i} {...kpi} />
        ))}
      </div>

      {/* Risk Pyramid + Biomarker Heatmap */}
      <div className="chart-grid two">
        <Panel title={<>
          Population Risk Bands
          {' '}
          <InfoButton>
            <strong>Risk Stratification Methodology</strong><br />
            Each patient is assessed across 5 biomarker profiles: HbA1c, Lipid Profile,
            Blood Glucose, Kidney Profile, and Liver Function. A profile is "off" when key
            sub-test values fall outside normal reference ranges.<br /><br />
            <strong>Cohort Assignment (by profiles off):</strong><br />
            0 = Extremely Low &bull; 1 = Low &bull; 2 = At Risk &bull; 3 = High &bull; 4-5 = Extremely High
          </InfoButton>
        </>}>
          <ChartWrapper type="bar" data={pyramidData} options={pyramidOptions} height={220} onElementClick={handlePyramidClick} />
        </Panel>

        <Panel title="Biomarker Profile Heatmap — % Off by Cohort">
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table" style={{ fontSize: 10 }}>
              <thead>
                <tr>
                  <th>Cohort</th>
                  {Object.entries(PROFILE_LABELS).map(([k, v]) => (
                    <th key={k} style={{ textAlign: 'center' }}>{v}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COHORT_ORDER.map(cohort => (
                  <tr key={cohort}>
                    <td><RiskBadge cohort={cohort} /></td>
                    {Object.keys(PROFILE_LABELS).map(profile => {
                      const pct = heatmap[cohort]?.[profile] || 0;
                      const intensity = Math.min(1, pct / 80);
                      return (
                        <td key={profile} style={{
                          textAlign: 'center',
                          fontWeight: 600,
                          background: `rgba(222, 53, 11, ${intensity * 0.2})`,
                          color: intensity > 0.4 ? 'var(--red)' : 'var(--text)',
                          cursor: 'pointer',
                        }} onClick={() => handleHeatmapClick(cohort, profile)}>
                          {pct}%
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>

      {/* Employer Cohort Breakdown + Q-over-Q Migration */}
      <div className="chart-grid two">
        <Panel title="Cohort Breakdown by Employer (Top 10 by High-Risk %)">
          <ChartWrapper type="bar" data={employerChartData} options={employerChartOptions} height={320} onElementClick={handleEmployerClick} />
        </Panel>

        <Panel title={<>
          Q-over-Q Risk Migration
          <span style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 400, marginLeft: 8 }}>
            {migration.improved} improved &bull; {migration.worsened} worsened
          </span>
        </>}>
          <ChartWrapper type="bar" data={migrationData} options={migrationOptions} height={320} />
        </Panel>
      </div>

      {/* CDM Enrollment Gap Table */}
      <Panel title={`CDM Enrollment Gap — ${highRiskNotCDM} High-Risk Patients NOT in CDM`}>
        <DataTable
          columns={gapColumns}
          data={gapPatients}
          pageSize={10}
          searchKeys={['name', 'employer', 'center']}
        />
      </Panel>

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
