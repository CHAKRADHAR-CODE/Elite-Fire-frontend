
import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { stateService } from '../services/stateService';
import { useTranslation } from '../App';
import { Mail, Lock, User as UserIcon, ShieldAlert, Zap, Swords, Target, Eye, EyeOff, ShieldCheck, Flame } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface LoginPageProps {
  onLogin: (user: User) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const { t } = useTranslation();
  const [isLogin, setIsLogin] = useState(true);
  const [showPin, setShowPin] = useState(false);
  const [formData, setFormData] = useState({ username: '', email: '', pin: '', confirmPin: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const validateEmail = (email: string) => /^[a-z0-9._%+-]+@gmail\.(com|in)$/.test(email);
  const validateUsername = (username: string) => /^[A-Z_]+$/.test(username);
  const validatePin = (pin: string) => /^\d{6}$/.test(pin);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsProcessing(true);

    const email = formData.email.toLowerCase().trim();
    const pin = formData.pin;

    await new Promise(resolve => setTimeout(resolve, 800));

    try {
      if (isLogin) {
        // Fixed: await the promise from getUsers
        const users = await stateService.getUsers(true);
        const user = users.find(u => u.email === email && u.pin === pin);
        if (user) {
          if (user.isDeleted) throw new Error('Account purged from battlefield.');
          if (user.isBlocked) throw new Error('Operative blocked by High Command.');
          setSuccess('AUTHENTICATION SUCCESSFUL: ACCESS GRANTED');
          setTimeout(() => {
            localStorage.setItem('efb_current_user', JSON.stringify(user));
            onLogin(user);
          }, 800);
        } else {
          throw new Error('Signal Mismatch: Invalid Credentials Checkpoint.');
        }
      } else {
        if (!validateUsername(formData.username)) throw new Error('Codename must be UPPERCASE & UNDERSCORE only.');
        if (!validateEmail(email)) throw new Error('Invalid Identity: Use @gmail.com or .in');
        if (!validatePin(pin)) throw new Error('Security Breach: PIN must be 6 digits.');
        if (pin !== formData.confirmPin) throw new Error('Signal Conflict: PINs do not match.');

        const newUser = await stateService.addUser({
          username: formData.username,
          email: email,
          pin: pin,
          role: UserRole.PLAYER,
          balance: 0
        });
        setSuccess('UNIT DEPLOYED SUCCESSFULLY: IDENTITY SYNCHED');
        setTimeout(() => {
          localStorage.setItem('efb_current_user', JSON.stringify(newUser));
          onLogin(newUser);
        }, 1000);
      }
    } catch (err: any) {
      setError(err.message || 'Fatal System Error.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden transition-colors duration-500">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-[#ff4d00]/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-[#00f2ea]/10 rounded-full blur-[120px]"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-5xl flex flex-col lg:flex-row items-stretch gap-0 rounded-[40px] overflow-hidden glass-panel relative z-10"
      >
        <div className="hidden lg:flex flex-1 flex-col justify-between p-16 bg-gradient-to-br from-gray-100/50 dark:from-black/80 dark:to-[#ff4d00]/10 border-r border-black/5 dark:border-white/5">
          <div>
            <div className="flex items-center gap-3 mb-12">
              <div className="w-16 h-16 bg-[#ff4d00] rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(255,77,0,0.5)]">
                <Flame className="text-white" size={32} />
              </div>
              <div>
                <h1 className="font-gaming text-3xl font-black fire-text italic uppercase">ELITE FIRE</h1>
                <p className="text-[#ff4d00] text-[9px] font-black tracking-[0.5em] uppercase">Tactical Grid v5.1</p>
              </div>
            </div>
            
            <h2 className="text-5xl font-gaming font-black text-gray-900 dark:text-white leading-[1.1] mb-6 uppercase">
              SECURE <br /> THE <span className="text-[#ff4d00]">VICTORY.</span>
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm max-w-sm leading-relaxed mb-12">
              Enter the grid. Manage your squad, track combat results, and dominate the elite battlefield.
            </p>
          </div>

          <div className="space-y-4">
             <div className="flex items-center gap-4 p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5">
               <ShieldCheck className="text-[#ff4d00]" size={20} />
               <p className="text-[10px] font-bold text-gray-600 dark:text-gray-300 uppercase tracking-widest">Signal Encryption Protocol Active</p>
             </div>
          </div>
        </div>

        <div className="flex-1 p-12 lg:p-20 bg-white/20 dark:bg-black/40">
          <div className="max-w-md mx-auto h-full flex flex-col justify-center">
            <div className="mb-10 text-center lg:text-left">
              <h3 className="text-2xl font-gaming font-black text-gray-900 dark:text-white uppercase tracking-tighter mb-2 italic">
                {isLogin ? t('login_title') : t('register_title')}
              </h3>
              <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">
                {isLogin ? 'AUTHENTICATING SIGNAL...' : 'REGISTERING NEW SOLDIER...'}
              </p>
            </div>

            <div className="flex p-1.5 bg-black/5 dark:bg-white/5 rounded-2xl mb-8 border border-black/5 dark:border-white/10">
              <button 
                onClick={() => setIsLogin(true)}
                className={`flex-1 py-4 rounded-xl text-[10px] font-black tracking-widest transition-all ${isLogin ? 'bg-[#ff4d00] text-white shadow-lg shadow-[#ff4d00]/30' : 'text-gray-500 hover:text-[#ff4d00]'}`}
              >
                {t('sign_in')}
              </button>
              <button 
                onClick={() => setIsLogin(false)}
                className={`flex-1 py-4 rounded-xl text-[10px] font-black tracking-widest transition-all ${!isLogin ? 'bg-[#ff4d00] text-white shadow-lg shadow-[#ff4d00]/30' : 'text-gray-500 hover:text-[#ff4d00]'}`}
              >
                {t('join_grid')}
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <AnimatePresence mode="wait">
                <motion.div 
                  key={isLogin ? 'login' : 'register'}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="space-y-5"
                >
                  {!isLogin && (
                    <div className="relative">
                      <UserIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={18} aria-hidden="true" />
                      <input 
                        type="text" 
                        aria-label="Operative Name"
                        placeholder="OPERATIVE NAME"
                        className="w-full bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-2xl py-5 pl-14 pr-6 text-sm font-bold text-gray-900 dark:text-white focus:outline-none focus:border-[#ff4d00]/50 transition-all uppercase"
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value.toUpperCase().replace(/[^A-Z_]/g, '') })}
                        required={!isLogin}
                      />
                    </div>
                  )}

                  <div className="relative">
                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={18} aria-hidden="true" />
                    <input 
                      type="email" 
                      aria-label="Email Address"
                      placeholder="NETWORK ID (EMAIL)"
                      className="w-full bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-2xl py-5 pl-14 pr-6 text-sm font-bold text-gray-900 dark:text-white focus:outline-none focus:border-[#ff4d00]/50 transition-all lowercase"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value.toLowerCase() })}
                      required
                    />
                  </div>

                  <div className="relative">
                    <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={18} aria-hidden="true" />
                    <input 
                      type={showPin ? "text" : "password"} 
                      aria-label="Security PIN"
                      placeholder="SECURITY PIN"
                      maxLength={6}
                      className={`w-full bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-2xl py-5 pl-14 pr-14 text-sm font-gaming text-gray-900 dark:text-white focus:outline-none focus:border-[#ff4d00]/50 transition-all tracking-[0.6em] placeholder:tracking-normal ${!showPin ? 'pin-mask-dots' : ''}`}
                      value={formData.pin}
                      onChange={(e) => setFormData({ ...formData, pin: e.target.value.replace(/\D/g, '') })}
                      required
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowPin(!showPin)} 
                      aria-label={showPin ? "Hide PIN" : "Show PIN"}
                      className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#ff4d00]"
                    >
                      {showPin ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>

                  {!isLogin && (
                    <div className="relative">
                      <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={18} aria-hidden="true" />
                      <input 
                        type={showPin ? "text" : "password"} 
                        aria-label="Confirm Security PIN"
                        placeholder="CONFIRM PIN"
                        maxLength={6}
                        className={`w-full bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-2xl py-5 pl-14 pr-6 text-sm font-gaming text-gray-900 dark:text-white focus:outline-none focus:border-[#ff4d00]/50 transition-all tracking-[0.6em] placeholder:tracking-normal ${!showPin ? 'pin-mask-dots' : ''}`}
                        value={formData.confirmPin}
                        onChange={(e) => setFormData({ ...formData, confirmPin: e.target.value.replace(/\D/g, '') })}
                        required={!isLogin}
                      />
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>

              <AnimatePresence>
                {error && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="flex items-center gap-2 text-red-500 bg-red-500/10 p-4 rounded-2xl text-xs font-black uppercase tracking-tight overflow-hidden">
                    <ShieldAlert size={16} /> <span>{error}</span>
                  </motion.div>
                )}
                {success && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="flex items-center gap-2 text-[#00f2ea] bg-[#00f2ea]/10 p-4 rounded-2xl text-xs font-black uppercase tracking-tight overflow-hidden">
                    <Zap size={16} /> <span>{success}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={isProcessing}
                type="submit" 
                className="w-full bg-[#ff4d00] text-white py-6 rounded-2xl font-gaming font-black text-xs shadow-lg shadow-[#ff4d00]/30 transition-all flex items-center justify-center gap-3"
              >
                {isLogin ? <Target size={20} /> : <Swords size={20} />}
                {isLogin ? t('initialize_auth') : t('deploy_unit')}
              </motion.button>
            </form>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
