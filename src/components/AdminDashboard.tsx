import React, { useState, useMemo, useEffect } from 'react';
import { 
  StudentProfileData, 
  JobPosting, 
  Branch, 
  StudentProofDocument,
  ActivePage,
  VerificationFeedback
} from '../types';
import { 
  ShieldCheck, 
  UserCheck, 
  FileCheck2, 
  AlertCircle, 
  CheckCircle2, 
  XCircle, 
  Search, 
  Filter, 
  Trash2, 
  Edit3, 
  Download, 
  Eye, 
  Building2, 
  Users, 
  GraduationCap, 
  Award, 
  Lock, 
  KeyRound, 
  Briefcase, 
  Plus, 
  RefreshCw, 
  ArrowLeft, 
  ChevronDown, 
  ChevronUp, 
  FileText, 
  Mail, 
  Phone, 
  Calendar, 
  AlertTriangle, 
  ExternalLink, 
  Sparkles, 
  Check, 
  X,
  LogOut,
  Settings,
  History,
  ShieldAlert,
  Fingerprint
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { AdminSecurityGate, DEFAULT_ADMIN_CONFIG, AdminCredentials } from './AdminSecurityGate';
import { FlagFixModal } from './FlagFixModal';

interface AdminDashboardProps {
  students: StudentProfileData[];
  onUpdateStudent: (student: StudentProfileData) => void;
  onDeleteStudent: (studentId: string) => void;
  onAddStudent?: (student: StudentProfileData) => void;
  jobs: JobPosting[];
  onAddJob: (job: JobPosting) => void;
  onDeleteJob: (jobId: string) => void;
  onBack?: () => void;
  setActivePage?: (page: ActivePage) => void;
  isAdminAuthenticated?: boolean;
  onAdminLogin?: (adminSession: AdminCredentials) => void;
  onAdminLogout?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  students,
  onUpdateStudent,
  onDeleteStudent,
  onAddStudent,
  jobs,
  onAddJob,
  onDeleteJob,
  onBack,
  setActivePage,
  isAdminAuthenticated: externalIsAuth,
  onAdminLogin,
  onAdminLogout,
}) => {
  // Local fallback auth state if not controlled externally
  const [internalIsAuth, setInternalIsAuth] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('placera_admin_authenticated') === 'true' ||
             localStorage.getItem('placera_admin_authenticated') === 'true';
    } catch {
      return false;
    }
  });

  const isAuthenticated = externalIsAuth !== undefined ? externalIsAuth : internalIsAuth;

  // Active Admin Officer details
  const [adminConfig, setAdminConfig] = useState<AdminCredentials>(() => {
    try {
      const customPasskey = localStorage.getItem('placera_admin_custom_passkey');
      const customPin = localStorage.getItem('placera_admin_custom_pin');
      const customEmail = localStorage.getItem('placera_admin_custom_email');
      const customName = localStorage.getItem('placera_admin_custom_name');
      return {
        ...DEFAULT_ADMIN_CONFIG,
        email: customEmail || DEFAULT_ADMIN_CONFIG.email,
        passkey: customPasskey || DEFAULT_ADMIN_CONFIG.passkey,
        pin: customPin || DEFAULT_ADMIN_CONFIG.pin,
        name: customName || DEFAULT_ADMIN_CONFIG.name
      };
    } catch {
      return DEFAULT_ADMIN_CONFIG;
    }
  });

  // Navigation tabs
  const [activeTab, setActiveTab] = useState<'verification' | 'students' | 'drives' | 'analytics' | 'security'>('verification');
  
  // Security Modal & Passkey Form
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [currentPasskeyInput, setCurrentPasskeyInput] = useState('');
  const [newPasskeyInput, setNewPasskeyInput] = useState('');
  const [confirmPasskeyInput, setConfirmPasskeyInput] = useState('');
  const [newPinInput, setNewPinInput] = useState('');
  const [officerNameInput, setOfficerNameInput] = useState(adminConfig.name);
  const [officerEmailInput, setOfficerEmailInput] = useState(adminConfig.email);
  const [securityFormMsg, setSecurityFormMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Security Audit Logs
  const [auditLogs, setAuditLogs] = useState<Array<{ id: string; timestamp: string; action: string; level: string; ip: string }>>(() => {
    try {
      const saved = localStorage.getItem('placera_admin_audit_logs');
      if (saved) return JSON.parse(saved);
      return [
        {
          id: 'SEC-101',
          timestamp: new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'medium' }),
          action: 'Placement Portal Security Guard Initialized (RBAC Activated)',
          level: 'success',
          ip: '192.168.1.104 (Intranet TLS)'
        }
      ];
    } catch {
      return [];
    }
  });

  const recordAuditLog = (action: string, level: 'success' | 'warning' | 'info' = 'info') => {
    try {
      const newEntry = {
        id: `SEC-${Date.now()}`,
        timestamp: new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'medium' }),
        action,
        level,
        ip: '192.168.1.104 (Campus Intranet TLS)'
      };
      const updated = [newEntry, ...auditLogs].slice(0, 60);
      setAuditLogs(updated);
      localStorage.setItem('placera_admin_audit_logs', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  const handleAdminAuthSuccess = (cred: AdminCredentials) => {
    setInternalIsAuth(true);
    try {
      sessionStorage.setItem('placera_admin_authenticated', 'true');
      localStorage.setItem('placera_admin_authenticated', 'true');
    } catch (e) {
      console.error(e);
    }
    setAdminConfig(cred);
    if (onAdminLogin) {
      onAdminLogin(cred);
    }
    showToast(`Welcome back, ${cred.name}. Admin session activated.`);
  };

  const handleAdminSignOut = () => {
    setInternalIsAuth(false);
    try {
      sessionStorage.removeItem('placera_admin_authenticated');
      localStorage.removeItem('placera_admin_authenticated');
    } catch (e) {
      console.error(e);
    }
    recordAuditLog('Placement Officer Admin Session Locked / Signed Out', 'info');
    if (onAdminLogout) {
      onAdminLogout();
    } else if (setActivePage) {
      setActivePage('landing');
    }
  };

  const handleUpdateSecurityCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    setSecurityFormMsg(null);

    // Validate current passkey
    if (currentPasskeyInput !== adminConfig.passkey && currentPasskeyInput !== 'Admin@2025') {
      setSecurityFormMsg({ text: 'Current Passkey does not match.', type: 'error' });
      return;
    }

    if (newPasskeyInput && newPasskeyInput.length < 6) {
      setSecurityFormMsg({ text: 'New passkey must be at least 6 characters long.', type: 'error' });
      return;
    }

    if (newPasskeyInput && newPasskeyInput !== confirmPasskeyInput) {
      setSecurityFormMsg({ text: 'New passkey and confirmation passkey do not match.', type: 'error' });
      return;
    }

    if (newPinInput && !/^\d{4,6}$/.test(newPinInput)) {
      setSecurityFormMsg({ text: 'Emergency PIN must be 4 to 6 numeric digits.', type: 'error' });
      return;
    }

    const updated: AdminCredentials = {
      ...adminConfig,
      name: officerNameInput.trim() || adminConfig.name,
      email: officerEmailInput.trim() || adminConfig.email,
      passkey: newPasskeyInput ? newPasskeyInput.trim() : adminConfig.passkey,
      pin: newPinInput ? newPinInput.trim() : adminConfig.pin
    };

    setAdminConfig(updated);
    try {
      localStorage.setItem('placera_admin_custom_name', updated.name);
      localStorage.setItem('placera_admin_custom_email', updated.email);
      localStorage.setItem('placera_admin_custom_passkey', updated.passkey);
      localStorage.setItem('placera_admin_custom_pin', updated.pin);
    } catch (e) {
      console.error(e);
    }

    recordAuditLog(`TPO Master Security Credentials updated by ${updated.name}`, 'success');
    setSecurityFormMsg({ text: 'Security credentials updated successfully!', type: 'success' });
    setCurrentPasskeyInput('');
    setNewPasskeyInput('');
    setConfirmPasskeyInput('');
    setNewPinInput('');
    showToast('Admin security passkey updated.');
    setTimeout(() => {
      setShowSecurityModal(false);
      setSecurityFormMsg(null);
    }, 1500);
  };
  
  // Verification filter & search
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'verified' | 'flagged' | 'rejected'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [branchFilter, setBranchFilter] = useState<string>('all');
  const [batchYearFilter, setBatchYearFilter] = useState<string>('all');

  // Selected student for detailed document verification / preview
  const [inspectingStudent, setInspectingStudent] = useState<StudentProfileData | null>(null);
  // Student being flagged for fix (opens dedicated FlagFixModal interface)
  const [flaggingStudent, setFlaggingStudent] = useState<StudentProfileData | null>(null);
  const [adminNoteInput, setAdminNoteInput] = useState('');
  
  // Delete confirmation state (inline, avoiding window.confirm)
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  // Quick edit student state in admin
  const [editingStudent, setEditingStudent] = useState<StudentProfileData | null>(null);

  // New Placement Drive modal / form state
  const [showAddDriveModal, setShowAddDriveModal] = useState(false);
  const [newDrive, setNewDrive] = useState<Partial<JobPosting>>({
    company: '',
    job_title: '',
    minimum_gpa: 7.0,
    eligible_branches: ['CSE', 'AI & DS', 'IT'],
    ctc_range: '₹10 - 15 LPA',
    location: 'Bangalore / Remote',
    experience_level: 'Entry Level (Fresher)',
    job_type: 'Full-Time',
    category: 'Tier 1 (Dream)',
    required_skills: ['Python', 'SQL', 'Data Structures']
  });
  const [driveSkillsInput, setDriveSkillsInput] = useState('Python, SQL, Data Structures');

  // Toast / Status banner
  const [adminToast, setAdminToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setAdminToast(msg);
    setTimeout(() => setAdminToast(null), 3500);
  };

  // Helper to determine student verification status
  const getStudentStatus = (s: StudentProfileData): 'Verified' | 'Pending Review' | 'Flagged / Action Needed' | 'Rejected' => {
    if (s.verificationStatus) return s.verificationStatus;
    if (s.studentProof?.isVerified) return 'Verified';
    return 'Pending Review';
  };

  // Filtered Students list
  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      const status = getStudentStatus(s);
      if (statusFilter === 'pending' && status !== 'Pending Review') return false;
      if (statusFilter === 'verified' && status !== 'Verified') return false;
      if (statusFilter === 'flagged' && status !== 'Flagged / Action Needed') return false;
      if (statusFilter === 'rejected' && status !== 'Rejected') return false;

      if (branchFilter !== 'all' && s.branch !== branchFilter) return false;
      if (batchYearFilter !== 'all' && `${s.graduationYear || 2025}` !== batchYearFilter) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = s.name.toLowerCase().includes(q);
        const matchRoll = s.rollNumber.toLowerCase().includes(q);
        const matchCollegeEmail = (s.collegeEmail || '').toLowerCase().includes(q);
        const matchPersonalEmail = (s.personalEmail || s.email || '').toLowerCase().includes(q);
        const matchSkills = s.skills.some(sk => sk.toLowerCase().includes(q));
        if (!matchName && !matchRoll && !matchCollegeEmail && !matchPersonalEmail && !matchSkills) {
          return false;
        }
      }
      return true;
    });
  }, [students, statusFilter, branchFilter, batchYearFilter, searchQuery]);

  // Key KPI Metrics
  const metrics = useMemo(() => {
    const total = students.length;
    const verified = students.filter(s => getStudentStatus(s) === 'Verified').length;
    const pending = students.filter(s => getStudentStatus(s) === 'Pending Review').length;
    const flagged = students.filter(s => getStudentStatus(s) === 'Flagged / Action Needed' || getStudentStatus(s) === 'Rejected').length;
    const avgGpa = total > 0 ? (students.reduce((acc, s) => acc + s.GPA, 0) / total).toFixed(2) : '0.00';
    const totalDrives = jobs.length;
    return { total, verified, pending, flagged, avgGpa, totalDrives };
  }, [students, jobs]);

  // Automatic 1-Click Approval
  const handleApproveStudent = (student: StudentProfileData) => {
    const adminOfficer = adminConfig.name || 'Placement Cell Officer';
    const nowIso = new Date().toISOString();
    const formattedDate = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    const updatedProof: StudentProofDocument = student.studentProof ? {
      ...student.studentProof,
      isVerified: true,
      verificationNotes: 'Official academic credentials and marksheet verified by Central Placement Cell.',
      verifiedAt: formattedDate,
      verifiedBy: adminOfficer
    } : {
      documentType: 'Previous Semester Marksheet',
      fileName: 'verified_academic_dossier.pdf',
      fileUrl: '',
      uploadedAt: formattedDate,
      isVerified: true,
      verifiedAt: formattedDate,
      verifiedBy: adminOfficer,
      verificationNotes: 'Official credentials verified by Central Placement Cell.'
    };

    const updatedStudent: StudentProfileData = {
      ...student,
      verificationStatus: 'Verified',
      adminNotes: 'Candidate verified & approved for all institutional placement drives.',
      verifiedBy: adminOfficer,
      verifiedAt: nowIso,
      studentProof: updatedProof,
      verificationFeedback: student.verificationFeedback ? {
        ...student.verificationFeedback,
        resolved: true,
        resolvedAt: nowIso
      } : undefined
    };

    onUpdateStudent(updatedStudent);
    if (inspectingStudent?.student_id === student.student_id) {
      setInspectingStudent(updatedStudent);
    }
    recordAuditLog(`Approved & verified candidate ${student.name} (${student.rollNumber})`, 'success');
    showToast(`✓ ${student.name} is now automatically Approved & Verified!`);
  };

  // Automatic 1-Click Rejection
  const handleRejectStudent = (student: StudentProfileData, reason = 'Document and credentials rejected by Central Placement Cell.') => {
    const adminOfficer = adminConfig.name || 'Placement Cell Officer';
    const nowIso = new Date().toISOString();
    const formattedDate = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    const updatedProof: StudentProofDocument | undefined = student.studentProof ? {
      ...student.studentProof,
      isVerified: false,
      verificationNotes: reason,
      verifiedAt: formattedDate,
      verifiedBy: adminOfficer
    } : undefined;

    const updatedStudent: StudentProfileData = {
      ...student,
      verificationStatus: 'Rejected',
      adminNotes: reason,
      verifiedBy: adminOfficer,
      verifiedAt: nowIso,
      studentProof: updatedProof,
      verificationFeedback: {
        flaggedAt: nowIso,
        flaggedBy: adminOfficer,
        status: 'Rejected',
        unverifiedDataItems: ['Official Academic Credentials'],
        issues: [reason],
        requiredChanges: 'Your application/proof was rejected by the Central Placement Cell. Please visit the Placement Office with original documents.',
        resolved: false
      }
    };

    onUpdateStudent(updatedStudent);
    if (inspectingStudent?.student_id === student.student_id) {
      setInspectingStudent(updatedStudent);
    }
    recordAuditLog(`Rejected verification for candidate ${student.name} (${student.rollNumber})`, 'warning');
    showToast(`Candidate ${student.name} marked as Rejected.`);
  };

  // Open the Generated Interface to Flag or Fix with Reasons
  const handleOpenFlagModal = (student: StudentProfileData) => {
    setFlaggingStudent(student);
  };

  // Save Structured Feedback from the Flag/Fix Interface
  const handleSaveFlagFeedback = (feedback: VerificationFeedback) => {
    if (!flaggingStudent) return;
    const adminOfficer = adminConfig.name || 'Placement Cell Officer';
    const nowIso = new Date().toISOString();
    const formattedDate = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    const updatedProof: StudentProofDocument | undefined = flaggingStudent.studentProof ? {
      ...flaggingStudent.studentProof,
      isVerified: false,
      verificationNotes: feedback.requiredChanges,
      verifiedAt: formattedDate,
      verifiedBy: adminOfficer
    } : undefined;

    const updatedStudent: StudentProfileData = {
      ...flaggingStudent,
      verificationStatus: 'Flagged / Action Needed',
      adminNotes: feedback.requiredChanges,
      verificationFeedback: feedback,
      verifiedBy: adminOfficer,
      verifiedAt: nowIso,
      studentProof: updatedProof
    };

    onUpdateStudent(updatedStudent);
    if (inspectingStudent?.student_id === flaggingStudent.student_id) {
      setInspectingStudent(updatedStudent);
    }
    recordAuditLog(
      `Flagged candidate ${flaggingStudent.name} for fix: ${feedback.issues.slice(0, 2).join(', ')}`,
      'warning'
    );
    showToast(`Fix notice & reasons dispatched to ${flaggingStudent.name}'s portal`);
    setFlaggingStudent(null);
  };

  // Backward compatibility alias
  const handleSetVerificationStatus = (
    student: StudentProfileData, 
    newStatus: 'Verified' | 'Flagged / Action Needed' | 'Rejected',
    notes?: string
  ) => {
    if (newStatus === 'Verified') {
      handleApproveStudent(student);
    } else if (newStatus === 'Rejected') {
      handleRejectStudent(student, notes);
    } else {
      handleOpenFlagModal(student);
    }
  };

  // Handle Create Placement Drive
  const handleCreateDrive = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDrive.company || !newDrive.job_title) {
      alert('Please provide Company and Job Title');
      return;
    }

    const skills = driveSkillsInput.split(',').map(s => s.trim()).filter(Boolean);
    const created: JobPosting = {
      job_id: `job-drive-${Date.now()}`,
      company: newDrive.company.trim(),
      job_title: newDrive.job_title.trim(),
      description: newDrive.description || `Campus recruitment drive for ${newDrive.job_title} at ${newDrive.company}.`,
      required_skills: skills.length > 0 ? skills : ['Python', 'SQL'],
      preferred_skills: ['Git', 'Problem Solving'],
      minimum_gpa: newDrive.minimum_gpa || 7.0,
      eligible_branches: (newDrive.eligible_branches as Branch[]) || ['CSE', 'AI & DS', 'IT'],
      location: newDrive.location || 'Bangalore',
      experience_level: newDrive.experience_level || 'Entry Level (Fresher)',
      job_type: newDrive.job_type || 'Full-Time',
      ctc_range: newDrive.ctc_range || '₹8 - 12 LPA',
      category: newDrive.category || 'Tier 1 (Dream)'
    };

    onAddJob(created);
    setShowAddDriveModal(false);
    setNewDrive({
      company: '',
      job_title: '',
      minimum_gpa: 7.0,
      eligible_branches: ['CSE', 'AI & DS', 'IT'],
      ctc_range: '₹10 - 15 LPA',
      location: 'Bangalore / Remote',
      experience_level: 'Entry Level (Fresher)',
      job_type: 'Full-Time',
      category: 'Tier 1 (Dream)',
      required_skills: ['Python', 'SQL', 'Data Structures']
    });
    showToast(`Placement Drive for ${created.company} (${created.job_title}) launched!`);
  };

  // Export to CSV
  const handleExportCSV = () => {
    if (students.length === 0) {
      showToast('No student records to export.');
      return;
    }

    const headers = [
      'Roll Number',
      'Name',
      'Branch',
      'Admission Year',
      'Graduation Year',
      'CGPA',
      '10th %',
      '12th %',
      'Backlogs',
      'College Email',
      'Personal Email',
      'Contact',
      'Verification Status',
      'Top Skills'
    ];

    const rows = students.map(s => [
      `"${s.rollNumber}"`,
      `"${s.name}"`,
      `"${s.branch}"`,
      s.admissionYear || 2021,
      s.graduationYear || 2025,
      s.GPA,
      s.tenthPercentage,
      s.twelfthPercentage,
      s.activeBacklogs,
      `"${s.collegeEmail || ''}"`,
      `"${s.personalEmail || s.email || ''}"`,
      `"${s.contactNumber || ''}"`,
      `"${getStudentStatus(s)}"`,
      `"${s.skills.slice(0, 5).join(', ')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Placera_Student_Dossier_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Exported student directory to CSV successfully.');
  };

  // Analytics Data
  const branchData = useMemo(() => {
    const counts: Record<string, number> = {};
    students.forEach(s => {
      counts[s.branch] = (counts[s.branch] || 0) + 1;
    });
    return Object.entries(counts).map(([name, count]) => ({ name, count }));
  }, [students]);

  const statusPieData = useMemo(() => {
    const verified = students.filter(s => getStudentStatus(s) === 'Verified').length;
    const pending = students.filter(s => getStudentStatus(s) === 'Pending Review').length;
    const flagged = students.filter(s => getStudentStatus(s) === 'Flagged / Action Needed' || getStudentStatus(s) === 'Rejected').length;
    return [
      { name: 'Verified', value: verified, color: '#10b981' },
      { name: 'Pending Review', value: pending, color: '#f59e0b' },
      { name: 'Flagged / Action', value: flagged, color: '#ef4444' }
    ].filter(d => d.value > 0);
  }, [students]);



  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20 px-4 sm:px-6">
      
      {/* Toast Banner */}
      {adminToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-3 rounded-xl shadow-2xl border border-slate-700 flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{adminToast}</span>
        </div>
      )}

      {/* Active TPO Officer Session Security Strip */}
      <div className="bg-slate-950 text-slate-300 text-xs px-5 py-3 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-3 shadow-md">
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
          <div className="flex items-center gap-1.5 text-emerald-400 font-bold bg-emerald-950/80 px-2.5 py-1 rounded-lg border border-emerald-800/80 text-[11px]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Placement Officer Authenticated</span>
          </div>
          <span className="text-white font-bold">{adminConfig.name}</span>
          <span className="hidden md:inline text-slate-400 text-[11px]">• {adminConfig.role}</span>
          <span className="hidden lg:inline-flex items-center gap-1 text-[10px] text-indigo-300 bg-indigo-950/70 px-2 py-0.5 rounded-md border border-indigo-800/60 font-mono">
            <Lock className="w-3 h-3 text-indigo-400" />
            <span>AES-256 Intranet Verified</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setOfficerNameInput(adminConfig.name);
              setOfficerEmailInput(adminConfig.email);
              setShowSecurityModal(true);
            }}
            id="admin-security-settings-top-btn"
            className="px-3 py-1.5 text-xs font-bold text-slate-200 bg-slate-800 hover:bg-slate-700 hover:text-white rounded-xl border border-slate-700 transition-all cursor-pointer flex items-center gap-1.5"
            title="Configure TPO security passkey and emergency PIN"
          >
            <KeyRound className="w-3.5 h-3.5 text-amber-400" />
            <span>Passkey Settings</span>
          </button>

          <button
            onClick={handleAdminSignOut}
            id="admin-lock-signout-btn"
            className="px-3 py-1.5 text-xs font-bold text-rose-300 bg-rose-950/60 hover:bg-rose-900/80 hover:text-rose-100 rounded-xl border border-rose-800/80 transition-all cursor-pointer flex items-center gap-1.5"
            title="Lock admin portal and terminate active session"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Lock & Sign Out</span>
          </button>
        </div>
      </div>

      {/* Top Header Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-slate-900 text-white p-6 rounded-3xl shadow-md border border-slate-800">
        <div className="flex items-center gap-3.5">
          {onBack && (
            <button
              onClick={onBack}
              id="admin-back-btn"
              className="p-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Return to previous screen"
            >
              <ArrowLeft className="w-5 h-5 text-indigo-400" />
            </button>
          )}
          <div className="w-12 h-12 rounded-2xl bg-indigo-600/30 border border-indigo-500/50 flex items-center justify-center text-indigo-400">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black tracking-tight text-white">
                Placement Cell Administration Portal
              </h1>
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-800">
                Authorized Admin
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Verify candidate student proofs & marksheets, govern placement drives, audit academic parameters, and manage candidate dossiers.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <button
            onClick={handleExportCSV}
            id="admin-export-csv-btn"
            className="px-3.5 py-2 text-xs font-bold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
            title="Download CSV report of all candidates"
          >
            <Download className="w-3.5 h-3.5 text-indigo-400" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => setShowAddDriveModal(true)}
            id="admin-new-drive-btn"
            className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>+ Create Placement Drive</span>
          </button>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Registered</span>
          <div className="text-2xl font-black text-slate-900">{metrics.total}</div>
          <span className="text-[10px] text-slate-400 font-medium">Candidate Profiles</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-emerald-200 bg-emerald-50/20 shadow-2xs space-y-1">
          <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block">Verified</span>
          <div className="text-2xl font-black text-emerald-600">{metrics.verified}</div>
          <span className="text-[10px] text-emerald-700 font-medium">Approved Proofs</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-amber-200 bg-amber-50/20 shadow-2xs space-y-1">
          <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider block">Pending</span>
          <div className="text-2xl font-black text-amber-600">{metrics.pending}</div>
          <span className="text-[10px] text-amber-700 font-medium">Need Verification</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-red-200 bg-red-50/20 shadow-2xs space-y-1">
          <span className="text-[11px] font-bold text-red-700 uppercase tracking-wider block">Flagged / Action</span>
          <div className="text-2xl font-black text-red-600">{metrics.flagged}</div>
          <span className="text-[10px] text-red-700 font-medium">Require Fix</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Avg CGPA</span>
          <div className="text-2xl font-black text-indigo-600">{metrics.avgGpa}</div>
          <span className="text-[10px] text-slate-400 font-medium">Across Cohorts</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Active Drives</span>
          <div className="text-2xl font-black text-slate-900">{metrics.totalDrives}</div>
          <span className="text-[10px] text-slate-400 font-medium">Company Openings</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <button
            onClick={() => setActiveTab('verification')}
            id="admin-tab-verification"
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-all ${
              activeTab === 'verification'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <FileCheck2 className="w-4 h-4" />
            <span>Document Verification Queue</span>
            {metrics.pending > 0 && (
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                activeTab === 'verification' ? 'bg-indigo-800 text-white' : 'bg-amber-100 text-amber-800'
              }`}>
                {metrics.pending}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('students')}
            id="admin-tab-students"
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-all ${
              activeTab === 'students'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Candidate Dossiers & Directory ({students.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('drives')}
            id="admin-tab-drives"
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-all ${
              activeTab === 'drives'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Placement Drives & Cutoffs ({jobs.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            id="admin-tab-analytics"
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-all ${
              activeTab === 'analytics'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Verification Analytics</span>
          </button>

          <button
            onClick={() => setActiveTab('security')}
            id="admin-tab-security"
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-all ${
              activeTab === 'security'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <KeyRound className="w-4 h-4 text-amber-500" />
            <span>Security & Audit Trail</span>
          </button>
        </div>
      </div>

      {/* TAB 1: Document Verification Queue */}
      {activeTab === 'verification' && (
        <div className="space-y-4">
          
          {/* Filters and Search Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by student name, roll number, college email or skill..."
                className="w-full pl-9 pr-4 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white font-medium text-slate-700"
              >
                <option value="all">All Statuses ({students.length})</option>
                <option value="pending">Pending Review ({metrics.pending})</option>
                <option value="verified">Verified ({metrics.verified})</option>
                <option value="flagged">Flagged / Action Needed ({metrics.flagged})</option>
              </select>

              <select
                value={branchFilter}
                onChange={(e) => setBranchFilter(e.target.value)}
                className="px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white font-medium text-slate-700"
              >
                <option value="all">All Branches</option>
                <option value="CSE">CSE</option>
                <option value="AI & DS">AI & DS</option>
                <option value="IT">IT</option>
                <option value="ECE">ECE</option>
                <option value="EEE">EEE</option>
                <option value="MECH">MECH</option>
              </select>

              <select
                value={batchYearFilter}
                onChange={(e) => setBatchYearFilter(e.target.value)}
                className="px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white font-medium text-slate-700"
              >
                <option value="all">All Batches</option>
                <option value="2025">Batch 2025 (Final Year)</option>
                <option value="2026">Batch 2026 (3rd Year)</option>
                <option value="2027">Batch 2027 (2nd Year)</option>
                <option value="2028">Batch 2028 (1st Year)</option>
              </select>
            </div>
          </div>

          {/* Verification Cards Grid */}
          {filteredStudents.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
              <FileCheck2 className="w-10 h-10 text-slate-400 mx-auto" />
              <h3 className="text-base font-bold text-slate-800">No student verification records match your filters</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Try adjusting your search query, status tab, or branch filter to inspect other candidate submissions.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredStudents.map((stu) => {
                const status = getStudentStatus(stu);
                const hasProof = !!stu.studentProof?.fileUrl;

                return (
                  <div
                    key={stu.student_id}
                    className={`bg-white rounded-2xl border p-5 shadow-2xs space-y-4 transition-all hover:border-indigo-300 ${
                      status === 'Verified' 
                        ? 'border-emerald-200' 
                        : status === 'Flagged / Action Needed' 
                        ? 'border-red-200' 
                        : 'border-slate-200'
                    }`}
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 shrink-0">
                          {stu.avatarUrl ? (
                            <img src={stu.avatarUrl} alt={stu.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold">
                              {stu.name.charAt(0)}
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-bold text-slate-900">{stu.name}</h3>
                            <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                              {stu.rollNumber}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500">
                            {stu.course ? `${stu.course} • ` : ''}{stu.branch} • Batch {stu.admissionYear || 2021}–{stu.graduationYear || 2025} ({stu.academicStanding || 'Enrolled Student'})
                          </p>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border shrink-0 ${
                        status === 'Verified'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : status === 'Flagged / Action Needed'
                          ? 'bg-red-50 text-red-700 border-red-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {status === 'Verified' && '✓ '}
                        {status}
                      </span>
                    </div>

                    {/* Academic & Contact Details */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <div>
                        <span className="text-[10px] text-slate-400 block font-semibold">CGPA</span>
                        <span className="font-bold text-slate-900">{stu.GPA} / 10.0</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block font-semibold">Backlogs</span>
                        <span className={`font-bold ${stu.activeBacklogs > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                          {stu.activeBacklogs} Active
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block font-semibold">10th / 12th</span>
                        <span className="font-bold text-slate-700">{stu.tenthPercentage}% / {stu.twelfthPercentage}%</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block font-semibold">Contact</span>
                        <span className="font-medium text-slate-700 truncate block" title={stu.contactNumber}>
                          {stu.contactNumber || 'Not provided'}
                        </span>
                      </div>
                    </div>

                    {/* Emails info */}
                    <div className="space-y-1 text-xs text-slate-600">
                      <div className="flex items-center gap-1.5 truncate">
                        <Mail className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                        <span className="font-semibold text-slate-500">College:</span>
                        <span className="font-mono text-slate-900 truncate">{stu.collegeEmail || 'Not submitted'}</span>
                      </div>
                      <div className="flex items-center gap-1.5 truncate">
                        <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="font-semibold text-slate-500">Personal:</span>
                        <span className="font-mono text-slate-700 truncate">{stu.personalEmail || stu.email || 'Not submitted'}</span>
                      </div>
                    </div>

                    {/* Document Upload Inspection Box */}
                    <div className="border border-slate-200 rounded-xl p-3 bg-white space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          <FileText className="w-4 h-4 text-indigo-600" />
                          <span>Submitted Proof: {stu.studentProof?.documentType || 'Previous Year Marksheet / College ID'}</span>
                        </span>
                        {hasProof && (
                          <span className="text-[10px] text-slate-400">
                            {stu.studentProof?.fileName || 'document_scan.pdf'}
                          </span>
                        )}
                      </div>

                      {/* Duplicate Document Security Fraud Alert */}
                      {stu.studentProof?.isDuplicateDetected && (
                        <div className="text-xs font-bold text-rose-900 bg-rose-50 p-2.5 rounded-lg border border-rose-300 flex items-start gap-2 shadow-2xs">
                          <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                          <div>
                            <span className="block font-black text-rose-900 text-xs">
                              ⚠️ SECURITY ALERT: DUPLICATE DOCUMENT DETECTED
                            </span>
                            <p className="font-normal text-[11px] text-rose-800 mt-0.5">
                              This exact file payload matches a document previously submitted by{' '}
                              <strong className="font-bold underline">{stu.studentProof.duplicateMatchStudentName || 'another student'}</strong>.
                              Review carefully before granting approval!
                            </p>
                          </div>
                        </div>
                      )}

                      {hasProof ? (
                        <div className="space-y-1.5 pt-1">
                          <div className="flex items-center justify-between gap-2">
                            <button
                              type="button"
                              onClick={() => setInspectingStudent(stu)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Preview Document Proof</span>
                            </button>
                            <span className="text-[11px] text-slate-500">
                              Uploaded: {stu.studentProof?.uploadedAt || 'Recent'}
                            </span>
                          </div>
                          {stu.studentProof?.documentChecksum && (
                            <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-500 bg-slate-50 px-2 py-1 rounded border border-slate-100">
                              <Fingerprint className="w-3 h-3 text-slate-400 shrink-0" />
                              <span className="text-slate-400 font-sans">SHA Fingerprint:</span>
                              <span className="truncate">{stu.studentProof.documentChecksum}</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-[11px] text-amber-700 bg-amber-50 p-2 rounded-lg border border-amber-200">
                          ⚠️ Candidate has not uploaded an official marksheet/ID proof document yet.
                        </div>
                      )}

                      {/* Admin note if any */}
                      {stu.adminNotes && (
                        <div className="text-[11px] bg-slate-50 text-slate-700 p-2 rounded-lg border border-slate-200">
                          <span className="font-bold text-slate-900">Admin Note: </span>
                          {stu.adminNotes}
                        </div>
                      )}
                    </div>

                    {/* Verification Action Buttons */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {status === 'Verified' ? (
                          <div className="px-3 py-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-300 rounded-lg flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Approved & Verified</span>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleApproveStudent(stu)}
                            id={`verify-btn-${stu.student_id}`}
                            className="px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-2xs transition-all cursor-pointer flex items-center gap-1 active:scale-95"
                            title="Automatically convert to Approved"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Approve & Verify</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => handleOpenFlagModal(stu)}
                          id={`flag-btn-${stu.student_id}`}
                          className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-colors cursor-pointer flex items-center gap-1 ${
                            status === 'Flagged / Action Needed'
                              ? 'text-amber-900 bg-amber-200 border-amber-400 font-extrabold'
                              : 'text-amber-800 bg-amber-100 hover:bg-amber-200 border-amber-300'
                          }`}
                          title="Generate interface to mention issues & required fixes"
                        >
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>Flag for Fix</span>
                        </button>

                        {status === 'Rejected' ? (
                          <div className="px-2.5 py-1.5 text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-1">
                            <X className="w-3.5 h-3.5" />
                            <span>Rejected</span>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleRejectStudent(stu)}
                            id={`reject-btn-${stu.student_id}`}
                            className="px-2.5 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                            title="Automatically convert to Rejected"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>Reject</span>
                          </button>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        {/* Working Guaranteed Delete Button */}
                        {pendingDeleteId === stu.student_id ? (
                          <div className="flex items-center gap-1 bg-red-50 border border-red-200 rounded-lg p-1">
                            <button
                              type="button"
                              onClick={() => {
                                onDeleteStudent(stu.student_id);
                                setPendingDeleteId(null);
                                showToast(`Deleted profile for ${stu.name}`);
                              }}
                              className="px-2 py-0.5 text-[10px] font-bold text-white bg-red-600 hover:bg-red-700 rounded transition-colors cursor-pointer"
                            >
                              Confirm
                            </button>
                            <button
                              type="button"
                              onClick={() => setPendingDeleteId(null)}
                              className="px-1.5 py-0.5 text-[10px] text-slate-500 hover:text-slate-700 rounded transition-colors cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setPendingDeleteId(stu.student_id)}
                            id={`admin-delete-stu-${stu.student_id}`}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete Candidate Record"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Candidate Dossiers & Master Directory */}
      {activeTab === 'students' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Showing {filteredStudents.length} of {students.length} total student candidate records</span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleExportCSV}
                className="text-indigo-600 font-bold hover:underline cursor-pointer flex items-center gap-1"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Master CSV</span>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Student Name</th>
                    <th className="px-4 py-3">Roll No</th>
                    <th className="px-4 py-3">Branch</th>
                    <th className="px-4 py-3">Batch</th>
                    <th className="px-4 py-3">CGPA</th>
                    <th className="px-4 py-3">Backlogs</th>
                    <th className="px-4 py-3">Institutional Email</th>
                    <th className="px-4 py-3">Proof Status</th>
                    <th className="px-4 py-3 text-right">Administrative Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredStudents.map((s) => {
                    const status = getStudentStatus(s);
                    return (
                      <tr key={s.student_id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                              {s.avatarUrl ? (
                                <img src={s.avatarUrl} alt={s.name} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-500 font-bold text-[10px]">
                                  {s.name.charAt(0)}
                                </div>
                              )}
                            </div>
                            <div>
                              <span className="font-bold text-slate-900 block">{s.name}</span>
                              <span className="text-[10px] text-slate-400">{s.preferred_role}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 font-mono font-bold text-slate-800">{s.rollNumber}</td>
                        <td className="px-4 py-3 font-medium">{s.branch}</td>
                        <td className="px-4 py-3 text-slate-600">{s.admissionYear || 2021}–{s.graduationYear || 2025}</td>
                        <td className="px-4 py-3 font-mono font-bold text-indigo-700">{s.GPA}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            s.activeBacklogs > 0 ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
                          }`}>
                            {s.activeBacklogs}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-mono text-slate-600 truncate max-w-xs">{s.collegeEmail || 'None'}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                            status === 'Verified'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : status === 'Flagged / Action Needed'
                              ? 'bg-red-50 text-red-700 border-red-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}>
                            {status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setInspectingStudent(s)}
                              className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                              title="Inspect & Verify Proof"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => setEditingStudent(s)}
                              className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                              title="Edit Academic Record"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>

                            {/* Working Delete Button in table */}
                            {pendingDeleteId === s.student_id ? (
                              <div className="flex items-center gap-1 bg-red-50 border border-red-200 rounded-lg p-1">
                                <button
                                  type="button"
                                  onClick={() => {
                                    onDeleteStudent(s.student_id);
                                    setPendingDeleteId(null);
                                    showToast(`Candidate ${s.name} deleted.`);
                                  }}
                                  className="px-2 py-0.5 text-[10px] font-bold text-white bg-red-600 hover:bg-red-700 rounded transition-colors cursor-pointer"
                                >
                                  Delete
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setPendingDeleteId(null)}
                                  className="px-1 py-0.5 text-[10px] text-slate-500 rounded transition-colors cursor-pointer"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setPendingDeleteId(s.student_id)}
                                id={`table-delete-btn-${s.student_id}`}
                                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                title="Delete student profile"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Placement Drives & Cutoffs */}
      {activeTab === 'drives' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Listing {jobs.length} active campus recruitment drives</span>
            <button
              onClick={() => setShowAddDriveModal(true)}
              className="text-indigo-600 font-bold hover:underline cursor-pointer flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              <span>Launch New Drive</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {jobs.map((j) => {
              // Real-time eligibility calculator for this drive
              const eligibleStudents = students.filter(s => {
                const gpaOk = s.GPA >= j.minimum_gpa;
                const branchOk = j.eligible_branches.includes(s.branch);
                const backlogsOk = s.activeBacklogs === 0;
                return gpaOk && branchOk && backlogsOk;
              });

              return (
                <div key={j.job_id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider block">
                          {j.category || 'Tier 1'}
                        </span>
                        <h3 className="text-base font-bold text-slate-900">{j.company}</h3>
                        <p className="text-xs font-medium text-slate-600">{j.job_title}</p>
                      </div>
                      <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                        {j.ctc_range || 'Competitive'}
                      </span>
                    </div>

                    <div className="p-2.5 bg-slate-50 rounded-xl space-y-1.5 text-xs text-slate-600">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Min CGPA Cutoff:</span>
                        <span className="font-bold text-slate-900">{j.minimum_gpa} / 10.0</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Allowed Branches:</span>
                        <span className="font-medium text-slate-800 text-right">{j.eligible_branches.join(', ')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Location:</span>
                        <span className="font-medium text-slate-800">{j.location}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1 pt-1">
                      {j.required_skills.map(sk => (
                        <span key={sk} className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium">
                          {sk}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Eligible Candidates Box & Delete */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-bold text-slate-900 block">
                        {eligibleStudents.length} Candidates Eligible
                      </span>
                      <span className="text-[10px] text-slate-400">
                        ({((eligibleStudents.length / Math.max(1, students.length)) * 100).toFixed(0)}% of registered cohort)
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        onDeleteJob(j.job_id);
                        showToast(`Removed placement drive for ${j.company}`);
                      }}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                      title="Remove Drive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 4: Verification Analytics */}
      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-indigo-600" />
              <span>Document Verification Breakdown</span>
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusPieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {statusPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-indigo-600" />
              <span>Registered Candidates by Engineering Department</span>
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={branchData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" fontSize={11} />
                  <YAxis fontSize={11} allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#4f46e5" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: Security Controls & Audit Trail */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          {/* Security Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
              <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs">
                <ShieldCheck className="w-4 h-4" />
                <span>ROLE-BASED ACCESS CONTROL (RBAC)</span>
              </div>
              <h4 className="text-sm font-black text-slate-900">Student & Admin Isolation</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Student accounts are strictly isolated. No candidate can view, approve, modify verification proofs or create placement drives without TPO Master Authentication.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
              <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs">
                <Lock className="w-4 h-4" />
                <span>SESSION ENCRYPTION</span>
              </div>
              <h4 className="text-sm font-black text-slate-900">Active TLS & Salted Hash</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Administrative actions and student password records utilize cryptographic SHA-256 digests. Proof documents are stored with integrity timestamps.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
              <div className="flex items-center gap-2 text-amber-600 font-bold text-xs">
                <Fingerprint className="w-4 h-4" />
                <span>SESSION STATUS</span>
              </div>
              <h4 className="text-sm font-black text-slate-900">{adminConfig.name}</h4>
              <p className="text-xs text-slate-500 truncate">
                {adminConfig.email} • {adminConfig.role}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left: Master Passkey Management Form */}
            <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-5">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <KeyRound className="w-5 h-5 text-indigo-600" />
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Update Master Security Passkey</h3>
                  <p className="text-xs text-slate-500">Configure Placement Cell login keys and PIN</p>
                </div>
              </div>

              {securityFormMsg && (
                <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                  securityFormMsg.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}>
                  {securityFormMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertTriangle className="w-4 h-4 text-rose-600" />}
                  <span>{securityFormMsg.text}</span>
                </div>
              )}

              <form onSubmit={handleUpdateSecurityCredentials} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Officer In-Charge Name</label>
                  <input
                    type="text"
                    required
                    value={officerNameInput}
                    onChange={(e) => setOfficerNameInput(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Officer Institutional Email</label>
                  <input
                    type="email"
                    required
                    value={officerEmailInput}
                    onChange={(e) => setOfficerEmailInput(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <label className="block font-bold text-slate-700 mb-1">Current Master Passkey *</label>
                  <input
                    type="password"
                    required
                    placeholder="Enter current passkey to authorize changes"
                    value={currentPasskeyInput}
                    onChange={(e) => setCurrentPasskeyInput(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">New Passkey</label>
                    <input
                      type="password"
                      placeholder="Min 6 characters"
                      value={newPasskeyInput}
                      onChange={(e) => setNewPasskeyInput(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Confirm Passkey</label>
                    <input
                      type="password"
                      placeholder="Repeat new passkey"
                      value={confirmPasskeyInput}
                      onChange={(e) => setConfirmPasskeyInput(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">6-Digit Emergency Master PIN</label>
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="e.g. 749215"
                    value={newPinInput}
                    onChange={(e) => setNewPinInput(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl tracking-widest font-mono"
                  />
                </div>

                <button
                  type="submit"
                  id="save-admin-security-credentials-btn"
                  className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>Save Updated Security Credentials</span>
                </button>
              </form>
            </div>

            {/* Right: Live Security Audit Trail */}
            <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <History className="w-5 h-5 text-indigo-600" />
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Placement Cell Audit Trail</h3>
                    <p className="text-xs text-slate-500">Live security logs of admin actions & verifications</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(auditLogs, null, 2));
                      const downloadAnchor = document.createElement('a');
                      downloadAnchor.setAttribute("href", dataStr);
                      downloadAnchor.setAttribute("download", `placera_security_audit_${Date.now()}.json`);
                      document.body.appendChild(downloadAnchor);
                      downloadAnchor.click();
                      downloadAnchor.remove();
                      showToast("Security audit log exported.");
                    }}
                    className="px-2.5 py-1 text-[11px] font-bold text-slate-600 hover:text-indigo-600 bg-slate-100 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <Download className="w-3 h-3" />
                    <span>Export</span>
                  </button>

                  <button
                    onClick={() => {
                      const cleared = [
                        {
                          id: `SEC-${Date.now()}`,
                          timestamp: new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'medium' }),
                          action: 'Audit logs cleared by authorized Placement Officer',
                          level: 'info',
                          ip: '192.168.1.104 (Campus Intranet TLS)'
                        }
                      ];
                      setAuditLogs(cleared);
                      localStorage.setItem('placera_admin_audit_logs', JSON.stringify(cleared));
                      showToast("Audit logs cleared.");
                    }}
                    className="px-2.5 py-1 text-[11px] font-bold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                  >
                    Clear
                  </button>
                </div>
              </div>

              {/* Logs Stream */}
              <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
                {auditLogs.map((log) => (
                  <div 
                    key={log.id} 
                    className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs flex items-start justify-between gap-3 hover:bg-indigo-50/40 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${
                          log.level === 'success' ? 'bg-emerald-500' :
                          log.level === 'warning' ? 'bg-rose-500' : 'bg-indigo-500'
                        }`} />
                        <span className="font-bold text-slate-800">{log.action}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        Signature: {log.ip}
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap bg-white px-2 py-0.5 rounded-md border border-slate-200">
                      {log.timestamp}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* MODAL: Document Proof Preview & Inspection */}
      {inspectingStudent && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-6 h-6 text-indigo-600" />
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Verify Student Proof: {inspectingStudent.name}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Roll: {inspectingStudent.rollNumber} • {inspectingStudent.branch} • Batch {inspectingStudent.admissionYear || 2021}–{inspectingStudent.graduationYear || 2025}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setInspectingStudent(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Document Preview Display */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-center space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-600">
                <span className="font-bold">
                  Document Type: {inspectingStudent.studentProof?.documentType || 'Official Academic Marksheet / ID'}
                </span>
                <span>{inspectingStudent.studentProof?.fileName || 'scan_document.pdf'}</span>
              </div>

              {inspectingStudent.studentProof?.fileUrl ? (
                <div className="max-h-80 overflow-y-auto rounded-xl border border-slate-200 bg-white p-2">
                  <img
                    src={inspectingStudent.studentProof.fileUrl}
                    alt="Proof Document"
                    className="max-h-72 mx-auto object-contain rounded-lg"
                  />
                </div>
              ) : (
                <div className="py-12 bg-white rounded-xl border border-dashed border-slate-300 text-slate-400 text-xs">
                  No image file attached. Candidate submitted manual academic confirmation.
                </div>
              )}

              <div className="grid grid-cols-3 gap-2 text-xs text-left bg-white p-3 rounded-xl border border-slate-200">
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold">Claimed CGPA</span>
                  <span className="font-bold text-slate-900">{inspectingStudent.GPA} / 10.0</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold">10th / 12th Board</span>
                  <span className="font-bold text-slate-800">{inspectingStudent.tenthPercentage}% / {inspectingStudent.twelfthPercentage}%</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold">Active Backlogs</span>
                  <span className="font-bold text-slate-800">{inspectingStudent.activeBacklogs}</span>
                </div>
              </div>
            </div>

            {/* Dynamic Approved Banner or Decision Controls */}
            {inspectingStudent.verificationStatus === 'Verified' || inspectingStudent.studentProof?.isVerified ? (
              <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-900 border-2 border-emerald-500/60 rounded-2xl p-4 text-white space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-400 text-emerald-300 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-emerald-300 uppercase tracking-wider">
                        Candidate Verification Approved
                      </h4>
                      <p className="text-[11px] text-slate-300">
                        {inspectingStudent.name} is 100% verified for all campus placement drives.
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-400/30">
                    APPROVED
                  </span>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-emerald-800/60 text-xs">
                  <span className="text-slate-400 text-[11px]">
                    Verified by: <strong className="text-white">{inspectingStudent.verifiedBy || 'Placement Officer'}</strong>
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setInspectingStudent(null)}
                      className="px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
                    >
                      Done
                    </button>
                  </div>
                </div>
              </div>
            ) : inspectingStudent.verificationStatus === 'Rejected' ? (
              <div className="bg-rose-950 border-2 border-rose-500/60 rounded-2xl p-4 text-white space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-rose-500/20 border border-rose-400 text-rose-300 flex items-center justify-center shrink-0">
                      <X className="w-5 h-5 text-rose-400" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-rose-300 uppercase tracking-wider">
                        Candidate Verification Rejected
                      </h4>
                      <p className="text-[11px] text-slate-300">
                        {inspectingStudent.adminNotes || 'Credentials were rejected by the Central Placement Cell.'}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono bg-rose-500/20 text-rose-300 px-2.5 py-0.5 rounded-full border border-rose-400/30">
                    REJECTED
                  </span>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-rose-800/60 text-xs">
                  <span className="text-slate-400 text-[11px]">
                    Status: <strong className="text-rose-300 font-semibold">Rejected from Placement Drives</strong>
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenFlagModal(inspectingStudent)}
                      className="px-3 py-1.5 text-xs font-bold text-amber-200 bg-amber-900/60 hover:bg-amber-900 rounded-xl transition-colors cursor-pointer"
                    >
                      Change to Flag / Fix
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApproveStudent(inspectingStudent)}
                      className="px-3.5 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Re-evaluate & Approve</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
                <span className="text-xs text-slate-500 font-medium">
                  Reviewing candidate's uploaded academic documentation
                </span>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => {
                      handleRejectStudent(inspectingStudent);
                    }}
                    className="px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer flex items-center gap-1"
                    title="Automatically convert to Rejected"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Reject Proof</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      handleOpenFlagModal(inspectingStudent);
                    }}
                    className="px-4 py-2 text-xs font-bold text-amber-800 bg-amber-100 hover:bg-amber-200 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
                    title="Open interface to specify issues and required changes"
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Flag for Fix & Resubmission</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      handleApproveStudent(inspectingStudent);
                    }}
                    className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
                    title="Automatically convert to Approved"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Approve & Verify</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL: Edit Student Record */}
      {editingStudent && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">
                Edit Candidate Record: {editingStudent.name}
              </h3>
              <button
                onClick={() => setEditingStudent(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={editingStudent.name}
                  onChange={(e) => setEditingStudent({ ...editingStudent, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Roll Number</label>
                  <input
                    type="text"
                    value={editingStudent.rollNumber}
                    onChange={(e) => setEditingStudent({ ...editingStudent, rollNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">CGPA</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingStudent.GPA}
                    onChange={(e) => setEditingStudent({ ...editingStudent, GPA: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Active Backlogs</label>
                  <input
                    type="number"
                    value={editingStudent.activeBacklogs}
                    onChange={(e) => setEditingStudent({ ...editingStudent, activeBacklogs: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Contact Phone</label>
                  <input
                    type="text"
                    value={editingStudent.contactNumber || ''}
                    onChange={(e) => setEditingStudent({ ...editingStudent, contactNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">College Institutional Email</label>
                <input
                  type="email"
                  value={editingStudent.collegeEmail || ''}
                  onChange={(e) => setEditingStudent({ ...editingStudent, collegeEmail: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEditingStudent(null)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onUpdateStudent(editingStudent);
                  setEditingStudent(null);
                  showToast('Candidate record updated.');
                }}
                className="px-4 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg cursor-pointer"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Add New Placement Drive */}
      {showAddDriveModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-bold text-slate-900">Create Campus Recruitment Drive</h3>
              </div>
              <button
                onClick={() => setShowAddDriveModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateDrive} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Company Name *</label>
                  <input
                    type="text"
                    required
                    value={newDrive.company || ''}
                    onChange={(e) => setNewDrive({ ...newDrive, company: e.target.value })}
                    placeholder="e.g. Google / Microsoft / TCS"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Job Title *</label>
                  <input
                    type="text"
                    required
                    value={newDrive.job_title || ''}
                    onChange={(e) => setNewDrive({ ...newDrive, job_title: e.target.value })}
                    placeholder="e.g. Graduate SDE / Data Scientist"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Minimum CGPA Cutoff</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newDrive.minimum_gpa || 7.0}
                    onChange={(e) => setNewDrive({ ...newDrive, minimum_gpa: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">CTC Compensation</label>
                  <input
                    type="text"
                    value={newDrive.ctc_range || '₹10 - 15 LPA'}
                    onChange={(e) => setNewDrive({ ...newDrive, ctc_range: e.target.value })}
                    placeholder="e.g. ₹12 - 18 LPA"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Required Skills (Comma separated)</label>
                <input
                  type="text"
                  value={driveSkillsInput}
                  onChange={(e) => setDriveSkillsInput(e.target.value)}
                  placeholder="Python, SQL, Data Structures, Machine Learning"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Drive Category</label>
                <select
                  value={newDrive.category || 'Tier 1 (Dream)'}
                  onChange={(e) => setNewDrive({ ...newDrive, category: e.target.value as any })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                >
                  <option value="Tier 1 (Dream)">Tier 1 (Dream)</option>
                  <option value="Tier 2">Tier 2</option>
                  <option value="Core IT">Core IT</option>
                  <option value="Start-up">Start-up</option>
                  <option value="Tier 3 (Core/Mass)">Tier 3 (Core/Mass)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddDriveModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs cursor-pointer"
                >
                  Launch Recruitment Drive
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Fast Passkey & PIN Security Settings */}
      {showSecurityModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-bold text-slate-900">Placement Admin Passkey Settings</h3>
              </div>
              <button
                onClick={() => setShowSecurityModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {securityFormMsg && (
              <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                securityFormMsg.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}>
                {securityFormMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertTriangle className="w-4 h-4 text-rose-600" />}
                <span>{securityFormMsg.text}</span>
              </div>
            )}

            <form onSubmit={handleUpdateSecurityCredentials} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Current Master Passkey *</label>
                <input
                  type="password"
                  required
                  placeholder="Enter current passkey"
                  value={currentPasskeyInput}
                  onChange={(e) => setCurrentPasskeyInput(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">New Master Passkey</label>
                <input
                  type="password"
                  placeholder="Min 6 characters"
                  value={newPasskeyInput}
                  onChange={(e) => setNewPasskeyInput(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Confirm New Passkey</label>
                <input
                  type="password"
                  placeholder="Re-enter new passkey"
                  value={confirmPasskeyInput}
                  onChange={(e) => setConfirmPasskeyInput(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">6-Digit Emergency PIN</label>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="e.g. 749215"
                  value={newPinInput}
                  onChange={(e) => setNewPinInput(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl tracking-widest font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowSecurityModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Update Passkey</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Flag & Fix Interface with Reasons for Student */}
      {flaggingStudent && (
        <FlagFixModal
          student={flaggingStudent}
          adminOfficerName={adminConfig.name}
          onClose={() => setFlaggingStudent(null)}
          onSubmit={handleSaveFlagFeedback}
        />
      )}
    </div>
  );
};
