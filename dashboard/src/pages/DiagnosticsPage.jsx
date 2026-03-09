import KpiCard from '../components/KpiCard';
import Panel from '../components/Panel';
import ChartWrapper from '../components/ChartWrapper';
import DataTable from '../components/DataTable';
import { StatusBadge } from '../components/Badge';
import { diagnosticOrders, diagnosticMetrics } from '../data/store';

const COLORS = {
  primary: '#1B2A4A', accent: '#048A81', green: '#00875A', amber: '#C27D2E',
  blue: '#0052CC', purple: '#6554C0', red: '#DE350B'
};

export default function DiagnosticsPage({ onPatientClick }) {
  const m = diagnosticMetrics;

  const topTests = Object.entries(m.byTest)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  const months = Object.keys(m.byMonth).sort();

  const columns = [
    { key: 'orderId', label: 'Order ID' },
    { key: 'patientName', label: 'Patient' },
    { key: 'age', label: 'Age' },
    { key: 'test', label: 'Test' },
    { key: 'type', label: 'Type' },
    { key: 'cartStatus', label: 'Cart', render: v => <StatusBadge status={v} /> },
    { key: 'detailedStatus', label: 'Status', render: v => <StatusBadge status={v} /> },
    { key: 'orderOn', label: 'Ordered' },
    { key: 'collectionDate', label: 'Collected' },
    { key: 'deliveredDate', label: 'Delivered' },
  ];

  return (
    <div>
      <div className="section-label">Diagnostics Overview</div>
      <div className="kpi-row five">
        <KpiCard label="Total Orders" value={m.total.toLocaleString()} color="" />
        <KpiCard label="Completed" value={m.completed.toLocaleString()} sub={`${m.completionRate}%`} color="green" />
        <KpiCard label="Pending" value={m.pending.toLocaleString()} color="amber" />
        <KpiCard label="Cancelled" value={m.cancelled.toLocaleString()} color="red" />
        <KpiCard label="Avg. Turnaround" value={`${m.avgTurnaround} days`} sub="Order to delivery" color="blue" />
      </div>

      <div className="chart-grid two">
        <Panel title="Monthly Diagnostic Volume" dotColor={COLORS.purple} tag="Bar Chart">
          <ChartWrapper type="bar" height={250} data={{
            labels: months.map(m => {
              const [y, mo] = m.split('-');
              return new Date(y, mo - 1).toLocaleString('default', { month: 'short', year: '2-digit' });
            }),
            datasets: [{
              label: 'Orders',
              data: months.map(m2 => diagnosticMetrics.byMonth[m2]),
              backgroundColor: COLORS.purple
            }]
          }} />
        </Panel>
        <Panel title="Top Tests Ordered" dotColor={COLORS.accent} tag="Horizontal Bar">
          <ChartWrapper type="bar" height={250} data={{
            labels: topTests.map(([name]) => name),
            datasets: [{
              label: 'Orders',
              data: topTests.map(([, count]) => count),
              backgroundColor: COLORS.accent
            }]
          }} options={{ indexAxis: 'y' }} />
        </Panel>
      </div>

      <div className="chart-grid three">
        <Panel title="By Type" dotColor={COLORS.blue} tag="Doughnut">
          <ChartWrapper type="doughnut" height={200} data={{
            labels: Object.keys(m.byType),
            datasets: [{
              data: Object.values(m.byType),
              backgroundColor: [COLORS.primary, COLORS.accent, COLORS.blue]
            }]
          }} />
        </Panel>
        <Panel title="Detailed Status" dotColor={COLORS.green} tag="Doughnut">
          <ChartWrapper type="doughnut" height={200} data={{
            labels: Object.keys(m.byDetailedStatus),
            datasets: [{
              data: Object.values(m.byDetailedStatus),
              backgroundColor: [COLORS.amber, COLORS.accent, COLORS.blue, COLORS.green, COLORS.primary, COLORS.red]
            }]
          }} />
        </Panel>
        <Panel title="By Center" dotColor={COLORS.purple} tag="Doughnut">
          <ChartWrapper type="doughnut" height={200} data={{
            labels: Object.keys(m.byCenter).map(l => l.replace('Aventus - ', '')),
            datasets: [{
              data: Object.values(m.byCenter),
              backgroundColor: [COLORS.primary, COLORS.accent, COLORS.blue]
            }]
          }} />
        </Panel>
      </div>

      <div className="section-label">Diagnostic Records</div>
      <Panel>
        <DataTable
          columns={columns}
          data={diagnosticOrders}
          searchKeys={['patientName', 'test', 'orderId']}
          onRowClick={row => onPatientClick(row.patientId)}
        />
      </Panel>
    </div>
  );
}
