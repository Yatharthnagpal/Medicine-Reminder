import { Calendar, Clock, MessageSquare, RotateCcw, Pencil, Trash2, User, Phone, ExternalLink, CheckCircle2, XCircle } from 'lucide-react';
import StatusBadge from './StatusBadge';

export default function ReminderCard({ reminder, onEdit, onDelete, onStatusChange }) {
  const repeatLabels = {
    'one-time': 'One-time',
    daily: 'Daily',
    '10-days': '10 Days',
    monthly: 'Monthly',
  };

  const getWhatsAppLink = (phone, message, medicine) => {
    const cleanPhone = phone.replace(/[\s\-\+]/g, '');
    let text = message || '';
    if (medicine) {
      text += `\n💊 ${medicine}`;
    }
    const encoded = encodeURIComponent(text);
    return `https://wa.me/${cleanPhone}?text=${encoded}`;
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatTime = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <div className="glass-card p-5 animate-slide-up hover:shadow-xl transition-shadow duration-300 group">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full gradient-whatsapp flex items-center justify-center text-white font-bold text-sm shadow-md">
            {reminder.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-gray-400" />
              {reminder.name}
            </h3>
            <a
              href={getWhatsAppLink(reminder.phone, reminder.message, reminder.medicine)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-whatsapp-600 hover:text-whatsapp-700 flex items-center gap-1 hover:underline transition-colors"
              title="Open in WhatsApp"
            >
              <Phone className="w-3 h-3" />
              {reminder.phone}
              <ExternalLink className="w-2.5 h-2.5 opacity-60" />
            </a>
          </div>
        </div>
        <StatusBadge status={reminder.status} />
      </div>

      {/* Medicine Info */}
      <div className="bg-gray-50 rounded-xl p-3 mb-3">
        <div className="flex items-start gap-2">
          <span className="text-sm mt-0.5 flex-shrink-0">💊</span>
          <p className="text-sm text-gray-700 leading-relaxed font-medium whitespace-pre-wrap">
            {reminder.medicine || 'No medicine specified'}
          </p>
        </div>
      </div>

      {/* Meta info */}
      <div className="flex items-center flex-wrap gap-3 text-xs text-gray-500 mb-4">
        <span className="flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5" />
          {formatDate(reminder.reminder_datetime)}
        </span>
        <span className="flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" />
          {formatTime(reminder.reminder_datetime)}
        </span>
        <span className="flex items-center gap-1 bg-whatsapp-50 text-whatsapp-700 px-2 py-0.5 rounded-full font-medium">
          <RotateCcw className="w-3 h-3" />
          {repeatLabels[reminder.repeat_type] || reminder.repeat_type}
        </span>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <a
          href={getWhatsAppLink(reminder.phone, reminder.message, reminder.medicine)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white gradient-whatsapp rounded-lg hover:opacity-90 transition-opacity shadow-sm"
          id={`whatsapp-reminder-${reminder.id}`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          WhatsApp
        </a>
        
        {reminder.status === 'pending' && onStatusChange && (
          <>
            <button
              onClick={() => onStatusChange(reminder.id, 'sent')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-green-700 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
              title="Mark as Sent"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Sent
            </button>
          </>
        )}
        
        {reminder.status !== 'pending' && onStatusChange && (
          <button
            onClick={() => onStatusChange(reminder.id, 'pending')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            title="Mark as Pending"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>
        )}

        <button
          onClick={() => onEdit(reminder)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          id={`edit-reminder-${reminder.id}`}
        >
          <Pencil className="w-3.5 h-3.5" />
          Edit
        </button>
        <button
          onClick={() => onDelete(reminder.id)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-50 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors ml-auto"
          id={`delete-reminder-${reminder.id}`}
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
