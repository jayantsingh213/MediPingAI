import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Bell, Menu, X, User, LogOut, LayoutDashboard, Shield, Store } from 'lucide-react';
import NotificationBell from './notifications/NotificationBell';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = () => {
    logout();
    setShowDropdown(false);
    navigate('/');
  };

  const getDashboardLink = () => {
    if (!user) return null;
    if (user.role === 'admin') return '/admin-dashboard';
    if (user.role === 'pharmacy') return '/pharmacy-dashboard';
    return '/dashboard';
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="glass-panel fixed top-0 left-0 right-0 z-50 px-6 py-4 shadow-sm border-b border-slate-200/50">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2 group pt-2">
          <img src="/logo.png" alt="MediPing AI" className="h-24 sm:h-32 w-auto object-contain transition-transform duration-300 group-hover:scale-105 mix-blend-multiply -my-8" />
          <span className="w-2.5 h-2.5 rounded-full bg-success pulse-badge ml-1 hidden sm:block mt-1"></span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-8">
          <Link 
            to="/" 
            className={`font-medium transition-colors ${isActive('/') ? 'text-primary' : 'text-slate-600 hover:text-slate-950'}`}
          >
            Home
          </Link>
          
          {user ? (
            <>
              <Link 
                to={getDashboardLink()} 
                className={`font-medium transition-colors ${isActive(getDashboardLink()) ? 'text-primary' : 'text-slate-600 hover:text-slate-950'}`}
              >
                Dashboard
              </Link>
              {user.role === 'user' && (
                <Link 
                  to="/profile" 
                  className={`font-medium transition-colors ${isActive('/profile') ? 'text-primary' : 'text-slate-600 hover:text-slate-950'}`}
                >
                  My Reservations
                </Link>
              )}
            </>
          ) : (
            <>
              <a href="#features" className="font-medium text-slate-600 hover:text-slate-950 transition-colors">Features</a>
              <a href="#how-it-works" className="font-medium text-slate-600 hover:text-slate-950 transition-colors">How It Works</a>
            </>
          )}

          {/* User Auth Section */}
          {user ? (
            <div className="flex items-center space-x-4">
              <NotificationBell />

              <div className="relative">
                <button 
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center space-x-2 bg-slate-100/80 hover:bg-slate-200/80 border border-slate-200/50 py-1.5 px-3 rounded-full transition-all"
                >
                  <div className="w-7 h-7 bg-primary/10 rounded-full flex items-center justify-center text-primary font-semibold text-xs">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-slate-800 text-sm font-medium hidden lg:inline">{user.name.split(' ')[0]}</span>
                </button>

                {showDropdown && (
                  <div className="absolute right-0 mt-3 w-56 bg-white border border-slate-100 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <div className="font-semibold text-slate-800 text-sm">{user.name}</div>
                      <div className="text-xs text-slate-500 truncate">{user.email}</div>
                    </div>
                    
                    <Link 
                      to={getDashboardLink()} 
                      onClick={() => setShowDropdown(false)}
                      className="flex items-center space-x-2 px-4 py-2 text-slate-700 hover:bg-slate-50 text-sm transition-colors"
                    >
                      <LayoutDashboard size={16} className="text-slate-400" />
                      <span>Dashboard</span>
                    </Link>

                    {user.role === 'user' && (
                      <Link 
                        to="/profile" 
                        onClick={() => setShowDropdown(false)}
                        className="flex items-center space-x-2 px-4 py-2 text-slate-700 hover:bg-slate-50 text-sm transition-colors"
                      >
                        <User size={16} className="text-slate-400" />
                        <span>My Profile</span>
                      </Link>
                    )}

                    <button 
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50/50 text-sm transition-colors text-left"
                    >
                      <LogOut size={16} className="text-red-400" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <Link 
                to="/login" 
                className="text-slate-600 hover:text-slate-950 font-medium transition-colors"
              >
                Sign In
              </Link>
              <Link 
                to="/login?register=pharmacy" 
                className="bg-slate-100 text-slate-800 border border-slate-200 hover:bg-slate-200 px-4 py-2 rounded-full font-medium transition-colors"
              >
                Register Pharmacy
              </Link>
              <Link 
                to="/login" 
                className="bg-primary text-white hover:bg-primary-dark px-5 py-2 rounded-full font-medium shadow-md shadow-primary/20 transition-all hover:scale-[1.02]"
              >
                Search Medicine
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center space-x-4">
          {user && <NotificationBell />}
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="md:hidden mt-4 pt-4 border-t border-slate-200/50 space-y-3 pb-2 animate-in slide-in-from-top duration-300">
          <Link 
            to="/" 
            onClick={() => setIsOpen(false)}
            className="block px-4 py-2 rounded-xl text-slate-700 hover:bg-slate-50 font-medium"
          >
            Home
          </Link>
          
          {user ? (
            <>
              <Link 
                to={getDashboardLink()} 
                onClick={() => setIsOpen(false)}
                className="block px-4 py-2 rounded-xl text-slate-700 hover:bg-slate-50 font-medium"
              >
                Dashboard
              </Link>
              {user.role === 'user' && (
                <Link 
                  to="/profile" 
                  onClick={() => setIsOpen(false)}
                  className="block px-4 py-2 rounded-xl text-slate-700 hover:bg-slate-50 font-medium"
                >
                  My Reservations
                </Link>
              )}
              <div className="pt-2 border-t border-slate-100 px-4">
                <div className="text-sm font-semibold text-slate-800">{user.name}</div>
                <div className="text-xs text-slate-500">{user.email}</div>
              </div>
              <button 
                onClick={handleLogout}
                className="w-full flex items-center space-x-2 px-4 py-2.5 text-red-600 hover:bg-red-50/50 rounded-xl text-sm font-medium transition-colors"
              >
                <LogOut size={16} />
                <span>Sign Out</span>
              </button>
            </>
          ) : (
            <div className="pt-2 border-t border-slate-200/50 space-y-2 px-4">
              <Link 
                to="/login" 
                onClick={() => setIsOpen(false)}
                className="block text-center py-2.5 text-slate-700 hover:bg-slate-50 font-medium rounded-xl border border-slate-200/50"
              >
                Sign In
              </Link>
              <Link 
                to="/login?register=pharmacy" 
                onClick={() => setIsOpen(false)}
                className="block text-center py-2.5 bg-slate-100 text-slate-800 font-medium rounded-xl border border-slate-200 hover:bg-slate-200"
              >
                Register Pharmacy
              </Link>
              <Link 
                to="/login" 
                onClick={() => setIsOpen(false)}
                className="block text-center py-2.5 bg-primary text-white font-medium rounded-xl shadow-md"
              >
                Search Medicine
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
