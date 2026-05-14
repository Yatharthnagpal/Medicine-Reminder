import { useState, useEffect, useCallback, useRef } from 'react';
import toast from 'react-hot-toast';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import ReminderForm from './components/ReminderForm';
import ReminderList from './components/ReminderList';
import Login from './components/Login';
import {
  getReminders,
  createReminder,
  updateReminder,
  deleteReminder,
  getDashboardStats,
} from './services/api';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('isAdminAuth') === 'true';
    }
    return false;
  });
  const [currentView, setCurrentView] = useState('dashboard');
  const [reminders, setReminders] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, sent: 0, failed: 0 });
  const [editingReminder, setEditingReminder] = useState(null);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const notifiedReminderIdsRef = useRef(new Set());
  const previousViewRef = useRef('dashboard');

  const sendBrowserNotification = useCallback((title, body) => {
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    if (Notification.permission !== 'granted') return;

    try {
      // Android Chrome forbids `new Notification()` — throws "Illegal constructor"
      new Notification(title, { body });
    } catch {
      // Fallback: use ServiceWorker notification if available (required on Android)
      if ('serviceWorker' in navigator && navigator.serviceWorker.ready) {
        navigator.serviceWorker.ready
          .then((reg) => reg.showNotification(title, { body }))
          .catch(() => {}); // silently ignore if SW not registered
      }
    }
  }, []);

  // Fetch all data
  const fetchData = useCallback(async () => {
    try {
      const [remindersData, statsData] = await Promise.all([
        getReminders(),
        getDashboardStats(),
      ]);
      setReminders(Array.isArray(remindersData) ? remindersData : []);
      setStats(statsData && typeof statsData === 'object'
        ? { total: statsData.total || 0, pending: statsData.pending || 0, sent: statsData.sent || 0, failed: statsData.failed || 0 }
        : { total: 0, pending: 0, sent: 0, failed: 0 }
      );
    } catch (err) {
      console.error('Error fetching data:', err);
      toast.error('Failed to load data. Is the backend running?');
    } finally {
      setLoadingList(false);
      setLoadingStats(false);
    }
  }, []);

  useEffect(() => {
    fetchData();

    // Auto-refresh every 30 seconds to reflect scheduler updates
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  useEffect(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    if (Notification.permission === 'default') {
      try {
        // Some older Android browsers use callback-based API (returns undefined, not a Promise)
        const result = Notification.requestPermission(() => {});
        if (result && typeof result.catch === 'function') {
          result.catch(() => {
            // Ignore permission request failures.
          });
        }
      } catch {
        // Ignore — Notification API not fully supported on this device
      }
    }
  }, []);

  useEffect(() => {
    const now = new Date();

    reminders.forEach((reminder) => {
      if (reminder.status !== 'pending') return;
      if (notifiedReminderIdsRef.current.has(reminder.id)) return;

      const dueAt = new Date(reminder.reminder_datetime);
      if (Number.isNaN(dueAt.getTime()) || dueAt > now) return;

      notifiedReminderIdsRef.current.add(reminder.id);
      toast(`Reminder due: ${reminder.name} - ${reminder.medicine || 'Time for medicine'}`, {
        icon: '🔔',
      });
      sendBrowserNotification(`Reminder: ${reminder.name}`, reminder.medicine || 'Time for medicine');
    });
  }, [reminders, sendBrowserNotification]);

  // Create or update reminder
  const handleSubmit = async (formData, editId) => {
    setSubmitting(true);
    try {
      if (editId) {
        await updateReminder(editId, formData);
        toast.success('Reminder updated successfully! ✅');
        setEditingReminder(null);
      } else {
        await createReminder(formData);
        toast.success('Reminder created successfully! 🎉');
      }
    } catch (err) {
      console.error('Error saving reminder:', err);
      const errorMsg =
        err.response?.data?.detail?.[0]?.msg ||
        err.response?.data?.detail ||
        'Failed to save reminder';
      toast.error(typeof errorMsg === 'string' ? errorMsg : 'Failed to save reminder');
      throw err; // Re-throw so ReminderForm knows it failed
    } finally {
      setSubmitting(false);
    }
    // Refresh data separately — don't let a failed refresh affect the success flow
    try {
      await fetchData();
    } catch (e) {
      // Silently ignore refresh errors
    }
  };

  // Delete reminder
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this reminder?')) return;
    try {
      await deleteReminder(id);
      toast.success('Reminder deleted! 🗑️');
      await fetchData();
    } catch (err) {
      console.error('Error deleting reminder:', err);
      toast.error('Failed to delete reminder');
    }
  };

  // Edit reminder — switch to edit page
  const handleEdit = (reminder) => {
    previousViewRef.current = currentView;
    setEditingReminder(reminder);
    setCurrentView('edit');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingReminder(null);
    setCurrentView(previousViewRef.current || 'dashboard');
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateReminder(id, { status: newStatus });
      toast.success('Marked as sent! Will return to pending on next schedule ✅');
      await fetchData();
    } catch (err) {
      console.error('Error updating status:', err);
      toast.error('Failed to update status');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('isAdminAuth');
    toast.success('Logged out successfully 👋');
  };

  const todaysReminders = reminders.filter((reminder) => {
    // Only show pending/failed reminders
    if (reminder.status !== 'pending' && reminder.status !== 'failed') return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const reminderDate = new Date(reminder.reminder_datetime);
    reminderDate.setHours(0, 0, 0, 0);
    
    // Include if it's pending and scheduled for today, OR if it's overdue
    const isToday = reminderDate.getTime() === today.getTime();
    const isOverdue = reminderDate < today;
    
    return isToday || isOverdue;
  });

  const pendingReminders = reminders.filter(
    (reminder) => reminder.status === 'pending' || reminder.status === 'failed'
  );

  const sentReminders = reminders.filter((reminder) => reminder.status === 'sent');

  if (!isAuthenticated) {
    return <Login onLogin={() => {
      setIsAuthenticated(true);
      localStorage.setItem('isAdminAuth', 'true');
    }} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar 
        currentView={currentView} 
        setCurrentView={setCurrentView} 
        onLogout={handleLogout}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {currentView === 'edit' && editingReminder ? (
          <div className="max-w-xl mx-auto">
            <ReminderForm
              onSubmit={async (formData, editId) => {
                await handleSubmit(formData, editId);
                setCurrentView(previousViewRef.current || 'dashboard');
              }}
              editingReminder={editingReminder}
              onCancelEdit={handleCancelEdit}
              loading={submitting}
            />
          </div>
        ) : currentView === 'dashboard' ? (
          <>
            {/* Dashboard Stats */}
            <Dashboard stats={stats} loading={loadingStats} onCardClick={setCurrentView} />

            {/* Form + List Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Form — takes 1 column on large screens */}
              <div className="lg:col-span-1">
                <ReminderForm
                  onSubmit={handleSubmit}
                  editingReminder={null}
                  onCancelEdit={handleCancelEdit}
                  loading={submitting}
                />
              </div>

              {/* Reminder List — takes 2 columns */}
              <div className="lg:col-span-2">
                <ReminderList
                  reminders={todaysReminders}
                  title="Today's Pending"
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onStatusChange={handleStatusChange}
                  loading={loadingList}
                />
              </div>
            </div>
          </>
        ) : (
          <div className="w-full space-y-6">
            {/* Dashboard Stats inside full-page view to allow navigation back */}
            <Dashboard stats={stats} loading={loadingStats} onCardClick={setCurrentView} />
            
            {currentView === 'all' && (
              <ReminderList
                reminders={reminders}
                title="All Reminders"
                onEdit={handleEdit}
                onDelete={handleDelete}
                onStatusChange={handleStatusChange}
                loading={loadingList}
              />
            )}
            
            {currentView === 'pending' && (
              <ReminderList
                reminders={pendingReminders}
                title="Pending Reminders"
                onEdit={handleEdit}
                onDelete={handleDelete}
                onStatusChange={handleStatusChange}
                loading={loadingList}
              />
            )}
            
            {currentView === 'sent' && (
              <ReminderList
                reminders={sentReminders}
                title="Sent Reminders"
                onEdit={handleEdit}
                onDelete={handleDelete}
                onStatusChange={handleStatusChange}
                loading={loadingList}
              />
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center">
          <p className="text-sm text-gray-400">
            WhatsApp Reminder App · Powered by Meta WhatsApp Cloud API
          </p>
        </div>
      </footer>
    </div>
  );
}
