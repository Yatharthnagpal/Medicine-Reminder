import { useState } from 'react';
import { List, Inbox, Search } from 'lucide-react';
import ReminderCard from './ReminderCard';

export default function ReminderList({ reminders, onEdit, onDelete, onStatusChange, loading, title = "All Reminders" }) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredReminders = reminders.filter((reminder) => {
    const query = searchQuery.toLowerCase();
    return (
      reminder.name.toLowerCase().includes(query) ||
      reminder.phone.includes(query)
    );
  });

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
        <div className="flex items-center gap-2">
          <List className="w-5 h-5 text-whatsapp-600" />
          <h2 className="text-lg font-bold text-gray-900">{title}</h2>
          <span className="bg-whatsapp-50 text-whatsapp-700 text-xs font-bold px-2.5 py-1 rounded-full">
            {reminders.length}
          </span>
        </div>
        
        {/* Search Box */}
        <div className="relative w-full sm:w-64">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            className="input-field pl-9 py-2 text-sm"
            placeholder="Search name or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-card p-5 animate-pulse">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full" />
                <div className="flex-1">
                  <div className="w-24 h-4 bg-gray-200 rounded mb-1" />
                  <div className="w-32 h-3 bg-gray-200 rounded" />
                </div>
              </div>
              <div className="w-full h-12 bg-gray-100 rounded-xl mb-3" />
              <div className="flex gap-3">
                <div className="w-20 h-3 bg-gray-200 rounded" />
                <div className="w-16 h-3 bg-gray-200 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredReminders.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
            {searchQuery ? <Search className="w-8 h-8 text-gray-400" /> : <Inbox className="w-8 h-8 text-gray-400" />}
          </div>
          <h3 className="text-gray-700 font-semibold mb-1">
            {searchQuery ? 'No matching reminders found' : 'No reminders yet'}
          </h3>
          <p className="text-sm text-gray-500">
            {searchQuery ? `No results for "${searchQuery}"` : 'Create your first reminder using the form above.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredReminders.map((reminder) => (
            <ReminderCard
              key={reminder.id}
              reminder={reminder}
              onEdit={onEdit}
              onDelete={onDelete}
              onStatusChange={onStatusChange}
            />
          ))}
        </div>
      )}
    </div>
  );
}
