import React, { useState, useMemo } from 'react';
import { RecommendationResult, JobPosting, ActivePage } from '../types';
import { 
  Briefcase, 
  Search, 
  Filter, 
  MapPin, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  ChevronRight, 
  Sparkles, 
  Building2, 
  TrendingUp, 
  GraduationCap, 
  SlidersHorizontal, 
  ArrowUpDown, 
  Layers, 
  ArrowLeft,
  X,
  IndianRupee
} from 'lucide-react';

interface RecommendationDashboardProps {
  recommendations: RecommendationResult[];
  preferredLocation?: string;
  onSelectJob: (rec: RecommendationResult) => void;
  setActivePage: (page: ActivePage) => void;
  onBack?: () => void;
}

// Utility to parse LPA numbers from CTC string (e.g. "₹22 - 28 LPA" -> 28)
const parseSalaryLPA = (ctc: string | undefined): number => {
  if (!ctc) return 0;
  const matches = ctc.match(/\d+(\.\d+)?/g);
  if (!matches || matches.length === 0) return 0;
  return Math.max(...matches.map(Number));
};

const CITY_ALIASES: Record<string, string[]> = {
  bangalore: ['bengaluru', 'bangalore', 'blr'],
  bengaluru: ['bengaluru', 'bangalore', 'blr'],
  blr: ['bengaluru', 'bangalore', 'blr'],
  gurgaon: ['gurugram', 'gurgaon', 'delhi ncr', 'ncr'],
  gurugram: ['gurugram', 'gurgaon', 'delhi ncr', 'ncr'],
  delhi: ['delhi', 'new delhi', 'delhi ncr', 'ncr'],
  'new delhi': ['delhi', 'new delhi', 'delhi ncr', 'ncr'],
  'delhi ncr': ['delhi', 'new delhi', 'delhi ncr', 'ncr'],
  ncr: ['delhi', 'new delhi', 'delhi ncr', 'ncr'],
  noida: ['noida', 'delhi ncr', 'ncr'],
  mumbai: ['mumbai', 'bombay', 'navi mumbai', 'bom'],
  'navi mumbai': ['navi mumbai', 'mumbai', 'bombay'],
  bombay: ['mumbai', 'bombay', 'navi mumbai'],
  bom: ['mumbai', 'bombay', 'navi mumbai'],
  kolkata: ['kolkata', 'calcutta'],
  calcutta: ['kolkata', 'calcutta'],
  chennai: ['chennai', 'madras'],
  madras: ['chennai', 'madras'],
  chandigarh: ['chandigarh', 'mohali', 'chd'],
  mohali: ['chandigarh', 'mohali', 'chd'],
  chd: ['chandigarh', 'mohali', 'chd'],
  pune: ['pune', 'hinjawadi'],
  hinjawadi: ['pune', 'hinjawadi'],
  hyderabad: ['hyderabad', 'secunderabad', 'hyd'],
  secunderabad: ['hyderabad', 'secunderabad', 'hyd'],
  hyd: ['hyderabad', 'secunderabad', 'hyd'],
  jaipur: ['jaipur'],
  lucknow: ['lucknow', 'lko'],
  lko: ['lucknow', 'lko'],
  mysore: ['mysore', 'mysuru'],
  mysuru: ['mysore', 'mysuru'],
  coimbatore: ['coimbatore', 'cbe'],
  cbe: ['coimbatore', 'cbe'],
  remote: ['remote', 'wfh', 'work from home'],
  hybrid: ['hybrid'],
};

const normalizeCity = (value: string): string =>
  value
    .toLowerCase()
    .replace(/[()]/g, ' ')
    .replace(/[.&'-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const splitCities = (value: string): string[] =>
  value
    .split(/\s*[\/;,|]\s*|\s+or\s+/i)
    .map(normalizeCity)
    .filter(Boolean);

export const cityMatchesLocation = (queryCity: string, jobLocation: string): boolean => {
  if (!queryCity || !jobLocation) return false;
  const requestedCities = splitCities(queryCity);
  const availableCities = splitCities(jobLocation);
  if (requestedCities.length === 0 || availableCities.length === 0) return false;

  return requestedCities.some(requested => {
    const reqClean = normalizeCity(requested);
    if (!reqClean) return false;
    const reqAliases = CITY_ALIASES[reqClean] || [reqClean];

    return availableCities.some(available => {
      const availClean = normalizeCity(available);
      if (!availClean) return false;

      // 1. Direct equality or substring containment
      if (availClean === reqClean || availClean.includes(reqClean) || reqClean.includes(availClean)) {
        return true;
      }

      // 2. Alias matching
      const availAliases = CITY_ALIASES[availClean] || [availClean];
      const hasAliasMatch = reqAliases.some(rAlias =>
        availAliases.some(aAlias =>
          aAlias === rAlias || aAlias.includes(rAlias) || rAlias.includes(aAlias)
        )
      );
      if (hasAliasMatch) return true;

      // 3. Sub-word matching for multi-word queries (e.g. "delhi" matching "delhi ncr")
      const reqWords = reqClean.split(/\s+/).filter(w => w.length > 2);
      const availWords = availClean.split(/\s+/).filter(w => w.length > 2);
      return reqWords.some(rw => availWords.some(aw => aw === rw || aw.includes(rw) || rw.includes(aw)));
    });
  });
};

export const RecommendationDashboard: React.FC<RecommendationDashboardProps> = ({
  recommendations,
  preferredLocation,
  onSelectJob,
  setActivePage,
  onBack,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [manualCity, setManualCity] = useState('');
  const [selectedExp, setSelectedExp] = useState('all');
  const [minMatchThreshold, setMinMatchThreshold] = useState(0);
  const [onlyEligible, setOnlyEligible] = useState(false);
  const [sortBy, setSortBy] = useState<
    'match-desc' | 'match-asc' | 'salary-desc' | 'salary-asc' | 'gpa-asc' | 'gpa-desc' | 'company-asc'
  >('match-desc');

  // Compute summary stats
  const totalAnalyzed = 320; // Simulated campus jobs pool
  const topMatch = recommendations.length > 0 ? recommendations[0].final_match_score : 0;
  const avgMatch = recommendations.length > 0
    ? Math.round(recommendations.reduce((acc, r) => acc + r.final_match_score, 0) / recommendations.length)
    : 0;
  const totalMatchedSkills = useMemo(() => {
    const set = new Set<string>();
    recommendations.forEach(r => r.matching_skills.forEach(s => set.add(s)));
    return set.size;
  }, [recommendations]);

  // Canonical title casing helper for presets
  const formatCityDisplay = (city: string): string => {
    return city
      .split(' ')
      .map(w => {
        const lower = w.toLowerCase();
        if (lower === 'ncr') return 'NCR';
        if (lower === 'idc') return 'IDC';
        return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
      })
      .join(' ');
  };

  // Extract unique filter lists
  const uniqueLocations = useMemo(() => {
    const locs = new Map<string, string>();
    recommendations.forEach(r => {
      const parts = r.job.location.split(/\s*[\/;,|]\s*|\s+or\s+/i);
      parts.forEach(p => {
        const cleaned = p.replace(/\([^)]*\)/g, '').trim();
        if (cleaned && cleaned.toLowerCase() !== 'remote' && cleaned.toLowerCase() !== 'hybrid') {
          const key = cleaned.toLowerCase();
          if (!locs.has(key)) {
            locs.set(key, formatCityDisplay(cleaned));
          }
        }
      });
    });
    return Array.from(locs.values()).sort((a, b) => a.localeCompare(b));
  }, [recommendations]);

  // Filtered recommendations
  const filteredRecs = useMemo(() => {
    return recommendations.filter(rec => {
      // Search query filter
      const text = `${rec.job.company} ${rec.job.job_title} ${rec.job.location} ${rec.job.description}`.toLowerCase();
      if (searchQuery && !text.includes(searchQuery.toLowerCase())) return false;

      // City Search / Filter:
      // Manual city input takes precedence, then preset dropdown location
      if (manualCity.trim()) {
        if (!cityMatchesLocation(manualCity.trim(), rec.job.location)) {
          return false;
        }
      } else if (selectedLocation !== 'all') {
        if (!cityMatchesLocation(selectedLocation, rec.job.location)) {
          return false;
        }
      }

      // Min Match Threshold
      if (rec.final_match_score < minMatchThreshold) return false;

      // Experience level filter (expanded options)
      if (selectedExp !== 'all') {
        const expStr = (rec.job.experience_level || '').toLowerCase();
        if (selectedExp === 'intern' && !expStr.includes('intern') && !expStr.includes('trainee')) return false;
        if (selectedExp === 'fresher' && !expStr.includes('fresher') && !expStr.includes('entry') && !expStr.includes('0-1')) return false;
        if (selectedExp === 'junior' && !expStr.includes('junior') && !expStr.includes('1-2') && !expStr.includes('associate')) return false;
        if (selectedExp === 'mid' && !expStr.includes('mid') && !expStr.includes('2-3') && !expStr.includes('2+') && !expStr.includes('senior')) return false;
      }

      // Eligibility
      if (onlyEligible && rec.eligibility_report?.overallStatus !== 'Eligible') {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'match-desc') return b.final_match_score - a.final_match_score;
      if (sortBy === 'match-asc') return a.final_match_score - b.final_match_score;
      if (sortBy === 'salary-desc') return parseSalaryLPA(b.job.ctc_range) - parseSalaryLPA(a.job.ctc_range);
      if (sortBy === 'salary-asc') return parseSalaryLPA(a.job.ctc_range) - parseSalaryLPA(b.job.ctc_range);
      if (sortBy === 'gpa-asc') return a.job.minimum_gpa - b.job.minimum_gpa;
      if (sortBy === 'gpa-desc') return b.job.minimum_gpa - a.job.minimum_gpa;
      if (sortBy === 'company-asc') return a.job.company.localeCompare(b.job.company);
      return 0;
    });
  }, [recommendations, searchQuery, minMatchThreshold, selectedLocation, manualCity, selectedExp, onlyEligible, sortBy]);

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-16">
      {/* Top Page Navigation Bar with Back Button */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack || (() => setActivePage('profile'))}
          id="recs-back-btn"
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-xs transition-all hover:border-slate-300 cursor-pointer active:scale-95"
        >
          <ArrowLeft className="w-4 h-4 text-indigo-600" />
          <span>Back to Previous Page</span>
        </button>

        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span>Inference Output</span>
          <span>/</span>
          <span className="font-semibold text-slate-900">Ranked Placement Opportunities</span>
        </div>
      </div>

      {/* Top Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Match Engine Output</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Your Recommended Opportunities
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Ranked opportunities generated by TF-IDF text similarity and deterministic criteria scoring.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActivePage('skill-gap')}
            className="px-4 py-2.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Layers className="w-4 h-4 text-indigo-600" />
            <span>Inspect Skill Gaps</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Jobs Analyzed */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Jobs Analyzed</p>
            <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{totalAnalyzed}+</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Active Campus Recruiters</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Briefcase className="w-5 h-5" />
          </div>
        </div>

        {/* Top Match */}
        <div className="bg-white rounded-2xl border border-indigo-100 p-5 shadow-xs flex items-center justify-between bg-gradient-to-br from-white to-indigo-50/40">
          <div>
            <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">Top Match</p>
            <h3 className="text-2xl font-extrabold text-indigo-700 mt-1">{topMatch}%</h3>
            <p className="text-[11px] text-indigo-900/60 mt-0.5">High Suitability Fit</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        {/* Average Match */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Average Match</p>
            <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{avgMatch}%</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Across Top 20 Recommendations</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        {/* Skills Matched */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Skills Matched</p>
            <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{totalMatchedSkills}</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Unique Core Overlaps</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <GraduationCap className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by company, role (e.g. Software Engineer, Machine Learning, Microsoft)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Quick Match Score Selector */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold text-slate-600">
            <span className="text-[11px] px-2 text-slate-400">Match:</span>
            <button
              onClick={() => setMinMatchThreshold(0)}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                minMatchThreshold === 0 ? 'bg-white text-indigo-700 shadow-xs' : 'hover:text-slate-900'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setMinMatchThreshold(85)}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                minMatchThreshold === 85 ? 'bg-white text-indigo-700 shadow-xs' : 'hover:text-slate-900'
              }`}
            >
              &gt;85% High
            </button>
            <button
              onClick={() => setMinMatchThreshold(75)}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                minMatchThreshold === 75 ? 'bg-white text-indigo-700 shadow-xs' : 'hover:text-slate-900'
              }`}
            >
              &gt;75% Good
            </button>
          </div>

          {/* Sort By */}
          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-xs border border-slate-300 rounded-xl px-2.5 py-2 bg-white text-slate-700 font-medium focus:ring-1 focus:ring-indigo-500"
            >
              <option value="match-desc">Sort by: Match Fit % (Highest First)</option>
              <option value="match-asc">Sort by: Match Fit % (Lowest First)</option>
              <option value="salary-desc">Sort by: CTC / Salary (Highest First)</option>
              <option value="salary-asc">Sort by: CTC / Salary (Lowest First)</option>
              <option value="gpa-asc">Sort by: Min CGPA Cutoff (Lowest First)</option>
              <option value="gpa-desc">Sort by: Min CGPA Cutoff (Highest First)</option>
              <option value="company-asc">Sort by: Company Name (A to Z)</option>
            </select>
          </div>
        </div>

        {/* Dropdown Filters Row */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-semibold text-slate-600">Filters:</span>
          </div>

          {/* Manual Location Input (apna manpasand city search karne k liye) */}
          <div className="relative flex items-center">
            <MapPin className="w-3.5 h-3.5 text-indigo-500 absolute left-2.5 pointer-events-none" />
            <input
              type="text"
              list="popular-city-suggestions"
              placeholder="Search City (e.g. Pune, Noida, Delhi)..."
              value={manualCity}
              onChange={(e) => {
                setManualCity(e.target.value);
                if (e.target.value) setSelectedLocation('all');
              }}
              className="pl-8 pr-7 py-1.5 border border-indigo-200 focus:border-indigo-500 rounded-lg bg-indigo-50/40 text-slate-800 text-xs placeholder:text-slate-400 w-56 sm:w-60 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <datalist id="popular-city-suggestions">
              {uniqueLocations.map(city => (
                <option key={city} value={city} />
              ))}
              <option value="Remote" />
              <option value="Hybrid" />
            </datalist>
            {manualCity && (
              <button
                type="button"
                onClick={() => setManualCity('')}
                className="absolute right-2 text-slate-400 hover:text-slate-600 cursor-pointer"
                title="Clear city search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick chip to filter by student's saved profile location */}
          {!manualCity && selectedLocation === 'all' && preferredLocation && (
            <button
              type="button"
              onClick={() => {
                setManualCity(preferredLocation);
                setSelectedLocation('all');
              }}
              className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors cursor-pointer"
              title={`Click to filter jobs in ${preferredLocation}`}
            >
              <MapPin className="w-3 h-3 text-indigo-500" />
              <span>Filter: {preferredLocation}</span>
            </button>
          )}

          {/* Location preset dropdown */}
          <select
            value={selectedLocation}
            onChange={(e) => {
              setSelectedLocation(e.target.value);
              if (e.target.value !== 'all') setManualCity('');
            }}
            className="px-2.5 py-1.5 border border-slate-200 rounded-lg bg-slate-50 text-slate-700"
          >
            <option value="all">Preset Locations (All)</option>
            {uniqueLocations.map(loc => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
            <option value="Remote">Remote</option>
            <option value="Hybrid">Hybrid</option>
          </select>

          {/* Experience filter: Expanded options */}
          <select
            value={selectedExp}
            onChange={(e) => setSelectedExp(e.target.value)}
            className="px-2.5 py-1.5 border border-slate-200 rounded-lg bg-slate-50 text-slate-700"
          >
            <option value="all">All Experience Levels</option>
            <option value="intern">Internship / Trainee (0 Years)</option>
            <option value="fresher">Entry Level / Fresher (0-1 Years)</option>
            <option value="junior">Junior Associate (1-2 Years)</option>
            <option value="mid">Mid-Level (2-3+ Years)</option>
          </select>

          {/* Eligibility toggle */}
          <label className="flex items-center gap-1.5 cursor-pointer ml-auto text-slate-700 font-medium">
            <input
              type="checkbox"
              checked={onlyEligible}
              onChange={(e) => setOnlyEligible(e.target.checked)}
              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span>Only show GPA & Branch Eligible</span>
          </label>
        </div>
      </div>

      {/* Recommendations Cards List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-slate-500 px-1">
          <span>
            {manualCity.trim()
              ? `Showing ${filteredRecs.length} ranked ${filteredRecs.length === 1 ? 'opportunity' : 'opportunities'} in "${manualCity.trim()}"`
              : selectedLocation !== 'all'
              ? `Showing ${filteredRecs.length} ranked ${filteredRecs.length === 1 ? 'opportunity' : 'opportunities'} in "${selectedLocation}"`
              : `Showing ${filteredRecs.length} ranked opportunities`}
          </span>
          <span>Ranked by explainable cosine + multi-criteria scoring</span>
        </div>

        {/* Active City Filter Status Banner */}
        {manualCity.trim() ? (
          <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-indigo-50 border border-indigo-200 text-xs text-indigo-900 shadow-xs">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>
                Filtered by manual city search: <strong>"{manualCity.trim()}"</strong>{' '}
                ({filteredRecs.length} {filteredRecs.length === 1 ? 'placement opportunity' : 'placement opportunities'} found).
              </span>
            </div>
            <button
              onClick={() => setManualCity('')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 underline cursor-pointer ml-3 shrink-0"
            >
              Clear city search
            </button>
          </div>
        ) : selectedLocation !== 'all' ? (
          <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-indigo-50 border border-indigo-200 text-xs text-indigo-900 shadow-xs">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>
                Filtered by preset location: <strong>"{selectedLocation}"</strong>{' '}
                ({filteredRecs.length} {filteredRecs.length === 1 ? 'placement opportunity' : 'placement opportunities'} found).
              </span>
            </div>
            <button
              onClick={() => setSelectedLocation('all')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 underline cursor-pointer ml-3 shrink-0"
            >
              Clear location filter
            </button>
          </div>
        ) : preferredLocation ? (
          <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>Showing all opportunities. Your saved preferred location is <strong>{preferredLocation}</strong>.</span>
            </div>
            <button
              onClick={() => {
                setManualCity(preferredLocation);
                setSelectedLocation('all');
              }}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer"
            >
              <span>Filter {preferredLocation} only</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        ) : null}

        {filteredRecs.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
            <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">
              {manualCity.trim()
                ? `No placements found in "${manualCity.trim()}"`
                : selectedLocation !== 'all'
                ? `No placements found in "${selectedLocation}"`
                : 'No matching placements found'}
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              {manualCity.trim() || selectedLocation !== 'all'
                ? 'Try searching another city (e.g. Pune, Bangalore, Noida, Hyderabad) or clear the city filter to view all campus opportunities.'
                : 'Try adjusting your search criteria or lowering the match threshold.'}
            </p>
            <div className="flex items-center justify-center gap-2 pt-1">
              {(manualCity || selectedLocation !== 'all') && (
                <button
                  onClick={() => {
                    setManualCity('');
                    setSelectedLocation('all');
                  }}
                  className="px-4 py-2 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors cursor-pointer"
                >
                  Clear City Filter
                </button>
              )}
              <button
                onClick={() => {
                  setSearchQuery('');
                  setMinMatchThreshold(0);
                  setSelectedLocation('all');
                  setManualCity('');
                  setSelectedExp('all');
                  setOnlyEligible(false);
                }}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                Reset All Filters
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredRecs.map((rec) => {
              const { job } = rec;
              const isEligible = rec.eligibility_report?.overallStatus === 'Eligible';

              // Visual styling based on Match %
              let scoreBadgeColor = 'bg-slate-100 text-slate-700 border-slate-200';
              let scoreBarColor = 'bg-slate-400';
              if (rec.final_match_score >= 88) {
                scoreBadgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-300 ring-2 ring-emerald-100';
                scoreBarColor = 'bg-emerald-500';
              } else if (rec.final_match_score >= 75) {
                scoreBadgeColor = 'bg-blue-50 text-blue-700 border-blue-300 ring-2 ring-blue-100';
                scoreBarColor = 'bg-blue-500';
              } else if (rec.final_match_score >= 60) {
                scoreBadgeColor = 'bg-amber-50 text-amber-700 border-amber-300';
                scoreBarColor = 'bg-amber-500';
              }

              return (
                <div
                  key={rec.recommendation_id}
                  className="bg-white rounded-2xl border border-slate-200 hover:border-indigo-300 transition-all shadow-xs hover:shadow-md p-5 sm:p-6 relative group"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Left: Company & Role Details */}
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-slate-900 text-base">{job.job_title}</span>
                        {job.category && (
                          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                            job.category === 'Tier 1 (Dream)' 
                              ? 'bg-purple-50 text-purple-700 border border-purple-200'
                              : 'bg-slate-100 text-slate-700 border border-slate-200'
                          }`}>
                            {job.category}
                          </span>
                        )}
                        {job.ctc_range && (
                          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                            {job.ctc_range}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 font-medium">
                        <span className="font-semibold text-indigo-900 flex items-center gap-1">
                          <Building2 className="w-3.5 h-3.5 text-indigo-600" />
                          {job.company}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          {job.location}
                        </span>
                        <span>•</span>
                        <span>Min GPA: {job.minimum_gpa}</span>
                        <span>•</span>
                        <span>Branches: {job.eligible_branches.join(', ')}</span>
                      </div>

                      {/* AI Reason string */}
                      <p className="text-xs text-slate-600 leading-relaxed pt-1 line-clamp-2">
                        <span className="font-semibold text-slate-800">AI Rationale: </span>
                        {rec.recommendation_reason}
                      </p>

                      {/* Skills Overlap Preview */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-2">
                        <span className="text-[11px] font-semibold text-slate-400 mr-1">Matching:</span>
                        {rec.matching_skills.slice(0, 4).map(skill => (
                          <span
                            key={skill}
                            className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 rounded"
                          >
                            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                            {skill}
                          </span>
                        ))}
                        {rec.missing_skills.length > 0 && (
                          <>
                            <span className="text-[11px] font-semibold text-slate-400 ml-2 mr-1">Missing:</span>
                            {rec.missing_skills.slice(0, 2).map(skill => (
                              <span
                                key={skill}
                                className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200 rounded"
                              >
                                <span className="text-red-500 font-bold">✕</span>
                                {skill}
                              </span>
                            ))}
                            {rec.missing_skills.length > 2 && (
                              <span className="text-[10px] text-slate-400 font-medium">
                                +{rec.missing_skills.length - 2} more
                              </span>
                            )}
                          </>
                        )}
                      </div>
                    </div>

                    {/* Right: Prominent Match Score & Action */}
                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100 min-w-[150px]">
                      {/* Prominent Match % */}
                      <div className="text-left sm:text-right">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          Fit Percentage
                        </span>
                        <div className="flex items-baseline gap-1">
                          <span className={`text-3xl sm:text-4xl font-black tracking-tight ${
                            rec.final_match_score >= 88 ? 'text-emerald-600' :
                            rec.final_match_score >= 75 ? 'text-indigo-600' : 'text-slate-700'
                          }`}>
                            {rec.final_match_score}%
                          </span>
                        </div>
                        <span className="text-[10px] font-semibold text-slate-500">
                          Cosine: {rec.cosine_similarity_score}% • Criteria: {rec.multi_criteria_fit_score}%
                        </span>
                      </div>

                      {/* Eligibility Pill */}
                      <div className="text-right">
                        {isEligible ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" />
                            Eligible
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                            <AlertTriangle className="w-3 h-3" />
                            {!rec.gpa_eligible ? 'GPA Cutoff' : 'Branch Restricted'}
                          </span>
                        )}
                      </div>

                      {/* View Details / AI Analysis Button */}
                      <button
                        onClick={() => onSelectJob(rec)}
                        id={`view-details-${job.job_id}`}
                        className="px-4 py-2 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-600 hover:text-white border border-indigo-200 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>View AI Analysis</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
