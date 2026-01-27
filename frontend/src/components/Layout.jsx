import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Bot, LayoutDashboard } from 'lucide-react';

const Layout = ({ children }) => {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md border-b border-indigo-100 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200">
              <Bot size={20} />
            </div>
            <span className="font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">
              IntelliSupport
            </span>
          </div>
          <div className="flex gap-2">
            <Link
              to="/"
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                isActive('/') 
                ? 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200' 
                : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-50'
              }`}
            >
              Submit Complaint
            </Link>
            <Link
              to="/dashboard"
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                isActive('/dashboard') 
                ? 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200' 
                : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-50'
              }`}
            >
              <LayoutDashboard size={16} />
              Dashboard
            </Link>
          </div>
        </div>
      </nav>
      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        {children}
      </main>
    </div>
  );
};

export default Layout;
