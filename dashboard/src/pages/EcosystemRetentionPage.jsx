import { useState, useMemo } from 'react';
import KpiCard from '../components/KpiCard';
import Panel from '../components/Panel';
import ChartWrapper from '../components/ChartWrapper';
import DataTable from '../components/DataTable';
import DrillDownPanel from '../components/DrillDownPanel';
import { ecosystemMetrics, patients, competitorPrescriptions, externalVisits } from '../data/store';

const fmt = (n) => '₱' + (n / 1e6).toFixed(1) + 'M';

export default function EcosystemRetentionPage({ onPatientClick }) {
  const [drillDown, setDrillDown] = useState(null);

  const {
    totalSpend, ecosystemRetained, leakage, avgTouchpoints,
    retentionByService, moleculeLeakage, doctorLeakage,
    geoLeakage, employerLeakage
  } = ecosystemMetrics;

  const retentionPct = totalSpend > 0 ? ((ecosystemRetained / totalSpend) * 100).toFixed(1) : 0;
  const leakagePct = totalSpend > 0 ? ((leakage / totalSpend) * 100).toFixed(1) : 0;

  // KPIs
  const kpis = [
    { label: 'Total Spend', value: fmt(totalSpend), sub: 'All claims', color: 'blue',
      onClick: () => setDrillDown({ title: 'All Patients — Total Spend', data: patients }) },
    { label: 'Ecosystem Retained', value: fmt(ecosystemRetained), sub: `${retentionPct}% retention`, color: 'green',
      onClick: () => setDrillDown({
        title: 'Patients — Ecosystem Retained (Top by Retention Rate)',
        data: [...patients].sort((a, b) => b.retentionRate - a.retentionRate),
      }) },
    { label: 'External Leakage', value: fmt(leakage), sub: `${leakagePct}% leaking`, color: 'red',
      onClick: () => setDrillDown({
        title: 'Patients — Highest External Leakage',
        data: [...patients].sort((a, b) => b.externalSpend - a.externalSpend),
      }) },
    { label: 'Avg Touchpoints', value: avgTouchpoints, sub: 'Per member', color: 'accent' },
  ];

  // Retention by service type bar chart
  const serviceData = useMemo(() => {
    const services = ['consultations', 'pharmacy', 'diagnostics'];
    const labels = ['Consultations', 'Pharmacy', 'Diagnostics'];
    return {
      labels,
      datasets: [
        {
          label: 'Ecosystem',
          data: services.map(s => retentionByService[s]?.ecosystem || 0),
          backgroundColor: '#048A81',
          borderRadius: 3,
        },
        {
          label: 'External',
          data: services.map(s => retentionByService[s]?.external || 0),
          backgroundColor: '#DE350B',
          borderRadius: 3,
        },
      ]
    };
  }, [retentionByService]);

  const serviceOptions = {
    plugins: { legend: { position: 'bottom', labels: { font: { size: 10 } } } },
    scales: {
      x: { stacked: true, grid: { display: false }, ticks: { font: { size: 10 } } },
      y: { stacked: true, grid: { color: '#F1F3F5' }, ticks: { font: { size: 10 }, callback: v => '₱' + (v / 1e6).toFixed(1) + 'M' } },
    }
  };

  // Molecule leakage columns
  const moleculeColumns = [
    { key: 'molecule', label: 'Molecule' },
    { key: 'unilabBrand', label: 'Unilab Brand' },
    { key: 'competitorBrand', label: 'Competitor Brand' },
    { key: 'totalVolume', label: 'Volume' },
    { key: 'totalRevenueLost', label: 'Revenue Lost', render: (val) => '₱' + (val || 0).toLocaleString() },
  ];

  // Doctor leakage columns
  const doctorColumns = [
    { key: 'doctor', label: 'Doctor' },
    { key: 'rxCount', label: 'Rx Count' },
    { key: 'totalLost', label: 'Revenue Lost', render: (val) => '₱' + (val || 0).toLocaleString() },
    { key: 'topMolecule', label: 'Top Competitor Brand' },
  ];

  // Employer leakage columns
  const employerColumns = [
    { key: 'employer', label: 'Employer' },
    { key: 'totalSpend', label: 'Total Spend', render: (val) => '₱' + (val || 0).toLocaleString() },
    { key: 'ecosystemPct', label: 'Ecosystem %', render: (val) => val + '%' },
    { key: 'externalPct', label: 'External %', render: (val) => (
      <span style={{ color: parseInt(val) > 30 ? 'var(--red)' : 'var(--text)', fontWeight: parseInt(val) > 30 ? 600 : 400 }}>
        {val}%
      </span>
    )},
    { key: 'externalSpend', label: 'External Spend', render: (val) => '₱' + (val || 0).toLocaleString() },
  ];

  // Geographic leakage columns
  const geoColumns = [
    { key: 'location', label: 'Location' },
    { key: 'totalSpend', label: 'Total Spend', render: (val) => '₱' + (val || 0).toLocaleString() },
    { key: 'externalSpend', label: 'External Spend', render: (val) => '₱' + (val || 0).toLocaleString() },
    { key: 'leakagePct', label: 'Leakage %', render: (val) => val + '%' },
    { key: 'topProvider', label: 'Top External Provider' },
  ];

  // Leakage by service doughnut
  const leakageDoughnut = useMemo(() => {
    const services = ['consultations', 'pharmacy', 'diagnostics'];
    const labels = ['Consultations', 'Pharmacy', 'Diagnostics'];
    const colors = ['#0052CC', '#6554C0', '#048A81'];
    return {
      labels,
      datasets: [{
        data: services.map(s => retentionByService[s]?.external || 0),
        backgroundColor: colors,
        borderWidth: 0,
      }]
    };
  }, [retentionByService]);

  // Chart click handlers
  const SERVICE_KEYS = ['consultations', 'pharmacy', 'diagnostics'];
  const SERVICE_LABELS = ['Consultations', 'Pharmacy', 'Diagnostics'];

  function handleLeakageDoughnutClick({ index }) {
    const service = SERVICE_LABELS[index];
    // Show patients sorted by external spend for that service category
    const claimsKey = SERVICE_KEYS[index] === 'consultations' ? 'consultation' : SERVICE_KEYS[index];
    const sorted = [...patients]
      .map(p => ({
        ...p,
        serviceSpend: p.claims[claimsKey] || 0,
        externalServiceSpend: Math.round((p.claims[claimsKey] || 0) * (1 - p.retentionRate)),
      }))
      .sort((a, b) => b.externalServiceSpend - a.externalServiceSpend);

    setDrillDown({
      title: `External Leakage — ${service}`,
      data: sorted,
      columns: [
        { key: 'name', label: 'Patient Name' },
        { key: 'employer', label: 'Employer' },
        { key: 'serviceSpend', label: `${service} Spend`, render: (val) => '₱' + (val || 0).toLocaleString() },
        { key: 'externalServiceSpend', label: 'External Spend', render: (val) => (
          <span style={{ color: 'var(--red)', fontWeight: 600 }}>₱{(val || 0).toLocaleString()}</span>
        )},
        { key: 'retentionRate', label: 'Retention', render: (val) => `${Math.round(val * 100)}%` },
      ],
      searchKeys: ['name', 'employer'],
    });
  }

  function handleServiceClick({ index }) {
    const service = SERVICE_LABELS[index];
    handleLeakageDoughnutClick({ index });
  }

  function handleEmployerRowClick(row) {
    setDrillDown({
      title: `Patients — ${row.employer}`,
      data: patients.filter(p => p.employer === row.employer),
    });
  }

  function handleGeoRowClick(row) {
    setDrillDown({
      title: `Patients — ${row.location}`,
      data: patients.filter(p => p.location === row.location),
    });
  }

  return (
    <div>
      {/* KPI Row */}
      <div className="kpi-row four">
        {kpis.map((kpi, i) => <KpiCard key={i} {...kpi} />)}
      </div>

      {/* Retention by Service + Leakage Breakdown */}
      <div className="chart-grid two">
        <Panel title="Retention by Service Type">
          <ChartWrapper type="bar" data={serviceData} options={serviceOptions} height={260} onElementClick={handleServiceClick} />
        </Panel>

        <Panel title="External Leakage by Service">
          <ChartWrapper type="doughnut" data={leakageDoughnut} options={{
            plugins: { legend: { position: 'bottom', labels: { font: { size: 10 } } } }
          }} height={260} onElementClick={handleLeakageDoughnutClick} />
        </Panel>
      </div>

      {/* Competitor Molecule Analysis */}
      <Panel title="Competitor Molecule Analysis">
        <DataTable columns={moleculeColumns} data={moleculeLeakage} pageSize={12} searchKeys={['molecule', 'unilabBrand', 'competitorBrand']} />
      </Panel>

      {/* Doctor Leakage + Geographic Leakage */}
      <div className="chart-grid two" style={{ marginTop: 14 }}>
        <Panel title="Doctor Leakage — Top Prescribers of Competitor Brands">
          <DataTable columns={doctorColumns} data={doctorLeakage.slice(0, 15)} pageSize={10} />
        </Panel>

        <Panel title="Geographic Leakage">
          <DataTable columns={geoColumns} data={geoLeakage} pageSize={10} onRowClick={handleGeoRowClick} />
        </Panel>
      </div>

      {/* Employer Leakage */}
      <div style={{ marginTop: 14 }}>
        <Panel title="Employer Leakage Analysis">
          <DataTable columns={employerColumns} data={employerLeakage} pageSize={10} searchKeys={['employer']} onRowClick={handleEmployerRowClick} />
        </Panel>
      </div>

      {/* Drill-Down Panel */}
      {drillDown && (
        <DrillDownPanel
          title={drillDown.title}
          data={drillDown.data}
          columns={drillDown.columns}
          searchKeys={drillDown.searchKeys}
          onClose={() => setDrillDown(null)}
          onPatientClick={onPatientClick}
        />
      )}
    </div>
  );
}
