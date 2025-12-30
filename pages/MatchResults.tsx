
import React, { useState, useMemo, useEffect } from 'react';
import { stateService } from '../services/stateService';
import { Match, User, UserRole } from '../types';
import { Trophy, ChevronDown, ChevronUp, CheckCircle2, DollarSign, Clock, Target, AlertTriangle, Zap, User as UserIcon, Activity, Flame, Swords, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MatchResults: React.FC<{ user: User }> = ({ user }) => {
  const [allMatches, setAllMatches] = useState<Match[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<string | null>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const [filter, setFilter] = useState<'ALL' | 'UNDECIDED' | 'PENDING'>('ALL');
  
  // Fixed: fetch matches asynchronously
  const fetchMatches = async () => {
    const matches = await stateService.getMatches();
    setAllMatches(matches);
  };

  useEffect(() => {
    fetchMatches();
  }, []);
  
  const filteredMatches = useMemo(() => {
    switch (filter) {
      case 'UNDECIDED': return allMatches.filter(m => m.status === 'UNDECIDED');
      case 'PENDING': return allMatches.filter(m => {
          if (m.status === 'UNDECIDED') return false;
          const losers = m.winningTeam === 'A' ? m.teamB : m.teamA;
          return losers.some(p => !p.paid);
      });
      default: return allMatches;
    }
  }, [allMatches, filter]);

  const handleSettle = async (matchId: string, winner: 'A' | 'B') => {
    if (!confirm(`CONFIRM SQUAD ${winner} VICTORY? This protocol will automatically adjust credit flows across all active signals.`)) return;
    setLoading(matchId);
    try {
      await stateService.settleMatch(matchId, winner);
      await fetchMatches();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(null);
    }
  };

  const handleMarkPaid = async (matchId: string, userId: string) => {
    await stateService.markLoserAsPaid(matchId, userId);
    await fetchMatches();
    // Refresh selected match display
    const current = selectedMatch;
    setSelectedMatch(null); 
    setTimeout(() => setSelectedMatch(current), 50);
  };

  const renderMatchCard = (m: Match, idx: number) => {
    const isSettled = m.status === 'SETTLED';
    const isExpanded = selectedMatch === m.id;
    const losers = isSettled ? (m.winningTeam === 'A' ? m.teamB : m.teamA) : [];
    const hasUnpaid = losers.some(p => !p.paid);
    const totalStake = [...m.teamA, ...m.teamB].reduce((acc, p) => acc + p.betAmount, 0);

    return (
      <motion.div 
        key={m.id} 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: idx * 0.05 }}
        className={`glass-panel rounded-[40px] border transition-all ${isExpanded ? 'border-brand-cyan/30 ring-1 ring-brand-cyan/10' : 'border-black/5 dark:border-white/5 hover:border-black/10 dark:hover:border-white/20'}`}
      >
        <div 
          className="p-8 flex flex-col md:flex-row md:items-center justify-between gap-8 cursor-pointer group" 
          onClick={() => setSelectedMatch(isExpanded ? null : m.id)}
        >
          <div className="flex items-center gap-8">
            <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center transition-all ${isSettled ? 'bg-brand-cyan/10 text-brand-cyan shadow-[0_0_40px_rgba(0,242,234,0.1)]' : 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'}`}>
              {isSettled ? <Trophy size={40} className="group-hover:scale-110 transition-transform" /> : <Clock size={40} className="animate-spin-slow" />}
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h4 className="font-gaming font-black text-gray-900 dark:text-white uppercase text-xl tracking-tighter italic">{m.name}</h4>
                {hasUnpaid && <span className="text-[8px] bg-red-500 text-white px-2 py-0.5 rounded font-black animate-pulse">DEBT PENDING</span>}
              </div>
              <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.3em]">{new Date(m.createdAt).toLocaleString()}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-8">
            <div className="text-right">
              <p className="text-[9px] text-gray-400 dark:text-gray-600 font-black uppercase tracking-widest mb-1">Combat Volume</p>
              <p className="text-2xl font-gaming font-black text-gray-900 dark:text-white">₹{totalStake.toLocaleString()}</p>
            </div>
            <div className="w-px h-10 bg-black/5 dark:bg-white/10 hidden md:block"></div>
            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="text-[9px] text-gray-400 dark:text-gray-600 font-black uppercase tracking-widest mb-1">Status</p>
                <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${isSettled ? 'bg-brand-cyan/10 text-brand-cyan' : 'bg-yellow-500/10 text-yellow-500'}`}>
                  {isSettled ? 'ARCHIVED' : 'LIVE GRID'}
                </div>
              </div>
              {isExpanded ? <ChevronUp size={24} className="text-gray-500" /> : <ChevronDown size={24} className="text-gray-500" />}
            </div>
          </div>
        </div>

        <AnimatePresence>
          {isExpanded && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }} 
              animate={{ height: 'auto', opacity: 1 }} 
              exit={{ height: 0, opacity: 0 }} 
              className="overflow-hidden border-t border-black/5 dark:border-white/5"
            >
              <div className="p-10 space-y-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                   <div className="bg-black/5 dark:bg-white/5 p-6 rounded-3xl border border-black/5 dark:border-white/5 flex items-center gap-5">
                      <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center text-yellow-500">
                         <Activity size={20} />
                      </div>
                      <div>
                         <p className="text-[8px] text-gray-500 font-black uppercase tracking-widest">Operative Count</p>
                         <p className="text-lg font-gaming font-black text-gray-900 dark:text-white">{m.teamA.length + m.teamB.length} UNITS</p>
                      </div>
                   </div>
                   <div className="bg-black/5 dark:bg-white/5 p-6 rounded-3xl border border-black/5 dark:border-white/5 flex items-center gap-5">
                      <div className="w-10 h-10 rounded-xl bg-brand-cyan/10 flex items-center justify-center text-brand-cyan">
                         <DollarSign size={20} />
                      </div>
                      <div>
                         <p className="text-[8px] text-gray-500 font-black uppercase tracking-widest">Avg Stake/Unit</p>
                         <p className="text-lg font-gaming font-black text-gray-900 dark:text-white">₹{(totalStake / (m.teamA.length + m.teamB.length)).toFixed(0)}</p>
                      </div>
                   </div>
                   <div className="bg-black/5 dark:bg-white/5 p-6 rounded-3xl border border-black/5 dark:border-white/5 flex items-center gap-5">
                      <div className="w-10 h-10 rounded-xl bg-brand-orange/10 flex items-center justify-center text-brand-orange">
                         <Flame size={20} />
                      </div>
                      <div>
                         <p className="text-[8px] text-gray-500 font-black uppercase tracking-widest">Victory Pool</p>
                         <p className="text-lg font-gaming font-black text-gray-900 dark:text-white">₹{totalStake}</p>
                      </div>
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  {/* Team A Display */}
                  <div className={`relative p-8 rounded-[40px] border-2 transition-all ${m.winningTeam === 'A' ? 'border-brand-cyan/40 bg-brand-cyan/5 shadow-inner' : 'border-black/5 dark:border-white/5 bg-black/5 dark:bg-white/5'}`}>
                    <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center gap-4">
                        <Swords size={24} className={m.winningTeam === 'A' ? 'text-brand-cyan' : 'text-gray-400'} />
                        <h5 className="font-gaming text-sm font-black text-gray-900 dark:text-white uppercase tracking-[0.2em]">Squad Alpha</h5>
                      </div>
                      {m.winningTeam === 'A' && <span className="bg-brand-cyan text-black text-[9px] font-black px-3 py-1 rounded-full uppercase italic">VICTORS</span>}
                    </div>
                    <div className="space-y-4">
                      {m.teamA.map(p => (
                        <div key={p.userId} className="flex items-center justify-between p-4 rounded-2xl bg-white/50 dark:bg-black/40 border border-black/5 dark:border-white/5 group hover:border-brand-cyan/30 transition-all">
                          <div className="flex items-center gap-4">
                            <div className="w-8 h-8 rounded-lg bg-black/5 dark:bg-white/5 flex items-center justify-center text-xs font-black text-gray-500 group-hover:text-brand-cyan">{p.username[0]}</div>
                            <span className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-tight">{p.username}</span>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-[11px] font-gaming font-black text-gray-500 dark:text-gray-600 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">₹{p.betAmount}</span>
                            {isSettled && m.winningTeam === 'B' && (
                               p.paid ? <CheckCircle2 size={18} className="text-brand-cyan" /> : 
                               <div className="relative group/paid">
                                  <AlertTriangle size={18} className="text-red-500" />
                                  {user.role === UserRole.ADMIN && (
                                    <button onClick={(e) => { e.stopPropagation(); handleMarkPaid(m.id, p.userId); }} className="absolute right-0 top-1/2 -translate-y-1/2 opacity-0 group-hover/paid:opacity-100 bg-brand-cyan text-black text-[9px] font-black px-4 py-2 rounded-full whitespace-nowrap transition-all shadow-xl hover:scale-105 z-20">SETTLE DEBT</button>
                                  )}
                               </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    {!isSettled && user.role === UserRole.ADMIN && (
                      <button onClick={() => handleSettle(m.id, 'A')} disabled={!!loading} className="w-full mt-10 py-5 bg-brand-cyan text-black font-gaming font-black text-[11px] rounded-[24px] uppercase tracking-widest shadow-lg shadow-brand-cyan/20 transition-all hover:scale-[1.02] active:scale-95">
                        {loading === m.id ? 'SYNCHRONIZING...' : 'DECLARE SQUAD ALPHA VICTORS'}
                      </button>
                    )}
                  </div>

                  {/* Team B Display */}
                  <div className={`relative p-8 rounded-[40px] border-2 transition-all ${m.winningTeam === 'B' ? 'border-brand-cyan/40 bg-brand-cyan/5 shadow-inner' : 'border-black/5 dark:border-white/5 bg-black/5 dark:bg-white/5'}`}>
                    <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center gap-4">
                        <Swords size={24} className={m.winningTeam === 'B' ? 'text-brand-cyan' : 'text-gray-400'} />
                        <h5 className="font-gaming text-sm font-black text-gray-900 dark:text-white uppercase tracking-[0.2em]">Squad Bravo</h5>
                      </div>
                      {m.winningTeam === 'B' && <span className="bg-brand-cyan text-black text-[9px] font-black px-3 py-1 rounded-full uppercase italic">VICTORS</span>}
                    </div>
                    <div className="space-y-4">
                      {m.teamB.map(p => (
                        <div key={p.userId} className="flex items-center justify-between p-4 rounded-2xl bg-white/50 dark:bg-black/40 border border-black/5 dark:border-white/5 group hover:border-brand-cyan/30 transition-all">
                          <div className="flex items-center gap-4">
                            <div className="w-8 h-8 rounded-lg bg-black/5 dark:bg-white/5 flex items-center justify-center text-xs font-black text-gray-500 group-hover:text-brand-cyan">{p.username[0]}</div>
                            <span className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-tight">{p.username}</span>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-[11px] font-gaming font-black text-gray-500 dark:text-gray-600 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">₹{p.betAmount}</span>
                            {isSettled && m.winningTeam === 'A' && (
                               p.paid ? <CheckCircle2 size={18} className="text-brand-cyan" /> : 
                               <div className="relative group/paid">
                                  <AlertTriangle size={18} className="text-red-500" />
                                  {user.role === UserRole.ADMIN && (
                                    <button onClick={(e) => { e.stopPropagation(); handleMarkPaid(m.id, p.userId); }} className="absolute right-0 top-1/2 -translate-y-1/2 opacity-0 group-hover/paid:opacity-100 bg-brand-cyan text-black text-[9px] font-black px-4 py-2 rounded-full whitespace-nowrap transition-all shadow-xl hover:scale-105 z-20">SETTLE DEBT</button>
                                  )}
                               </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    {!isSettled && user.role === UserRole.ADMIN && (
                      <button onClick={() => handleSettle(m.id, 'B')} disabled={!!loading} className="w-full mt-10 py-5 bg-brand-cyan text-black font-gaming font-black text-[11px] rounded-[24px] uppercase tracking-widest shadow-lg shadow-brand-cyan/20 transition-all hover:scale-[1.02] active:scale-95">
                        {loading === m.id ? 'SYNCHRONIZING...' : 'DECLARE SQUAD BRAVO VICTORS'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto pb-24">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-10 mb-16">
        <div>
           <h1 className="text-5xl font-gaming font-black text-gray-900 dark:text-white uppercase tracking-tighter italic">Combat Archive</h1>
           <p className="text-brand-cyan text-[10px] font-black uppercase tracking-[0.5em] mt-3 opacity-60">Result Settlements & Credit Flow Logs</p>
        </div>
        
        <div className="flex bg-gray-100 dark:bg-[#0b0e14] p-2 rounded-[24px] border border-black/5 dark:border-white/10 self-start shadow-xl">
           <button onClick={() => setFilter('ALL')} className={`px-6 py-3 rounded-2xl text-[10px] font-black transition-all ${filter === 'ALL' ? 'bg-brand-cyan text-black shadow-lg shadow-brand-cyan/30' : 'text-gray-500 hover:text-brand-cyan'}`}>ALL LOGS</button>
           <button onClick={() => setFilter('UNDECIDED')} className={`px-6 py-3 rounded-2xl text-[10px] font-black transition-all ${filter === 'UNDECIDED' ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/30' : 'text-gray-500 hover:text-yellow-500'}`}>LIVE</button>
           <button onClick={() => setFilter('PENDING')} className={`px-6 py-3 rounded-2xl text-[10px] font-black transition-all ${filter === 'PENDING' ? 'bg-red-500 text-white shadow-lg shadow-red-500/30' : 'text-gray-500 hover:text-red-500'}`}>DEBTS</button>
        </div>
      </div>

      <div className="space-y-6">
        {filteredMatches.length > 0 ? filteredMatches.sort((a,b) => b.createdAt - a.createdAt).map(renderMatchCard) : (
          <div className="py-40 text-center flex flex-col items-center">
             <div className="w-24 h-24 bg-black/5 dark:bg-white/5 rounded-full flex items-center justify-center mb-10 opacity-10">
                <Target size={48} className="text-gray-900 dark:text-white" />
             </div>
             <p className="font-gaming uppercase text-xs tracking-[1em] text-gray-900 dark:text-white opacity-20 italic">No combat signals matched the current filter.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MatchResults;
