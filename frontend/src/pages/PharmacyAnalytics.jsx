import React from 'react';
import Sidebar from '../components/Sidebar';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  Legend
} from 'recharts';
import { 
  BarChart3, 
  TrendingUp, 
  Zap, 
  CheckCircle,
  Clock,
  Award
} from 'lucide-react';

const PharmacyAnalytics = () => {
  // Chart Data: Daily Request Load
  const dailyRequestsData = [
    { day: 'Mon', requests: 12, accepted: 10 },
    { day: 'Tue', requests: 19, accepted: 16 },
    { day: 'Wed', requests: 15, accepted: 13 },
    { day: 'Thu', requests: 22, accepted: 19 },
    { day: 'Fri', requests: 30, accepted: 27 },
    { day: 'Sat', requests: 25, accepted: 23 },
    { day: 'Sun', requests: 18, accepted: 16 }
  ];

  // Chart Data: Most Requested Medicines
  const popularMedsData = [
    { name: 'Paracetamol 650mg', searches: 145 },
    { name: 'Ibuprofen 400mg', searches: 92 },
    { name: 'Cetirizine 10mg', searches: 78 },
    { name: 'Metformin 500mg', searches: 54 },
    { name: 'Amoxicillin 500mg', searches: 42 }
  ];

  // Chart Data: Acceptance rate over months
  const monthlyRateData = [
    { month: 'Jan', rate: 78 },
    { month: 'Feb', rate: 82 },
    { month: 'Mar', rate: 85 },
    { month: 'Apr', rate: 88 },
    { month: 'May', rate: 91 },
    { month: 'Jun', rate: 94 }
  ];

  return (
    <div className="pt-40 sm:pt-48 sm:pt-40 pb-12 pl-64 min-h-screen bg-slate-50 text-left">
      <Sidebar role="pharmacy" />
      
      <div className="max-w-7xl mx-auto px-8">
        
        {/* Header Title */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight font-display flex items-center space-x-2">
            <BarChart3 size={24} className="text-primary" />
            <span>Store Performance Analytics</span>
          </h1>
          <p className="text-slate-500 text-sm">Visual metrics of medicine requests, acceptance ratios, and pickup completions.</p>
        </div>

        {/* Highlight widgets */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className="premium-card bg-white p-5 border border-slate-200/40">
            <div className="flex justify-between items-start mb-3">
              <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Average response delay</span>
              <Clock size={16} className="text-primary" />
            </div>
            <div className="text-2xl font-black text-slate-800 font-display">32 seconds</div>
            <span className="text-[10px] text-success font-semibold flex items-center mt-1">
              ⚡ 12% faster than local average
            </span>
          </div>

          <div className="premium-card bg-white p-5 border border-slate-200/40">
            <div className="flex justify-between items-start mb-3">
              <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Completed Pickups</span>
              <CheckCircle size={16} className="text-success" />
            </div>
            <div className="text-2xl font-black text-slate-800 font-display">148 orders</div>
            <span className="text-[10px] text-slate-400 font-medium flex items-center mt-1">
              98.2% completion guarantee rate
            </span>
          </div>

          <div className="premium-card bg-white p-5 border border-slate-200/40">
            <div className="flex justify-between items-start mb-3">
              <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Top rated partner</span>
              <Award size={16} className="text-amber-500" />
            </div>
            <div className="text-2xl font-black text-slate-800 font-display">4.8 / 5.0</div>
            <span className="text-[10px] text-primary font-semibold flex items-center mt-1">
              ⭐ Rank #3 in sector region
            </span>
          </div>
        </div>

        {/* Graphs layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
          {/* Daily request load area chart */}
          <div className="lg:col-span-8 premium-card bg-white p-6 border border-slate-200/50">
            <h4 className="font-bold text-slate-800 text-sm font-display mb-4">Daily Requests vs Accepted Responses</h4>
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <AreaChart
                  data={dailyRequestsData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorRequests" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563EB" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorAccepted" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22C55E" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#22C55E" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis dataKey="day" stroke="#94A3B8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px' }} />
                  <Legend verticalAlign="top" height={36} iconType="circle" />
                  <Area type="monotone" name="Inbound Requests" dataKey="requests" stroke="#2563EB" strokeWidth={2} fillOpacity={1} fill="url(#colorRequests)" />
                  <Area type="monotone" name="Accepted Availability" dataKey="accepted" stroke="#22C55E" strokeWidth={2} fillOpacity={1} fill="url(#colorAccepted)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Acceptance rate line chart */}
          <div className="lg:col-span-4 premium-card bg-white p-6 border border-slate-200/50">
            <h4 className="font-bold text-slate-800 text-sm font-display mb-4">Acceptance Rate Trend</h4>
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <LineChart
                  data={monthlyRateData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                  <XAxis dataKey="month" stroke="#94A3B8" fontSize={11} tickLine={false} />
                  <YAxis domain={[50, 100]} stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px' }} />
                  <Line type="monotone" name="Rate (%)" dataKey="rate" stroke="#2563EB" strokeWidth={3} activeDot={{ r: 6 }} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Most requested medicines bar chart */}
        <div className="premium-card bg-white p-6 border border-slate-200/50 mb-8">
          <h4 className="font-bold text-slate-800 text-sm font-display mb-4">Most Requested Medicines in Your Region</h4>
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer>
              <BarChart
                data={popularMedsData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                barSize={32}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px' }} />
                <Bar dataKey="searches" name="Regional Searches" fill="#2563EB" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
};

export default PharmacyAnalytics;
