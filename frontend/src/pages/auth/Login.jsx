import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Layers,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  CheckCircle2,
  FileSpreadsheet,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { useApp } from '../../context/AppContext';

export const Login = () => {
  const navigate = useNavigate();
  const { showToast, loginUser, currentUser, isAuthLoading } = useApp();

  const [email, setEmail] = useState('admin@freshharvest.co.uk');
  const [password, setPassword] = useState('Password123!');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Pre-configured test accounts for quick credential filling
  const demoAccounts = [
    {
      role: 'admin',
      label: 'Business Owner / Admin',
      email: 'admin@freshharvest.co.uk',
      password: 'Password123!',
      badge: 'Full Access',
      description: 'WhatsApp Orders, Invoicing, Purchasing & Settings',
    },
    {
      role: 'accountant',
      label: 'Accountant / Auditor',
      email: 'accounts@freshharvest.co.uk',
      password: 'Password123!',
      badge: 'VAT & Ledgers',
      description: 'HMRC VAT Returns, Statements, P&L & Reports',
    },
    {
      role: 'customer',
      label: 'Customer (Green Valley)',
      email: 'accounts@greenvalley.co.uk',
      password: 'Password123!',
      badge: 'Client Portal',
      description: 'View Invoices, Payments, Balance & Statements',
    },
  ];

  // If already authenticated, redirect to role-specific dashboard immediately
  useEffect(() => {
    if (!isAuthLoading && currentUser) {
      if (currentUser.role === 'customer') {
        navigate('/portal', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [currentUser, isAuthLoading, navigate]);

  const handleSelectDemo = (account) => {
    setEmail(account.email);
    setPassword(account.password);
    setErrorMessage('');
    showToast(`Loaded test credentials for ${account.label}`);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsLoading(true);
    setErrorMessage('');

    try {
      const user = await loginUser(email, password);
      showToast(`Welcome back, ${user.name || user.title}!`);
      if (user.role === 'customer') {
        navigate('/portal', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    } catch (err) {
      const msg = err.data?.message || err.message || 'Invalid email or password. Please verify your credentials.';
      setErrorMessage(msg);
      showToast(msg, 'danger');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex antialiased">
      {/* Left Visual Branding Panel (Hidden on Mobile) */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 text-white p-12 flex-col justify-between relative overflow-hidden">
        {/* Background decorative gradient glow */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-600/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-emerald-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Brand Header */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-11 h-11 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-white leading-tight">
              Ledger<span className="text-blue-400">Flow</span>
            </h1>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">
              Business SaaS Dashboard
            </p>
          </div>
        </div>

        {/* Center Marketing Value Props */}
        <div className="space-y-8 max-w-lg relative z-10 my-auto py-8">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/15 text-blue-400 text-xs font-bold border border-blue-500/30 mb-4">
              <Sparkles className="w-3.5 h-3.5" /> Smart Invoicing & Purchasing
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white leading-tight tracking-tight">
              Simple invoicing, daily purchasing & accounting made easy.
            </h2>
            <p className="text-slate-400 text-sm mt-3 leading-relaxed">
              Designed specifically for small business owners, wholesale distributors, and food suppliers who need straightforward financial control without complexity.
            </p>
          </div>

          <div className="space-y-3.5">
            <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 backdrop-blur-xs">
              <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Daily Order & Inventory Aggregation</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Combine customer produce orders into a single wholesale purchasing sheet instantly.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 backdrop-blur-xs">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Automated Customer Balances & Statements</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Live outstanding tracking with accountant-ready debit & credit statement PDFs.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 backdrop-blur-xs">
              <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
                <FileSpreadsheet className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">HMRC Making Tax Digital (MTD) VAT</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Automatic 20% standard and 0% produce zero-rated tax calculation.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Security Badge */}
        <div className="flex items-center gap-2 text-xs text-slate-400 relative z-10 pt-4 border-t border-slate-800">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Secure Mock Enterprise Workspace • 256-bit Simulated Encryption</span>
        </div>
      </div>

      {/* Right Login Form Container */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-6">
          {/* Mobile Brand Header */}
          <div className="lg:hidden flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-xs">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <span className="text-lg font-black text-slate-900 tracking-tight">
                Ledger<span className="text-blue-600">Flow</span>
              </span>
              <p className="text-[10px] font-semibold text-slate-400 uppercase">
                Business Management
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Sign in to your account
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Enter your credentials or choose a quick demo role to explore.
            </p>
          </div>

          {/* Quick Demo Login Preset Buttons */}
          <div className="p-3.5 bg-blue-50/70 rounded-2xl border border-blue-100 space-y-2">
            <span className="text-[11px] font-bold text-blue-900 uppercase tracking-wider block">
              Quick One-Click Demo Logins:
            </span>
            <div className="grid grid-cols-1 gap-1.5">
              {demoAccounts.map((acc) => (
                <button
                  key={acc.role}
                  type="button"
                  onClick={() => handleSelectDemo(acc)}
                  className={`flex items-center justify-between p-2.5 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                    email === acc.email
                      ? 'bg-white border-blue-500 shadow-xs ring-1 ring-blue-500/20'
                      : 'bg-white/60 border-slate-200/80 hover:bg-white hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <div>
                    <span className="font-bold text-slate-900 block">{acc.label}</span>
                    <span className="text-[11px] text-slate-500">{acc.description}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-700 text-[10px] font-bold shrink-0 ml-2">
                    {acc.badge}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Error Message Banner */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2 animate-fade-in">
              <span className="font-bold shrink-0">Error:</span>
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@business.com"
                  className="block w-full rounded-xl border border-slate-300 pl-9 pr-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-colors"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => showToast('Enter your registered password or choose a demo account above.', 'info')}
                  className="text-xs text-blue-600 hover:text-blue-800 font-medium cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full rounded-xl border border-slate-300 pl-9 pr-10 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
                />
                <span className="text-xs text-slate-600 font-medium">Keep me signed in</span>
              </label>

              <span className="text-[11px] text-slate-400 font-mono">v1.4 Live Auth</span>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={isLoading}
              icon={ArrowRight}
              iconPosition="right"
              className="w-full font-bold shadow-md shadow-blue-600/20 text-sm py-3"
            >
              Sign In to Dashboard
            </Button>
          </form>

          {/* Direct Access Note */}
          <div className="pt-2 text-center text-xs text-slate-500">
            <span>Production-secured authentication. </span>
            <span className="text-slate-600 font-medium">Session cookies strictly managed by backend.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
