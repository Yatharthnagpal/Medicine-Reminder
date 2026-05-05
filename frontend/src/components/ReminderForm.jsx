import { useState, useEffect } from 'react';
import { Send, X, User, Phone, MessageSquare, Calendar, RotateCcw, Loader2 } from 'lucide-react';

const REPEAT_OPTIONS = [
  { value: '10-days', label: '10 Days' },
  { value: '15-days', label: '15 Days' },
  { value: '20-days', label: '20 Days' },
  { value: 'monthly', label: 'Monthly' },
];

const getTemplateMessage = (name) => `Namaskar ${name || '{Name}'} ji!

Kamal Medicals, Behror ki taraf se aapko yaad dilana chahte hain:

Samay par dawai lena bhule nahi! aapki zaroorat ki dawaiyon ke liye hamare paas aayein.
Kamal Medicals, near main chauraha NH8, Jodhpur Sweets Home ke samne, Behror, Rajasthan`;

const initialFormState = {
  name: '',
  phone: '+91',
  message: getTemplateMessage(''),
  medicine: '',
  reminder_datetime: '',
  repeat_type: '15-days',
};

export default function ReminderForm({ onSubmit, editingReminder, onCancelEdit, loading }) {
  const [form, setForm] = useState(initialFormState);
  const [isMessageEdited, setIsMessageEdited] = useState(false);
  const isEditing = !!editingReminder;

  useEffect(() => {
    if (editingReminder) {
      setForm({
        name: editingReminder.name || '',
        phone: editingReminder.phone || '',
        message: editingReminder.message || '',
        medicine: editingReminder.medicine || '',
        reminder_datetime: editingReminder.reminder_datetime
          ? new Date(editingReminder.reminder_datetime).toISOString().slice(0, 16)
          : '',
        repeat_type: editingReminder.repeat_type || '15-days',
      });
      setIsMessageEdited(true);
    } else {
      setForm(initialFormState);
      setIsMessageEdited(false);
    }
  }, [editingReminder]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'message') {
      setIsMessageEdited(true);
      setForm({ ...form, [name]: value });
    } else if (name === 'name' && !isMessageEdited) {
      setForm({
        ...form,
        name: value,
        message: getTemplateMessage(value)
      });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Convert local datetime to ISO string
    const payload = {
      ...form,
      reminder_datetime: new Date(form.reminder_datetime).toISOString(),
    };
    onSubmit(payload, editingReminder?.id);
    if (!isEditing) {
      setForm(initialFormState);
      setIsMessageEdited(false);
    }
  };

  return (
    <div className="glass-card p-6 animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg gradient-whatsapp flex items-center justify-center">
            <Send className="w-4 h-4 text-white" />
          </div>
          <h2 className="text-lg font-bold text-gray-900">
            {isEditing ? 'Edit Reminder' : 'New Reminder'}
          </h2>
        </div>
        {isEditing && (
          <button
            onClick={onCancelEdit}
            className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
            id="cancel-edit-btn"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name & Phone in 2 columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1.5">
              <User className="w-3.5 h-3.5 text-gray-400" />
              Person Name
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="e.g. John Doe"
              className="input-field"
              required
              id="input-name"
            />
          </div>
          <div>
            <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1.5">
              <Phone className="w-3.5 h-3.5 text-gray-400" />
              Phone Number
            </label>
            <input
              type="text"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="e.g. +919876543210"
              className="input-field"
              required
              id="input-phone"
            />
          </div>
        </div>

        {/* Message field is hidden as per user request, it will be auto-generated in the background */}

        {/* Medicine */}
        <div>
          <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1.5">
            <span className="text-gray-400">💊</span>
            Medicine (Optional)
          </label>
          <textarea
            name="medicine"
            value={form.medicine}
            onChange={handleChange}
            placeholder="e.g. 1. Paracetamol 500mg"
            className="input-field resize-none"
            id="input-medicine"
            rows="3"
          />
        </div>

        {/* Date/Time & Repeat Type */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1.5">
              <Calendar className="w-3.5 h-3.5 text-gray-400" />
              Date & Time
            </label>
            <input
              type="datetime-local"
              name="reminder_datetime"
              value={form.reminder_datetime}
              onChange={handleChange}
              className="input-field"
              required
              id="input-datetime"
            />
          </div>
          <div>
            <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1.5">
              <RotateCcw className="w-3.5 h-3.5 text-gray-400" />
              Repeat Type
            </label>
            <select
              name="repeat_type"
              value={form.repeat_type}
              onChange={handleChange}
              className="input-field appearance-none cursor-pointer"
              id="input-repeat-type"
            >
              {REPEAT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full flex items-center justify-center gap-2"
          id="submit-reminder-btn"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              {isEditing ? 'Updating...' : 'Creating...'}
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              {isEditing ? 'Update Reminder' : 'Create Reminder'}
            </>
          )}
        </button>
      </form>
    </div>
  );
}
