import { RISK_COHORTS } from '../data/constants';

const COHORT_MAP = Object.fromEntries(RISK_COHORTS.map(c => [c.label, c]));

export default function RiskBadge({ cohort }) {
  const config = COHORT_MAP[cohort];
  if (!config) return <span className="badge">{cohort}</span>;

  return (
    <span
      className="badge"
      style={{
        background: config.color + '18',
        color: config.color,
        fontWeight: 600,
      }}
    >
      {cohort}
    </span>
  );
}
