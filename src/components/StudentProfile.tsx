import React, { useState, useMemo } from 'react';
import { StudentProfileData, Branch, ExperienceLevel, JobType, Project, Certification, Achievement } from '../types';
import { PhotoCaptureModal } from './PhotoCaptureModal';
import { AchievementModal } from './AchievementModal';
import { CollegeProofUpload } from './CollegeProofUpload';
import { AcademicDocumentVault } from './AcademicDocumentVault';
import { PhoneInputWithCountry } from './PhoneInputWithCountry';
import { CollegeCityAutocomplete } from './CollegeCityAutocomplete';
import { AI_SUGGESTED_AVATARS } from '../data/aiAvatars';
import { 
  INDIAN_HIGHER_EDUCATION_COURSES, 
  getCourseById, 
  getBranchesForCourse, 
  getDefaultBranchForCourse,
  formatCourseAndBranch 
} from '../data/coursesAndBranches';
import { calculateAcademicStanding } from '../utils/crypto';
import { ResumeAnalyzer } from './ResumeAnalyzer';
import { ATSResumeAnalysis } from '../types';
import { 
  User, 
  GraduationCap, 
  Code, 
  Award, 
  FolderGit2, 
  Briefcase, 
  Sliders, 
  Plus, 
  Trash2, 
  Sparkles, 
  ArrowRight,
  ArrowLeft,
  CheckCircle2, 
  RefreshCw, 
  Info, 
  Terminal, 
  Trophy, 
  BookOpen, 
  FileCheck, 
  Github, 
  Globe, 
  Camera, 
  Upload, 
  UserPlus, 
  LogIn, 
  ExternalLink, 
  Edit3, 
  Medal, 
  Calendar, 
  Building,
  Mail,
  Phone,
  ShieldCheck,
  FileCheck2,
  KeyRound,
  Lock,
  Printer,
  QrCode,
  AlertTriangle,
  AlertCircle,
  Clock,
  CheckCircle,
  X
} from 'lucide-react';

interface StudentProfileProps {
  student: StudentProfileData | null;
  setStudent: (student: StudentProfileData) => void;
  onGenerateRecommendations: () => void;
  onBack?: () => void;
  onOpenAuthModal?: (mode?: 'login' | 'register') => void;
  onDeleteStudent?: (studentId: string) => void;
}

interface PlacementCertificateModalProps {
  student: StudentProfileData;
  onClose: () => void;
}

const PlacementCertificateModal: React.FC<PlacementCertificateModalProps> = ({ student, onClose }) => {
  const verifiedDate = student.verifiedAt 
    ? new Date(student.verifiedAt).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }) 
    : new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
  const certId = `PLACERA-TPO-${(student.rollNumber || student.student_id).toUpperCase().replace(/[^A-Z0-9]/g, '')}-${student.graduationYear || '2025'}`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border-4 border-amber-400/40 p-6 sm:p-10 my-8">
        {/* Certificate Header */}
        <div className="flex items-center justify-between border-b-2 border-slate-200 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-indigo-600 text-white flex items-center justify-center shadow-md">
              <GraduationCap className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight text-slate-900 uppercase">
                {student.collegeName || 'National Institute of Technology'}
              </h2>
              <p className="text-xs font-bold text-amber-700 uppercase tracking-wider">
                Central Training & Placement Cell (TPO) • Placement Clearance
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Certificate Title */}
        <div className="text-center space-y-2 mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 text-xs font-extrabold uppercase tracking-widest">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Official Certificate of Placement Eligibility
          </div>
          <p className="text-xs text-slate-500">
            Certificate ID: <span className="font-mono font-bold text-slate-800">{certId}</span>
          </p>
        </div>

        {/* Body Text */}
        <div className="text-center space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50/70 p-5 rounded-2xl border border-slate-200">
          <p>
            This is to certify that candidate <span className="font-extrabold text-slate-900 underline decoration-indigo-500 underline-offset-4">{student.name}</span>, Roll / Registration No: <span className="font-mono font-bold text-slate-900">{student.rollNumber || student.student_id}</span>, Department of <span className="font-bold text-slate-900">{student.branch}</span> (Class of {student.graduationYear || '2025'}), has fulfilled all institutional academic eligibility and document verification checks.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-center text-xs">
            <div className="p-2 bg-white rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-[10px] text-slate-500 block font-semibold">Cumulative CGPA</span>
              <span className="font-black text-indigo-700 text-sm">{student.GPA} / 10.0</span>
            </div>
            <div className="p-2 bg-white rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-[10px] text-slate-500 block font-semibold">Active Backlogs</span>
              <span className="font-black text-emerald-700 text-sm">{student.activeBacklogs} (Cleared)</span>
            </div>
            <div className="p-2 bg-white rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-[10px] text-slate-500 block font-semibold">10th / 12th Board</span>
              <span className="font-black text-slate-800 text-sm">{student.tenthPercentage}% / {student.twelfthPercentage}%</span>
            </div>
            <div className="p-2 bg-white rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-[10px] text-slate-500 block font-semibold">Campus Clearance</span>
              <span className="font-black text-emerald-700 text-sm">100% Eligible</span>
            </div>
          </div>
          <p className="text-[11px] text-slate-500 italic pt-1">
            "The candidate's semester marksheets and enrollment proofs have been verified and approved. The candidate is granted full clearance for all Super Dream, Dream, and Core on-campus recruitment drives."
          </p>
        </div>

        {/* Official Seal & Signature Section */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-6 border-t border-slate-200 pt-6">
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 rounded-full border-2 border-dashed border-amber-600/80 bg-amber-50 flex flex-col items-center justify-center text-amber-800 font-black text-[9px] text-center shadow-inner uppercase p-1">
              <Award className="w-5 h-5 text-amber-600 mb-0.5" />
              <span>TPO Seal</span>
              <span>VERIFIED</span>
            </div>
            <div className="text-left">
              <p className="text-xs font-bold text-slate-900">{student.verifiedBy || 'Dr. Rajesh Mehta'}</p>
              <p className="text-[10px] text-slate-500">Head Training & Placement Officer</p>
              <p className="text-[9px] text-emerald-700 font-semibold font-mono">Date: {verifiedDate}</p>
            </div>
          </div>

          <div className="text-center sm:text-right space-y-1">
            <div className="inline-flex items-center gap-1 text-[10px] text-slate-400 font-mono">
              <QrCode className="w-3.5 h-3.5 text-slate-500" />
              <span>SHA-256:AUTHENTICATED</span>
            </div>
            <p className="text-[10px] text-slate-400">Institutional Placement Passkey Valid</p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={handlePrint}
            className="px-4 py-2 text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            <span>Print / Save PDF</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors cursor-pointer shadow-xs"
          >
            Close Certificate
          </button>
        </div>
      </div>
    </div>
  );
};

const COMMON_SKILLS = [
  'Python', 'C++', 'Java', 'SQL', 'JavaScript', 'HTML', 'CSS',
  'Machine Learning', 'Data Structures & Algorithms', 'React.js',
  'Node.js', 'Pandas', 'NumPy', 'Scikit-learn', 'Docker',
  'Operating Systems', 'Computer Networks', 'Database Management',
  'Git', 'FastAPI', 'Azure', 'AWS', 'TensorFlow', 'NLP'
];

const STANDARD_CORE_SUBJECTS = [
  'Data Structures & Algorithms',
  'Database Management Systems (DBMS)',
  'Operating Systems',
  'Computer Networks',
  'Object Oriented Programming (OOP)',
  'System Design',
  'Artificial Intelligence & ML',
  'Software Engineering'
];

export const StudentProfile: React.FC<StudentProfileProps> = ({
  student,
  setStudent,
  onGenerateRecommendations,
  onBack,
  onOpenAuthModal,
  onDeleteStudent,
}) => {
  const [skillInput, setSkillInput] = useState('');
  const [coreSubjectInput, setCoreSubjectInput] = useState('');
  const [activityInput, setActivityInput] = useState('');
  const [saveAlert, setSaveAlert] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  
  // Modals state
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [showAchievementModal, setShowAchievementModal] = useState(false);
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [editingAchievement, setEditingAchievement] = useState<Achievement | null>(null);
  const handleResumeAnalyzed = (
    analysis: ATSResumeAnalysis, 
    resumeText: string, 
    fileName?: string, 
    pdfUrl?: string, 
    fileSize?: string
  ) => {
    if (!student) return;
    const mergedSkills = Array.from(new Set([...student.skills, ...analysis.foundSkills]));
    setStudent({
      ...student,
      skills: mergedSkills,
      atsResumeScore: analysis.atsScore,
      resumeText,
      resumeFileName: fileName,
      resumePdfUrl: pdfUrl || student.resumePdfUrl,
      resumeFileSize: fileSize || student.resumeFileSize,
    });
  };

  // Dynamic academic standing calculation based on student admission and current date (2026)
  const standingCalc = useMemo(() => {
    if (!student) return null;
    return calculateAcademicStanding(student.admissionYear || 2025, student.graduationYear || 2029);
  }, [student?.admissionYear, student?.graduationYear]);

  // Active course definition and available branches
  const activeCourse = student?.course || 'B.Tech';
  const activeCourseDef = useMemo(() => getCourseById(activeCourse), [activeCourse]);
  const activeBranches = useMemo(() => getBranchesForCourse(activeCourse), [activeCourse]);

  // Profile course change handler
  const handleProfileCourseChange = (newCourseId: string) => {
    if (!student) return;
    const courseDef = getCourseById(newCourseId);
    const defaultBranch = getDefaultBranchForCourse(newCourseId);
    const duration = courseDef?.durationYears || 4;
    const admission = student.admissionYear || 2025;
    
    setStudent({
      ...student,
      course: newCourseId,
      branch: defaultBranch as Branch,
      graduationYear: admission + duration
    });
  };

  if (!student) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 space-y-8">
        <div className="flex items-center justify-between">
          <button
            onClick={onBack || (() => window.history.back())}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-indigo-600" />
            <span>Back</span>
          </button>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 text-center shadow-sm space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mx-auto shadow-sm">
            <UserPlus className="w-8 h-8" />
          </div>

          <div className="space-y-2 max-w-lg mx-auto">
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Create Your Student Profile
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              No active student profile is loaded. Create your personalized profile from scratch with your name, roll number, department, CGPA, technical skills, achievements, and live photo capture.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => onOpenAuthModal ? onOpenAuthModal('register') : null}
              id="empty-profile-create-btn"
              className="w-full sm:w-auto px-6 py-3 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <UserPlus className="w-4 h-4" />
              <span>Create My Profile (Register)</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onOpenAuthModal ? onOpenAuthModal('login') : null}
              id="empty-profile-login-btn"
              className="w-full sm:w-auto px-6 py-3 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In to Existing Profile</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Helper updates
  const updateField = <K extends keyof StudentProfileData>(field: K, value: StudentProfileData[K]) => {
    setStudent({
      ...student,
      [field]: value,
    });
  };

  // Achievement handlers
  const handleOpenAddAchievement = () => {
    setEditingAchievement(null);
    setShowAchievementModal(true);
  };

  const handleEditAchievement = (ach: Achievement) => {
    setEditingAchievement(ach);
    setShowAchievementModal(true);
  };

  const handleSaveAchievement = (ach: Achievement) => {
    const existing = student.achievements || [];
    const idx = existing.findIndex(a => a.id === ach.id);
    if (idx >= 0) {
      const copy = [...existing];
      copy[idx] = ach;
      updateField('achievements', copy);
    } else {
      updateField('achievements', [ach, ...existing]);
    }
    setShowAchievementModal(false);
    setEditingAchievement(null);
  };

  const handleDeleteAchievement = (id: string) => {
    const existing = student.achievements || [];
    updateField('achievements', existing.filter(a => a.id !== id));
  };

  const handlePhotoCaptured = (dataUrl: string) => {
    updateField('avatarUrl', dataUrl);
    setShowPhotoModal(false);
  };

  const handleToggleCoreSubject = (subject: string) => {
    const existing = student.coreSubjects || [];
    if (existing.includes(subject)) {
      updateField('coreSubjects', existing.filter(s => s !== subject));
    } else {
      updateField('coreSubjects', [...existing, subject]);
    }
  };

  const handleAddCustomCoreSubject = () => {
    const trimmed = coreSubjectInput.trim();
    if (!trimmed) return;
    const existing = student.coreSubjects || [];
    if (!existing.includes(trimmed)) {
      updateField('coreSubjects', [...existing, trimmed]);
    }
    setCoreSubjectInput('');
  };

  const handleAddActivity = () => {
    const trimmed = activityInput.trim();
    if (!trimmed) return;
    const existing = student.leadershipAndExtracurriculars || [];
    if (!existing.includes(trimmed)) {
      updateField('leadershipAndExtracurriculars', [...existing, trimmed]);
    }
    setActivityInput('');
  };

  const handleRemoveActivity = (item: string) => {
    const existing = student.leadershipAndExtracurriculars || [];
    updateField('leadershipAndExtracurriculars', existing.filter(a => a !== item));
  };

  const handleAddSkill = (skillToAdd: string) => {
    const trimmed = skillToAdd.trim();
    if (!trimmed) return;
    
    // Support comma-separated inputs (e.g. "SQL, Node.js, AWS")
    const newItems = trimmed.split(',').map(s => s.trim()).filter(Boolean);
    let updated = [...student.skills];
    
    newItems.forEach(item => {
      const exists = updated.some(s => s.toLowerCase() === item.toLowerCase());
      if (!exists) {
        updated.push(item);
      }
    });

    updateField('skills', updated);
    setSkillInput('');
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    updateField('skills', student.skills.filter(s => s !== skillToRemove));
  };

  // Projects handlers
  const handleAddProject = () => {
    const newProject: Project = {
      id: `proj-${Date.now()}`,
      title: 'New Engineering Project',
      description: 'Applied machine learning and full stack technologies to solve campus placement challenges.',
      technologies: ['Python', 'SQL']
    };
    updateField('projects', [...student.projects, newProject]);
  };

  const handleUpdateProject = (id: string, field: keyof Project, val: any) => {
    const updated = student.projects.map(p => {
      if (p.id === id) {
        return { ...p, [field]: val };
      }
      return p;
    });
    updateField('projects', updated);
  };

  const handleRemoveProject = (id: string) => {
    updateField('projects', student.projects.filter(p => p.id !== id));
  };

  // Certifications handlers
  const handleAddCert = () => {
    const newCert: Certification = {
      id: `cert-${Date.now()}`,
      name: 'Cloud & AI Professional Specialization',
      issuingOrganization: 'Coursera / AWS'
    };
    updateField('certifications', [...student.certifications, newCert]);
  };

  const handleUpdateCert = (id: string, field: keyof Certification, val: string) => {
    const updated = student.certifications.map(c => {
      if (c.id === id) {
        return { ...c, [field]: val };
      }
      return c;
    });
    updateField('certifications', updated);
  };

  const handleRemoveCert = (id: string) => {
    updateField('certifications', student.certifications.filter(c => c.id !== id));
  };

  const loadPreset = (preset: StudentProfileData) => {
    setStudent(preset);
    setSaveAlert(true);
    setTimeout(() => setSaveAlert(false), 2000);
  };

  const isVerified = student.verificationStatus === 'Verified';
  const isPending = student.verificationStatus === 'Pending Review' || !student.verificationStatus;
  const isFlagged = student.verificationStatus === 'Flagged / Action Needed';
  const isRejected = student.verificationStatus === 'Rejected';

  const handleRequestReReview = () => {
    updateField('verificationStatus', 'Pending Review');
    if (student.verificationFeedback) {
      updateField('verificationFeedback', {
        ...student.verificationFeedback,
        resolved: true,
        resolvedAt: new Date().toISOString()
      });
    }
    setSaveAlert(true);
    setTimeout(() => setSaveAlert(false), 3000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      {/* Top Page Navigation Bar with Back Button */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack || (() => window.history.back())}
          id="profile-back-btn"
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-xs transition-all hover:border-slate-300 cursor-pointer active:scale-95"
        >
          <ArrowLeft className="w-4 h-4 text-indigo-600" />
          <span>Back to Previous Page</span>
        </button>

        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span>Student Portal</span>
          <span>/</span>
          <span className="font-semibold text-slate-900">Academic Dossier</span>
          <span>/</span>
          <span className={`font-bold px-2 py-0.5 rounded-md text-[10px] ${
            isVerified ? 'bg-emerald-100 text-emerald-800' : 
            isRejected ? 'bg-rose-100 text-rose-800' :
            isFlagged ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
          }`}>
            {isVerified ? 'Approved & Verified' : isRejected ? 'Verification Rejected' : isFlagged ? 'Action Needed (Flagged)' : 'Under Review'}
          </span>
        </div>
      </div>

      {/* Dynamic Institutional Placement Verification Clearance Banner */}
      {isVerified ? (
        <div className="bg-gradient-to-r from-emerald-900 via-slate-900 to-teal-950 text-white rounded-3xl p-6 border-2 border-emerald-500/50 shadow-xl relative overflow-hidden">
          {/* Ambient Glow */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-emerald-500/20 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 -mb-16 w-48 h-48 rounded-full bg-teal-500/10 blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-start sm:items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border-2 border-emerald-400 text-emerald-300 flex items-center justify-center shrink-0 shadow-lg shadow-emerald-950/50">
                <ShieldCheck className="w-8 h-8 text-emerald-400 animate-pulse" />
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest bg-emerald-500/30 text-emerald-300 border border-emerald-400/40 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-300" />
                    <span>Approved by Placement Cell</span>
                  </span>
                  <span className="text-xs text-emerald-200/80 font-mono">
                    ID: PLACERA-VERIFIED-{(student.rollNumber || student.student_id).toUpperCase().replace(/[^A-Z0-9]/g, '')}
                  </span>
                </div>

                <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">
                  Campus Placement Eligibility Clearance Granted
                </h3>

                <p className="text-xs text-slate-300 flex flex-wrap items-center gap-2">
                  <span>Verified by <strong className="text-emerald-300 font-semibold">{student.verifiedBy || 'Central Placement Officer'}</strong></span>
                  <span>•</span>
                  <span>{student.verifiedAt ? new Date(student.verifiedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Official Active Session'}</span>
                  <span>•</span>
                  <span className="text-emerald-300 font-semibold">100% Unrestricted Drives Clearance</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0 w-full md:w-auto">
              <button
                type="button"
                onClick={() => setShowCertificateModal(true)}
                id="view-clearance-cert-btn"
                className="w-full sm:w-auto px-4 py-2.5 text-xs font-black text-slate-900 bg-gradient-to-r from-amber-300 to-amber-400 hover:from-amber-200 hover:to-amber-300 rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95"
              >
                <Award className="w-4 h-4 text-slate-900" />
                <span>View Placement Certificate</span>
              </button>
            </div>
          </div>
        </div>
      ) : isPending ? (
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-5 border border-indigo-500/40 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/40 text-amber-300 flex items-center justify-center shrink-0">
              <Clock className="w-6 h-6 text-amber-400 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-400/30 px-2 py-0.5 rounded-full">
                  Verification Pending
                </span>
                <span className="text-xs text-amber-300/80 font-mono">Central Placement Cell Queue</span>
              </div>
              <h4 className="text-sm font-bold text-white mt-0.5">
                Application Submitted: Awaiting Admin Approval
              </h4>
              <p className="text-xs text-slate-300">
                Your submitted documents and academic profile have been securely forwarded to the College Administrator. Placement matching and drive applications will unlock once the administrator approves your request.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
            <span className="text-[11px] text-amber-300 bg-amber-950/80 px-3 py-1.5 rounded-xl border border-amber-700/60 font-semibold flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5" />
              <span>Pending Officer Review</span>
            </span>
          </div>
        </div>
      ) : isFlagged ? (
        <div className="bg-amber-50/90 border-2 border-amber-300 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-amber-200/80 pb-4">
            <div className="flex items-start gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 border border-amber-300 text-amber-800 flex items-center justify-center shrink-0 shadow-2xs">
                <AlertTriangle className="w-6 h-6 text-amber-700 animate-bounce" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider bg-amber-200 text-amber-900 border border-amber-300 px-2.5 py-0.5 rounded-full">
                    Action Required by Student
                  </span>
                  {student.verificationFeedback?.flaggedBy && (
                    <span className="text-[11px] text-amber-800 font-medium">
                      Flagged by {student.verificationFeedback.flaggedBy}
                    </span>
                  )}
                </div>
                <h4 className="text-base font-extrabold text-amber-950 mt-1">
                  Placement Cell Feedback: Document or Data Resubmission Needed
                </h4>
                <p className="text-xs text-amber-900/90 mt-0.5">
                  The placement administrator reviewed your profile and identified discrepancies that require correction before your account can be verified.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleRequestReReview}
                id="request-re-review-btn"
                className="px-4 py-2 text-xs font-bold text-emerald-900 bg-emerald-200 hover:bg-emerald-300 border border-emerald-300 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs active:scale-95"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Mark Fixed & Request Re-review</span>
              </button>
            </div>
          </div>

          {/* Details breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* 1. Unverified Data Items */}
            <div className="bg-white/90 border border-amber-200 rounded-2xl p-3.5 space-y-2">
              <span className="text-[11px] font-bold text-amber-950 uppercase tracking-wider block">
                1. Data Not Verified:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {student.verificationFeedback?.unverifiedDataItems && student.verificationFeedback.unverifiedDataItems.length > 0 ? (
                  student.verificationFeedback.unverifiedDataItems.map(item => (
                    <span key={item} className="text-[11px] font-semibold bg-amber-100 text-amber-900 border border-amber-200 px-2.5 py-1 rounded-lg">
                      {item}
                    </span>
                  ))
                ) : (
                  <span className="text-[11px] font-semibold bg-amber-100 text-amber-900 border border-amber-200 px-2.5 py-1 rounded-lg">
                    Academic Marksheet & ID Proof
                  </span>
                )}
              </div>
            </div>

            {/* 2. Detected Issues */}
            <div className="bg-white/90 border border-amber-200 rounded-2xl p-3.5 space-y-2 md:col-span-2">
              <span className="text-[11px] font-bold text-amber-950 uppercase tracking-wider block">
                2. Issues Identified by Admin:
              </span>
              <ul className="text-xs text-amber-950 space-y-1">
                {student.verificationFeedback?.issues && student.verificationFeedback.issues.length > 0 ? (
                  student.verificationFeedback.issues.map((issue, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-amber-600 font-bold">•</span>
                      <span>{issue}</span>
                    </li>
                  ))
                ) : (
                  <li className="flex items-start gap-1.5">
                    <span className="text-amber-600 font-bold">•</span>
                    <span>{student.adminNotes || 'Uploaded document scan requires verification or re-upload.'}</span>
                  </li>
                )}
              </ul>
            </div>
          </div>

          {/* 3. Instructions & Required Changes */}
          <div className="bg-gradient-to-r from-amber-100 via-amber-50 to-orange-100 border border-amber-300 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-extrabold text-amber-900 uppercase tracking-wider">
                What Changes You Need To Make:
              </span>
              <p className="text-xs font-semibold text-amber-950 leading-relaxed">
                "{student.verificationFeedback?.requiredChanges || student.adminNotes || 'Please upload your official previous semester grade card with university seal.'}"
              </p>
              {student.verificationFeedback?.actionDeadline && (
                <p className="text-[11px] text-amber-800 font-medium">
                  ⏰ Expected resolution: <strong className="font-bold">{student.verificationFeedback.actionDeadline}</strong>
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={() => {
                const el = document.getElementById('academic-proof-section') || document.getElementById('academic-vault-section');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-4 py-2 text-xs font-bold text-amber-950 bg-amber-300 hover:bg-amber-400 rounded-xl transition-all cursor-pointer shrink-0 shadow-2xs active:scale-95"
            >
              Update Documents in Vault ↓
            </button>
          </div>
        </div>
      ) : isRejected ? (
        <div className="bg-rose-50 border-2 border-rose-300 rounded-3xl p-6 shadow-sm space-y-3">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 border border-rose-200 text-rose-700 flex items-center justify-center shrink-0">
              <X className="w-6 h-6 text-rose-600" />
            </div>
            <div className="space-y-1 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider bg-rose-200 text-rose-900 border border-rose-300 px-2.5 py-0.5 rounded-full">
                  Verification Rejected
                </span>
                <span className="text-xs text-rose-700 font-medium">Placement Eligibility Suspended</span>
              </div>
              <h4 className="text-base font-extrabold text-rose-950">
                Placement Cell Has Rejected Your Current Verification Submission
              </h4>
              <p className="text-xs text-rose-900">
                Reason: {student.adminNotes || 'Document or credentials did not meet verified university enrollment standards.'}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2 border-t border-rose-200 text-xs">
            <button
              type="button"
              onClick={() => {
                const el = document.getElementById('academic-proof-section');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-4 py-2 text-xs font-bold text-rose-900 bg-rose-200 hover:bg-rose-300 rounded-xl transition-colors cursor-pointer"
            >
              Re-upload Official Marksheet Proof
            </button>
          </div>
        </div>
      ) : null}

      {/* Candidate Profile Dossier Header */}
      <div className={`bg-white rounded-3xl border p-6 shadow-xs transition-all ${
        isVerified ? 'border-emerald-200 ring-2 ring-emerald-100' : 'border-slate-200'
      }`}>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          
          {/* Candidate Avatar & Identity */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            {/* Interactive Avatar with Camera Overlay */}
            <div className="relative group shrink-0">
              <div className={`w-20 h-20 rounded-2xl overflow-hidden border-2 bg-slate-100 shadow-sm relative ${
                isVerified ? 'border-emerald-400 ring-2 ring-emerald-200' : 'border-indigo-200'
              }`}>
                {student.avatarUrl ? (
                  <img 
                    src={student.avatarUrl} 
                    alt={student.name} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-tr from-indigo-600 to-blue-600 text-white flex items-center justify-center font-black text-2xl">
                    {student.name.charAt(0)}
                  </div>
                )}

                {/* Hover overlay for instant camera opening */}
                <button
                  onClick={() => setShowPhotoModal(true)}
                  className="absolute inset-0 bg-slate-900/60 text-white opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 cursor-pointer"
                  title="Capture or change profile photo"
                >
                  <Camera className="w-5 h-5 text-white" />
                  <span className="text-[10px] font-bold">Change</span>
                </button>
              </div>

              {/* Status Indicator */}
              <div 
                className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center shadow-xs ${
                  isVerified ? 'bg-emerald-500 ring-2 ring-emerald-300' : isFlagged ? 'bg-amber-500' : 'bg-blue-500'
                }`} 
                title={isVerified ? 'Profile Verified by Placement Cell' : 'Pending Review'}
              >
                {isVerified ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                ) : (
                  <Clock className="w-3.5 h-3.5 text-white" />
                )}
              </div>
            </div>

            {/* Candidate Metadata */}
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                  {student.name}
                </h1>
                {isVerified ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-2xs">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>✓ Approved & Verified</span>
                  </span>
                ) : isFlagged ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                    <AlertTriangle className="w-3 h-3" />
                    <span>Action Needed</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                    <Clock className="w-3 h-3" />
                    <span>Pending Review</span>
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-500 flex flex-wrap items-center gap-2">
                <span className="font-mono font-medium text-slate-700">{student.rollNumber || student.student_id}</span>
                <span>•</span>
                <span className="font-bold text-indigo-900 bg-indigo-50/90 px-2.5 py-0.5 rounded-md border border-indigo-100">
                  {formatCourseAndBranch(student.course, student.branch)}
                </span>
                <span>•</span>
                <span className="font-semibold text-indigo-600">
                  {standingCalc?.cgpaShortLabel || 'CGPA'}: {student.GPA} / 10
                </span>
                <span>•</span>
                <span className="font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                  {standingCalc?.currentYearLabel || student.academicStanding || '2nd Year (Sophomore)'}
                </span>
                <span>•</span>
                <span>Class of {student.graduationYear}</span>
              </p>

              {/* Photo & AI Avatar Actions */}
              <div className="space-y-2 pt-1">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowPhotoModal(true)}
                    id="profile-camera-btn"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-all cursor-pointer shadow-2xs active:scale-95"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                    <span>AI Avatars Studio & Photo</span>
                  </button>
                  {isVerified && (
                    <button
                      type="button"
                      onClick={() => setShowCertificateModal(true)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-all cursor-pointer"
                    >
                      <Award className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Clearance Certificate</span>
                    </button>
                  )}
                </div>

                {/* Quick 1-Click AI Avatar Selector */}
                <div className="flex items-center gap-1.5 overflow-x-auto max-w-sm sm:max-w-md py-1">
                  <span className="text-[10px] font-semibold text-slate-400 shrink-0">AI Avatars:</span>
                  {AI_SUGGESTED_AVATARS.slice(0, 6).map((av) => (
                    <button
                      key={av.id}
                      type="button"
                      onClick={() => updateField('avatarUrl', av.url)}
                      title={`Select ${av.name}`}
                      className={`w-7 h-7 rounded-lg overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${
                        student.avatarUrl === av.url
                          ? 'border-indigo-600 ring-2 ring-indigo-400 scale-110'
                          : 'border-slate-200 hover:border-indigo-300 opacity-80 hover:opacity-100'
                      }`}
                    >
                      <img src={av.url} alt={av.name} className="w-full h-full object-cover" />
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setShowPhotoModal(true)}
                    className="w-7 h-7 rounded-lg border border-dashed border-indigo-300 text-indigo-600 hover:bg-indigo-50 text-[10px] font-bold flex items-center justify-center shrink-0 cursor-pointer"
                    title="Open Full AI Avatar Studio"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Student actions stay scoped to the current authenticated profile. */}
          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            {onDeleteStudent && (
              confirmDeleteOpen ? (
                <div className="flex items-center gap-1.5 bg-red-50 border border-red-200 rounded-xl p-1">
                  <button
                    type="button"
                    onClick={() => {
                      onDeleteStudent(student.student_id);
                      setConfirmDeleteOpen(false);
                    }}
                    id="profile-confirm-delete-btn"
                    className="px-3 py-1.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors cursor-pointer"
                  >
                    Confirm Delete
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDeleteOpen(false)}
                    className="px-2 py-1.5 text-xs text-slate-600 hover:text-slate-800 rounded-lg cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmDeleteOpen(true)}
                  id="profile-delete-btn"
                  className="px-3 py-2 text-xs font-semibold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                  title="Delete this candidate profile"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              )
            )}

            <button
              type="button"
              onClick={onGenerateRecommendations}
              id="profile-generate-rec-top-btn"
              className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm shadow-indigo-200 transition-all cursor-pointer flex items-center gap-2 active:scale-95"
            >
              <Sparkles className="w-4 h-4" />
              <span>Generate Recommendations</span>
            </button>
          </div>
        </div>
      </div>

      {/* Form Grid */}
      <div className="space-y-6">
        <ResumeAnalyzer
          student={student}
          onScoreSaved={(score) => setStudent({ ...student, atsResumeScore: score })}
          onResumeAnalyzed={handleResumeAnalyzed}
        />

        {/* 1. Personal & Academic Details */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-indigo-600" />
              <h2 className="text-base font-bold text-slate-900">1. Personal Identity & Academic Contact Details</h2>
            </div>
            <span className="text-[11px] bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full font-semibold border border-indigo-200">
              Verified Student Profile
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Candidate Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  value={student.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="e.g. Arjun Sharma"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                University Roll / Reg. No. <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={student.rollNumber || ''}
                onChange={(e) => updateField('rollNumber', e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 font-mono uppercase"
                placeholder="e.g. 21BCSE042"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                College / Institutional Email <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-indigo-500 absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  value={student.collegeEmail || student.email || ''}
                  onChange={(e) => {
                    updateField('collegeEmail', e.target.value);
                    updateField('email', e.target.value);
                  }}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="21bcse042@college.edu.in"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Personal Email ID <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  value={student.personalEmail || ''}
                  onChange={(e) => updateField('personalEmail', e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="candidate.personal@gmail.com"
                />
              </div>
            </div>

            <div className="sm:col-span-2 lg:col-span-1">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Contact / Mobile Number <span className="text-red-500">*</span>
              </label>
              <PhoneInputWithCountry
                value={student.contactNumber || ''}
                onChange={(val) => updateField('contactNumber', val)}
                id="profile-contact-number"
                required={true}
              />
            </div>

            <div className="sm:col-span-2">
              <CollegeCityAutocomplete
                collegeName={student.collegeName || ''}
                cityName={student.collegeCity || ''}
                onChangeCollege={(val) => updateField('collegeName', val)}
                onChangeCity={(val) => updateField('collegeCity', val)}
                id="profile-college-autocomplete"
                label="College / Institute Name"
                showCityInput={true}
                required={true}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Admission Year <span className="text-red-500">*</span>
              </label>
              <select
                value={student.admissionYear || 2025}
                onChange={(e) => {
                  const adm = parseInt(e.target.value);
                  updateField('admissionYear', adm);
                  const duration = activeCourseDef?.durationYears || 4;
                  updateField('graduationYear', adm + duration);
                }}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white font-medium"
              >
                {[2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026].map(year => (
                  <option key={year} value={year}>{year} (Admission)</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Graduation Year <span className="text-red-500">*</span>
              </label>
              <select
                value={student.graduationYear || 2029}
                onChange={(e) => updateField('graduationYear', parseInt(e.target.value))}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white font-medium"
              >
                {[2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030, 2031].map(year => (
                  <option key={year} value={year}>{year} (Graduation)</option>
                ))}
              </select>
            </div>

            {/* Course & Branch Specialization Hierarchy */}
            <div className="sm:col-span-2 p-3.5 bg-indigo-50/50 border border-indigo-100 rounded-xl space-y-3">
              <div className="flex items-center justify-between border-b border-indigo-100 pb-2">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-indigo-600" />
                  <span className="text-xs font-bold text-slate-900">
                    Academic Course & Department Specialization
                  </span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                  {activeCourseDef.degreeLevel} • {activeCourseDef.durationYears} Years Duration
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* 1. Course Selection */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                    <span>Course / Degree Program <span className="text-red-500">*</span></span>
                    <span className="text-[10px] text-slate-500 font-normal">Choose degree first</span>
                  </label>
                  <select
                    value={activeCourse}
                    onChange={(e) => handleProfileCourseChange(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white font-bold text-indigo-950 cursor-pointer shadow-2xs"
                    id="profile-course-select"
                  >
                    {INDIAN_HIGHER_EDUCATION_COURSES.map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.displayName}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 2. Dynamic Branch / Department Selection as per Course */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                    <span>{activeCourseDef.branchSectionLabel} <span className="text-red-500">*</span></span>
                    <span className="text-[10px] text-indigo-600 font-medium">Mapped to {activeCourse}</span>
                  </label>
                  <select
                    value={activeBranches.some(b => b.code === student.branch) ? student.branch : '__CUSTOM__'}
                    onChange={(e) => {
                      if (e.target.value !== '__CUSTOM__') {
                        updateField('branch', e.target.value as Branch);
                      }
                    }}
                    className="w-full px-3 py-2 text-xs border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white font-medium text-slate-900 cursor-pointer shadow-2xs"
                    id="profile-branch-select"
                  >
                    {activeBranches.map((br) => (
                      <option key={br.code} value={br.code}>
                        {br.name} {br.category ? `(${br.category})` : ''}
                      </option>
                    ))}
                    {!activeBranches.some(b => b.code === student.branch) && (
                      <option value="__CUSTOM__">Custom: {student.branch}</option>
                    )}
                  </select>
                </div>
              </div>

              {/* Informative Selection Summary Badge */}
              <div className="flex items-center gap-2 text-[11px] text-slate-700 bg-white px-3 py-1.5 rounded-lg border border-indigo-100 shadow-2xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>
                  Current Specialization: <strong className="text-indigo-900 font-bold">{activeCourse}</strong> in{' '}
                  <strong className="text-slate-900 font-bold">{student.branch}</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Dynamic Academic Standing Banner */}
          {standingCalc && (
            <div className="p-3 bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-indigo-600 shrink-0" />
                <div>
                  <span className="font-bold text-indigo-950">Dynamic Academic Standing: </span>
                  <span className="font-extrabold text-indigo-700">
                    {standingCalc.currentYearLabel}
                  </span>
                  <span className="text-slate-500 text-[11px] block sm:inline sm:ml-1">
                    (Session {standingCalc.academicSession} • Semester {standingCalc.currentSemester})
                  </span>
                </div>
              </div>
              <span className="text-[10px] font-bold text-indigo-700 bg-white px-2.5 py-1 rounded-lg border border-indigo-200 shadow-2xs shrink-0">
                {standingCalc.completedYearName} Completed
              </span>
            </div>
          )}

          {/* Account Security Information Card */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-emerald-600" />
              <div>
                <span className="font-bold text-slate-900">Encrypted Login Credentials Active</span>
                <p className="text-[11px] text-slate-500">
                  Protected with SHA-256 salted password hashing for placement drive safety.
                </p>
              </div>
            </div>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              SHA-256 Secured
            </span>
          </div>

          {/* College Student Proof Verification Section */}
          <div className="pt-4 border-t border-slate-100" id="academic-proof-section">
            <CollegeProofUpload
              proof={student.studentProof}
              onChange={(newProof) => updateField('studentProof', newProof)}
              collegeName={student.collegeName || 'Your College'}
              admissionYear={student.admissionYear || 2025}
              graduationYear={student.graduationYear || 2029}
              verificationStatus={student.verificationStatus}
              verifiedBy={student.verifiedBy}
              verifiedAt={student.verifiedAt}
              adminNotes={student.adminNotes}
              required={true}
            />
          </div>
        </div>

        {/* Academic Eligibility & Cutoffs */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-indigo-600" />
              <h2 className="text-base font-bold text-slate-900">2. Academic Record & Company Cutoff Parameters</h2>
            </div>
            <span className="text-[11px] bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full font-medium">
              Checked by Recruiter Filter Rules
            </span>
          </div>

          {/* Dynamic CGPA Professional Context Alert Card */}
          {standingCalc && (
            <div className="p-3.5 bg-amber-50/90 border border-amber-200/90 rounded-2xl text-xs space-y-1">
              <div className="flex items-center gap-2 font-extrabold text-amber-950">
                <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
                <span>CGPA Metric: {standingCalc.cgpaLabel}</span>
              </div>
              <p className="text-amber-800 text-[11px] leading-relaxed">
                {standingCalc.cgpaProfessionalHelp}
              </p>
              <p className="text-[10px] text-amber-700/80 italic pt-0.5">
                Guideline: {standingCalc.cgpaExplanation}
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                {standingCalc?.cgpaShortLabel || 'CGPA'} (Out of 10.0) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  min="1.0"
                  max="10.0"
                  value={student.GPA}
                  onChange={(e) => updateField('GPA', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 font-mono font-bold text-indigo-700"
                  placeholder="8.72"
                />
                <span className="absolute right-3 top-2 text-[11px] text-slate-400 font-medium">/ 10</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">10th Class Percentage</label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  min="40"
                  max="100"
                  value={student.tenthPercentage ?? 90}
                  onChange={(e) => updateField('tenthPercentage', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 font-mono"
                  placeholder="91.5"
                />
                <span className="absolute right-3 top-2 text-[11px] text-slate-400 font-medium">%</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">12th / Diploma %</label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  min="40"
                  max="100"
                  value={student.twelfthPercentage ?? 88}
                  onChange={(e) => updateField('twelfthPercentage', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 font-mono"
                  placeholder="88.4"
                />
                <span className="absolute right-3 top-2 text-[11px] text-slate-400 font-medium">%</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Active Backlogs</label>
              <input
                type="number"
                min="0"
                max="10"
                value={student.activeBacklogs ?? 0}
                onChange={(e) => updateField('activeBacklogs', parseInt(e.target.value) || 0)}
                className={`w-full px-3 py-2 text-xs border rounded-lg focus:ring-2 font-mono ${
                  (student.activeBacklogs ?? 0) > 0 
                    ? 'border-amber-400 bg-amber-50 text-amber-900 focus:ring-amber-500' 
                    : 'border-slate-300 focus:ring-indigo-500'
                }`}
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">ATS Resume Score</label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={student.atsResumeScore ?? 85}
                  onChange={(e) => updateField('atsResumeScore', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 font-mono"
                  placeholder="88"
                />
                <span className="absolute right-3 top-2 text-[11px] text-slate-400 font-medium">/ 100</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 pt-2 text-xs">
            <label className="inline-flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={student.willingToRelocate ?? true}
                onChange={(e) => updateField('willingToRelocate', e.target.checked)}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
              />
              <span className="font-semibold text-slate-700">Willing to Relocate (Pan-India / Global)</span>
            </label>

            <div className="text-slate-300">|</div>

            <div className="flex items-center gap-1.5 text-slate-600">
              <span className="font-semibold">Graduation Year:</span>
              <input
                type="number"
                value={student.graduationYear}
                onChange={(e) => updateField('graduationYear', parseInt(e.target.value) || 2025)}
                className="w-20 px-2 py-1 text-xs border border-slate-300 rounded-md font-mono"
              />
            </div>
          </div>
        </div>

        {/* 3. Mark Sheets & Achievement Certificates Vault */}
        <div id="student-document-vault-section">
          <AcademicDocumentVault
            student={student}
            onUpdateMarksheets={(ms) => updateField('uploadedMarksheets', ms)}
            onUpdateCertificates={(certs) => updateField('uploadedCertificates', certs)}
          />
        </div>

        {/* Competitive Coding & Developer Profiles */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Terminal className="w-5 h-5 text-indigo-600" />
              <h2 className="text-base font-bold text-slate-900">4. Competitive Coding & Developer Handles</h2>
            </div>
            <span className="text-xs text-indigo-600 font-semibold">Boosts Dream Role Match %</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">LeetCode Username</label>
              <div className="relative">
                <input
                  type="text"
                  value={student.leetcodeHandle || ''}
                  onChange={(e) => updateField('leetcodeHandle', e.target.value)}
                  className="w-full pl-7 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 font-mono"
                  placeholder="arjun_codes"
                />
                <span className="absolute left-2.5 top-2 text-xs text-slate-400">@</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">LeetCode Solved</label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  value={student.leetcodeSolved ?? 0}
                  onChange={(e) => updateField('leetcodeSolved', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 font-mono"
                  placeholder="385"
                />
                <span className="absolute right-3 top-2 text-[11px] text-slate-400 font-medium">problems</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Codeforces / Chef Rating</label>
              <input
                type="text"
                value={student.codeforcesOrChefRating || ''}
                onChange={(e) => updateField('codeforcesOrChefRating', e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 font-mono"
                placeholder="1620 (Expert) / 4-Star"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">GitHub Profile URL</label>
              <div className="relative">
                <input
                  type="text"
                  value={student.githubUrl || ''}
                  onChange={(e) => updateField('githubUrl', e.target.value)}
                  className="w-full pl-7 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 font-mono text-[11px]"
                  placeholder="https://github.com/..."
                />
                <Github className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              </div>
            </div>
          </div>
        </div>

        {/* Core CS Fundamentals */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-600" />
              <h2 className="text-base font-bold text-slate-900">5. Core Computer Science Fundamentals</h2>
            </div>
            <span className="text-xs text-slate-500 font-semibold">
              {(student.coreSubjects || []).length} subjects selected
            </span>
          </div>

          <div>
            <span className="text-[11px] font-semibold text-slate-500 block mb-2">
              Key foundational subjects evaluated in campus technical interview rounds:
            </span>
            <div className="flex flex-wrap gap-2 mb-3">
              {STANDARD_CORE_SUBJECTS.map((subject) => {
                const isSelected = (student.coreSubjects || []).includes(subject);
                return (
                  <button
                    key={subject}
                    type="button"
                    onClick={() => handleToggleCoreSubject(subject)}
                    className={`text-xs px-3 py-1.5 rounded-lg border transition-all cursor-pointer flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-indigo-50 text-indigo-700 border-indigo-300 font-semibold shadow-xs'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {isSelected ? <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" /> : <Plus className="w-3 h-3 text-slate-400" />}
                    <span>{subject}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex gap-2 max-w-md">
              <input
                type="text"
                value={coreSubjectInput}
                onChange={(e) => setCoreSubjectInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCustomCoreSubject();
                  }
                }}
                className="flex-1 px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="Add other subject (e.g. Distributed Systems)..."
              />
              <button
                type="button"
                onClick={handleAddCustomCoreSubject}
                className="px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg cursor-pointer"
              >
                Add
              </button>
            </div>
          </div>
        </div>

        {/* 6. Skills Portfolio */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Code className="w-5 h-5 text-indigo-600" />
              <h2 className="text-base font-bold text-slate-900">6. Technical Skills Portfolio</h2>
            </div>
            <span className="text-xs text-slate-500 font-semibold">{student.skills.length} skills added</span>
          </div>

          <div>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSkill(skillInput);
                  }
                }}
                placeholder="Type a skill (e.g., PyTorch, React, System Design) and press Enter"
                className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
              <button
                type="button"
                onClick={() => handleAddSkill(skillInput)}
                className="px-4 py-2 text-xs font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 rounded-lg cursor-pointer"
              >
                Add Skill
              </button>
            </div>

            {/* Existing Skills Tags */}
            <div className="flex flex-wrap gap-1.5 mb-4">
              {student.skills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-800 border border-indigo-100"
                >
                  <span>{skill}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                    className="hover:text-red-600 cursor-pointer text-indigo-400"
                    title="Remove skill"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>

            {/* Quick suggested chips */}
            <div>
              <span className="text-[11px] font-semibold text-slate-400 block mb-1.5">
                Suggested Campus Recruitment Competencies:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {COMMON_SKILLS.filter(s => !student.skills.includes(s)).slice(0, 10).map((skill) => (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => handleAddSkill(skill)}
                    className="text-[11px] px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200 transition-colors cursor-pointer"
                  >
                    + {skill}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 7. Academic Projects */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <FolderGit2 className="w-5 h-5 text-indigo-600" />
              <h2 className="text-base font-bold text-slate-900">7. Projects (Weights TF-IDF Corpus)</h2>
            </div>
            <button
              type="button"
              onClick={handleAddProject}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Project</span>
            </button>
          </div>

          <div className="space-y-4">
            {student.projects.map((proj, idx) => (
              <div key={proj.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 relative">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-700 uppercase">Project #{idx + 1}</span>
                  {student.projects.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveProject(proj.id)}
                      className="text-slate-400 hover:text-red-600 p-1 cursor-pointer"
                      title="Remove project"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Project Title</label>
                    <input
                      type="text"
                      value={proj.title}
                      onChange={(e) => handleUpdateProject(proj.id, 'title', e.target.value)}
                      className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                      placeholder="e.g. Placement Recommendation System"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Technologies (comma separated)</label>
                    <input
                      type="text"
                      value={proj.technologies.join(', ')}
                      onChange={(e) => handleUpdateProject(proj.id, 'technologies', e.target.value.split(',').map(t => t.trim()).filter(Boolean))}
                      className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white font-mono text-[11px]"
                      placeholder="Python, Scikit-learn, React.js"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Description</label>
                  <textarea
                    rows={2}
                    value={proj.description}
                    onChange={(e) => handleUpdateProject(proj.id, 'description', e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                    placeholder="Brief description of the problem solved, architecture and outcome..."
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 8. Student Achievements, Honors & Hackathons */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 gap-2">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              <div>
                <h2 className="text-base font-bold text-slate-900">8. Achievements, Honors & Competitions</h2>
                <p className="text-[11px] text-slate-500">
                  Hackathons, Coding Ranks, Research Papers, and Accolades (Boosts Placement Ensemble Score).
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleOpenAddAchievement}
              id="profile-add-achievement-btn"
              className="px-3.5 py-1.5 text-xs font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 shadow-2xs w-fit"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Achievement</span>
            </button>
          </div>

          {/* Feature Highlight Note */}
          <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3 flex items-start gap-2.5 text-xs text-amber-900">
            <Medal className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-[11px] leading-relaxed">
              <strong>Profile evidence booster:</strong> Each verified achievement adds up to +2.0 bonus points (max +6 pts) to the deterministic criteria fit and is directly cited in recruiter match explanations.
            </div>
          </div>

          {/* Achievements Cards List */}
          {(!student.achievements || student.achievements.length === 0) ? (
            <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50 space-y-2">
              <Trophy className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-xs font-semibold text-slate-700">No achievements recorded yet</p>
              <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                Add your hackathon prizes, coding ranks, research papers, or institute honors to strengthen your academic profile.
              </p>
              <button
                type="button"
                onClick={handleOpenAddAchievement}
                className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-600 bg-white border border-indigo-200 rounded-lg hover:bg-indigo-50 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add First Achievement</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {student.achievements.map((ach) => (
                <div 
                  key={ach.id} 
                  className="p-4 bg-slate-50/90 rounded-xl border border-slate-200 hover:border-amber-300 hover:bg-amber-50/30 transition-all space-y-2.5 relative group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 border border-amber-200">
                          {ach.category}
                        </span>
                        {ach.rank && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100">
                            {ach.rank}
                          </span>
                        )}
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                        {ach.title}
                      </h4>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleEditAchievement(ach)}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-white transition-colors cursor-pointer"
                        title="Edit achievement"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteAchievement(ach.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-white transition-colors cursor-pointer"
                        title="Delete achievement"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
                    <span className="flex items-center gap-1">
                      <Building className="w-3 h-3 text-slate-400" />
                      <span>{ach.organization}</span>
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      <span>{ach.date}</span>
                    </span>
                  </div>

                  {ach.description && (
                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                      {ach.description}
                    </p>
                  )}

                  {ach.proofUrl && (
                    <a
                      href={ach.proofUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-medium text-indigo-600 hover:text-indigo-700 hover:underline pt-0.5"
                    >
                      <span>Verification Credential</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 9. Certifications & Experience */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Certifications */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-indigo-600" />
                <h2 className="text-base font-bold text-slate-900">9. Certifications</h2>
              </div>
              <button
                type="button"
                onClick={handleAddCert}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>

            <div className="space-y-3">
              {student.certifications.map((cert) => (
                <div key={cert.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 relative">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 space-y-2">
                      <input
                        type="text"
                        value={cert.name}
                        onChange={(e) => handleUpdateCert(cert.id, 'name', e.target.value)}
                        placeholder="Certification name"
                        className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white font-medium"
                      />
                      <input
                        type="text"
                        value={cert.issuingOrganization}
                        onChange={(e) => handleUpdateCert(cert.id, 'issuingOrganization', e.target.value)}
                        placeholder="Issuing body (e.g. Stanford / Google)"
                        className="w-full px-2.5 py-1 text-[11px] border border-slate-200 rounded-lg bg-white text-slate-600"
                      />
                    </div>
                    {student.certifications.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveCert(cert.id)}
                        className="text-slate-400 hover:text-red-600 ml-2 p-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Experience */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Briefcase className="w-5 h-5 text-indigo-600" />
              <h2 className="text-base font-bold text-slate-900">Experience & Internships</h2>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Experience Level</label>
                <select
                  value={student.experienceLevel}
                  onChange={(e) => updateField('experienceLevel', e.target.value as ExperienceLevel)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                >
                  <option value="Entry Level (Fresher)">Entry Level (Fresher - Campus Placements)</option>
                  <option value="0-1 Years">0-1 Years (Prior Internships / Apprenticeship)</option>
                  <option value="1-2 Years">1-2 Years</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Internship Details</label>
                <textarea
                  rows={3}
                  value={student.experience}
                  onChange={(e) => updateField('experience', e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                  placeholder="Describe internship role, company, technologies used..."
                />
              </div>
            </div>
          </div>
        </div>

        {/* 10. Leadership & Extracurricular Achievements */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-indigo-600" />
              <h2 className="text-base font-bold text-slate-900">10. Leadership & Extracurricular Highlights</h2>
            </div>
            <span className="text-xs text-slate-500 font-semibold">
              {(student.leadershipAndExtracurriculars || []).length} highlights added
            </span>
          </div>

          <div className="space-y-3">
            <div className="flex gap-2 max-w-md">
              <input
                type="text"
                value={activityInput}
                onChange={(e) => setActivityInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddActivity();
                  }
                }}
                className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g. AI Club Lead / Smart India Hackathon Finalist..."
              />
              <button
                type="button"
                onClick={handleAddActivity}
                className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg cursor-pointer"
              >
                Add Highlight
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {(student.leadershipAndExtracurriculars || []).map((item, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200 rounded-lg"
                >
                  <Trophy className="w-3.5 h-3.5 text-amber-500" />
                  <span>{item}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveActivity(item)}
                    className="text-slate-400 hover:text-slate-800 p-0.5 cursor-pointer ml-1"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* 11. Placement Preferences */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Sliders className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-bold text-slate-900">11. Placement Preferences</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Preferred Role</label>
              <input
                type="text"
                value={student.preferred_role}
                onChange={(e) => updateField('preferred_role', e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                placeholder="e.g. Software Developer / Data Analyst"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Preferred Location</label>
              <input
                type="text"
                value={student.preferred_location}
                onChange={(e) => updateField('preferred_location', e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                placeholder="e.g. Bangalore / Hyderabad / Pune"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Job Type</label>
              <select
                value={student.job_type}
                onChange={(e) => updateField('job_type', e.target.value as JobType)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
              >
                <option value="Full-Time">Full-Time (FTE)</option>
                <option value="Internship">Internship Only</option>
                <option value="Intern + PPO">Intern + Pre-Placement Offer (PPO)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Bottom Action Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-slate-900 text-white rounded-2xl shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold">Ready for Model Inference?</h4>
              <p className="text-xs text-slate-400">
                Feeds profile into TF-IDF vectorizer and deterministic multi-criteria scoring.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleOpenAddAchievement}
              className="w-full sm:w-auto px-4 py-2.5 text-xs font-bold text-amber-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl border border-amber-500/30 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>+ Add Achievement</span>
            </button>

            <button
              type="button"
              onClick={() => setShowPhotoModal(true)}
              className="w-full sm:w-auto px-4 py-2.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Camera className="w-3.5 h-3.5 text-indigo-400" />
              <span>Update Photo</span>
            </button>

            {isVerified ? (
              <button
                type="button"
                onClick={onGenerateRecommendations}
                id="profile-generate-btn-bottom"
                className="w-full sm:w-auto px-6 py-2.5 text-xs font-extrabold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-98"
              >
                <span>Generate Recommendations</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <div className="flex flex-col sm:flex-row items-center gap-2">
                <span className="text-[11px] text-amber-300 font-medium flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Awaiting Admin Approval</span>
                </span>
                <button
                  type="button"
                  disabled
                  id="profile-generate-btn-bottom-disabled"
                  className="w-full sm:w-auto px-5 py-2.5 text-xs font-bold text-slate-400 bg-slate-800 rounded-xl border border-slate-700 cursor-not-allowed flex items-center justify-center gap-1.5 opacity-70"
                  title="Campus recommendations and drive applications unlock after administrator approves your submitted documents."
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Recommendations Locked</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals for Photo Capture and Achievement Addition */}
      {showPhotoModal && (
        <PhotoCaptureModal
          currentPhoto={student.avatarUrl}
          onSavePhoto={handlePhotoCaptured}
          onClose={() => setShowPhotoModal(false)}
        />
      )}

      {showAchievementModal && (
        <AchievementModal
          initialData={editingAchievement}
          onSave={handleSaveAchievement}
          onClose={() => {
            setShowAchievementModal(false);
            setEditingAchievement(null);
          }}
        />
      )}

      {showCertificateModal && (
        <PlacementCertificateModal
          student={student}
          onClose={() => setShowCertificateModal(false)}
        />
      )}
    </div>
  );
};
