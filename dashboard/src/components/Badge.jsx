export default function Badge({ children, color = 'green' }) {
  return <span className={`badge ${color}`}>{children}</span>;
}

export function StatusBadge({ status }) {
  const colorMap = {
    'Confirmed': 'green', 'Delivered': 'green', 'Completed': 'green', 'Approved': 'green',
    'Report Ready': 'green', 'Covered': 'green',
    'Pending': 'amber', 'Processing': 'amber', 'Shipped': 'amber',
    'Sample Pending': 'amber', 'Sample Collected': 'amber',
    'Cancelled': 'red', 'Rejected': 'red', 'Not Covered': 'red',
  };
  return <Badge color={colorMap[status] || 'amber'}>{status}</Badge>;
}
