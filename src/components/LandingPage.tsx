import React from 'react';
import { ActivePage, StudentProfileData, RecommendationResult } from '../types';
import { 
  Sparkles, 
  ArrowRight, 
  Cpu, 
  BarChart3, 
  CheckCircle2, 
  Layers, 
  Target, 
  BookOpen, 
  UserCheck, 
  Building2, 
  ArrowUpRight,
  ShieldCheck,
  Zap,
  GraduationCap,
  UserPlus,
  LogIn,
  Binary,
  FileCheck,
  Compass,
  Award,
  ChevronRight
} from 'lucide-react';

interface LandingPageProps {
  setActivePage: (page: ActivePage) => void;
  onLoadDemoAndRun?: () => void;
  student: StudentProfileData | null;
  topRecommendation?: RecommendationResult;
  onGetStarted?: () => void;
  onOpenAuthModal?: (mode?: 'login' | 'register') => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  setActivePage,
  onLoadDemoAndRun,
  student,
  topRecommendation,
  onGetStarted,
  onOpenAuthModal,
}) => {
  const handleGetStarted = () => {
    if (onGetStarted) {
      onGetStarted();
    } else if (onOpenAuthModal) {
      onOpenAuthModal('register');
    } else {
      setActivePage('profile');
    }
  };

  const handleLogin = () => {
    if (onOpenAuthModal) {
      onOpenAuthModal('login');
    } else if (onGetStarted) {
      onGetStarted();
    } else {
      setActivePage('profile');
    }
  };



  return (
    <div className="space-y-16 pb-20">
      
      {/* HERO SECTION: PLATFORM INTRODUCTION & GET STARTED */}
      <section className="relative overflow-hidden pt-8 pb-16 lg:pt-12 lg:pb-20 border-b border-slate-200 bg-white rounded-3xl shadow-xs">
        {/* Decorative Grid Background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-70 pointer-events-none" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            
            {/* Top Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200/80 text-indigo-700 text-xs font-semibold shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600 animate-pulse" />
              <span>AI-Powered Campus Placement & Career Recommendation System</span>
            </div>

            {/* Platform Title & Slogan */}
            <div className="space-y-2">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight">
                PLACERA
              </h1>
              <p className="text-2xl sm:text-3xl font-extrabold text-indigo-600 tracking-tight">
                Find Where You Fit.
              </p>
            </div>

            {/* About the Platform Description (Is platform ke baare me) */}
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal max-w-2xl mx-auto">
              <strong>PLACERA</strong> is an intelligent placement matching engine that evaluates engineering students 
              beyond basic CGPA cutoffs. By analyzing verified programming competencies, academic metrics, 
              and achievements against <strong>synthetic campus opportunity profiles</strong>, PLACERA estimates your top-fit job roles
              and generates personalized interview roadmaps.
            </p>

            {/* Main Action Buttons with Prominent GET STARTED */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
              {/* PRIMARY GET STARTED BUTTON */}
              <button
                onClick={handleGetStarted}
                id="hero-get-started-btn"
                className="w-full sm:w-auto px-7 py-3.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2.5 cursor-pointer active:scale-95 group"
              >
                {student ? (
                  <>
                    <UserCheck className="w-4 h-4 text-indigo-200 group-hover:text-white transition-colors" />
                    <span>Go to My Dashboard ({student.name.split(' ')[0]})</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 text-indigo-200 group-hover:text-white transition-colors" />
                    <span>Get Started (Register / Sign In)</span>
                  </>
                )}
                <ArrowRight className="w-4 h-4 text-indigo-200 group-hover:translate-x-0.5 transition-transform" />
              </button>

            </div>

            {/* Trust Indicators */}
            <div className="pt-6 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-slate-500 text-xs font-medium border-t border-slate-100 max-w-xl mx-auto">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Local profile benchmark</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>25+ synthetic roles</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Transparent AI Match Scores</span>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};
