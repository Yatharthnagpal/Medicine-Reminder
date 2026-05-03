import { useState } from 'react';
import toast from 'react-hot-toast';

export default function Login({ onLogin }) {
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    // Hardcoded credentials as requested
    setTimeout(() => {
      if (id === 'kamal' && password === '30051975') {
        toast.success('Login successful! 🎉');
        onLogin();
      } else {
        toast.error('Invalid ID or Password. Please try again. ❌');
        setLoading(false);
      }
    }, 800); // Simulate network request for better UX
  };

  return (
    <div className="min-h-screen flex items-center justify-center gradient-whatsapp-soft p-4">
      <div className="w-full max-w-md">
        {/* Animated Icon / Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white shadow-xl mb-4 transform transition-transform hover:scale-110 duration-300">
            <span className="text-4xl">🔐</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight">Admin Access</h1>
          <p className="text-gray-600 mt-2">Sign in to manage WhatsApp Reminders</p>
        </div>

        {/* Login Form */}
        <div className="glass-card p-8 shadow-2xl relative overflow-hidden">
          {/* Decorative subtle blob */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-whatsapp-500/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-whatsapp-600/10 rounded-full blur-3xl"></div>

          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 ml-1 block">
                Admin ID
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="text-gray-400">👤</span>
                </div>
                <input
                  type="text"
                  value={id}
                  onChange={(e) => setId(e.target.value)}
                  className="input-field pl-11"
                  placeholder="Enter your ID"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 ml-1 block">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="text-gray-400">🔑</span>
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pl-11"
                  placeholder="Enter your password"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex justify-center items-center py-3.5 text-lg"
            >
              {loading ? (
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                'Secure Login'
              )}
            </button>
          </form>
        </div>

        {/* Footer info */}
        <p className="text-center text-sm text-gray-500 mt-8 font-medium">
          Protected Dashboard Area
        </p>
      </div>
    </div>
  );
}
