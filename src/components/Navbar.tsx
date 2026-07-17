import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Coins, Sparkles, LogOut, Menu, X, Swords, User, LayoutDashboard, HeartHandshake } from 'lucide-react';
import { UserProfile } from '../lib/mockFirebase';

interface NavbarProps {
  user: UserProfile | null;
  activePage: string;
  setActivePage: (page: string) => void;
  onLoginClick: () => void;
  onLogoutClick: () => void;
  isAdmin: boolean;
}

export default function Navbar({ 
  user, 
  activePage, 
  setActivePage, 
  onLoginClick, 
  onLogoutClick,
  isAdmin 
}: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 w-full bg-[#0a0e17]/90 backdrop-blur-lg border-b border-[#00ff87]/20 z-40 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <div 
            onClick={() => { setActivePage('home'); setIsOpen(false); }}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-[#00ff87] to-[#00d4ff] flex items-center justify-center font-black text-[#0a0e17] shadow-[0_0_15px_rgba(0,255,135,0.4)] transition-transform duration-300 group-hover:scale-105">
              <span className="font-display text-xl tracking-tighter">P</span>
            </div>
            <div>
              <span className="font-display font-black text-lg tracking-wider text-white group-hover:text-[#00ff87] transition-colors">
                PMSL
              </span>
              <span className="text-[9px] block text-[#a0b4c8] tracking-[0.2em] uppercase font-semibold">
                TOURNAMENTS
              </span>
            </div>
          </div>

          {/* Desktop Links and Actions */}
          <div className="hidden md:flex items-center gap-2 sm:gap-4">
            <button 
              onClick={() => setActivePage('home')}
              className={`text-xs uppercase tracking-wider font-semibold font-display px-2.5 py-1.5 rounded-md transition ${
                activePage === 'home' ? 'text-[#00ff87]' : 'text-[#a0b4c8] hover:text-white'
              }`}
            >
              Home
            </button>
            <button 
              onClick={() => setActivePage('tournaments')}
              className={`text-xs uppercase tracking-wider font-semibold font-display px-2.5 py-1.5 rounded-md transition ${
                activePage === 'tournaments' ? 'text-[#00ff87]' : 'text-[#a0b4c8] hover:text-white'
              }`}
            >
              Tournaments
            </button>
            <button 
              onClick={() => setActivePage('results')}
              className={`text-xs uppercase tracking-wider font-semibold font-display px-2.5 py-1.5 rounded-md transition ${
                activePage === 'results' ? 'text-[#00ff87]' : 'text-[#a0b4c8] hover:text-white'
              }`}
            >
              Results
            </button>
            <button 
              onClick={() => setActivePage('teams')}
              className={`text-xs uppercase tracking-wider font-semibold font-display px-2.5 py-1.5 rounded-md transition ${
                activePage === 'teams' ? 'text-[#00ff87]' : 'text-[#a0b4c8] hover:text-white'
              }`}
            >
              Teams
            </button>

            {user ? (
              <div className="flex items-center gap-2 sm:gap-4 pl-2 sm:pl-4 border-l border-white/10">
                {/* Coins Indicator */}
                <div 
                  onClick={() => setActivePage('earn-coins')}
                  className="flex items-center gap-1.5 bg-black/40 border border-[#00ff87]/30 hover:border-[#00ff87] px-2.5 py-1.5 rounded-full cursor-pointer transition shadow-[0_0_10px_rgba(0,255,135,0.05)]"
                >
                  <Coins className="w-4 h-4 text-[#00ff87] animate-pulse" />
                  <span className="text-xs font-mono font-bold text-white tracking-wide">
                    {user.coins} <span className="hidden sm:inline text-[10px] text-[#a0b4c8]">Coins</span>
                  </span>
                </div>

                {/* Dashboard Button */}
                <button
                  onClick={() => setActivePage('dashboard')}
                  className={`text-xs uppercase tracking-wider font-semibold font-display px-2.5 py-1.5 rounded-md transition ${
                    activePage === 'dashboard' ? 'text-[#00ff87]' : 'text-[#a0b4c8] hover:text-white'
                  }`}
                >
                  Dashboard
                </button>

                {/* Earn Coins button */}
                <button
                  onClick={() => setActivePage('earn-coins')}
                  className={`btn-neon-green py-1.5 px-3 text-[10px] sm:text-xs tracking-wider font-bold uppercase transition shadow-md ${
                    activePage === 'earn-coins' ? 'bg-[#00ff87] text-black' : ''
                  }`}
                >
                  Earn Coins
                </button>

                {/* Admin Page Link if admin */}
                {isAdmin && (
                  <button
                    onClick={() => setActivePage('admin')}
                    className={`text-xs uppercase tracking-wider font-semibold font-display flex items-center gap-1 border border-rose-500/30 px-2 py-1 rounded text-rose-400 hover:bg-rose-500/10 transition ${
                      activePage === 'admin' ? 'bg-rose-500/20 text-white' : ''
                    }`}
                    title="Admin Panel"
                  >
                    <Shield className="w-3.5 h-3.5 text-rose-400" />
                    <span className="hidden lg:inline">Admin</span>
                  </button>
                )}

                {/* Profile Link */}
                <div 
                  onClick={() => setActivePage('profile')}
                  className="relative w-9 h-9 rounded-full overflow-hidden border-2 border-[#00d4ff] hover:border-[#00ff87] transition cursor-pointer"
                >
                  {user.photoURL ? (
                    <img src={user.photoURL} alt={user.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="w-full h-full bg-slate-800 flex items-center justify-center text-white font-bold">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <button
                onClick={onLoginClick}
                className="btn-neon-green flex items-center gap-2 py-1.5 px-3.5 rounded text-xs tracking-wider"
              >
                <Swords className="w-3.5 h-3.5" />
                <span>Google Login</span>
              </button>
            )}
          </div>

          {/* Mobile Right Container (Coins, Profile & Hamburger menu trigger) */}
          <div className="flex md:hidden items-center gap-2.5">
            {user && (
              <>
                {/* Mobile Coins Indicator */}
                <div 
                  onClick={() => { setActivePage('earn-coins'); setIsOpen(false); }}
                  className="flex items-center gap-1 bg-black/40 border border-[#00ff87]/30 px-2.5 py-1 rounded-full cursor-pointer transition"
                >
                  <Coins className="w-3.5 h-3.5 text-[#00ff87] animate-pulse" />
                  <span className="text-xs font-mono font-bold text-[#00ff87]">{user.coins}</span>
                </div>

                {/* Mobile Profile Link */}
                <div 
                  onClick={() => { setActivePage('profile'); setIsOpen(false); }}
                  className="relative w-8 h-8 rounded-full overflow-hidden border border-[#00d4ff]"
                >
                  {user.photoURL ? (
                    <img src={user.photoURL} alt={user.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="w-full h-full bg-slate-800 flex items-center justify-center text-white text-xs font-bold">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
              </>
            )}

            {!user && (
              <button
                onClick={() => { onLoginClick(); setIsOpen(false); }}
                className="btn-neon-green flex items-center gap-1.5 py-1 px-2.5 rounded text-[10px] uppercase font-bold tracking-wider"
              >
                <Swords className="w-3 h-3" />
                <span>Login</span>
              </button>
            )}

            {/* Hamburger button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-1.5 rounded-lg border border-white/10 hover:border-[#00ff87] text-slate-300 hover:text-white transition"
              aria-label="Toggle Menu"
            >
              {isOpen ? <X className="w-5 h-5 text-[#00ff87]" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Animated Dropdown Menu for Mobile */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="md:hidden border-t border-[#00ff87]/15 bg-[#0a0e17]/95 backdrop-blur-xl overflow-hidden"
          >
            <div className="px-4 py-4 space-y-1 flex flex-col">
              <button
                onClick={() => { setActivePage('home'); setIsOpen(false); }}
                className={`text-left text-xs uppercase tracking-wider font-semibold font-display py-3 px-2 rounded-lg transition ${
                  activePage === 'home' ? 'bg-[#00ff87]/10 text-[#00ff87]' : 'text-[#a0b4c8] hover:bg-white/5 hover:text-white'
                }`}
              >
                Home Arena
              </button>
              <button
                onClick={() => { setActivePage('tournaments'); setIsOpen(false); }}
                className={`text-left text-xs uppercase tracking-wider font-semibold font-display py-3 px-2 rounded-lg transition ${
                  activePage === 'tournaments' ? 'bg-[#00ff87]/10 text-[#00ff87]' : 'text-[#a0b4c8] hover:bg-white/5 hover:text-white'
                }`}
              >
                Tournaments
              </button>
              <button
                onClick={() => { setActivePage('results'); setIsOpen(false); }}
                className={`text-left text-xs uppercase tracking-wider font-semibold font-display py-3 px-2 rounded-lg transition ${
                  activePage === 'results' ? 'bg-[#00ff87]/10 text-[#00ff87]' : 'text-[#a0b4c8] hover:bg-white/5 hover:text-white'
                }`}
              >
                Championship Results
              </button>
              <button
                onClick={() => { setActivePage('teams'); setIsOpen(false); }}
                className={`text-left text-xs uppercase tracking-wider font-semibold font-display py-3 px-2 rounded-lg transition ${
                  activePage === 'teams' ? 'bg-[#00ff87]/10 text-[#00ff87]' : 'text-[#a0b4c8] hover:bg-white/5 hover:text-white'
                }`}
              >
                Elite Squads
              </button>

              {user && (
                <>
                  <div className="border-t border-white/5 my-2" />
                  <button
                    onClick={() => { setActivePage('dashboard'); setIsOpen(false); }}
                    className={`text-left text-xs uppercase tracking-wider font-semibold font-display py-3 px-2 rounded-lg flex items-center gap-2 transition ${
                      activePage === 'dashboard' ? 'bg-[#00ff87]/10 text-[#00ff87]' : 'text-[#a0b4c8] hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    <span>My Dashboard</span>
                  </button>
                  <button
                    onClick={() => { setActivePage('earn-coins'); setIsOpen(false); }}
                    className={`text-left text-xs uppercase tracking-wider font-semibold font-display py-3 px-2 rounded-lg flex items-center gap-2 transition ${
                      activePage === 'earn-coins' ? 'bg-[#00ff87]/10 text-[#00ff87]' : 'text-[#a0b4c8] hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <Coins className="w-4 h-4" />
                    <span>Coin Refinery</span>
                  </button>

                  {isAdmin && (
                    <button
                      onClick={() => { setActivePage('admin'); setIsOpen(false); }}
                      className={`text-left text-xs uppercase tracking-wider font-semibold font-display py-3 px-2 rounded-lg flex items-center gap-2 text-rose-400 hover:bg-rose-500/10 transition ${
                        activePage === 'admin' ? 'bg-rose-500/20 text-white' : ''
                      }`}
                    >
                      <Shield className="w-4 h-4 text-rose-400" />
                      <span>Admin Control Panel</span>
                    </button>
                  )}

                  <button
                    onClick={() => { onLogoutClick(); setIsOpen(false); }}
                    className="text-left text-xs uppercase tracking-wider font-semibold font-display py-3 px-2 rounded-lg flex items-center gap-2 text-rose-400 hover:bg-rose-500/10 transition mt-2"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout Session</span>
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
