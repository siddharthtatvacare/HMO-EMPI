import KpiCard from '../components/KpiCard';
import Panel from '../components/Panel';
import ChartWrapper from '../components/ChartWrapper';
import { executiveSummary } from '../data/store';

const COLORS = {
  primary: '#1B2A4A', accent: '#048A81', green: '#00875A', amber: '#C27D2E',
  red: '#DE350B', blue: '#0052CC', purple: '#6554C0'
};

export default function ExecutiveSummary({ onDrillDown }) {
  const s = executiveSummary;

  const centerLabels = Object.keys(s.centerBreakdown);
  const centerData = centerLabels.map(k => s.centerBreakdown[k]);

  // Monthly trend data
  const months = Object.keys(s.consultMetrics.byMonth).sort();
  const consultMonthly = months.map(m => s.consultMetrics.byMonth[m] || 0);
  const pharmaMonthly = months.map(m => s.pharmaMetrics.byMonth[m] || 0);
  const diagMonthly = months.map(m => s.diagMetrics.byMonth[m] || 0);

  return (
    <div>
      <div className="section-label">Platform Overview</div>
      <div className="kpi-row five">
        <KpiCard label="Total Patients" value={s.totalPatients.toLocaleString()}
          sub="Enrolled across all centers" color="" onClick={() => onDrillDown('patients')} />
        <KpiCard label="Total Consultations" value={s.consultMetrics.total.toLocaleString()}
          sub={`${s.consultMetrics.confirmRate}% confirmed`} color="green" onClick={() => onDrillDown('consultations')} />
        <KpiCard label="Pharmacy Orders" value={s.pharmaMetrics.total.toLocaleString()}
          sub={`${s.pharmaMetrics.coverageRate}% Unilabs covered`} color="blue" onClick={() => onDrillDown('pharmacy')} />
        <KpiCard label="Diagnostic Orders" value={s.diagMetrics.total.toLocaleString()}
          sub={`${s.diagMetrics.completionRate}% completed`} color="purple" onClick={() => onDrillDown('diagnostics')} />
        <KpiCard label="CDM Enrolled" value={s.cdmMetrics.total.toLocaleString()}
          sub={`${s.cdmMetrics.improvementRate}% improved scores`} color="accent" onClick={() => onDrillDown('cdm')} />
      </div>

      <div className="section-label">Financial Summary</div>
      <div className="kpi-row four">
        <KpiCard label="Total Rx Value" value={`₱${(s.pharmaMetrics.totalAmount).toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})}`}
          sub="Gross medicine value" color="" />
        <KpiCard label="Unilabs Covered" value={`₱${(s.pharmaMetrics.totalWalletDeduction).toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})}`}
          sub="Wallet/free meds deduction" color="green" />
        <KpiCard label="Patient Co-Pay" value={`₱${(s.pharmaMetrics.totalCoPay).toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})}`}
          sub="Out-of-pocket by patients" color="amber" />
        <KpiCard label="Rx Approval Rate" value={`${s.pharmaMetrics.approvalRate}%`}
          sub={`${s.pharmaMetrics.approved} approved / ${s.pharmaMetrics.rejected} rejected`} color="blue" />
      </div>

      <div className="section-label">Monthly Activity Trend</div>
      <div className="chart-grid two">
        <Panel title="Consultations, Pharmacy & Diagnostics — Monthly" dotColor={COLORS.primary} tag="Line Chart">
          <ChartWrapper type="line" height={260} data={{
            labels: months.map(m => {
              const [y, mo] = m.split('-');
              return new Date(y, mo - 1).toLocaleString('default', { month: 'short', year: '2-digit' });
            }),
            datasets: [
              { label: 'Consultations', data: consultMonthly, borderColor: COLORS.primary, backgroundColor: 'transparent', tension: 0.3 },
              { label: 'Pharmacy Orders', data: pharmaMonthly, borderColor: COLORS.blue, backgroundColor: 'transparent', tension: 0.3 },
              { label: 'Diagnostics', data: diagMonthly, borderColor: COLORS.purple, backgroundColor: 'transparent', tension: 0.3 },
            ]
          }} options={{ plugins: { legend: { position: 'bottom' } } }} />
        </Panel>

        <Panel title="Center-wise Distribution" dotColor={COLORS.accent} tag="Bar Chart">
          <ChartWrapper type="bar" height={260} data={{
            labels: centerLabels.map(l => l.replace('Aventus - ', '')),
            datasets: [
              { label: 'Patients', data: centerData.map(c => c.patients), backgroundColor: COLORS.primary },
              { label: 'Consultations', data: centerData.map(c => c.consultations), backgroundColor: COLORS.accent },
              { label: 'Pharmacy', data: centerData.map(c => c.orders), backgroundColor: COLORS.blue },
              { label: 'Diagnostics', data: centerData.map(c => c.diagnostics), backgroundColor: COLORS.purple },
            ]
          }} options={{ plugins: { legend: { position: 'bottom' } } }} />
        </Panel>
      </div>

      <div className="section-label">Consultation Insights</div>
      <div className="chart-grid three">
        <Panel title="By Specialisation" dotColor={COLORS.accent} tag="Doughnut">
          <ChartWrapper type="doughnut" height={220} data={{
            labels: Object.keys(s.consultMetrics.bySpecialisation),
            datasets: [{
              data: Object.values(s.consultMetrics.bySpecialisation),
              backgroundColor: [COLORS.primary, COLORS.accent, COLORS.blue]
            }]
          }} />
        </Panel>
        <Panel title="By Call Type" dotColor={COLORS.blue} tag="Doughnut">
          <ChartWrapper type="doughnut" height={220} data={{
            labels: Object.keys(s.consultMetrics.byCallType),
            datasets: [{
              data: Object.values(s.consultMetrics.byCallType),
              backgroundColor: [COLORS.green, COLORS.purple]
            }]
          }} />
        </Panel>
        <Panel title="Confirmation Funnel" dotColor={COLORS.green} tag="Funnel">
          <div style={{ padding: '10px 0' }}>
            <FunnelStep label="Requested" count={s.consultMetrics.total} pct="100%" width="100%" color={COLORS.primary} />
            <FunnelStep label="Confirmed" count={s.consultMetrics.confirmed} pct={`${s.consultMetrics.confirmRate}%`} width={`${s.consultMetrics.confirmRate}%`} color={COLORS.accent} />
            <FunnelStep label="Prescribed" count={s.consultMetrics.withPrescription} pct={`${s.consultMetrics.prescriptionRate}%`} width={`${s.consultMetrics.prescriptionRate}%`} color={COLORS.green} />
          </div>
        </Panel>
      </div>

      <div className="section-label">Risk & Alerts</div>
      <div className="chart-grid two">
        <div>
          <div className="kpi-row two" style={{ marginBottom: 0 }}>
            <KpiCard label="Cancelled Consultations" value={s.consultMetrics.cancelled}
              sub={`${(100 - parseFloat(s.consultMetrics.confirmRate)).toFixed(1)}% cancel rate`} color="red" />
            <KpiCard label="Rejected Prescriptions" value={s.pharmaMetrics.rejected}
              sub={`${(100 - parseFloat(s.pharmaMetrics.approvalRate)).toFixed(1)}% rejection rate`} color="red" />
            <KpiCard label="Pending Diagnostics" value={s.diagMetrics.pending}
              sub="Awaiting completion" color="amber" />
            <KpiCard label="CDM Low Scores (≤50)" value={
              s.cdmMetrics.scoreDistribution['Critical (≤30)'] + s.cdmMetrics.scoreDistribution['Low (31-50)']
            } sub="Need intervention" color="amber" />
          </div>
        </div>
        <div>
          {s.consultMetrics.cancelled > 50 && (
            <div className="alert-box red">
              <div className="alert-icon">⚠</div>
              <div>
                <div className="alert-title">{s.consultMetrics.cancelled} consultations cancelled</div>
                <div className="alert-detail">Review cancellation reasons. Consider reminder SMS before appointments.</div>
              </div>
            </div>
          )}
          {s.pharmaMetrics.rejected > 30 && (
            <div className="alert-box amber">
              <div className="alert-icon">⚠</div>
              <div>
                <div className="alert-title">{s.pharmaMetrics.rejected} prescription rejections</div>
                <div className="alert-detail">Review Unilabs formulary alignment with prescribed medicines.</div>
              </div>
            </div>
          )}
          <div className="alert-box amber">
            <div className="alert-icon">⚠</div>
            <div>
              <div className="alert-title">Avg. diagnostic turnaround: {s.diagMetrics.avgTurnaround} days</div>
              <div className="alert-detail">Target benchmark is 3 days. Optimize sample collection logistics.</div>
            </div>
          </div>
          <div className="alert-box red">
            <div className="alert-icon">⚠</div>
            <div>
              <div className="alert-title">{s.totalPatients - s.uniquePatientsWithCDM} patients not enrolled in CDM</div>
              <div className="alert-detail">Opportunity to improve chronic disease outcomes via CDM coaching.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FunnelStep({ label, count, pct, width, color }) {
  return (
    <div className="funnel-step">
      <div className="funnel-label">{label}</div>
      <div className="funnel-bar" style={{ width, background: color }}>{count}</div>
      <div className="funnel-pct">{pct}</div>
    </div>
  );
}
