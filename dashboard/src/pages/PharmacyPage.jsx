import KpiCard from '../components/KpiCard';
import Panel from '../components/Panel';
import ChartWrapper from '../components/ChartWrapper';
import DataTable from '../components/DataTable';
import { StatusBadge } from '../components/Badge';
import { pharmacyOrders, pharmacyMetrics } from '../data/store';

const COLORS = {
  primary: '#1B2A4A', accent: '#048A81', green: '#00875A', amber: '#C27D2E',
  blue: '#0052CC', purple: '#6554C0', red: '#DE350B'
};

export default function PharmacyPage({ onPatientClick }) {
  const m = pharmacyMetrics;

  const topMeds = Object.entries(m.byMedicine)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  const months = Object.keys(m.byMonth).sort();

  const columns = [
    { key: 'orderId', label: 'Order ID' },
    { key: 'patientName', label: 'Patient' },
    { key: 'relation', label: 'Relation' },
    { key: 'medicine', label: 'Medicine' },
    { key: 'medicineStatus', label: 'Coverage', render: v => <StatusBadge status={v} /> },
    { key: 'rxApprovalStatus', label: 'Rx Status', render: v => <StatusBadge status={v} /> },
    { key: 'orderStatus', label: 'Order', render: v => <StatusBadge status={v} /> },
    { key: 'amount', label: 'Amount', render: v => `₱${v?.toLocaleString()}` },
    { key: 'walletDeduction', label: 'Covered', render: v => v > 0 ? `₱${v?.toLocaleString()}` : '—' },
    { key: 'coPay', label: 'Co-Pay', render: v => v > 0 ? `₱${v?.toLocaleString()}` : '—' },
    { key: 'cartCreatedOn', label: 'Created' },
  ];

  return (
    <div>
      <div className="section-label">Pharmacy Overview</div>
      <div className="kpi-row five">
        <KpiCard label="Total Orders" value={m.total.toLocaleString()} color="" />
        <KpiCard label="Unilabs Covered" value={m.covered.toLocaleString()} sub={`${m.coverageRate}%`} color="green" />
        <KpiCard label="Not Covered" value={m.notCovered.toLocaleString()} color="amber" />
        <KpiCard label="Delivered" value={m.delivered.toLocaleString()} sub={`${m.deliveryRate}%`} color="blue" />
        <KpiCard label="Rx Rejected" value={m.rejected.toLocaleString()} sub={`${(100 - parseFloat(m.approvalRate)).toFixed(1)}%`} color="red" />
      </div>

      <div className="section-label">Financial Breakdown</div>
      <div className="kpi-row four">
        <KpiCard label="Total Rx Value" value={`₱${m.totalAmount.toLocaleString(undefined, {maximumFractionDigits: 0})}`} color="" />
        <KpiCard label="Unilabs Wallet Covered" value={`₱${m.totalWalletDeduction.toLocaleString(undefined, {maximumFractionDigits: 0})}`} color="green" />
        <KpiCard label="Patient Co-Pay" value={`₱${m.totalCoPay.toLocaleString(undefined, {maximumFractionDigits: 0})}`} color="amber" />
        <KpiCard label="Coverage Ratio" value={`${((m.totalWalletDeduction / m.totalAmount) * 100).toFixed(1)}%`}
          sub="Wallet / Total Value" color="blue" />
      </div>

      <div className="chart-grid two">
        <Panel title="Monthly Order Volume" dotColor={COLORS.primary} tag="Bar Chart">
          <ChartWrapper type="bar" height={250} data={{
            labels: months.map(m => {
              const [y, mo] = m.split('-');
              return new Date(y, mo - 1).toLocaleString('default', { month: 'short', year: '2-digit' });
            }),
            datasets: [{
              label: 'Orders',
              data: months.map(m2 => pharmacyMetrics.byMonth[m2]),
              backgroundColor: COLORS.blue
            }]
          }} />
        </Panel>
        <Panel title="Top 10 Medicines Ordered" dotColor={COLORS.accent} tag="Horizontal Bar">
          <ChartWrapper type="bar" height={250} data={{
            labels: topMeds.map(([name]) => name),
            datasets: [{
              label: 'Orders',
              data: topMeds.map(([, count]) => count),
              backgroundColor: COLORS.accent
            }]
          }} options={{ indexAxis: 'y' }} />
        </Panel>
      </div>

      <div className="chart-grid three">
        <Panel title="Order Status" dotColor={COLORS.green} tag="Doughnut">
          <ChartWrapper type="doughnut" height={200} data={{
            labels: Object.keys(m.byOrderStatus),
            datasets: [{
              data: Object.values(m.byOrderStatus),
              backgroundColor: [COLORS.amber, COLORS.blue, COLORS.accent, COLORS.green, COLORS.red]
            }]
          }} />
        </Panel>
        <Panel title="Coverage Split" dotColor={COLORS.blue} tag="Doughnut">
          <ChartWrapper type="doughnut" height={200} data={{
            labels: ['Covered', 'Not Covered'],
            datasets: [{
              data: [m.covered, m.notCovered],
              backgroundColor: [COLORS.green, COLORS.red]
            }]
          }} />
        </Panel>
        <Panel title="By Relation" dotColor={COLORS.purple} tag="Doughnut">
          <ChartWrapper type="doughnut" height={200} data={{
            labels: Object.keys(m.byRelation),
            datasets: [{
              data: Object.values(m.byRelation),
              backgroundColor: [COLORS.primary, COLORS.accent, COLORS.amber, COLORS.purple]
            }]
          }} />
        </Panel>
      </div>

      <div className="section-label">Pharmacy Orders</div>
      <Panel>
        <DataTable
          columns={columns}
          data={pharmacyOrders}
          searchKeys={['patientName', 'medicine', 'orderId']}
          onRowClick={row => onPatientClick(row.patientId)}
        />
      </Panel>
    </div>
  );
}
