import React, { useState } from 'react';

function Login() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const validate = () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError('Please fill in all fields.');
      return false;
    }
    return true;
  };

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');
    if (!validate()) return;
    setLoading(true);
    setTimeout(() => {
      localStorage.setItem('token', 'demo-token');
      localStorage.setItem('user', JSON.stringify({
        fullName: name.trim(),
        email: email.trim(),
        role: 'ngo_admin',
      }));
      window.location.reload();
    }, 600);
  };

  const handleBeneficiaryLogin = () => {
    setError('');
    if (!validate()) return;
    setLoading(true);
    setTimeout(() => {
      localStorage.setItem('token', 'demo-token');
      localStorage.setItem('user', JSON.stringify({
        fullName: name.trim(),
        email: email.trim(),
        role: 'beneficiary',
      }));
      window.location.reload();
    }, 600);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel with Background Image */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Background Image Container */}
        <div
          className="absolute inset-0 z-0 bg-cover bg-center"
          style={{ backgroundImage: `url('/login-hero.jpg')` }}
        ></div>
        {/* Dark Gradient Overlay for Text Readability */}
        <div className="absolute inset-0 z-0 bg-blue-900/80 mix-blend-multiply"></div>
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-blue-900/90 via-blue-800/80 to-slate-900/90"></div>

        {/* Content Layer */}
        <div className="relative z-10 flex flex-col justify-between w-full h-full p-12">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white">AidConnect</h1>
          </div>
          <div>
            <h2 className="text-4xl font-bold text-white leading-tight mb-4">Transforming Humanitarian<br />Aid Distribution</h2>
            <p className="text-blue-200 text-lg mb-10">Coordinating resources, preventing duplication, and ensuring transparent aid delivery to communities in need.</p>
            <div className="flex gap-10">
              <div><p className="text-3xl font-bold text-amber-400">1,248</p><p className="text-blue-300 text-sm mt-1">Beneficiaries</p></div>
              <div><p className="text-3xl font-bold text-amber-400">45</p><p className="text-blue-300 text-sm mt-1">NGOs Connected</p></div>
              <div><p className="text-3xl font-bold text-amber-400">98%</p><p className="text-blue-300 text-sm mt-1">Success Rate</p></div>
            </div>
          </div>
          <p className="text-blue-400 text-sm">© 2024 AidConnect. Securing humanitarian aid distribution.</p>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center bg-gray-50 p-8">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-1">Welcome back</h2>
            <p className="text-gray-500 text-sm mb-6">Sign in to access your dashboard</p>

            {error && (
              <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-3 rounded-r-lg">
                <p className="text-red-700 text-sm font-medium">{error}</p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </span>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    placeholder="Your full name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                  </span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </span>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleLogin(e)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button
                onClick={handleLogin}
                disabled={loading}
                className="w-full py-3 rounded-lg font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 transition shadow-lg disabled:opacity-50"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>

              <div className="relative flex items-center gap-3">
                <div className="flex-1 h-px bg-gray-200"></div>
                <span className="text-xs text-gray-400 font-medium">OR</span>
                <div className="flex-1 h-px bg-gray-200"></div>
              </div>

              <button
                onClick={handleBeneficiaryLogin}
                disabled={loading}
                className="w-full py-3 rounded-lg font-semibold text-green-700 bg-green-50 border border-green-200 hover:bg-green-100 transition disabled:opacity-50"
              >
                Sign in as Beneficiary
              </button>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-100 text-center">
              <p className="text-sm text-gray-500">Don't have an account? <span className="text-blue-600 font-semibold">Contact your NGO Admin</span></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
