import { MessageCircle } from 'lucide-react';

export default function Navbar({ currentView, setCurrentView, onLogout }) {
  return (
    <nav className="gradient-whatsapp sticky top-0 z-50 shadow-lg shadow-whatsapp-700/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-white font-bold text-lg tracking-tight">
                WhatsApp Reminder
              </h1>
              <p className="text-whatsapp-200 text-xs font-medium -mt-0.5">
                Automated Message Scheduler
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="hidden md:flex items-center gap-2 bg-white/10 backdrop-blur-sm p-1 rounded-xl">
            <button
              onClick={() => setCurrentView('dashboard')}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                currentView === 'dashboard'
                  ? 'bg-white text-whatsapp-700 shadow-sm'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setCurrentView('all')}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                currentView === 'all'
                  ? 'bg-white text-whatsapp-700 shadow-sm'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              All Reminders
            </button>
          </div>

          {/* Status indicator & Logout */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full">
              <span className="w-2 h-2 bg-green-300 rounded-full animate-pulse-soft"></span>
              <span className="hidden sm:inline text-white/90 text-xs font-medium">Scheduler Active</span>
            </div>
            {onLogout && (
              <button 
                onClick={onLogout}
                title="Logout"
                className="text-white/80 hover:text-white bg-white/10 hover:bg-red-500/80 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1"
              >
                <span className="hidden sm:inline">Logout</span>
                <span className="sm:hidden">🚪</span>
              </button>
            )}
          </div>
        </div>
        
        {/* Mobile Navigation Tabs */}
        <div className="md:hidden flex items-center gap-2 pb-3 mt-2">
            <button
              onClick={() => setCurrentView('dashboard')}
              className={`flex-1 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                currentView === 'dashboard'
                  ? 'bg-white text-whatsapp-700 shadow-sm'
                  : 'text-white/80 bg-white/10'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setCurrentView('all')}
              className={`flex-1 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                currentView === 'all'
                  ? 'bg-white text-whatsapp-700 shadow-sm'
                  : 'text-white/80 bg-white/10'
              }`}
            >
              All Reminders
            </button>
        </div>
      </div>
    </nav>
  );
}
