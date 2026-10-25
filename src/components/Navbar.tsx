import React, { useState } from 'react';
import { ActivePage, StudentProfileData } from '../types';
import { AdminCredentials } from './AdminSecurityGate';
import { 
  Sparkles, 
  UserCheck, 
  Briefcase, 
  TrendingUp, 
  Layers, 
  Database, 
  Cpu, 
  Menu, 
  X,
  Building2,
  CheckCircle2,
  ArrowLeft,
  UserPlus,
  LogIn,
  LogOut,
  Camera,
  ChevronDown,
  Trophy,
  User,
  ShieldCheck,
  Lock,
  FileCheck2,
  MoreHorizontal
} from 'lucide-react';

interface NavbarProps {
  activePage: ActivePage;
  setActivePage: (page: ActivePage) => void;
  onOpenSchema: () => void;
  recommendationsCount: number;
  canGoBack?: boolean;
  onBack?: () => void;
  student?: StudentProfileData | null;
  adminSession?: AdminCredentials | null;
  onOpenAuthModal?: (role?: 'student' | 'admin', mode?: 'login' | 'register') => void;
  onOpenPhotoModal?: () => void;
  onLogout?: () => void;
  onAdminLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activePage,
  setActivePage,
  onOpenSchema,
  recommendationsCount,
  canGoBack,
  onBack,
  student,
  adminSession,
  onOpenAuthModal,
  onOpenPhotoModal,
  onLogout,
  onAdminLogout,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);

  const navItems: { id: ActivePage; label: string; icon: React.ReactNode; section: 'Student' | 'Admin'; badge?: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <TrendingUp className="w-4 h-4" />, section: 'Student' },
    { id: 'profile', label: 'Profile', icon: <UserCheck className="w-4 h-4" />, section: 'Student' },
    { id: 'pipeline', label: 'AI Match', icon: <Cpu className="w-4 h-4" />, section: 'Student' },
    { 
      id: 'recommendations', 
      label: 'Recommendations', 
      icon: <Briefcase className="w-4 h-4" />,
      section: 'Student',
      badge: recommendationsCount > 0 ? `${recommendationsCount}` : undefined 
    },
    { id: 'skill-gap', label: 'Skill Gap', icon: <Layers className="w-4 h-4" />, section: 'Student' },
    { id: 'jobs', label: 'Opportunities', icon: <Building2 className="w-4 h-4" />, section: 'Student' },
    { id: 'admin', label: 'Admin Overview', icon: <ShieldCheck className="w-4 h-4 text-emerald-400" />, section: 'Admin' },
  ];

  const visibleNavItems = student
    ? navItems.filter(item => item.section === 'Student')
    : adminSession
      ? navItems.filter(item => item.section === 'Admin')
      : [];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200">
      {/* Top Academic Banner */}
      <div className="bg-slate-900 text-slate-200 text-xs px-4 py-1.5 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="font-semibold text-white">B.Tech CSE Artificial Intelligence PBL Project</span>
          <span className="hidden sm:inline text-slate-400">| PLACERA PLACEMENT ENGINE</span>
        </div>
        <div className="flex items-center gap-3">
          {adminSession ? (
            <div className="flex items-center gap-2 text-xs text-emerald-300 font-semibold bg-emerald-950/60 px-2.5 py-0.5 rounded-md border border-emerald-700/50">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Officer: {adminSession.name}</span>
              {onAdminLogout && (
                <button
                  onClick={onAdminLogout}
                  title="Lock & Exit Admin Portal"
                  className="ml-1 text-slate-400 hover:text-red-300 transition-colors cursor-pointer"
                >
                  <LogOut className="w-3 h-3" />
                </button>
              )}
            </div>
          ) : student ? (
            <div className="flex items-center gap-2 text-xs text-indigo-200 font-medium">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span className="text-slate-300">Signed In:</span>
              <strong className="text-white font-bold">{student.name}</strong>
              <span className="text-[11px] text-slate-400 hidden md:inline">({student.rollNumber || student.student_id})</span>
              {onLogout && (
                <button
                  onClick={onLogout}
                  className="ml-1.5 px-2 py-0.5 text-[10px] font-semibold text-slate-300 hover:text-red-300 bg-slate-800 hover:bg-slate-700 rounded transition-colors cursor-pointer"
                  title="Sign out of student account"
                >
                  Sign Out
                </button>
              )}
            </div>
          ) : (
            <button
              onClick={() => setActivePage('admin')}
              id="nav-admin-portal-top-btn"
              className="flex items-center gap-1.5 text-xs text-emerald-300 hover:text-white transition-colors cursor-pointer font-bold"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Admin / TPO Portal</span>
            </button>
          )}
          <button
            onClick={onOpenSchema}
            id="nav-schema-btn"
            className="flex items-center gap-1.5 text-xs text-indigo-300 hover:text-white transition-colors cursor-pointer"
          >
            <Database className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Database Schema</span>
          </button>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2 sm:gap-4">
          
          {/* Brand Logo & Back Button */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {canGoBack && onBack && (
              <button
                onClick={onBack}
                id="navbar-global-back-btn"
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 hover:text-indigo-700 border border-slate-200 rounded-xl transition-all cursor-pointer shadow-xs active:scale-95"
                title="Go back to previous screen"
              >
                <ArrowLeft className="w-4 h-4 text-indigo-600" />
                <span className="hidden sm:inline">Back</span>
              </button>
            )}

            <button 
              onClick={() => setActivePage('landing')}
              id="brand-logo-btn"
              className="flex items-center gap-2 text-left cursor-pointer group"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-600 flex items-center justify-center text-white shadow-sm shadow-indigo-200 group-hover:scale-105 transition-transform font-black text-lg">
                P
              </div>
              <div>
                <span className="text-base sm:text-lg font-black tracking-tight text-slate-900 leading-none block">
                  PLACERA
                </span>
                <span className="text-[10px] font-semibold text-indigo-600 tracking-wider uppercase block">
                  AI Placement Portal
                </span>
              </div>
            </button>
          </div>

          {/* User Auth, Profile & Dual Portals */}
          <div className="hidden sm:flex items-center gap-2.5">
            {student ? (
              /* Profile Bar shown ONLY when student is actively logged in / registered */
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  id="navbar-user-chip-btn"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-indigo-200 bg-indigo-50/50 hover:bg-indigo-50 transition-all cursor-pointer shadow-xs group"
                >
                  {/* Avatar thumbnail */}
                  <div className="relative w-8 h-8 rounded-full overflow-hidden border border-indigo-300 bg-white shrink-0">
                    {student.avatarUrl ? (
                      <img src={student.avatarUrl} alt={student.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                        {student.name.charAt(0)}
                      </div>
                    )}
                  </div>

                  {/* Name & Branch info */}
                  <div className="text-left hidden lg:block max-w-[130px]">
                    <span className="text-xs font-bold text-slate-800 block truncate group-hover:text-indigo-600">
                      {student.name}
                    </span>
                    <span className="text-[10px] text-slate-500 block truncate">
                      {student.branch} • {student.GPA} CGPA
                    </span>
                  </div>

                  <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${userDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl border border-slate-200 shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-900">{student.name}</p>
                      <p className="text-[11px] text-slate-500 font-mono truncate">{student.rollNumber || student.email || 'Registered Candidate'}</p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
                          {student.branch} • {student.GPA} CGPA
                        </span>
                        {student.studentProof && (
                          <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                            <FileCheck2 className="w-2.5 h-2.5" />
                            <span>Verified</span>
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="py-1 text-xs">
                      <button
                        onClick={() => {
                          setActivePage('profile');
                          setUserDropdownOpen(false);
                        }}
                        className="w-full px-4 py-2 text-left text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer font-medium"
                      >
                        <User className="w-4 h-4 text-indigo-600" />
                        <span>My Academic Profile</span>
                      </button>

                      {onOpenPhotoModal && (
                        <button
                          onClick={() => {
                            onOpenPhotoModal();
                            setUserDropdownOpen(false);
                          }}
                          className="w-full px-4 py-2 text-left text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer font-medium"
                        >
                          <Camera className="w-4 h-4 text-indigo-600" />
                          <span>Change Photo (Camera / Upload)</span>
                        </button>
                      )}

                      <button
                        onClick={() => {
                          setActivePage('profile');
                          setUserDropdownOpen(false);
                        }}
                        className="w-full px-4 py-2 text-left text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer font-medium"
                      >
                        <Trophy className="w-4 h-4 text-amber-500" />
                        <span>My Achievements ({student.achievements?.length || 0})</span>
                      </button>
                    </div>

                    <div className="border-t border-slate-100 pt-1">
                      {onLogout && (
                        <button
                          onClick={() => {
                            onLogout();
                            setUserDropdownOpen(false);
                          }}
                          className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 flex items-center gap-2 cursor-pointer text-xs font-semibold"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Sign Out</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : adminSession ? (
              /* Admin Officer badge when admin logged in and no student */
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-emerald-300 bg-emerald-50 text-emerald-900 text-xs font-semibold shadow-xs">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <div className="text-left">
                  <span className="block font-bold text-slate-900 leading-tight">{adminSession.name}</span>
                  <span className="text-[10px] text-emerald-700 block leading-tight">{adminSession.role.split('/')[0]}</span>
                </div>
                {onAdminLogout && (
                  <button
                    onClick={onAdminLogout}
                    className="ml-1 p-1 hover:bg-emerald-100 rounded text-slate-500 hover:text-red-600 transition-colors cursor-pointer"
                    title="Sign Out from Placement Officer Portal"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ) : (
              /* When not logged in: Clean dual portal buttons (Student & Admin) */
              <div className="flex items-center gap-2">
                {onOpenAuthModal && (
                  <>
                    <button
                      onClick={() => onOpenAuthModal('student', 'login')}
                      id="navbar-student-login-btn"
                      className="px-3 py-2 text-xs font-semibold text-slate-700 hover:text-indigo-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <LogIn className="w-3.5 h-3.5 text-slate-500" />
                      <span>Student Sign In</span>
                    </button>

                    <button
                      onClick={() => onOpenAuthModal('student', 'register')}
                      id="navbar-student-register-btn"
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-all cursor-pointer active:scale-95"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Student Register</span>
                    </button>

                    <button
                      onClick={() => setActivePage('admin')}
                      id="navbar-admin-entry-btn"
                      className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-all cursor-pointer active:scale-95"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Admin Portal</span>
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Simple navigation menu: Home and About */}
          <div className="relative">
            <button onClick={() => setMoreMenuOpen(!moreMenuOpen)} aria-label="More navigation options" aria-expanded={moreMenuOpen} className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-indigo-600 transition-colors"><MoreHorizontal className="w-5 h-5" /></button>
            {moreMenuOpen && <div className="absolute right-0 top-full mt-2 w-48 rounded-xl border border-slate-200 bg-white py-1 shadow-xl z-50">
              <button onClick={() => { setActivePage('landing'); setMoreMenuOpen(false); }} className="w-full px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50">Home</button>
              <button onClick={() => { setActivePage('about'); setMoreMenuOpen(false); }} className="w-full px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50">About PLACERA</button>
            </div>}
          </div>

          {/* Mobile menu button & quick profile indicator */}
          <div className="flex items-center gap-2">
            {student ? (
              <button
                onClick={() => setActivePage('profile')}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-900 text-xs font-bold cursor-pointer"
                title="View My Profile"
              >
                <div className="w-5 h-5 rounded-full overflow-hidden bg-indigo-600 text-white flex items-center justify-center text-[10px]">
                  {student.avatarUrl ? (
                    <img src={student.avatarUrl} alt={student.name} className="w-full h-full object-cover" />
                  ) : (
                    student.name.charAt(0)
                  )}
                </div>
                <span className="max-w-[80px] truncate">{student.name.split(' ')[0]}</span>
              </button>
            ) : adminSession ? (
              <button
                onClick={() => setActivePage('admin')}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Admin</span>
              </button>
            ) : onOpenAuthModal ? (
              <button
                onClick={() => onOpenAuthModal('student', 'login')}
                className="px-2.5 py-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-xl"
              >
                Sign In / Register
              </button>
            ) : null}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              id="mobile-menu-toggle"
              className="p-2 text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="bg-white border-b border-slate-200 px-4 pt-2 pb-4 space-y-2 shadow-lg animate-in slide-in-from-top-2">
          {student && (
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full overflow-hidden border border-indigo-200 bg-white shrink-0">
                  {student.avatarUrl ? (
                    <img src={student.avatarUrl} alt={student.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                      {student.name.charAt(0)}
                    </div>
                  )}
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-900 block">{student.name}</span>
                  <span className="text-[10px] text-slate-500">{student.branch} • CGPA {student.GPA}</span>
                </div>
              </div>
              {onOpenPhotoModal && (
                <button
                  onClick={() => {
                    onOpenPhotoModal();
                    setMobileMenuOpen(false);
                  }}
                  className="px-2 py-1 text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-lg flex items-center gap-1 cursor-pointer"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Photo</span>
                </button>
              )}
            </div>
          )}

          {adminSession && !student && (
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <span className="font-bold text-emerald-950 block">{adminSession.name}</span>
                  <span className="text-[10px] text-emerald-700">{adminSession.role}</span>
                </div>
              </div>
            </div>
          )}

          {visibleNavItems.length > 0 && (
            <>
              <div className="px-3 pt-2 text-[10px] font-black uppercase tracking-wider text-slate-400">
                {student ? 'Student Portal' : 'Admin Portal'}
              </div>
              {visibleNavItems.map((item) => {
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActivePage(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium flex items-center justify-between ${
                  isActive ? 'bg-indigo-50 text-indigo-600 font-semibold' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  {item.icon}
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="bg-indigo-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
              </button>
            );
              })}
            </>
          )}

          <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
            {/* When already signed in as student */}
            {student ? (
              <div className="space-y-2">
                <button
                  onClick={() => {
                    setActivePage('profile');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2 px-3 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-xl border border-indigo-200 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>My Placement Dossier & Profile</span>
                </button>
                {onLogout && (
                  <button
                    onClick={() => {
                      onLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full py-2 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl border border-red-200 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                )}
              </div>
            ) : adminSession ? (
              /* When signed in as Admin */
              <div className="space-y-2">
                <button
                  onClick={() => {
                    setActivePage('admin');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2 px-3 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-xl border border-emerald-200 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Placement Officer Portal</span>
                </button>
                {onAdminLogout && (
                  <button
                    onClick={() => {
                      onAdminLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full py-2 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl border border-red-200 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out from Admin</span>
                  </button>
                )}
              </div>
            ) : (
              /* When NOT signed in: Show Register & Sign In options */
              onOpenAuthModal && (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      onOpenAuthModal('student', 'register');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-center py-2 text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-xl cursor-pointer"
                  >
                    🎓 Student Register
                  </button>
                  <button
                    onClick={() => {
                      onOpenAuthModal('student', 'login');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-center py-2 text-xs font-semibold bg-slate-100 text-slate-800 rounded-xl cursor-pointer"
                  >
                    🎓 Student Sign In
                  </button>
                  <button
                    onClick={() => {
                      setActivePage('admin');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full col-span-2 text-center py-2 text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl cursor-pointer"
                  >
                    🏛️ Placement Officer / Admin Portal
                  </button>
                </div>
              )
            )}
          </div>
        </div>
      )}
    </header>
  );
};
