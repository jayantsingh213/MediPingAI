import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Mail, Phone, Lock, Globe, Shield, Store, User, ArrowRight, CheckCircle2 } from 'lucide-react';

const LoginPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, registerPharmacy, user } = useAuth();

  // Determine if we should start in sign-in or pharmacy register mode
  const [isRegister, setIsRegister] = useState(searchParams.get('register') === 'pharmacy');
  const [activeDemoTab, setActiveDemoTab] = useState('user'); // 'user', 'pharmacy', 'admin'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Pharmacy registration state
  const [regName, setRegName] = useState('');
  const [regOwner, setRegOwner] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regAddress, setRegAddress] = useState('');
  const [regSuccess, setRegSuccess] = useState(false);

  // Re-check query param on change
  useEffect(() => {
    setIsRegister(searchParams.get('register') === 'pharmacy');
  }, [searchParams]);

  // If already logged in, redirect to correct portal
  useEffect(() => {
    if (user) {
      if (user.role === 'admin') navigate('/admin-dashboard');
      else if (user.role === 'pharmacy') navigate('/pharmacy-dashboard');
      else navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email');
      return;
    }
    setError('');
    setLoading(true);
    const res = await login(email, password, activeDemoTab);
    setLoading(false);
    if (!res.success) {
      setError(res.message || 'Login failed. Please check your credentials.');
    }
  };

  const triggerDemoLogin = async (role) => {
    setError('');
    setLoading(true);
    let demoEmail = 'user@mediping.ai';
    if (role === 'pharmacy') demoEmail = 'pharmacy@mediping.ai';
    if (role === 'admin') demoEmail = 'admin@mediping.ai';

    const res = await login(demoEmail, 'password123', role);
    setLoading(false);
    if (!res.success) {
      setError('Demo login failed.');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!regName || !regOwner || !regEmail || !regPhone || !regAddress) {
      setError('Please fill in all registration fields');
      return;
    }
    setError('');
    setLoading(true);
    const res = await registerPharmacy({
      name: regName,
      ownerName: regOwner,
      email: regEmail,
      phone: regPhone,
      address: regAddress,
      coordinates: [77.5946 + (Math.random() - 0.5) * 0.05, 12.9716 + (Math.random() - 0.5) * 0.05] // Staggered coords near Bangalore
    });
    setLoading(true); // Wait a tiny bit for realistic effect
    setTimeout(() => {
      setLoading(false);
      if (res.success) {
        setRegSuccess(true);
        setError('');
      } else {
        setError(res.message || 'Registration failed');
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen pt-40 sm:pt-48 sm:pt-40 pb-12 flex items-center justify-center bg-dot-pattern px-6">
      <div className="absolute top-1/3 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl -z-10 animate-pulse"></div>
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-success/5 rounded-full blur-3xl -z-10 animate-pulse"></div>

      <div className="max-w-[1000px] w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Brand Context */}
        <div className="lg:col-span-5 text-left lg:pt-8 hidden lg:block">
          <div className="flex items-center space-x-2 mb-6">
            <img src="/logo.png" alt="MediPing AI" className="h-36 sm:h-48 w-auto object-contain mix-blend-multiply -ml-4" />
          </div>
          <h2 className="text-4xl lg:text-5xl font-extrabold text-slate-900 leading-tight mb-4 font-display">
            The Healthcare Platform for Live Pharmacy Access.
          </h2>
          <p className="text-slate-500 text-base leading-relaxed mb-8">
            Join the network to find or provide real-time medicine availability. Secure, fast, and reliable.
          </p>

          <div className="space-y-4">
            <div className="flex items-start space-x-3.5">
              <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-primary mt-0.5">
                <CheckCircle2 size={14} />
              </div>
              <div>
                <h5 className="font-semibold text-slate-800 text-sm">Patient Portal</h5>
                <p className="text-xs text-slate-500">Live request radar and QR code reservations.</p>
              </div>
            </div>
            <div className="flex items-start space-x-3.5">
              <div className="w-6 h-6 bg-success/10 rounded-full flex items-center justify-center text-success mt-0.5">
                <CheckCircle2 size={14} />
              </div>
              <div>
                <h5 className="font-semibold text-slate-800 text-sm">Pharmacy Portal</h5>
                <p className="text-xs text-slate-500">Live requests panel, inventory, and pickups queues.</p>
              </div>
            </div>
            <div className="flex items-start space-x-3.5">
              <div className="w-6 h-6 bg-orange-500/10 rounded-full flex items-center justify-center text-warning mt-0.5">
                <CheckCircle2 size={14} />
              </div>
              <div>
                <h5 className="font-semibold text-slate-800 text-sm">Admin Portal</h5>
                <p className="text-xs text-slate-500">Approval dashboards, heatmaps, and response tracking.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Authentication Panel */}
        <div className="lg:col-span-7 w-full">
          <div className="premium-card bg-white p-8 border border-slate-200/50 shadow-xl">
            {/* Toggle Signin/Register */}
            <div className="flex space-x-6 border-b border-slate-100 pb-4 mb-6">
              <button 
                onClick={() => { setIsRegister(false); setRegSuccess(false); setError(''); }}
                className={`font-semibold text-base pb-2 border-b-2 transition-all ${!isRegister ? 'border-primary text-primary' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
              >
                Sign In
              </button>
              <button 
                onClick={() => { setIsRegister(true); setError(''); }}
                className={`font-semibold text-base pb-2 border-b-2 transition-all ${isRegister ? 'border-primary text-primary' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
              >
                Pharmacy Partner
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3.5 bg-red-50 border border-red-200 text-red-600 text-xs rounded-xl text-left font-medium">
                ⚠️ {error}
              </div>
            )}

            {!isRegister ? (
              // --- SIGN IN FLOW ---
              <div>
                <form onSubmit={handleEmailLogin} className="space-y-4 text-left">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Email Address</label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-4 top-3.5 text-slate-400" />
                      <input 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@company.com" 
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary/50 transition-all font-sans"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Password (Optional for Demo)</label>
                      <a href="#" className="text-xs text-primary font-semibold hover:underline">Forgot password?</a>
                    </div>
                    <div className="relative">
                      <Lock size={16} className="absolute left-4 top-3.5 text-slate-400" />
                      <input 
                        type="password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••" 
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary/50 transition-all"
                      />
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full bg-primary hover:bg-primary-dark text-white py-3.5 rounded-xl font-semibold shadow-md shadow-primary/10 transition-colors flex items-center justify-center space-x-2 text-sm"
                  >
                    {loading ? <span>Loading...</span> : <><span>Sign In with Email</span><ArrowRight size={16} /></>}
                  </button>
                </form>

                {/* Divider */}
                <div className="my-6 flex items-center justify-center space-x-3">
                  <div className="flex-1 h-px bg-slate-100"></div>
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">OR</span>
                  <div className="flex-1 h-px bg-slate-100"></div>
                </div>

                {/* Google & Phone Buttons */}
                <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={() => triggerDemoLogin('user')}
                    className="flex items-center justify-center space-x-2 border border-slate-200/80 hover:bg-slate-50 py-3 rounded-xl transition-colors text-xs font-semibold text-slate-700"
                  >
                    <span>Google Sign In</span>
                  </button>
                  <button 
                    onClick={() => triggerDemoLogin('user')}
                    className="flex items-center justify-center space-x-2 border border-slate-200/80 hover:bg-slate-50 py-3 rounded-xl transition-colors text-xs font-semibold text-slate-700"
                  >
                    <span>Phone Login</span>
                  </button>
                </div>

                {/* DEMO / GUEST LOGIN QUICK SELECT PANEL */}
                <div className="mt-8 pt-6 border-t border-slate-100 text-left">
                  <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 bg-primary/10 text-primary border border-primary/20 rounded-full text-[10px] font-extrabold uppercase tracking-wider mb-4">
                    <Shield size={10} />
                    <span>Evaluation Guest Mode</span>
                  </div>
                  <h4 className="font-bold text-slate-800 text-sm mb-3 font-display">Log in immediately with one-click:</h4>

                  {/* Demo Tabs */}
                  <div className="flex border border-slate-200 rounded-xl p-1 bg-slate-50 mb-4">
                    <button 
                      onClick={() => setActiveDemoTab('user')}
                      className={`flex-1 flex items-center justify-center space-x-1.5 py-2 rounded-lg text-xs font-semibold transition-all ${activeDemoTab === 'user' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                      <User size={13} />
                      <span>Patient</span>
                    </button>
                    <button 
                      onClick={() => setActiveDemoTab('pharmacy')}
                      className={`flex-1 flex items-center justify-center space-x-1.5 py-2 rounded-lg text-xs font-semibold transition-all ${activeDemoTab === 'pharmacy' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                      <Store size={13} />
                      <span>Pharmacist</span>
                    </button>
                    <button 
                      onClick={() => setActiveDemoTab('admin')}
                      className={`flex-1 flex items-center justify-center space-x-1.5 py-2 rounded-lg text-xs font-semibold transition-all ${activeDemoTab === 'admin' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                      <Shield size={13} />
                      <span>Admin</span>
                    </button>
                  </div>

                  {/* Demo Descriptions & Actions */}
                  {activeDemoTab === 'user' && (
                    <div className="bg-slate-50 p-4 border border-slate-100 rounded-2xl">
                      <p className="text-xs text-slate-500 leading-relaxed mb-3">
                        Experience the patient path: Search medication, trigger live radar ping, watch nearby pharmacies respond, and reserve items.
                      </p>
                      <div className="text-xs font-mono text-slate-600 mb-4">
                        Demo Account: <span className="font-bold">user@mediping.ai</span>
                      </div>
                      <button 
                        onClick={() => triggerDemoLogin('user')}
                        className="w-full bg-primary hover:bg-primary-dark text-white py-2.5 rounded-xl font-bold text-xs shadow-md transition-colors"
                      >
                        Sign In as Demo Patient
                      </button>
                    </div>
                  )}

                  {activeDemoTab === 'pharmacy' && (
                    <div className="bg-slate-50 p-4 border border-slate-100 rounded-2xl">
                      <p className="text-xs text-slate-500 leading-relaxed mb-3">
                        Experience the pharmacy dashboard: Receive real-time medicine requests, toggle stock availability, edit inventory, and confirm pickup QR codes.
                      </p>
                      <div className="text-xs font-mono text-slate-600 mb-4">
                        Demo Account: <span className="font-bold">pharmacy@mediping.ai</span>
                      </div>
                      <button 
                        onClick={() => triggerDemoLogin('pharmacy')}
                        className="w-full bg-primary hover:bg-primary-dark text-white py-2.5 rounded-xl font-bold text-xs shadow-md transition-colors"
                      >
                        Sign In as Demo Pharmacist
                      </button>
                    </div>
                  )}

                  {activeDemoTab === 'admin' && (
                    <div className="bg-slate-50 p-4 border border-slate-100 rounded-2xl">
                      <p className="text-xs text-slate-500 leading-relaxed mb-3">
                        Experience the global control panel: Review verified pharmacies, manage suspensions, check response times, and look at request volume maps.
                      </p>
                      <div className="text-xs font-mono text-slate-600 mb-4">
                        Demo Account: <span className="font-bold">admin@mediping.ai</span>
                      </div>
                      <button 
                        onClick={() => triggerDemoLogin('admin')}
                        className="w-full bg-primary hover:bg-primary-dark text-white py-2.5 rounded-xl font-bold text-xs shadow-md transition-colors"
                      >
                        Sign In as Demo Admin
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              // --- PHARMACY REGISTER FLOW ---
              <div>
                {regSuccess ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-success/15 text-success rounded-full flex items-center justify-center mx-auto mb-6">
                      <CheckCircle2 size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 font-display mb-2">Registration Submitted!</h3>
                    <p className="text-slate-500 text-sm max-w-sm mx-auto leading-relaxed mb-8">
                      Your store verification request was successfully recorded. The system administrator will review your application.
                    </p>
                    <button 
                      onClick={() => { setIsRegister(false); setRegSuccess(false); }}
                      className="bg-primary hover:bg-primary-dark text-white px-6 py-2.5 rounded-full text-sm font-semibold shadow-md"
                    >
                      Sign In Now
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleRegister} className="space-y-4 text-left">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase">Store Name</label>
                        <input 
                          type="text" 
                          value={regName}
                          onChange={(e) => setRegName(e.target.value)}
                          placeholder="e.g. Care Plus Chemist" 
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary/50"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase">Owner Name</label>
                        <input 
                          type="text" 
                          value={regOwner}
                          onChange={(e) => setRegOwner(e.target.value)}
                          placeholder="e.g. Dr. John Watson" 
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary/50"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase">Pharmacy Email</label>
                      <input 
                        type="email" 
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        placeholder="store@domain.com" 
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary/50"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase">Contact Number</label>
                      <input 
                        type="text" 
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        placeholder="+1 (555) 000-0000" 
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary/50"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase">Physical Address</label>
                      <textarea 
                        rows={2}
                        value={regAddress}
                        onChange={(e) => setRegAddress(e.target.value)}
                        placeholder="Street address, City, postal code" 
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary/50"
                      />
                    </div>

                    <button 
                      type="submit" 
                      disabled={loading}
                      className="w-full bg-primary hover:bg-primary-dark text-white py-3.5 rounded-xl font-semibold shadow-md transition-colors flex items-center justify-center space-x-2 text-sm mt-2"
                    >
                      {loading ? <span>Submitting...</span> : <><span>Submit Store Registration</span><ArrowRight size={16} /></>}
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
