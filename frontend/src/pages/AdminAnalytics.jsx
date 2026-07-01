import React, { useEffect, useState } from 'react';
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
  Legend
} from 'recharts';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Building2,
  Clock,
  Sparkles
} from 'lucide-react';

const AdminAnalytics = () => {
  const [analyticsData, setAnalyticsData] = useState({
    userGrowth: [],
    searchedMedicines: [],
    responseTimes: []
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:5000/api/admin/stats')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setAnalyticsData({
            userGrowth: data.stats.userGrowth || [],
            searchedMedicines: data.stats.searchedMedicines || [],
            responseTimes: data.stats.responseTimes || []
          });
        }
      })
      .catch(err => {
        console.log('Unreachable stats API, loading fallback local analytics dataset');
        setAnalyticsData({
          userGrowth: [
            { month: 'Jan', users: 120 },
            { month: 'Feb', users: 180 },
            { month: 'Mar', users: 290 },
            { month: 'Apr', users: 430 },
            { month: 'May', users: 650 },
            { month: 'Jun', users: 890 }
          ],
          searchedMedicines: [
            { name: 'Paracetamol 650mg', searches: 342 },
            { name: 'Ibuprofen 400mg', searches: 189 },
            { name: 'Cetirizine 10mg', searches: 145 },
            { name: 'Metformin 500mg', searches: 98 },
            { name: 'Azithromycin 500mg', searches: 76 }
          ],
          responseTimes: [
            { name: '0-1 Min', count: 45 },
            { name: '1-3 Min', count: 32 },
            { name: '3-5 Min', count: 18 },
            { name: '5+ Min', count: 5 }
          ]
        });
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <div className="pt-40 sm:pt-48 sm:pt-40 pb-12 pl-64 min-h-screen bg-slate-50 text-left">
      <Sidebar role="admin" />
      
      <div className="max-w-7xl mx-auto px-8">
        
        {/* Header Title */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight font-display flex items-center space-x-2">
            <BarChart3 size={24} className="text-primary" />
            <span>Platform Global Analytics</span>
          </h1>
          <p className="text-slate-500 text-sm">Real-time statistics covering user demographics, response frequencies, and medicine searches.</p>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-400">Loading system metrics...</div>
        ) : (
          <div className="space-y-8">
            
            {/* Upper charts layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* User Growth area chart */}
              <div className="lg:col-span-8 premium-card bg-white p-6 border border-slate-200/50">
                <h4 className="font-bold text-slate-800 text-sm font-display mb-4">Patient Acquisition Rate</h4>
                <div style={{ width: '100%', height: 300 }}>
                  <ResponsiveContainer>
                    <AreaChart
                      data={analyticsData.userGrowth}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#2563EB" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                      <XAxis dataKey="month" stroke="#94A3B8" fontSize={11} tickLine={false} />
                      <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px' }} />
                      <Area type="monotone" name="Total Patients" dataKey="users" stroke="#2563EB" strokeWidth={3} fillOpacity={1} fill="url(#colorUsers)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Response Times chart */}
              <div className="lg:col-span-4 premium-card bg-white p-6 border border-slate-200/50">
                <h4 className="font-bold text-slate-800 text-sm font-display mb-4">Response Time Distribution</h4>
                <div style={{ width: '100%', height: 300 }}>
                  <ResponsiveContainer>
                    <BarChart
                      data={analyticsData.responseTimes}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                      barSize={24}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                      <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} tickLine={false} />
                      <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px' }} />
                      <Bar dataKey="count" name="Pharmacies" fill="#22C55E" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>

            {/* Popular searched medicines bar chart */}
            <div className="premium-card bg-white p-6 border border-slate-200/50">
              <h4 className="font-bold text-slate-800 text-sm font-display mb-4">Most Searched Medicines Globally</h4>
              <div style={{ width: '100%', height: 280 }}>
                <ResponsiveContainer>
                  <BarChart
                    data={analyticsData.searchedMedicines}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    barSize={32}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                    <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} tickLine={false} />
                    <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px' }} />
                    <Bar dataKey="searches" name="Searches" fill="#2563EB" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};

export default AdminAnalytics;
