import { ClipboardList, Clock, CheckCircle2, TrendingUp } from 'lucide-react';

export default function Dashboard({ stats, loading, onCardClick }) {
  const cards = [
    {
      id: 'all',
      label: 'Total Reminders',
      value: stats.total,
      icon: ClipboardList,
      color: 'from-slate-500 to-slate-700',
      shadow: 'shadow-slate-500/20',
      bg: 'bg-slate-50',
      text: 'text-slate-600',
    },
    {
      id: 'pending',
      label: 'Pending',
      value: stats.pending + stats.failed,
      icon: Clock,
      color: 'from-amber-400 to-amber-600',
      shadow: 'shadow-amber-500/20',
      bg: 'bg-amber-50',
      text: 'text-amber-600',
    },
    {
      id: 'sent',
      label: 'Sent',
      value: stats.sent,
      icon: CheckCircle2,
      color: 'from-emerald-400 to-emerald-600',
      shadow: 'shadow-emerald-500/20',
      bg: 'bg-emerald-50',
      text: 'text-emerald-600',
    },
  ];

  return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-2 mb-5">
        <TrendingUp className="w-5 h-5 text-whatsapp-600" />
        <h2 className="text-lg font-bold text-gray-900">Dashboard</h2>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              onClick={() => onCardClick && onCardClick(card.id)}
              className={`glass-card p-5 hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 ${onCardClick ? 'cursor-pointer' : ''}`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.color} ${card.shadow} shadow-lg flex items-center justify-center`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {loading ? (
                    <span className="inline-block w-8 h-7 bg-gray-200 rounded animate-pulse"></span>
                  ) : (
                    card.value
                  )}
                </p>
                <p className="text-xs font-medium text-gray-500 mt-0.5">{card.label}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
