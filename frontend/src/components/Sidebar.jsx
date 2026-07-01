import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Package, 
  BarChart3, 
  CheckSquare, 
  LogOut, 
  User, 
  Settings,
  HeartPulse,
  Home
} from 'lucide-react';

const Sidebar = ({ role = 'pharmacy' }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, pharmacy, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Define navigation arrays based on role
  const pharmacyLinks = [
    { name: 'Dashboard', path: '/pharmacy-dashboard', icon: LayoutDashboard },
    { name: 'Inventory', path: '/pharmacy-inventory', icon: Package },
    { name: 'Analytics', path: '/pharmacy-analytics', icon: BarChart3 },
  ];

  const adminLinks = [
    { name: 'Overview', path: '/admin-dashboard', icon: LayoutDashboard },
    { name: 'Verification Queue', path: '/admin-verification', icon: CheckSquare },
    { name: 'System Analytics', path: '/admin-analytics', icon: BarChart3 },
  ];

  const links = role === 'admin' ? adminLinks : pharmacyLinks;
  const isActive = (path) => location.pathname === path;

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-slate-200/60 z-30 flex flex-col pt-24 pb-6 px-4">
      {/* Mini Profile Info */}
      <div className="bg-slate-50/80 border border-slate-200/30 rounded-2xl p-4 mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-md shadow-primary/10">
            {role === 'admin' ? 'AD' : (pharmacy?.name?.charAt(0) || 'P')}
          </div>
          <div className="overflow-hidden">
            <h4 className="font-semibold text-slate-800 text-sm truncate">
              {role === 'admin' ? 'Administrator' : (pharmacy?.name || 'Pharmacist')}
            </h4>
            <p className="text-xs text-slate-500 capitalize">{user?.role}</p>
          </div>
        </div>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 space-y-1.5">
        {links.map((link) => {
          const Icon = link.icon;
          const active = isActive(link.path);
          return (
            <Link
              key={link.path}
              to={link.path}
              className={`flex items-center space-x-3 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
                active 
                  ? 'bg-primary text-white shadow-md shadow-primary/15' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Icon size={18} className={active ? 'text-white' : 'text-slate-400'} />
              <span>{link.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer Controls */}
      <div className="pt-6 border-t border-slate-100 space-y-1">
        <Link 
          to="/"
          className="flex items-center space-x-3 px-4 py-2.5 rounded-xl font-medium text-sm text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors"
        >
          <Home size={18} className="text-slate-400" />
          <span>Back to Home</span>
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl font-medium text-sm text-red-600 hover:bg-red-50/50 transition-colors text-left"
        >
          <LogOut size={18} className="text-red-400" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
