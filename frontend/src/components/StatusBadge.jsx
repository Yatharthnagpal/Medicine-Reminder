export default function StatusBadge({ status }) {
  const config = {
    pending: {
      bg: 'bg-amber-50',
      text: 'text-amber-700',
      ring: 'ring-amber-200',
      dot: 'bg-amber-400',
      label: 'Pending',
    },
    sent: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
      ring: 'ring-emerald-200',
      dot: 'bg-emerald-400',
      label: 'Sent',
    },
    failed: {
      bg: 'bg-amber-50',
      text: 'text-amber-700',
      ring: 'ring-amber-200',
      dot: 'bg-amber-400',
      label: 'Pending',
    },
  };

  const s = config[status] || config.pending;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ring-1 ${s.bg} ${s.text} ${s.ring}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`}></span>
      {s.label}
    </span>
  );
}
