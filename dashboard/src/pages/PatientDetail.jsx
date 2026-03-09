import KpiCard from '../components/KpiCard';
import Panel from '../components/Panel';
import DataTable from '../components/DataTable';
import RiskBadge from '../components/RiskBadge';
import ChartWrapper from '../components/ChartWrapper';
import { StatusBadge } from '../components/Badge';
import {
  getPatientById, getConsultationsForPatient, getPharmacyOrdersForPatient,
  getDiagnosticOrdersForPatient, getCDMRecordForPatient
} from '../data/store';

const PROFILE_LABELS = {
  hba1c: 'HbA1c',
  lipidProfile: 'Lipid Profile',
  bloodGlucose: 'Blood Glucose',
  kidneyProfile: 'Kidney Profile',
  liverFunction: 'Liver Function',
};

const profileKeys = Object.keys(PROFILE_LABELS);

export default function PatientDetail({ patientId, onBack }) {
  const patient = getPatientById(patientId);
  if (!patient) return <div className="panel">Patient not found.</div>;

  const consults = getConsultationsForPatient(patientId);
  const pharma = getPharmacyOrdersForPatient(patientId);
  const diag = getDiagnosticOrdersForPatient(patientId);
  const cdm = getCDMRecordForPatient(patientId);

  const statusColor = (status) => status === 'abnormal' ? 'var(--red)' : status === 'borderline' ? 'var(--amber)' : 'var(--green)';

  // --- CDM-only: MetScore trend chart ---
  const metScoreChartData = cdm?.metScoreTrend ? {
    labels: cdm.metScoreTrend.map(p => {
      const d = new Date(p.date);
      return `${d.getDate()} ${d.toLocaleString('default', { month: 'short' })}`;
    }),
    datasets: [{
      label: 'Metabolic Score',
      data: cdm.metScoreTrend.map(p => p.score),
      borderColor: '#048A81',
      backgroundColor: 'rgba(4, 138, 129, 0.08)',
      fill: true,
      tension: 0.35,
      pointRadius: 2.5,
      pointBackgroundColor: '#048A81',
      borderWidth: 2,
    }]
  } : null;

  const metScoreOptions = {
    plugins: {
      legend: { display: false },
      tooltip: { callbacks: { label: (ctx) => `Score: ${ctx.raw}` } }
    },
    scales: {
      x: { grid: { display: false }, ticks: { font: { size: 8 }, maxRotation: 45, maxTicksLimit: 10 } },
      y: {
        grid: { color: '#F1F3F5' },
        ticks: { font: { size: 9 } },
        min: Math.max(100, (cdm?.metabolicScore?.initial || 200) - 40),
        max: Math.min(650, (cdm?.metabolicScore?.current || 400) + 40),
      },
    }
  };

  // --- Biomarker trend (ALL patients: Q1→Q2; CDM patients: Q0→Q1→Q2) ---
  const biomarkerTrend = cdm?.biomarkerTrend; // Q0, Q1, Q2 for CDM
  const hasQ0 = !!biomarkerTrend; // CDM patients have Q0
  const bioQ1 = patient.biomarkers?.q1;
  const bioQ2 = patient.biomarkers?.q2;

  // Quarters to show in trend table
  const quarters = hasQ0
    ? [{ key: 'q0', label: 'Baseline (Q0)', data: biomarkerTrend.q0 },
       { key: 'q1', label: 'Q1', data: biomarkerTrend.q1 },
       { key: 'q2', label: 'Q2 (Current)', data: biomarkerTrend.q2 }]
    : [{ key: 'q1', label: 'Q1 (Prior)', data: bioQ1 },
       { key: 'q2', label: 'Q2 (Current)', data: bioQ2 }];

  // Profiles-off trend line chart
  const profilesOffTrendData = {
    labels: quarters.map(q => q.label),
    datasets: [{
      label: 'Profiles Off',
      data: quarters.map(q => q.data?.profilesOff ?? 0),
      borderColor: '#DE350B',
      backgroundColor: 'rgba(222, 53, 11, 0.08)',
      fill: true,
      tension: 0.3,
      pointRadius: 5,
      pointBackgroundColor: '#DE350B',
      borderWidth: 2,
    }]
  };

  const profilesOffOptions = {
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false }, ticks: { font: { size: 10 } } },
      y: {
        grid: { color: '#F1F3F5' },
        ticks: { font: { size: 10 }, stepSize: 1 },
        min: 0, max: 5,
        title: { display: true, text: 'Profiles Off', font: { size: 9 } },
      },
    }
  };

  return (
    <div>
      <button className="back-btn" onClick={onBack}>← Back to list</button>

      <div className="patient-header">
        <div className="patient-avatar">{patient.name.charAt(0)}</div>
        <div style={{ flex: 1 }}>
          <h2 className="patient-name">{patient.name}</h2>
          <div className="patient-meta">
            {patient.id} &bull; {patient.gender}, {patient.age}y &bull; {patient.employer}
          </div>
          <div className="patient-meta">
            {patient.phone} &bull; {patient.email}
          </div>
          <div className="patient-meta">
            Doctor: {patient.doctor} &bull; {patient.center.replace('Aventus - ', '')} &bull; Enrolled: {patient.enrollDate}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <RiskBadge cohort={patient.riskCohort} />
          <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>
            {patient.profilesOff.q2} profiles off
          </div>
        </div>
      </div>

      {/* Summary KPIs */}
      <div className="kpi-row five">
        <KpiCard label="Total Claims" value={`₱${patient.totalClaims?.toLocaleString()}`} color="blue" />
        <KpiCard label="Premium" value={`₱${patient.annualPremium?.toLocaleString()}`} color="" />
        <KpiCard label="Med Adherence" value={`${patient.medicationAdherence}%`} color={patient.medicationAdherence >= 70 ? 'green' : 'amber'} />
        <KpiCard label="Retention Rate" value={`${Math.round(patient.retentionRate * 100)}%`} color="accent" />
        <KpiCard label="CDM Status" value={patient.isCDM ? 'Enrolled' : 'Not Enrolled'} color={patient.isCDM ? 'green' : ''} />
      </div>

      {/* Biomarker Profiles — Q2 Current */}
      <div className="section-label">Biomarker Profiles (Q2 — Current)</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10, marginBottom: 16 }}>
        {Object.entries(PROFILE_LABELS).map(([key, label]) => {
          const profile = patient.biomarkers?.q2?.[key];
          if (!profile) return null;
          return (
            <Panel key={key} title={label}>
              <div style={{ fontSize: 11 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontWeight: 700, color: statusColor(profile.status) }}>
                    {profile.status?.toUpperCase()}
                  </span>
                  <span style={{ fontWeight: 600, color: profile.off ? 'var(--red)' : 'var(--green)' }}>
                    {profile.off ? 'OFF' : 'OK'}
                  </span>
                </div>
                {profile.value !== undefined && (
                  <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>{profile.value}</div>
                )}
                {profile.subTests && (
                  <div style={{ maxHeight: 120, overflowY: 'auto' }}>
                    {profile.subTests.map((st, i) => (
                      <div key={i} style={{
                        display: 'flex', justifyContent: 'space-between',
                        padding: '2px 0', borderBottom: '1px solid #F1F3F5',
                        color: st.off ? 'var(--red)' : 'var(--text)',
                        fontWeight: st.off ? 600 : 400,
                      }}>
                        <span>{st.name}</span>
                        <span>{st.value} {st.unit}</span>
                      </div>
                    ))}
                  </div>
                )}
                {profile.offCount !== undefined && (
                  <div style={{ fontSize: 9, color: 'var(--text-muted)', marginTop: 4 }}>
                    {profile.offCount} sub-tests abnormal
                  </div>
                )}
              </div>
            </Panel>
          );
        })}
      </div>

      {/* Biomarker Trend — ALL PATIENTS (Q1→Q2 or Q0→Q1→Q2 for CDM) */}
      <div className="section-label">
        Biomarker Trend {hasQ0 ? '(Baseline → Q1 → Q2)' : '(Q1 → Q2)'}
      </div>
      <div className="chart-grid two">
        {/* Profiles Off trend chart */}
        <Panel title="Profiles Off — Quarterly Trend">
          <ChartWrapper type="line" data={profilesOffTrendData} options={profilesOffOptions} height={200} />
        </Panel>

        {/* Profile Journey Table */}
        <Panel title="Profile Status Journey">
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table" style={{ fontSize: 10 }}>
              <thead>
                <tr>
                  <th>Profile</th>
                  {quarters.map(q => (
                    <th key={q.key} style={{ textAlign: 'center' }}>{q.label}</th>
                  ))}
                  <th style={{ textAlign: 'center' }}>Trend</th>
                </tr>
              </thead>
              <tbody>
                {profileKeys.map(key => {
                  const first = quarters[0].data?.[key];
                  const last = quarters[quarters.length - 1].data?.[key];
                  if (!first || !last) return null;

                  const improved = first.off && !last.off;
                  const worsened = !first.off && last.off;
                  const trendIcon = improved ? '↑' : worsened ? '↓' : '→';
                  const trendColor = improved ? 'var(--green)' : worsened ? 'var(--red)' : 'var(--text-muted)';

                  return (
                    <tr key={key}>
                      <td style={{ fontWeight: 600 }}>{PROFILE_LABELS[key]}</td>
                      {quarters.map(q => {
                        const p = q.data?.[key];
                        if (!p) return <td key={q.key} />;
                        return (
                          <td key={q.key} style={{ textAlign: 'center' }}>
                            <span style={{
                              display: 'inline-block',
                              padding: '2px 8px',
                              borderRadius: 10,
                              fontSize: 9,
                              fontWeight: 600,
                              background: p.off ? 'var(--red-bg)' : 'var(--green-bg)',
                              color: p.off ? 'var(--red)' : 'var(--green)',
                            }}>
                              {p.status?.toUpperCase()}
                            </span>
                            {p.value !== undefined && (
                              <div style={{ fontSize: 9, color: 'var(--text-muted)', marginTop: 2 }}>{p.value}</div>
                            )}
                            {p.offCount !== undefined && (
                              <div style={{ fontSize: 9, color: 'var(--text-muted)', marginTop: 2 }}>{p.offCount} off</div>
                            )}
                          </td>
                        );
                      })}
                      <td style={{ textAlign: 'center', fontSize: 16, fontWeight: 700, color: trendColor }}>
                        {trendIcon}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>

      {/* CDM Section with MetScore Trend */}
      {cdm && (
        <>
          <div className="section-label">CDM — Chronic Disease Management</div>
          <div className="kpi-row five">
            <KpiCard label="Met Score (Current)" value={cdm.metabolicScore.current}
              sub={`${cdm.metabolicScore.label} ${cdm.metabolicScore.trend}`}
              color={cdm.metabolicScore.trend === '↑' ? 'green' : cdm.metabolicScore.trend === '↓' ? 'red' : 'amber'} />
            <KpiCard label="Met Score (Initial)" value={cdm.metabolicScore.initial} color="" />
            <KpiCard label="Improver Status" value={cdm.isImprover ? 'Improving ↑' : 'Declining ↓'}
              color={cdm.isImprover ? 'green' : 'red'} />
            <KpiCard label="Coaching Sessions" value={cdm.coachingSessions} color="purple" />
            <KpiCard label="BCA Readings" value={cdm.bcaReadings?.length || 0} color="" />
          </div>

          {/* Adherence KPIs */}
          <div className="section-label" style={{ fontSize: 10 }}>Plan Adherence & Engagement</div>
          <div className="kpi-row five">
            <KpiCard label="Diet Adherence" value={`${cdm.dietPlanAdherence}%`}
              sub={`${cdm.avgCaloriesActual} / ${cdm.avgCaloriesTarget} kcal`}
              color={cdm.dietPlanAdherence >= 70 ? 'green' : cdm.dietPlanAdherence >= 40 ? 'amber' : 'red'} />
            <KpiCard label="Exercise Adherence" value={`${cdm.exercisePlanAdherence}%`}
              sub={`${cdm.avgWorkoutDurationActual} / ${cdm.avgWorkoutDurationTarget} min`}
              color={cdm.exercisePlanAdherence >= 65 ? 'green' : cdm.exercisePlanAdherence >= 35 ? 'amber' : 'red'} />
            <KpiCard label="Meal Logging" value={`${cdm.mealLoggingRate}%`}
              sub="Days logged" color={cdm.mealLoggingRate >= 70 ? 'green' : 'amber'} />
            <KpiCard label="Exercise Logging" value={`${cdm.exerciseLoggingRate}%`}
              sub="Days logged" color={cdm.exerciseLoggingRate >= 70 ? 'green' : 'amber'} />
            <KpiCard label="Avg Daily Steps" value={cdm.avgDailySteps?.toLocaleString()}
              sub={`NEAT ↑${cdm.neatImprovement}%`}
              color={cdm.avgDailySteps >= 8000 ? 'green' : cdm.avgDailySteps >= 5000 ? 'amber' : 'red'} />
          </div>

          {/* Consultation engagement */}
          <div className="kpi-row four" style={{ marginBottom: 16 }}>
            <KpiCard label="Diet Consults" value={cdm.dietConsultationsBooked} color="accent" />
            <KpiCard label="Physio Consults" value={cdm.physioConsultationsBooked} color="blue" />
            <KpiCard label="Diet Plan" value={cdm.dietPlanAssignedDate} sub="Assigned" color="" />
            <KpiCard label="Physio Plan" value={cdm.physioPlanAssignedDate} sub="Assigned" color="" />
          </div>

          {/* BCA Trend Table */}
          {cdm.bcaReadings?.length > 0 && (
            <Panel title="Body Composition Analysis (BCA) — Trend">
              <div style={{ overflowX: 'auto' }}>
                <table className="data-table" style={{ fontSize: 10 }}>
                  <thead>
                    <tr>
                      <th>Reading</th>
                      <th style={{ textAlign: 'center' }}>Date</th>
                      <th style={{ textAlign: 'center' }}>Weight (kg)</th>
                      <th style={{ textAlign: 'center' }}>BMI</th>
                      <th style={{ textAlign: 'center' }}>Body Fat %</th>
                      <th style={{ textAlign: 'center' }}>Muscle Mass %</th>
                      <th style={{ textAlign: 'center' }}>Visceral Fat</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cdm.bcaReadings.map((bca, idx) => {
                      const prev = idx > 0 ? cdm.bcaReadings[idx - 1] : null;
                      const wtDelta = prev ? bca.weight - prev.weight : 0;
                      return (
                        <tr key={idx}>
                          <td style={{ fontWeight: 600 }}>BCA {idx + 1}</td>
                          <td style={{ textAlign: 'center' }}>{bca.date || '—'}</td>
                          <td style={{ textAlign: 'center' }}>
                            {bca.weight}
                            {prev && <span style={{ fontSize: 9, marginLeft: 4, color: wtDelta < 0 ? 'var(--green)' : wtDelta > 0 ? 'var(--red)' : 'var(--text-muted)' }}>
                              {wtDelta < 0 ? '↓' : wtDelta > 0 ? '↑' : '→'}{Math.abs(wtDelta).toFixed(1)}
                            </span>}
                          </td>
                          <td style={{ textAlign: 'center', color: bca.bmi > 25 ? 'var(--red)' : bca.bmi > 23 ? 'var(--amber)' : 'var(--green)', fontWeight: 600 }}>
                            {bca.bmi}
                          </td>
                          <td style={{ textAlign: 'center' }}>{bca.bodyFat}%</td>
                          <td style={{ textAlign: 'center' }}>{bca.muscleMass}%</td>
                          <td style={{ textAlign: 'center' }}>{bca.visceralFat}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Panel>
          )}

          {/* MetScore Trend Line */}
          {metScoreChartData && (
            <Panel title={<>
              Metabolic Score Trend
              <span style={{ fontSize: 10, fontWeight: 400, color: 'var(--text-muted)', marginLeft: 8 }}>
                Every 10 days &bull; {cdm.metScoreTrend.length} assessments
              </span>
            </>}>
              <ChartWrapper type="line" data={metScoreChartData} options={metScoreOptions} height={220} />
            </Panel>
          )}
        </>
      )}

      {/* Claims Breakdown */}
      <div className="section-label">Claims Breakdown</div>
      <div className="kpi-row four" style={{ marginBottom: 16 }}>
        <KpiCard label="Consultation" value={`₱${patient.claims?.consultation?.toLocaleString()}`} color="" />
        <KpiCard label="Pharmacy" value={`₱${patient.claims?.pharmacy?.toLocaleString()}`} color="blue" />
        <KpiCard label="Diagnostics" value={`₱${patient.claims?.diagnostics?.toLocaleString()}`} color="purple" />
        <KpiCard label="Hospitalization" value={`₱${patient.claims?.hospitalization?.toLocaleString()}`} color={patient.claims?.hospitalization > 0 ? 'red' : ''} />
      </div>

      {/* Consultations Table */}
      <div className="section-label">Consultations</div>
      <Panel>
        <DataTable
          columns={[
            { key: 'consultationId', label: 'ID' },
            { key: 'doctorName', label: 'Doctor' },
            { key: 'callType', label: 'Type' },
            { key: 'specialisation', label: 'Spec.' },
            { key: 'requestStatus', label: 'Status', render: (v) => <StatusBadge status={v} /> },
            { key: 'requestDate', label: 'Requested' },
            { key: 'appointmentDate', label: 'Appointment' },
            { key: 'prescriptionUrl', label: 'Rx', render: (v) => v ? '✓' : '—' },
          ]}
          data={consults}
          pageSize={10}
        />
      </Panel>

      {pharma.length > 0 && (
        <>
          <div className="section-label">Pharmacy Orders</div>
          <Panel>
            <DataTable
              columns={[
                { key: 'orderId', label: 'Order' },
                { key: 'medicine', label: 'Medicine' },
                { key: 'medicineStatus', label: 'Coverage', render: (v) => <StatusBadge status={v} /> },
                { key: 'rxApprovalStatus', label: 'Rx', render: (v) => <StatusBadge status={v} /> },
                { key: 'orderStatus', label: 'Status', render: (v) => <StatusBadge status={v} /> },
                { key: 'amount', label: 'Amount', render: (v) => `₱${v?.toLocaleString()}` },
                { key: 'walletDeduction', label: 'Covered', render: (v) => v > 0 ? `₱${v?.toLocaleString()}` : '—' },
                { key: 'coPay', label: 'Co-Pay', render: (v) => v > 0 ? `₱${v?.toLocaleString()}` : '—' },
              ]}
              data={pharma}
              pageSize={10}
            />
          </Panel>
        </>
      )}

      {diag.length > 0 && (
        <>
          <div className="section-label">Diagnostic Orders</div>
          <Panel>
            <DataTable
              columns={[
                { key: 'orderId', label: 'Order' },
                { key: 'test', label: 'Test' },
                { key: 'type', label: 'Type' },
                { key: 'cartStatus', label: 'Cart', render: (v) => <StatusBadge status={v} /> },
                { key: 'detailedStatus', label: 'Status', render: (v) => <StatusBadge status={v} /> },
                { key: 'orderOn', label: 'Ordered' },
                { key: 'deliveredDate', label: 'Delivered' },
              ]}
              data={diag}
              pageSize={10}
            />
          </Panel>
        </>
      )}
    </div>
  );
}
