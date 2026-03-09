import { useState, useMemo } from 'react';
import KpiCard from '../components/KpiCard';
import Panel from '../components/Panel';
import ChartWrapper from '../components/ChartWrapper';
import DataTable from '../components/DataTable';
import DrillDownPanel from '../components/DrillDownPanel';
import { financialMetrics, patients, cdmRecords } from '../data/store';
import { RISK_COHORTS } from '../data/constants';

const COHORT_ORDER = ['Extremely Low', 'Low', 'At Risk', 'High', 'Extremely High'];
const COHORT_COLORS = Object.fromEntries(RISK_COHORTS.map(c => [c.label, c.color]));
const fmt = (n) => '₱' + (n / 1e6).toFixed(1) + 'M';
const fmtK = (n) => '₱' + (n / 1e3).toFixed(0) + 'K';

export default function FinancialIntelligencePage({ onPatientClick }) {
  const [drillDown, setDrillDown] = useState(null);

  const {
    totalPremium, totalClaims, mlr, avgCostPerMember,
    cdmSavingsPerMember, claimsByCategory, costByCohort,
    employerProfitability, cdmROIByCohort
  } = financialMetrics;

  const cdmPatientIds = new Set(cdmRecords.map(r => r.patientId));

  // KPIs
  const kpis = [
    { label: 'Premium Revenue', value: fmt(totalPremium), sub: 'Annual', color: 'blue',
      onClick: () => setDrillDown({
        title: 'All Patients — Premium Revenue',
        data: [...patients].sort((a, b) => b.annualPremium - a.annualPremium),
        columns: [
          { key: 'name', label: 'Patient Name' },
          { key: 'employer', label: 'Employer' },
          { key: 'annualPremium', label: 'Premium', render: (val) => '₱' + (val || 0).toLocaleString() },
          { key: 'totalClaims', label: 'Claims', render: (val) => '₱' + (val || 0).toLocaleString() },
          { key: 'riskCohort', label: 'Risk Cohort' },
        ],
      }) },
    { label: 'Total Claims', value: fmt(totalClaims), sub: 'All categories', color: 'red',
      onClick: () => setDrillDown({
        title: 'All Patients — Sorted by Claims',
        data: [...patients].sort((a, b) => b.totalClaims - a.totalClaims),
      }) },
    { label: 'Medical Loss Ratio', value: mlr + '%', sub: parseFloat(mlr) > 85 ? 'Above target' : 'Within range', color: parseFloat(mlr) > 85 ? 'red' : 'green' },
    { label: 'Avg Cost / Member', value: fmtK(avgCostPerMember), sub: 'Annual', color: 'amber',
      onClick: () => setDrillDown({
        title: 'All Patients — Cost Per Member',
        data: [...patients].sort((a, b) => b.totalClaims - a.totalClaims),
      }) },
    { label: 'CDM Savings / Member', value: fmtK(Math.abs(cdmSavingsPerMember)), sub: cdmSavingsPerMember > 0 ? 'CDM saves' : 'CDM costs more', color: cdmSavingsPerMember > 0 ? 'green' : 'red',
      onClick: () => setDrillDown({
        title: 'CDM vs Non-CDM Patients — Claims Comparison',
        data: patients.map(p => ({ ...p, cdmStatus: cdmPatientIds.has(p.id) ? 'CDM' : 'Non-CDM' })).sort((a, b) => b.totalClaims - a.totalClaims),
        columns: [
          { key: 'name', label: 'Patient Name' },
          { key: 'cdmStatus', label: 'CDM Status', render: (val) => (
            <span style={{ color: val === 'CDM' ? 'var(--green)' : 'var(--text-muted)', fontWeight: 600 }}>{val}</span>
          )},
          { key: 'riskCohort', label: 'Risk Cohort' },
          { key: 'totalClaims', label: 'Total Claims', render: (val) => '₱' + (val || 0).toLocaleString() },
          { key: 'annualPremium', label: 'Premium', render: (val) => '₱' + (val || 0).toLocaleString() },
        ],
      }) },
  ];

  // Claims by category doughnut
  const CATEGORY_LABELS = ['Consultation', 'Pharmacy', 'Diagnostics', 'Hospitalization'];
  const CATEGORY_KEYS = ['consultation', 'pharmacy', 'diagnostics', 'hospitalization'];

  const categoryDoughnut = useMemo(() => ({
    labels: CATEGORY_LABELS,
    datasets: [{
      data: Object.values(claimsByCategory),
      backgroundColor: ['#0052CC', '#6554C0', '#048A81', '#DE350B'],
      borderWidth: 0,
    }]
  }), [claimsByCategory]);

  // Cost by risk cohort bar
  const costByCohortData = useMemo(() => ({
    labels: COHORT_ORDER,
    datasets: [
      {
        label: 'Total Claims',
        data: COHORT_ORDER.map(c => costByCohort[c]?.totalClaims || 0),
        backgroundColor: COHORT_ORDER.map(c => COHORT_COLORS[c]),
        borderRadius: 3,
        yAxisID: 'y',
      },
      {
        label: 'Avg Per Member',
        data: COHORT_ORDER.map(c => costByCohort[c]?.avgPerMember || 0),
        type: 'line',
        borderColor: '#1B2A4A',
        backgroundColor: '#1B2A4A',
        pointRadius: 4,
        pointBackgroundColor: '#1B2A4A',
        tension: 0.3,
        yAxisID: 'y1',
      },
    ]
  }), [costByCohort]);

  const costByCohortOptions = {
    plugins: { legend: { position: 'bottom', labels: { font: { size: 10 } } } },
    scales: {
      x: { grid: { display: false }, ticks: { font: { size: 9 } } },
      y: { grid: { color: '#F1F3F5' }, ticks: { font: { size: 9 }, callback: v => '₱' + (v / 1e6).toFixed(1) + 'M' }, position: 'left' },
      y1: { grid: { display: false }, ticks: { font: { size: 9 }, callback: v => '₱' + (v / 1e3).toFixed(0) + 'K' }, position: 'right' },
    }
  };

  // CDM ROI comparison
  const roiData = useMemo(() => {
    if (!cdmROIByCohort) return null;
    return {
      labels: COHORT_ORDER,
      datasets: [
        {
          label: 'CDM Avg Claims',
          data: COHORT_ORDER.map(c => cdmROIByCohort[c]?.cdm?.avgClaims || 0),
          backgroundColor: '#048A81',
          borderRadius: 3,
        },
        {
          label: 'Non-CDM Avg Claims',
          data: COHORT_ORDER.map(c => cdmROIByCohort[c]?.nonCdm?.avgClaims || 0),
          backgroundColor: '#9CA3AF',
          borderRadius: 3,
        },
      ]
    };
  }, [cdmROIByCohort]);

  const roiOptions = {
    plugins: { legend: { position: 'bottom', labels: { font: { size: 10 } } } },
    scales: {
      x: { grid: { display: false }, ticks: { font: { size: 9 } } },
      y: { grid: { color: '#F1F3F5' }, ticks: { font: { size: 10 }, callback: v => '₱' + (v / 1e3).toFixed(0) + 'K' } },
    }
  };

  // Employer profitability table
  const employerColumns = [
    { key: 'employer', label: 'Employer' },
    { key: 'members', label: 'Members' },
    { key: 'premium', label: 'Premium', render: (val) => '₱' + (val || 0).toLocaleString() },
    { key: 'claims', label: 'Claims', render: (val) => '₱' + (val || 0).toLocaleString() },
    { key: 'mlr', label: 'MLR', render: (val) => (
      <span style={{
        fontWeight: 600,
        color: parseFloat(val) > 100 ? 'var(--red)' : parseFloat(val) > 85 ? 'var(--amber)' : 'var(--green)',
      }}>
        {val}%
      </span>
    )},
    { key: 'profitLoss', label: 'P&L', render: (val) => (
      <span style={{ fontWeight: 600, color: val >= 0 ? 'var(--green)' : 'var(--red)' }}>
        {val >= 0 ? '+' : ''}₱{(val || 0).toLocaleString()}
      </span>
    )},
  ];

  // Chart click handlers
  function handleCategoryClick({ index }) {
    const category = CATEGORY_KEYS[index];
    const label = CATEGORY_LABELS[index];
    const sorted = [...patients]
      .map(p => ({ ...p, categorySpend: p.claims[category] || 0 }))
      .sort((a, b) => b.categorySpend - a.categorySpend);
    setDrillDown({
      title: `${label} Claims — All Patients`,
      data: sorted,
      columns: [
        { key: 'name', label: 'Patient Name' },
        { key: 'employer', label: 'Employer' },
        { key: 'riskCohort', label: 'Risk Cohort' },
        { key: 'categorySpend', label: `${label} Spend`, render: (val) => '₱' + (val || 0).toLocaleString() },
        { key: 'totalClaims', label: 'Total Claims', render: (val) => '₱' + (val || 0).toLocaleString() },
      ],
    });
  }

  function handleCostByCohortClick({ index }) {
    const cohort = COHORT_ORDER[index];
    setDrillDown({
      title: `${cohort} Risk — Claims Detail`,
      data: patients.filter(p => p.riskCohort === cohort).sort((a, b) => b.totalClaims - a.totalClaims),
    });
  }

  function handleROIClick({ datasetIndex, index }) {
    const cohort = COHORT_ORDER[index];
    const isCDM = datasetIndex === 0;
    setDrillDown({
      title: `${isCDM ? 'CDM' : 'Non-CDM'} Patients — ${cohort}`,
      data: patients.filter(p => p.riskCohort === cohort && (isCDM ? cdmPatientIds.has(p.id) : !cdmPatientIds.has(p.id)))
        .sort((a, b) => b.totalClaims - a.totalClaims),
    });
  }

  function handleEmployerRowClick(row) {
    setDrillDown({
      title: `Patients — ${row.employer}`,
      data: patients.filter(p => p.employer === row.employer).sort((a, b) => b.totalClaims - a.totalClaims),
    });
  }

  return (
    <div>
      {/* KPI Row */}
      <div className="kpi-row five">
        {kpis.map((kpi, i) => <KpiCard key={i} {...kpi} />)}
      </div>

      {/* Claims by Category + Cost by Cohort */}
      <div className="chart-grid two">
        <Panel title="Claims by Category">
          <ChartWrapper type="doughnut" data={categoryDoughnut} options={{
            plugins: { legend: { position: 'bottom', labels: { font: { size: 10 } } } }
          }} height={280} onElementClick={handleCategoryClick} />
        </Panel>

        <Panel title="Cost by Risk Cohort — Total & Average Per Member">
          <ChartWrapper type="bar" data={costByCohortData} options={costByCohortOptions} height={280} onElementClick={handleCostByCohortClick} />
        </Panel>
      </div>

      {/* CDM ROI Comparison */}
      {roiData && (
        <Panel title="CDM ROI — Average Claims: CDM vs Non-CDM by Risk Cohort">
          <ChartWrapper type="bar" data={roiData} options={roiOptions} height={260} onElementClick={handleROIClick} />
        </Panel>
      )}

      {/* Employer Profitability Table */}
      <div style={{ marginTop: 14 }}>
        <Panel title="Employer Profitability (sorted by worst MLR)">
          <DataTable columns={employerColumns} data={employerProfitability || []} pageSize={15} searchKeys={['employer']} onRowClick={handleEmployerRowClick} />
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
