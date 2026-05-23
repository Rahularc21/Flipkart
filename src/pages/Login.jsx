import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../utils/api.js';
import toast from 'react-hot-toast';
import { Mail, ShieldCheck, Lock, ArrowRight } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [submitLoading, setSubmitLoading] = useState(false);

  const destination = location.state?.from?.pathname || '/';

  const validateForm = () => {
    const errorObj = {};
    if (!email) {
      errorObj.email = 'Email address is required.';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errorObj.email = 'Provide a valid email format.';
    }
    if (!password) {
      errorObj.password = 'Password is required.';
    } else if (password.length < 6) {
      errorObj.password = 'Password must be at least 6 characters.';
    }
    setErrors(errorObj);
    return Object.keys(errorObj).length === 0;
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.success) {
        toast.success(res.message || 'Logged in successfully!');
        login(res.data.user, res.data.token);
        navigate(destination, { replace: true });
      } else {
        toast.error(res.message || 'Verification failed. Try again.');
      }
    } catch (err) {
      toast.error(err.message || 'Network error connecting to endpoints.');
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center p-4 md:p-8" id="login-view-screen">
      <div className="bg-white w-full max-w-3xl rounded-md shadow-md overflow-hidden grid grid-cols-1 md:grid-cols-5 min-h-[420px]">
        
        <div className="bg-[#2874F0] text-white p-8 flex flex-col justify-between md:col-span-2 select-none">
          <div>
            <h2 className="text-xl md:text-2.5xl font-bold font-sans tracking-tight">Login</h2>
            <p className="text-xs md:text-sm text-blue-100 font-sans mt-3.5 leading-relaxed">
              Get access to your Orders, Wishlist and Recommendations
            </p>
          </div>
          
          <div className="hidden md:flex flex-col items-center justify-center opacity-85">
            <svg viewBox="0 0 120 100" className="w-32 h-32 text-blue-300">
              <rect x="20" y="20" width="80" height="60" rx="4" fill="currentColor" opacity="0.15" />
              <path d="M40 50 L55 65 L80 35" stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </svg>
            <span className="text-[10px] tracking-widest text-[#FFE11B] font-extrabold uppercase mt-2 flex items-center gap-1">
              <ShieldCheck size={12} /> SECURED PORTAL
            </span>
          </div>
        </div>

        <div className="p-8 md:col-span-3 flex flex-col justify-between">
          <form onSubmit={handleLoginSubmit} className="flex flex-col gap-5">
            
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <span className="absolute left-3 top-3.5 text-slate-400"><Mail size={16} /></span>
                <input
                  type="email"
                  value={email}
                  placeholder="Enter Email Address"
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border rounded outline-none transition focus:bg-white ${
                    errors.email ? 'border-rose-500 focus:ring-1 focus:ring-rose-200' : 'border-slate-200 focus:border-primary focus:ring-1 focus:ring-blue-100'
                  }`}
                />
              </div>
              {errors.email && <span className="text-[11px] text-rose-500 font-medium">{errors.email}</span>}
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Password</label>
              <div className="relative">
                <span className="absolute left-3 top-3.5 text-slate-400"><Lock size={16} /></span>
                <input
                  type="password"
                  value={password}
                  placeholder="Enter Password"
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border rounded outline-none transition focus:bg-white ${
                    errors.password ? 'border-rose-500 focus:ring-1 focus:ring-rose-200' : 'border-slate-200 focus:border-primary focus:ring-1 focus:ring-blue-100'
                  }`}
                />
              </div>
              {errors.password && <span className="text-[11px] text-rose-500 font-medium">{errors.password}</span>}
            </div>

            <p className="text-[10px] md:text-[11px] text-slate-400 leading-relaxed font-sans">
              By continuing, you agree to Flipkart's Terms of Use and Privacy Policy.
            </p>

            <button
              type="submit"
              disabled={submitLoading}
              className="w-full py-3 rounded bg-[#FB641B] hover:bg-orange-600 font-bold text-sm text-white uppercase tracking-wider shadow-sm transition hover:shadow-md cursor-pointer flex items-center justify-center gap-1.5 active:translate-y-[1px] disabled:bg-slate-300 disabled:cursor-not-allowed"
            >
              {submitLoading ? 'Verifying Credentials...' : 'Sign In'}
              <ArrowRight size={16} />
            </button>

          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 text-center text-xs md:text-sm">
            <span className="text-slate-500">New to Flipkart? </span>
            <Link to="/signup" className="text-primary font-bold hover:underline select-none">
              Create an account
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
}
