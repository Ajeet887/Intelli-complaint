import React, { useEffect, useState, useMemo } from 'react';
import Layout from '../components/Layout';
import Card from '../components/ui/Card';
import { getComplaints, updateComplaintStatus } from '../services/api';
import { RefreshCw, CheckCircle2, Clock, AlertCircle, BarChart3, PieChart } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart as RePieChart,
  Pie,
  Cell,
} from 'recharts';
import { motion } from 'framer-motion';

const STATS_COLORS = {
  Completed: '#10B981', // Green
  Pending: '#F59E0B',   // Amber
  InProgress: '#3B82F6', // Blue
};

const Dashboard = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchComplaints = async () => {
    try {
      const data = await getComplaints();
      setComplaints(data);
    } catch (error) {
      console.error('Failed to fetch complaints', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
    const interval = setInterval(fetchComplaints, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    try {
      // Optimistic update
      setComplaints(prev => prev.map(c => c[0] === id ? [...c.slice(0, 9), newStatus, c[10]] : c));
      await updateComplaintStatus(id, newStatus);
      fetchComplaints(); // Refresh to ensure sync
    } catch (error) {
      console.error("Failed to update status", error);
      fetchComplaints(); // Revert on error
    }
  };

  const processedData = useMemo(() => {
    const stats = {
      total: complaints.length,
      completed: 0,
      pending: 0,
      inProgress: 0,
    };

    const issuesMap = {};

    complaints.forEach(c => {
      // Index 9 is status (based on new schema)
      // If schema update hasn't propagated or new fields are missing in old records, handle gracefully
      const status = c[9] || 'Pending'; 
      const issue = c[5] || 'Unknown';

      if (status === 'Completed') stats.completed++;
      else if (status === 'In Progress') stats.inProgress++;
      else stats.pending++; // Default to Pending

      if (issue) {
        issuesMap[issue] = (issuesMap[issue] || 0) + 1;
      }
    });

    const pieData = [
      { name: 'Completed', value: stats.completed, color: STATS_COLORS.Completed },
      { name: 'In Progress', value: stats.inProgress, color: STATS_COLORS.InProgress },
      { name: 'Pending', value: stats.pending, color: STATS_COLORS.Pending },
    ].filter(d => d.value > 0);

    const barData = Object.entries(issuesMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5); // Top 5 issues

    return { stats, pieData, barData };
  }, [complaints]);

  const StatCard = ({ title, count, icon: Icon, color, subtext }) => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl ${color} bg-opacity-10`}>
          <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
        </div>
        <span className="text-3xl font-bold text-slate-900">{count}</span>
      </div>
      <h3 className="text-slate-500 font-medium text-sm">{title}</h3>
      <p className="text-xs text-slate-400 mt-1">{subtext}</p>
    </motion.div>
  );

  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Analytics Dashboard</h1>
            <p className="text-slate-500 mt-1">Real-time overview of complaint resolution metrics</p>
          </div>
          <button 
            onClick={() => { setLoading(true); fetchComplaints(); }}
            className="p-2 rounded-full hover:bg-slate-100 text-slate-500 hover:text-indigo-600 transition-colors"
            title="Refresh Data"
          >
            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            title="Total Complaints" 
            count={processedData.stats.total} 
            icon={BarChart3} 
            color="bg-indigo-600 text-indigo-600"
            subtext="All time received"
          />
          <StatCard 
            title="Resolved" 
            count={processedData.stats.completed} 
            icon={CheckCircle2} 
            color="bg-emerald-500 text-emerald-600"
            subtext={`${((processedData.stats.completed / processedData.stats.total || 0) * 100).toFixed(1)}% success rate`}
          />
          <StatCard 
            title="In Progress" 
            count={processedData.stats.inProgress} 
            icon={Clock} 
            color="bg-blue-500 text-blue-600"
            subtext="Currently being handled"
          />
          <StatCard 
            title="Pending Actions" 
            count={processedData.stats.pending} 
            icon={AlertCircle} 
            color="bg-amber-500 text-amber-600"
            subtext="Requires immediate attention"
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 p-6 flex flex-col">
            <h3 className="text-lg font-bold text-slate-900 mb-6">Top Reported Issues</h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={processedData.barData} layout="vertical" margin={{ left: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" width={100} tick={{fontSize: 12}} />
                  <Tooltip 
                    cursor={{fill: 'transparent'}}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="count" fill="#4F46E5" radius={[0, 4, 4, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="p-6 flex flex-col">
            <h3 className="text-lg font-bold text-slate-900 mb-6">Status Distribution</h3>
            <div className="h-64 w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <RePieChart>
                  <Pie
                    data={processedData.pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {processedData.pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36}/>
                </RePieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center">
                  <span className="text-3xl font-bold text-slate-900">{processedData.stats.total}</span>
                  <p className="text-xs text-slate-500">Total</p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Recent Complaints Table */}
        <Card className="overflow-hidden border-0 shadow-xl shadow-slate-200/50">
          <div className="p-6 border-b border-slate-100">
            <h3 className="text-lg font-bold text-slate-900">Recent Complaints</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/80 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 font-semibold text-slate-600 uppercase tracking-wider text-xs">Status</th>
                  <th className="px-6 py-4 font-semibold text-slate-600 uppercase tracking-wider text-xs">Type</th>
                  <th className="px-6 py-4 font-semibold text-slate-600 uppercase tracking-wider text-xs">Issue</th>
                  <th className="px-6 py-4 font-semibold text-slate-600 uppercase tracking-wider text-xs">Area</th>
                  <th className="px-6 py-4 font-semibold text-slate-600 uppercase tracking-wider text-xs">Summary</th>
                  <th className="px-6 py-4 font-semibold text-slate-600 uppercase tracking-wider text-xs">Mentioned Time</th>
                  <th className="px-6 py-4 font-semibold text-slate-600 uppercase tracking-wider text-xs">Logged Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 bg-white">
                {complaints.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center text-slate-400 italic">
                      No complaints found yet.
                    </td>
                  </tr>
                ) : (
                  complaints.slice().reverse().map((complaint) => (
                    <tr key={complaint[0]} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="px-6 py-4">
                        <select
                          value={complaint[9] || 'Pending'}
                          onChange={(e) => handleStatusChange(complaint[0], e.target.value)}
                          className={`
                            block w-full rounded-md border-0 py-1.5 pl-3 pr-8 text-xs font-semibold ring-1 ring-inset focus:ring-2 focus:ring-indigo-600 sm:leading-6 cursor-pointer
                            ${(complaint[9] === 'Completed') ? 'text-emerald-700 bg-emerald-50 ring-emerald-600/20' : 
                              (complaint[9] === 'In Progress') ? 'text-blue-700 bg-blue-50 ring-blue-600/20' : 
                              'text-amber-700 bg-amber-50 ring-amber-600/20'}
                          `}
                        >
                          <option value="Pending">Pending</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Completed">Completed</option>
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                          complaint[1] === 'voice' 
                            ? 'bg-purple-100 text-purple-700' 
                            : 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                        }`}>
                          {complaint[1] === 'voice' ? 'Voice' : 'Text'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900">{complaint[5] || 'Unknown Issue'}</span>
                          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mt-0.5">Category</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-500">{complaint[6] || '—'}</td>
                      <td className="px-6 py-4 text-slate-600 max-w-xs" title={complaint[3]}>
                        <p className="line-clamp-2">{complaint[3]}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1 text-slate-600 text-xs font-medium italic">
                          <Clock size={12} className="text-slate-400" />
                          {complaint[7]}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-400 text-xs font-mono">
                        {new Date(complaint[8]).toLocaleString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </Layout>
  );
};

export default Dashboard;
