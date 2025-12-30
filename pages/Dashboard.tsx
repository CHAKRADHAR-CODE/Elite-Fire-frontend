
import React, { useMemo, useEffect, useState } from 'react';
import { User, UserRole, Match, Transaction } from '../types';
import { stateService } from '../services/stateService';
import { useTranslation } from '../App';
import { Trophy, Activity, Wallet, BarChart3, Users, Zap, Flame, Shield, Swords, Loader2 } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const StatCard: React.FC<{ icon: React.ReactNode, label: string, value: string | number, color: string, index: number }> = ({ icon, label, value, color, index }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.1 }}
    whileHover={{ y: -5, scale: 1.02 }} 
    className="bg-gray-100/50 dark:bg-[#0b0e14]/60 backdrop-blur-xl p-8 rounded-[32px] border border-black/5 dark:border-white/5 shadow-xl relative overflow-hidden group"
  >
    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 bg-black/5 dark:bg-white/5 text-[${color}]`} style={{ color }}>
      {icon}
    </div>
    <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-2">{label}</p>
    <p className="text-3xl font-gaming font-black text-gray-900 dark:text-white">{value}</p>
  </motion.div>
);

const Dashboard: React.FC<{ user: User }> = ({ user }) => {
  const { t } = useTranslation();
  const [matches, setMatches] = useState<Match[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const isAdmin = user.role === UserRole.ADMIN;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [m, u, t] = await Promise.all([
          stateService.getMatches(),
          stateService.getUsers(),
          isAdmin ? stateService.getAllTransactions() : stateService.getTransactions(user.id)
        ]);
        setMatches(m);
        setAllUsers(u);
        setTransactions(t);
      } catch (error) {
        console.error("GRID SYNC ERROR", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user.id, isAdmin]);

  const performanceData = useMemo(() => {
    if (isAdmin) {
      return allUsers.map(u => ({ name: u.username, balance: u.balance })).sort((a,b) => b.balance - a.balance).slice(0, 10);
    } else {
      let current = user.balance;
      return transactions.slice(0, 10).reverse().map(t => {
        const point = { time: new Date(t.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), balance: current };
        current -= t.amount;
        return point;
      });
    }
  }, [user.balance, transactions, isAdmin, allUsers]);

  const leaderBoard = useMemo(() => {
    return [...allUsers].sort((a, b) => b.balance - a.balance).slice(0, 5);
  }, [allUsers]);

  if (loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center space-y-4">
        <Loader2 className="text-brand-orange animate-spin" size={48} />
        <p className="font-gaming text-xs text-brand-orange animate-pulse uppercase tracking-widest">Scanning Grid Channels...</p>
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-20">
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div>
          <h2 className="text-5xl font-gaming font-black uppercase text-gray-900 dark:text-white tracking-tighter italic">Operational Hub</h2>
          <p className="text-[#ff4d00] text-[10px] font-black uppercase tracking-[0.6em] mt-3 opacity-60">Strategic Overview & Combat Stats</p>
        </div>
        {(isAdmin || user.canCreateMatch) && (
          <Link 
            to="/team-builder" 
            className="bg-[#ff4d00] hover:bg-[#e64600] text-white px-10 py-5 rounded-2xl font-gaming font-black text-[10px] uppercase shadow-xl flex items-center gap-3 transition-all active:scale-95"
          >
            <Swords size={18} /> {t('squad_builder')}
          </Link>
        )}
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard index={0} icon={<Shield size={24} />} label="ENGAGEMENTS" value={matches.length} color="#ff4d00" />
        <StatCard index={1} icon={<Activity size={24} />} label="ACTIVE SIGNAL" value={matches.filter(m => m.status === 'UNDECIDED').length} color="#00f2ea" />
        <StatCard index={2} icon={<Users size={24} />} label="OPERATIVE COUNT" value={allUsers.length} color="#ffea00" />
        <StatCard index={3} icon={<Wallet size={24} />} label="WALLET STATUS" value={`₹${user.balance.toFixed(0)}`} color="#ef4444" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="xl:col-span-2 glass-panel p-10 rounded-[40px] relative overflow-hidden"
        >
          <div className="flex items-center gap-4 mb-10">
            <div className="w-10 h-10 rounded-xl bg-[#00f2ea]/10 flex items-center justify-center text-[#00f2ea]"><BarChart3 size={20} /></div>
            <h3 className="font-gaming font-black text-gray-900 dark:text-white uppercase tracking-widest text-sm italic">Signal Flux Matrix</h3>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              {isAdmin ? (
                <BarChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#88888820" vertical={false} />
                  <XAxis dataKey="name" stroke="#888" fontSize={9} />
                  <Tooltip contentStyle={{ borderRadius: '15px', background: '#111', border: 'none' }} itemStyle={{ color: '#ff4d00' }} />
                  <Bar dataKey="balance" fill="#ff4d00" radius={[10, 10, 0, 0]} />
                </BarChart>
              ) : (
                <AreaChart data={performanceData}>
                  <defs>
                    <linearGradient id="fluxGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ff4d00" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#ff4d00" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#88888820" vertical={false} />
                  <XAxis dataKey="time" stroke="#888" fontSize={9} />
                  <Tooltip contentStyle={{ borderRadius: '15px', background: '#111', border: 'none' }} />
                  <Area type="monotone" dataKey="balance" stroke="#ff4d00" fill="url(#fluxGrad)" strokeWidth={3} />
                </AreaChart>
              )}
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}
          className="glass-panel p-10 rounded-[40px]"
        >
          <div className="flex items-center gap-4 mb-10">
            <div className="w-10 h-10 rounded-xl bg-[#ffea00]/10 flex items-center justify-center text-[#ffea00]"><Trophy size={20} /></div>
            <h3 className="font-gaming font-black text-gray-900 dark:text-white uppercase tracking-widest text-sm italic">Elite Ranking</h3>
          </div>
          <div className="space-y-4">
            {leaderBoard.map((u, i) => (
              <div key={u.id} className="flex items-center gap-4 p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-[10px] ${i === 0 ? 'bg-yellow-500 text-black shadow-lg' : 'bg-gray-100 dark:bg-white/10 text-gray-500'}`}>{i+1}</div>
                <p className="flex-1 text-xs font-bold text-gray-900 dark:text-white truncate uppercase">{u.username}</p>
                <p className="text-sm font-gaming font-black text-[#ff4d00]">₹{u.balance.toFixed(0)}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
