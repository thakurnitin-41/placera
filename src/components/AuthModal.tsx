import React, { useState, useMemo, useEffect } from 'react';
import { StudentProfileData, Branch, ExperienceLevel, JobType, StudentProofDocument } from '../types';
import { PhotoCaptureModal } from './PhotoCaptureModal';
import { CollegeProofUpload } from './CollegeProofUpload';
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
import { hashPassword, verifyPassword, calculateAcademicStanding } from '../utils/crypto';
import { AdminCredentials, DEFAULT_ADMIN_CONFIG } from './AdminSecurityGate';
import { 
  UserPlus, 
  LogIn, 
  X, 
  Camera, 
  Upload, 
  CheckCircle2, 
  Sparkles, 
  Lock, 
  Mail, 
  Phone, 
  User, 
  Building2, 
  GraduationCap, 
  BookOpen, 
  Plus, 
  ArrowRight,
  ArrowLeft,
  ShieldCheck, 
  Award, 
  Trash2, 
  FileCheck2, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  KeyRound, 
  Calendar, 
  Briefcase, 
  AlertTriangle,
  Search,
  Check,
  SkipForward,
  HelpCircle,
  FileText
} from 'lucide-react';

interface AuthModalProps {
  isOpen?: boolean;
  onClose: () => void;
  onLoginSuccess: (student: StudentProfileData) => void;
  registeredStudents?: StudentProfileData[];
  onRegisterSuccess: (student: StudentProfileData) => void;
  onDeleteStudent?: (studentId: string) => void;
  onStudentPasswordReset?: (student: StudentProfileData) => void;
  initialRole?: 'student' | 'admin';
  initialMode?: 'login' | 'register';
  onAdminAuthSuccess?: (adminSession: AdminCredentials) => void;
}

const CATEGORIZED_SKILLS: { category: string; skills: string[] }[] = [
  {
    category: 'Core Languages',
    skills: ['Python', 'C++', 'Java', 'JavaScript', 'TypeScript', 'SQL', 'Go', 'Rust', 'C#', 'R']
  },
  {
    category: 'AI / Machine Learning',
    skills: ['Machine Learning', 'Deep Learning', 'PyTorch', 'TensorFlow', 'NLP', 'Computer Vision', 'Generative AI', 'Pandas', 'NumPy', 'Scikit-learn']
  },
  {
    category: 'Web & Backend',
    skills: ['React.js', 'Next.js', 'Node.js', 'FastAPI', 'Spring Boot', 'Express.js', 'Django', 'Tailwind CSS', 'GraphQL', 'REST APIs']
  },
  {
    category: 'Databases & Storage',
    skills: ['PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'SQLite', 'Firebase', 'Cassandra']
  },
  {
    category: 'Cloud & DevOps',
    skills: ['Docker', 'Kubernetes', 'AWS', 'Microsoft Azure', 'Google Cloud (GCP)', 'Git', 'Linux', 'CI/CD Pipelines']
  },
  {
    category: 'Core Computer Science',
    skills: ['Data Structures & Algorithms', 'System Design', 'Operating Systems', 'Computer Networks', 'DBMS', 'OOP']
  }
];

const ALL_SKILLS = CATEGORIZED_SKILLS.flatMap(c => c.skills);

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen = true,
  onClose,
  onLoginSuccess,
  registeredStudents = [],
  onRegisterSuccess,
  onDeleteStudent,
  onStudentPasswordReset,
  initialRole = 'student',
  initialMode = 'register',
  onAdminAuthSuccess,
}) => {
  if (!isOpen) return null;

  // Active portal tab: 'student' or 'admin'
  const [portalRole, setPortalRole] = useState<'student' | 'admin'>(initialRole);
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  
  // Registration Flow Step Tracker: 1: Basic Registration, 2: Profile Creation
  const [regStep, setRegStep] = useState<1 | 2>(1);

  // Student Login form states
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [rememberStudent, setRememberStudent] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isVerifyingLogin, setIsVerifyingLogin] = useState(false);
  const [showPasswordRecovery, setShowPasswordRecovery] = useState(false);
  const [recoveryIdentifier, setRecoveryIdentifier] = useState('');
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoveryPassword, setRecoveryPassword] = useState('');
  const [recoveryConfirmPassword, setRecoveryConfirmPassword] = useState('');
  const [recoveryMessage, setRecoveryMessage] = useState<string | null>(null);

  // STEP 1: Basic Registration form states
  const [regName, setRegName] = useState('');
  const [regCollegeEmail, setRegCollegeEmail] = useState('');
  const [regPersonalEmail, setRegPersonalEmail] = useState('');
  const [useSeparatePersonalEmail, setUseSeparatePersonalEmail] = useState(false);
  const [regContactNumber, setRegContactNumber] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regRoll, setRegRoll] = useState('');
  const [regCollege, setRegCollege] = useState('Jaypee Institute of Information Technology (JIIT)');
  const [regCollegeCity, setRegCollegeCity] = useState('Noida');

  // STEP 2: Profile Creation form states
  const [regCourse, setRegCourse] = useState<string>('B.Tech');
  const [regBranch, setRegBranch] = useState<Branch>('CSE');
  const [customBranchInput, setCustomBranchInput] = useState('');
  const [isCustomBranch, setIsCustomBranch] = useState(false);
  const [regAdmissionYear, setRegAdmissionYear] = useState<number>(2022);
  const [regGradYear, setRegGradYear] = useState<number>(2026);
  const [regGPA, setRegGPA] = useState<number>(8.5);
  const [regTenth, setRegTenth] = useState<number>(88.0);
  const [regTwelfth, setRegTwelfth] = useState<number>(87.5);
  const [regBacklogs, setRegBacklogs] = useState<number>(0);
  
  // Skills with searchable tags
  const [regSkills, setRegSkills] = useState<string[]>(['Python', 'SQL', 'Data Structures & Algorithms', 'React.js']);
  const [skillSearchQuery, setSkillSearchQuery] = useState('');
  const [selectedSkillCategory, setSelectedSkillCategory] = useState<string>('All');
  const [customSkillInput, setCustomSkillInput] = useState('');

  // Career preferences & optional fields
  const [regPreferredRole, setRegPreferredRole] = useState('Software Development Engineer (SDE-1)');
  const [regPreferredLocation, setRegPreferredLocation] = useState('Bengaluru / Pune / Remote');
  const [regJobType, setRegJobType] = useState<JobType>('Full-Time');
  const [regWillingToRelocate, setRegWillingToRelocate] = useState(true);
  
  // Projects & Experience
  const [regProjectTitle, setRegProjectTitle] = useState('');
  const [regProjectDescription, setRegProjectDescription] = useState('');
  const [regProjectTech, setRegProjectTech] = useState('');
  const [regExperienceLevel, setRegExperienceLevel] = useState<ExperienceLevel>('Entry Level (Fresher)');
  const [regExperienceSummary, setRegExperienceSummary] = useState('');

  // Resume & Links
  const [regResumeText, setRegResumeText] = useState('');
  const [regResumeFileName, setRegResumeFileName] = useState('');
  const [regLinkedinUrl, setRegLinkedinUrl] = useState('');
  const [regGithubUrl, setRegGithubUrl] = useState('');
  const [regLeetcodeHandle, setRegLeetcodeHandle] = useState('');
  const [regLeetcodeSolved, setRegLeetcodeSolved] = useState<number>(0);

  // Avatar & Proof
  const [regAvatarUrl, setRegAvatarUrl] = useState<string | undefined>(undefined);
  const [regStudentProof, setRegStudentProof] = useState<StudentProofDocument | undefined>(undefined);
  const [regInitialAchievement, setRegInitialAchievement] = useState('');

  // Form error and status states
  const [regError, setRegError] = useState<string | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [profileCreationActiveTab, setProfileCreationActiveTab] = useState<'academics' | 'skills' | 'projects' | 'links'>('academics');

  // Autosave Draft in LocalStorage
  useEffect(() => {
    try {
      const savedDraft = localStorage.getItem('placera_registration_draft');
      if (savedDraft) {
        const d = JSON.parse(savedDraft);
        if (d.name && !regName) setRegName(d.name);
        if (d.collegeEmail && !regCollegeEmail) setRegCollegeEmail(d.collegeEmail);
        if (d.contactNumber && !regContactNumber) setRegContactNumber(d.contactNumber);
        if (d.college && regCollege === 'Jaypee Institute of Information Technology (JIIT)') setRegCollege(d.college);
        if (d.collegeCity && regCollegeCity === 'Noida') setRegCollegeCity(d.collegeCity);
        if (d.roll && !regRoll) setRegRoll(d.roll);
      }
    } catch (e) {
      // Ignore draft parse errors
    }
  }, []);

  // Sync draft to localStorage on change
  useEffect(() => {
    if (regName || regCollegeEmail || regRoll) {
      try {
        localStorage.setItem('placera_registration_draft', JSON.stringify({
          name: regName,
          collegeEmail: regCollegeEmail,
          personalEmail: regPersonalEmail,
          contactNumber: regContactNumber,
          roll: regRoll,
          college: regCollege,
          collegeCity: regCollegeCity,
          course: regCourse,
          branch: regBranch,
        }));
      } catch (e) {}
    }
  }, [regName, regCollegeEmail, regPersonalEmail, regContactNumber, regRoll, regCollege, regCollegeCity, regCourse, regBranch]);

  // Admin Portal Login & Register states
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [rememberAdmin, setRememberAdmin] = useState(false);
  const [adminPin, setAdminPin] = useState('');
  const [adminAuthType, setAdminAuthType] = useState<'passkey' | 'pin'>('passkey');
  const [showAdminPass, setShowAdminPass] = useState(false);
  const [adminError, setAdminError] = useState<string | null>(null);
  const [adminSuccess, setAdminSuccess] = useState<string | null>(null);
  const [isAdminSubmitting, setIsAdminSubmitting] = useState(false);

  // Admin Registration states
  const [adminRegName, setAdminRegName] = useState('');
  const [adminRegDesignation, setAdminRegDesignation] = useState('Training & Placement Officer (TPO)');
  const [adminRegCollege, setAdminRegCollege] = useState('National Institute of Technology');
  const [adminRegCollegeCity, setAdminRegCollegeCity] = useState('');
  const [adminRegDepartment, setAdminRegDepartment] = useState('Central Career Development & Placement Cell');
  const [adminRegEmail, setAdminRegEmail] = useState('');
  const [adminRegPasskey, setAdminRegPasskey] = useState('');
  const [adminRegConfirmPasskey, setAdminRegConfirmPasskey] = useState('');
  const [adminRegPin, setAdminRegPin] = useState('749215');
  const [showAdminRegPass, setShowAdminRegPass] = useState(false);

  // Photo modal control
  const [showPhotoModal, setShowPhotoModal] = useState(false);

  // Available branches dynamically derived from selected course
  const availableBranchesForCourse = useMemo(() => {
    return getBranchesForCourse(regCourse);
  }, [regCourse]);

  // Current selected course metadata
  const currentCourseDef = useMemo(() => {
    return getCourseById(regCourse);
  }, [regCourse]);

  // Dynamic Course Change Handler
  const handleCourseChange = (newCourseId: string) => {
    setRegCourse(newCourseId);
    const defaultBranch = getDefaultBranchForCourse(newCourseId);
    setRegBranch(defaultBranch);
    setIsCustomBranch(false);
    setCustomBranchInput('');

    const courseDef = getCourseById(newCourseId);
    if (courseDef && courseDef.durationYears) {
      setRegGradYear(regAdmissionYear + courseDef.durationYears);
    }
  };

  // Academic standing calculation
  const academicStanding = useMemo(() => {
    return calculateAcademicStanding(regAdmissionYear, regGradYear);
  }, [regAdmissionYear, regGradYear]);

  // Password strength check
  const passwordStrength = useMemo(() => {
    if (!regPassword) return { score: 0, label: 'Empty', color: 'bg-slate-200' };
    let score = 0;
    if (regPassword.length >= 6) score += 1;
    if (regPassword.length >= 8) score += 1;
    if (/[A-Z]/.test(regPassword) && /[a-z]/.test(regPassword)) score += 1;
    if (/\d/.test(regPassword) || /[^A-Za-z0-9]/.test(regPassword)) score += 1;

    if (score <= 1) return { score: 1, label: 'Weak', color: 'bg-red-500 text-red-700' };
    if (score === 2) return { score: 2, label: 'Fair', color: 'bg-amber-500 text-amber-700' };
    if (score === 3) return { score: 3, label: 'Good', color: 'bg-blue-500 text-blue-700' };
    return { score: 4, label: 'Strong (SHA-256 Protected)', color: 'bg-emerald-500 text-emerald-700' };
  }, [regPassword]);

  // Inline Validation Helpers for Step 1
  const isEmailValid = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const isPhoneValid = (phone: string) => phone.replace(/\D/g, '').length >= 10;
  const passwordsMatch = regPassword.length > 0 && regPassword === regConfirmPassword;

  // Filtered skills for searchable tags
  const filteredSkills = useMemo(() => {
    let pool = ALL_SKILLS;
    if (selectedSkillCategory !== 'All') {
      const cat = CATEGORIZED_SKILLS.find(c => c.category === selectedSkillCategory);
      if (cat) pool = cat.skills;
    }
    if (!skillSearchQuery.trim()) return pool;
    const q = skillSearchQuery.toLowerCase();
    return pool.filter(s => s.toLowerCase().includes(q));
  }, [skillSearchQuery, selectedSkillCategory]);

  // Toggle skills in registration
  const toggleSkill = (skill: string) => {
    const isPresent = regSkills.some(s => s.toLowerCase() === skill.toLowerCase());
    if (isPresent) {
      setRegSkills(regSkills.filter(s => s.toLowerCase() !== skill.toLowerCase()));
    } else {
      setRegSkills([...regSkills, skill]);
    }
  };

  const handleAddCustomSkill = () => {
    const trimmed = customSkillInput.trim();
    if (!trimmed) return;
    const newItems = trimmed.split(',').map(s => s.trim()).filter(Boolean);
    let updated = [...regSkills];
    newItems.forEach(item => {
      if (!updated.some(s => s.toLowerCase() === item.toLowerCase())) {
        updated.push(item);
      }
    });
    setRegSkills(updated);
    setCustomSkillInput('');
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setRegSkills(regSkills.filter(s => s !== skillToRemove));
  };

  // Resume File Upload handler (client-side extraction)
  const handleResumeFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setRegResumeFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setRegResumeText(content);
      }
    };
    reader.readAsText(file);
  };

  // Load registered admins
  const getRegisteredAdmins = (): AdminCredentials[] => {
    try {
      const saved = localStorage.getItem('placera_registered_admins');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      return [DEFAULT_ADMIN_CONFIG];
    } catch {
      return [DEFAULT_ADMIN_CONFIG];
    }
  };

  // STEP 1 Validation: Move to Step 2
  const handleProceedToStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);

    if (!regName.trim()) {
      setRegError('Please enter your full name.');
      return;
    }
    if (!regCollegeEmail.trim() || !isEmailValid(regCollegeEmail)) {
      setRegError('Please enter a valid email address.');
      return;
    }
    if (useSeparatePersonalEmail && regPersonalEmail.trim() && !isEmailValid(regPersonalEmail)) {
      setRegError('Please enter a valid personal backup email.');
      return;
    }
    if (!regContactNumber.trim() || !isPhoneValid(regContactNumber)) {
      setRegError('Please enter a valid contact / mobile number with at least 10 digits.');
      return;
    }
    if (!regPassword || regPassword.length < 6) {
      setRegError('Password must be at least 6 characters.');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setRegError('Password and confirmation password do not match.');
      return;
    }
    if (!regRoll.trim()) {
      setRegRoll(`22${regBranch || 'CS'}0${Math.floor(100 + Math.random() * 900)}`);
    }

    setRegStep(2);
  };

  // Final Registration Submission (with full profile or skip-for-now)
  const executeFinalRegistration = async (isSkippedProfile: boolean = false) => {
    setRegError(null);
    setIsRegistering(true);

    try {
      const { hash: passwordHash, salt: passwordSalt } = await hashPassword(regPassword);
      const studentId = `STU-${Date.now()}`;
      
      const effectiveBranch = isCustomBranch && customBranchInput.trim() ? customBranchInput.trim() : (regBranch || 'CSE');
      const effectiveCollege = regCollege.trim() || 'Jaypee Institute of Information Technology (JIIT)';
      const effectiveCity = regCollegeCity.trim() || 'Noida';
      const effectiveSkills = regSkills.length > 0 
        ? regSkills 
        : ['Python', 'SQL', 'Data Structures & Algorithms', 'React.js', 'Git'];
      
      const effectiveRoll = regRoll.trim() || `22CS${Math.floor(100 + Math.random() * 900)}`;

      // Build structured project record
      const projectsList = regProjectTitle.trim() ? [
        {
          id: `proj-${Date.now()}`,
          title: regProjectTitle.trim(),
          description: regProjectDescription.trim() || `Architected hands-on technical software system integrating ${effectiveSkills.slice(0, 3).join(', ')}.`,
          technologies: regProjectTech ? regProjectTech.split(',').map(s => s.trim()) : effectiveSkills.slice(0, 3)
        }
      ] : [
        {
          id: `proj-${Date.now()}`,
          title: `${effectiveBranch} Placement Capstone Project`,
          description: `Applied ${effectiveSkills.slice(0, 3).join(', ')} to engineer data processing pipelines and analytical algorithms.`,
          technologies: effectiveSkills.slice(0, 4)
        }
      ];

      const newStudent: StudentProfileData = {
        student_id: studentId,
        name: regName.trim(),
        collegeEmail: regCollegeEmail.trim(),
        personalEmail: regPersonalEmail.trim() || regCollegeEmail.trim(),
        contactNumber: regContactNumber.trim(),
        email: regCollegeEmail.trim(),
        passwordHash,
        passwordSalt,
        verificationStatus: 'Pending Review',
        studentProof: regStudentProof ? { ...regStudentProof, isVerified: false } : undefined,
        rollNumber: effectiveRoll,
        collegeName: effectiveCollege,
        collegeCity: effectiveCity,
        course: regCourse || 'B.Tech',
        branch: effectiveBranch as Branch,
        admissionYear: regAdmissionYear || 2022,
        graduationYear: regGradYear || 2026,
        academicStanding: academicStanding.currentYearLabel,
        cgpaSemesterContext: academicStanding.cgpaShortLabel,
        academicSession: academicStanding.academicSession,
        GPA: regGPA > 0 ? parseFloat(regGPA.toFixed(2)) : 8.5,
        tenthPercentage: regTenth > 0 ? parseFloat(regTenth.toFixed(1)) : 88.0,
        twelfthPercentage: regTwelfth > 0 ? parseFloat(regTwelfth.toFixed(1)) : 87.5,
        activeBacklogs: regBacklogs,
        historyOfBacklogs: regBacklogs,
        skills: effectiveSkills,
        avatarUrl: regAvatarUrl,
        certifications: [
          {
            id: `cert-${Date.now()}`,
            name: 'Academic Excellence & Technical Specialization',
            issuingOrganization: effectiveCollege,
            issueYear: `${regGradYear || 2026}`
          }
        ],
        achievements: regInitialAchievement.trim() ? [
          {
            id: `ach-${Date.now()}`,
            title: regInitialAchievement.trim(),
            category: 'Hackathon',
            organization: effectiveCollege,
            issueDate: '2024',
            badgeLevel: 'Institute Winner',
            description: 'Key academic and technical achievement registered on profile.'
          }
        ] : [],
        projects: projectsList,
        experience: regExperienceSummary.trim() || 'Candidate with technical project implementations and core software coursework.',
        experienceLevel: regExperienceLevel,
        preferred_role: regPreferredRole.trim() || 'Software Development Engineer (SDE-1)',
        preferred_location: regPreferredLocation.trim() || 'Bengaluru / Pune / Remote',
        job_type: regJobType || 'Full-Time',
        coreSubjects: [
          'Data Structures & Algorithms',
          'Database Management Systems',
          'Operating Systems',
          'Computer Networks'
        ],
        atsResumeScore: 85,
        resumeText: regResumeText.trim() || undefined,
        resumeFileName: regResumeFileName || undefined,
        linkedinUrl: regLinkedinUrl.trim() || undefined,
        githubUrl: regGithubUrl.trim() || undefined,
        leetcodeHandle: regLeetcodeHandle.trim() || undefined,
        leetcodeSolved: regLeetcodeSolved > 0 ? regLeetcodeSolved : undefined,
        willingToRelocate: regWillingToRelocate
      };

      try {
        localStorage.removeItem('placera_registration_draft');
      } catch (e) {}

      onRegisterSuccess(newStudent);
      onClose();
    } catch (err: any) {
      console.error('Registration submission error:', err);
      setRegError('Account creation failed. Please check inputs and retry.');
    } finally {
      setIsRegistering(false);
    }
  };

  // Student Login Handler
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    const identifier = loginIdentifier.trim().toLowerCase();
    if (!identifier) {
      setLoginError('Please enter your College Email, Personal Email, or Roll Number.');
      return;
    }
    if (!loginPassword) {
      setLoginError('Please enter your account password.');
      return;
    }

    setIsVerifyingLogin(true);

    try {
      const matchedStudent = registeredStudents.find(s => 
        (s.email && s.email.toLowerCase() === identifier) ||
        (s.collegeEmail && s.collegeEmail.toLowerCase() === identifier) ||
        (s.personalEmail && s.personalEmail.toLowerCase() === identifier) ||
        (s.rollNumber && s.rollNumber.toLowerCase() === identifier) ||
        (s.student_id && s.student_id.toLowerCase() === identifier)
      );

      if (!matchedStudent) {
        setLoginError('No student account found with this identifier. Please verify or create a new profile.');
        setIsVerifyingLogin(false);
        return;
      }

      if (matchedStudent.passwordHash && matchedStudent.passwordSalt) {
        const isMatch = await verifyPassword(loginPassword, matchedStudent.passwordHash, matchedStudent.passwordSalt);
        if (!isMatch) {
          setLoginError('Incorrect password. Please verify your credentials.');
          setIsVerifyingLogin(false);
          return;
        }
      } else if (matchedStudent.password) {
        if (matchedStudent.password !== loginPassword) {
          setLoginError('Incorrect password. Please verify your credentials.');
          setIsVerifyingLogin(false);
          return;
        }
      }

      onLoginSuccess(matchedStudent);
      onClose();
    } catch (err: any) {
      console.error('Login verification error:', err);
      setLoginError('Verification failed. Please try again.');
    } finally {
      setIsVerifyingLogin(false);
    }
  };

  // Password Recovery
  const handlePasswordRecovery = async (e: React.FormEvent) => {
    e.preventDefault();
    setRecoveryMessage(null);

    const identifier = recoveryIdentifier.trim().toLowerCase();
    const email = recoveryEmail.trim().toLowerCase();
    const matchedStudent = registeredStudents.find(s => {
      const ids = [s.email, s.collegeEmail, s.personalEmail, s.rollNumber, s.student_id]
        .filter(Boolean)
        .map(v => v!.toLowerCase());
      const emails = [s.email, s.collegeEmail, s.personalEmail]
        .filter(Boolean)
        .map(v => v!.toLowerCase());
      return ids.includes(identifier) && emails.includes(email);
    });

    if (!matchedStudent) {
      setRecoveryMessage('No matching record found. Use your own student ID and registered email.');
      return;
    }
    if (recoveryPassword.length < 8) {
      setRecoveryMessage('Password must be at least 8 characters long.');
      return;
    }
    if (recoveryPassword !== recoveryConfirmPassword) {
      setRecoveryMessage('Passwords do not match.');
      return;
    }

    const { hash: passwordHash, salt: passwordSalt } = await hashPassword(recoveryPassword);
    const updated: StudentProfileData = {
      ...matchedStudent,
      passwordHash,
      passwordSalt,
      password: undefined
    };
    onStudentPasswordReset?.(updated);
    setRecoveryMessage('Password reset successfully! Return to sign in.');
    setShowPasswordRecovery(false);
  };

  // Admin Login Handler
  const handleAdminLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError(null);
    setAdminSuccess(null);
    setIsAdminSubmitting(true);

    setTimeout(() => {
      const adminList = getRegisteredAdmins();
      if (adminAuthType === 'passkey') {
        const inputEmail = adminEmail.trim().toLowerCase();
        const inputPasskey = adminPassword.trim();
        const match = adminList.find(a => 
          a.email.toLowerCase() === inputEmail && a.passkey === inputPasskey
        );

        if (match) {
          setAdminSuccess(`Access granted for ${match.name}.`);
          setTimeout(() => {
            if (onAdminAuthSuccess) onAdminAuthSuccess(match);
            onClose();
          }, 300);
        } else {
          setAdminError('Invalid email or passkey. Use demo credentials or Master Emergency PIN.');
          setIsAdminSubmitting(false);
        }
      } else {
        const match = adminList.find(a => a.pin === adminPin.trim());
        if (match) {
          setAdminSuccess(`Emergency bypass verified for ${match.name}.`);
          setTimeout(() => {
            if (onAdminAuthSuccess) onAdminAuthSuccess(match);
            onClose();
          }, 300);
        } else {
          setAdminError('Invalid Emergency PIN code.');
          setIsAdminSubmitting(false);
        }
      }
    }, 300);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xl max-w-2xl w-full max-h-[94vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          
          {/* TOP EXECUTIVE HEADER: White & Navy Theme */}
          <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur border border-white/20 flex items-center justify-center text-white font-black text-lg shadow-inner">
                P
              </div>
              <div>
                <h3 className="text-base font-extrabold tracking-tight text-white flex items-center gap-2">
                  <span>PLACERA</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                    AI Portal
                  </span>
                </h3>
                <p className="text-[11px] text-slate-300">
                  {portalRole === 'student' ? 'Campus Candidate Recruitment & Onboarding' : 'Authorized Placement Officer Control'}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* DUAL PORTAL SWITCHER: Student Candidate vs Placement Officer */}
          <div className="px-6 pt-4 pb-2 bg-slate-50/80 border-b border-slate-200/70 flex items-center justify-between gap-3">
            <div className="flex bg-slate-200/80 p-1 rounded-2xl w-full sm:w-auto">
              <button
                type="button"
                onClick={() => { setPortalRole('student'); setRegError(null); setLoginError(null); }}
                className={`flex-1 sm:flex-none px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  portalRole === 'student'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>Student Candidate</span>
              </button>
              <button
                type="button"
                onClick={() => { setPortalRole('admin'); setRegError(null); setAdminError(null); }}
                className={`flex-1 sm:flex-none px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  portalRole === 'admin'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Placement Officer (Admin)</span>
              </button>
            </div>

            {/* Mode Toggle: Sign In vs Register */}
            {portalRole === 'student' && (
              <div className="flex items-center gap-1 text-xs">
                <button
                  type="button"
                  onClick={() => { setMode('login'); setRegError(null); setLoginError(null); }}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                    mode === 'login'
                      ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => { setMode('register'); setRegError(null); setLoginError(null); }}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                    mode === 'register'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Create Account
                </button>
              </div>
            )}
          </div>

          {/* MAIN MODAL BODY CONTAINER (Scrollable) */}
          <div className="p-6 overflow-y-auto space-y-6 flex-1">
            
            {/* ============================================================== */}
            {/* 1. STUDENT REGISTRATION FLOW (3-STAGE ONBOARDING JOURNEY)        */}
            {/* ============================================================== */}
            {portalRole === 'student' && mode === 'register' && (
              <div className="space-y-6">

                {/* Progress Indicators Header */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-900 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                      Registration & Onboarding Roadmap
                    </span>
                    <span className="text-indigo-600 font-mono">
                      Step {regStep} of 2 {regStep === 1 ? '• Basic Account' : '• Profile & Academics'}
                    </span>
                  </div>

                  {/* Visual Step Indicator Bar */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className={`h-2 rounded-full transition-all ${regStep >= 1 ? 'bg-indigo-600' : 'bg-slate-200'}`} />
                    <div className={`h-2 rounded-full transition-all ${regStep === 2 ? 'bg-indigo-600' : 'bg-slate-200'}`} />
                    <div className="h-2 rounded-full bg-slate-200 relative overflow-hidden" title="Step 3: Personalised Onboarding launches immediately upon registration">
                      <div className="w-full h-full bg-gradient-to-r from-indigo-300 to-emerald-400 opacity-60" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
                    <span className={regStep === 1 ? 'text-indigo-600 font-bold' : 'text-slate-600'}>1. Basic Registration</span>
                    <span className={regStep === 2 ? 'text-indigo-600 font-bold' : 'text-slate-600'}>2. Profile Creation</span>
                    <span className="text-slate-400">3. Personalised Onboarding</span>
                  </div>
                </div>

                {regError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{regError}</span>
                  </div>
                )}

                {/* ----------------------------------------------------------- */}
                {/* STAGE 1: BASIC REGISTRATION                                  */}
                {/* ----------------------------------------------------------- */}
                {regStep === 1 && (
                  <form onSubmit={handleProceedToStep2} className="space-y-4" autoComplete="on">
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                        <User className="w-4 h-4 text-indigo-600" />
                        Account & Essential Credentials
                      </h4>
                      <p className="text-xs text-slate-500">
                        Create your candidate account. Progress is autosaved automatically in your browser.
                      </p>
                    </div>

                    {/* Candidate Full Name */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Candidate Full Name *
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        <input
                          type="text"
                          required
                          value={regName}
                          onChange={(e) => setRegName(e.target.value)}
                          placeholder="e.g. Nitin Singh"
                          className="w-full pl-9 pr-8 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 font-medium"
                        />
                        {regName.trim().length >= 2 && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 absolute right-3 top-2.5" />
                        )}
                      </div>
                    </div>

                    {/* Email Input with Institutional & Personal Support */}
                    <div className="space-y-2">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-xs font-semibold text-slate-700">
                            Primary Email Address *
                          </label>
                          <span className="text-[10px] text-slate-400">Institutional or Personal</span>
                        </div>
                        <div className="relative">
                          <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                          <input
                            type="email"
                            required
                            value={regCollegeEmail}
                            onChange={(e) => setRegCollegeEmail(e.target.value)}
                            placeholder="student@college.edu.in or candidate@gmail.com"
                            className="w-full pl-9 pr-8 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 font-medium"
                          />
                          {isEmailValid(regCollegeEmail) && (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 absolute right-3 top-2.5" />
                          )}
                        </div>
                      </div>

                      {/* Optional Backup Personal Email Toggle */}
                      <div>
                        <label className="inline-flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-800 cursor-pointer font-medium">
                          <input
                            type="checkbox"
                            checked={useSeparatePersonalEmail}
                            onChange={(e) => setUseSeparatePersonalEmail(e.target.checked)}
                            className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                          />
                          <span>Add separate personal backup email for job offers</span>
                        </label>
                        {useSeparatePersonalEmail && (
                          <div className="mt-1.5">
                            <input
                              type="email"
                              value={regPersonalEmail}
                              onChange={(e) => setRegPersonalEmail(e.target.value)}
                              placeholder="backup.personal@gmail.com"
                              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 font-medium"
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Contact Number & Roll Number */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Contact / WhatsApp Number *
                        </label>
                        <PhoneInputWithCountry
                          value={regContactNumber}
                          onChange={setRegContactNumber}
                          id="step1-contact-num"
                          required={true}
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          University Roll Number / USN *
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            required
                            value={regRoll}
                            onChange={(e) => setRegRoll(e.target.value)}
                            placeholder="e.g. 21BCSE088"
                            className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 font-mono font-medium"
                          />
                          {regRoll.trim().length >= 3 && (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 absolute right-3 top-2.5" />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* College & Campus City Selection */}
                    <div className="bg-slate-50/70 p-3 rounded-2xl border border-slate-200/80">
                      <CollegeCityAutocomplete
                        collegeName={regCollege}
                        cityName={regCollegeCity}
                        onChangeCollege={setRegCollege}
                        onChangeCity={setRegCollegeCity}
                        id="step1-college-autocomplete"
                        label="College / Institute Name"
                        showCityInput={true}
                        required={true}
                      />
                    </div>

                    {/* Password & Confirm Password */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Password (min 6 chars) *
                        </label>
                        <div className="relative">
                          <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                          <input
                            type={showRegPassword ? 'text' : 'password'}
                            required
                            value={regPassword}
                            onChange={(e) => setRegPassword(e.target.value)}
                            placeholder="Set strong password"
                            className="w-full pl-9 pr-8 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 font-medium"
                          />
                          <button
                            type="button"
                            onClick={() => setShowRegPassword(!showRegPassword)}
                            className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                          >
                            {showRegPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                        {regPassword && (
                          <div className="mt-1 flex items-center justify-between text-[10px]">
                            <span className="text-slate-500">Strength: {passwordStrength.label}</span>
                            <span className={`px-1.5 py-0.5 rounded font-bold ${passwordStrength.color}`}>
                              {passwordStrength.score}/4
                            </span>
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Confirm Password *
                        </label>
                        <div className="relative">
                          <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                          <input
                            type={showRegPassword ? 'text' : 'password'}
                            required
                            value={regConfirmPassword}
                            onChange={(e) => setRegConfirmPassword(e.target.value)}
                            placeholder="Repeat password"
                            className="w-full pl-9 pr-8 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 font-medium"
                          />
                          {passwordsMatch && (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 absolute right-3 top-2.5" />
                          )}
                        </div>
                        {regConfirmPassword && !passwordsMatch && (
                          <p className="text-[10px] text-red-500 mt-0.5">Passwords do not match</p>
                        )}
                      </div>
                    </div>

                    {/* Step 1 Actions */}
                    <div className="pt-3 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => executeFinalRegistration(true)}
                        className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 cursor-pointer"
                        title="Skip profile details now and complete later from profile"
                      >
                        <SkipForward className="w-3.5 h-3.5 text-slate-400" />
                        <span>Quick Register & Complete Later</span>
                      </button>

                      <button
                        type="submit"
                        className="w-full sm:w-auto px-6 py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                      >
                        <span>Continue to Profile Setup (Step 2)</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </form>
                )}

                {/* ----------------------------------------------------------- */}
                {/* STAGE 2: PROFILE CREATION                                    */}
                {/* ----------------------------------------------------------- */}
                {regStep === 2 && (
                  <div className="space-y-5">
                    
                    {/* Sub-tab Navigation */}
                    <div className="flex bg-slate-100 p-1 rounded-2xl overflow-x-auto text-xs font-semibold">
                      <button
                        type="button"
                        onClick={() => setProfileCreationActiveTab('academics')}
                        className={`flex-1 py-1.5 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer ${
                          profileCreationActiveTab === 'academics' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Academics</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setProfileCreationActiveTab('skills')}
                        className={`flex-1 py-1.5 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer ${
                          profileCreationActiveTab === 'skills' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Skills & Role ({regSkills.length})</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setProfileCreationActiveTab('projects')}
                        className={`flex-1 py-1.5 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer ${
                          profileCreationActiveTab === 'projects' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        <Briefcase className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Projects & Resume</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setProfileCreationActiveTab('links')}
                        className={`flex-1 py-1.5 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer ${
                          profileCreationActiveTab === 'links' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        <Award className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Links & Extras</span>
                      </button>
                    </div>

                    {/* TAB 1: ACADEMICS */}
                    {profileCreationActiveTab === 'academics' && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">Degree / Course</label>
                            <select
                              value={regCourse}
                              onChange={(e) => handleCourseChange(e.target.value)}
                              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs bg-white focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                            >
                              {INDIAN_HIGHER_EDUCATION_COURSES.map(c => (
                                <option key={c.id} value={c.id}>{c.displayName}</option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">Branch / Department</label>
                            <select
                              value={isCustomBranch ? '__CUSTOM__' : regBranch}
                              onChange={(e) => {
                                if (e.target.value === '__CUSTOM__') {
                                  setIsCustomBranch(true);
                                } else {
                                  setIsCustomBranch(false);
                                  setRegBranch(e.target.value as Branch);
                                }
                              }}
                              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs bg-white focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                            >
                              {availableBranchesForCourse.map(br => (
                                <option key={br.code} value={br.code}>{br.name}</option>
                              ))}
                              <option value="__CUSTOM__">+ Other / Custom Specialization...</option>
                            </select>
                          </div>
                        </div>

                        {isCustomBranch && (
                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">Specify Custom Branch</label>
                            <input
                              type="text"
                              value={customBranchInput}
                              onChange={(e) => setCustomBranchInput(e.target.value)}
                              placeholder="e.g. AI & Robotics Engineering"
                              className="w-full px-3 py-2 border border-indigo-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500"
                            />
                          </div>
                        )}

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">Admission Year</label>
                            <select
                              value={regAdmissionYear}
                              onChange={(e) => {
                                const yr = parseInt(e.target.value) || 2022;
                                setRegAdmissionYear(yr);
                                setRegGradYear(yr + (currentCourseDef.durationYears || 4));
                              }}
                              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs bg-white font-mono"
                            >
                              {[2020, 2021, 2022, 2023, 2024, 2025, 2026].map(yr => (
                                <option key={yr} value={yr}>{yr}</option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">Graduation Year</label>
                            <select
                              value={regGradYear}
                              onChange={(e) => setRegGradYear(parseInt(e.target.value) || 2026)}
                              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs bg-white font-mono"
                            >
                              {[2024, 2025, 2026, 2027, 2028, 2029, 2030].map(yr => (
                                <option key={yr} value={yr}>{yr}</option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">Current CGPA (out of 10)</label>
                            <input
                              type="number"
                              step="0.01"
                              min="1.0"
                              max="10.0"
                              value={regGPA}
                              onChange={(e) => setRegGPA(parseFloat(e.target.value) || 0)}
                              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono font-bold text-indigo-700"
                              placeholder="8.50"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">Active Backlogs</label>
                            <input
                              type="number"
                              min="0"
                              value={regBacklogs}
                              onChange={(e) => setRegBacklogs(parseInt(e.target.value) || 0)}
                              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">10th Board %</label>
                            <input
                              type="number"
                              step="0.1"
                              value={regTenth}
                              onChange={(e) => setRegTenth(parseFloat(e.target.value) || 0)}
                              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">12th Board / Diploma %</label>
                            <input
                              type="number"
                              step="0.1"
                              value={regTwelfth}
                              onChange={(e) => setRegTwelfth(parseFloat(e.target.value) || 0)}
                              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* TAB 2: SEARCHABLE SKILL TAGS & CAREER PREFERENCES */}
                    {profileCreationActiveTab === 'skills' && (
                      <div className="space-y-4">
                        
                        {/* Searchable Skill Tags Input */}
                        <div className="space-y-2">
                          <label className="block text-xs font-semibold text-slate-700">
                            Search & Select Technical Skills ({regSkills.length} selected)
                          </label>

                          {/* Search Input Box */}
                          <div className="relative">
                            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                            <input
                              type="text"
                              value={skillSearchQuery}
                              onChange={(e) => setSkillSearchQuery(e.target.value)}
                              placeholder="Search skills (e.g. Python, React, Docker, NLP, SQL)..."
                              className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500"
                            />
                          </div>

                          {/* Skill Categories Filter */}
                          <div className="flex flex-wrap gap-1 pt-1">
                            {['All', ...CATEGORIZED_SKILLS.map(c => c.category)].map(cat => (
                              <button
                                key={cat}
                                type="button"
                                onClick={() => setSelectedSkillCategory(cat)}
                                className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold transition-all cursor-pointer ${
                                  selectedSkillCategory === cat
                                    ? 'bg-slate-900 text-white shadow-2xs'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                              >
                                {cat}
                              </button>
                            ))}
                          </div>

                          {/* Selected Skills Chips */}
                          <div className="flex flex-wrap gap-1.5 p-2.5 bg-slate-50 border border-slate-200 rounded-xl min-h-[42px]">
                            {regSkills.map(skill => (
                              <span
                                key={skill}
                                className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-600 text-white rounded-lg text-xs font-medium shadow-2xs"
                              >
                                <span>{skill}</span>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveSkill(skill)}
                                  className="hover:text-indigo-200 cursor-pointer"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </span>
                            ))}
                            {regSkills.length === 0 && (
                              <span className="text-xs text-slate-400 italic">No skills selected yet. Click skills below to add.</span>
                            )}
                          </div>

                          {/* Filtered Skill Pills to Add */}
                          <div className="max-h-36 overflow-y-auto p-2 bg-white border border-slate-200/80 rounded-xl flex flex-wrap gap-1">
                            {filteredSkills.map(skill => {
                              const isSelected = regSkills.some(s => s.toLowerCase() === skill.toLowerCase());
                              return (
                                <button
                                  type="button"
                                  key={skill}
                                  onClick={() => toggleSkill(skill)}
                                  className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors cursor-pointer flex items-center gap-1 ${
                                    isSelected
                                      ? 'bg-indigo-50 text-indigo-700 border-indigo-300 font-bold'
                                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                                  }`}
                                >
                                  {isSelected ? <Check className="w-3 h-3 text-indigo-600" /> : <Plus className="w-3 h-3 text-slate-400" />}
                                  <span>{skill}</span>
                                </button>
                              );
                            })}
                          </div>

                          {/* Custom Skill Quick Adder */}
                          <div className="flex gap-2 pt-1">
                            <input
                              type="text"
                              value={customSkillInput}
                              onChange={(e) => setCustomSkillInput(e.target.value)}
                              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddCustomSkill(); }}}
                              placeholder="Or add custom skills (comma-separated, e.g. PySpark, Supabase)"
                              className="flex-1 px-3 py-1.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500"
                            />
                            <button
                              type="button"
                              onClick={handleAddCustomSkill}
                              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold cursor-pointer"
                            >
                              Add
                            </button>
                          </div>
                        </div>

                        {/* Career Preferences */}
                        <div className="space-y-3 pt-2 border-t border-slate-100">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-semibold text-slate-700 mb-1">Target Role</label>
                              <select
                                value={regPreferredRole}
                                onChange={(e) => setRegPreferredRole(e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs bg-white cursor-pointer"
                              >
                                <option value="Software Development Engineer (SDE-1)">Software Development Engineer (SDE-1)</option>
                                <option value="Frontend Engineer">Frontend Engineer</option>
                                <option value="Backend Systems Engineer">Backend Systems Engineer</option>
                                <option value="AI / Machine Learning Engineer">AI / Machine Learning Engineer</option>
                                <option value="Data Scientist / Analytics">Data Scientist / Analytics</option>
                                <option value="Cloud & DevOps Engineer">Cloud & DevOps Engineer</option>
                                <option value="Cybersecurity Analyst">Cybersecurity Analyst</option>
                                <option value="Product & Business Analyst">Product & Business Analyst</option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-xs font-semibold text-slate-700 mb-1">Preferred Location</label>
                              <input
                                type="text"
                                value={regPreferredLocation}
                                onChange={(e) => setRegPreferredLocation(e.target.value)}
                                placeholder="e.g. Bengaluru / Pune / Remote"
                                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
                              />
                            </div>
                          </div>
                        </div>

                      </div>
                    )}

                    {/* TAB 3: PROJECTS & RESUME */}
                    {profileCreationActiveTab === 'projects' && (
                      <div className="space-y-4">
                        
                        {/* Primary Project Details */}
                        <div className="p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-3">
                          <h5 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                            <Briefcase className="w-3.5 h-3.5 text-indigo-600" />
                            Featured Technical Project (Optional)
                          </h5>

                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">Project Title</label>
                            <input
                              type="text"
                              value={regProjectTitle}
                              onChange={(e) => setRegProjectTitle(e.target.value)}
                              placeholder="e.g. AI-Powered Placement Prediction Engine"
                              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">Technologies Used</label>
                            <input
                              type="text"
                              value={regProjectTech}
                              onChange={(e) => setRegProjectTech(e.target.value)}
                              placeholder="e.g. Python, FastAPI, React, PostgreSQL"
                              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">Project Summary / Impact</label>
                            <textarea
                              rows={2}
                              value={regProjectDescription}
                              onChange={(e) => setRegProjectDescription(e.target.value)}
                              placeholder="Briefly describe the problem solved, architecture, and quantifiable outcomes."
                              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
                            />
                          </div>
                        </div>

                        {/* Resume Text & ATS Scan */}
                        <div className="p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-3">
                          <div className="flex items-center justify-between">
                            <h5 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                              <FileText className="w-3.5 h-3.5 text-indigo-600" />
                              Resume Text for Instant ATS Keyword Scan
                            </h5>
                            <label className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-indigo-600 bg-indigo-50 border border-indigo-200 rounded-lg cursor-pointer hover:bg-indigo-100">
                              <Upload className="w-3 h-3" />
                              <span>Upload File</span>
                              <input type="file" accept=".txt,.md,.pdf" onChange={handleResumeFileUpload} className="hidden" />
                            </label>
                          </div>

                          <textarea
                            rows={3}
                            value={regResumeText}
                            onChange={(e) => setRegResumeText(e.target.value)}
                            placeholder="Paste your raw resume text here (education, experience, projects, skills) for automatic ATS scoring and keyword analysis."
                            className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono"
                          />
                          {regResumeFileName && (
                            <p className="text-[10px] text-emerald-600 font-semibold">Loaded: {regResumeFileName}</p>
                          )}
                        </div>

                      </div>
                    )}

                    {/* TAB 4: LINKS & EXTRAS */}
                    {profileCreationActiveTab === 'links' && (
                      <div className="space-y-4">
                        <div className="space-y-3">
                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">LinkedIn Profile URL</label>
                            <input
                              type="url"
                              value={regLinkedinUrl}
                              onChange={(e) => setRegLinkedinUrl(e.target.value)}
                              placeholder="https://linkedin.com/in/yourprofile"
                              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">GitHub Profile URL</label>
                            <input
                              type="url"
                              value={regGithubUrl}
                              onChange={(e) => setRegGithubUrl(e.target.value)}
                              placeholder="https://github.com/yourhandle"
                              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-semibold text-slate-700 mb-1">LeetCode Username</label>
                              <input
                                type="text"
                                value={regLeetcodeHandle}
                                onChange={(e) => setRegLeetcodeHandle(e.target.value)}
                                placeholder="leetcode_handle"
                                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-slate-700 mb-1">Problems Solved</label>
                              <input
                                type="number"
                                min="0"
                                value={regLeetcodeSolved}
                                onChange={(e) => setRegLeetcodeSolved(parseInt(e.target.value) || 0)}
                                placeholder="e.g. 150"
                                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Optional Student Verification Document */}
                        <div className="p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                              <FileCheck2 className="w-3.5 h-3.5 text-indigo-600" />
                              College Verification Proof (Optional for now)
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500">
                            Upload your College ID, Tuition Receipt, or Marksheet. You can skip this and upload anytime from your Profile.
                          </p>
                          <CollegeProofUpload
                            proof={regStudentProof}
                            onChange={(doc) => setRegStudentProof(doc)}
                            collegeName={regCollege}
                            admissionYear={regAdmissionYear}
                            graduationYear={regGradYear}
                          />
                        </div>

                      </div>
                    )}

                    {/* Step 2 Actions with Skip-for-Now Option */}
                    <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100">
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <button
                          type="button"
                          onClick={() => setRegStep(1)}
                          className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <ArrowLeft className="w-3.5 h-3.5" />
                          <span>Back to Step 1</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => executeFinalRegistration(true)}
                          className="px-3 py-2 text-xs font-semibold text-slate-600 hover:text-indigo-700 hover:bg-indigo-50/50 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                          title="Skip remaining profile fields for now and finish registration"
                        >
                          <SkipForward className="w-3.5 h-3.5 text-slate-400" />
                          <span>Skip Remaining & Finish</span>
                        </button>
                      </div>

                      <button
                        type="button"
                        disabled={isRegistering}
                        onClick={() => executeFinalRegistration(false)}
                        className="w-full sm:w-auto px-6 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
                      >
                        <Sparkles className="w-4 h-4 text-indigo-200" />
                        <span>{isRegistering ? 'Building Profile...' : 'Complete Profile & Launch Onboarding'}</span>
                      </button>
                    </div>

                  </div>
                )}

              </div>
            )}

            {/* ============================================================== */}
            {/* 2. STUDENT SIGN IN FORM                                        */}
            {/* ============================================================== */}
            {portalRole === 'student' && mode === 'login' && !showPasswordRecovery && (
              <form onSubmit={handleLoginSubmit} className="space-y-4" autoComplete="on">
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    <LogIn className="w-4 h-4 text-indigo-600" />
                    Sign In to Student Account
                  </h4>
                  <p className="text-xs text-slate-500">
                    Access your placement readiness, active campus drives, and personalized career roadmaps.
                  </p>
                </div>

                {loginError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{loginError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    College Email / Personal Email / Roll Number *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      required
                      value={loginIdentifier}
                      onChange={(e) => setLoginIdentifier(e.target.value)}
                      placeholder="e.g. nitin.singh@campus.edu or 21BCSE088"
                      className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 font-medium"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-700">Password *</label>
                    <button
                      type="button"
                      onClick={() => setShowPasswordRecovery(true)}
                      className="text-[11px] text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type={showLoginPassword ? 'text' : 'password'}
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="Enter account password"
                      className="w-full pl-9 pr-8 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showLoginPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Quick Demo Student Selector for Reviewer Convenience */}
                {registeredStudents.length > 0 && (
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
                    <span className="text-[11px] font-bold text-slate-700 block">
                      Quick Demo Profile Switcher
                    </span>
                    <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                      {registeredStudents.slice(0, 4).map((stu) => (
                        <button
                          key={stu.student_id}
                          type="button"
                          onClick={() => {
                            setLoginIdentifier(stu.collegeEmail || stu.email || stu.rollNumber);
                            setLoginPassword(stu.password || 'Placera@2025');
                          }}
                          className="px-2.5 py-1 text-[11px] font-medium bg-white hover:bg-indigo-50 text-slate-800 hover:text-indigo-700 border border-slate-200 rounded-lg transition-colors cursor-pointer"
                        >
                          {stu.name} ({stu.branch})
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isVerifyingLogin}
                  className="w-full py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
                >
                  <LogIn className="w-4 h-4" />
                  <span>{isVerifyingLogin ? 'Verifying...' : 'Sign In to Student Dashboard'}</span>
                </button>
              </form>
            )}

            {/* Password Recovery View */}
            {portalRole === 'student' && mode === 'login' && showPasswordRecovery && (
              <form onSubmit={handlePasswordRecovery} className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    <KeyRound className="w-4 h-4 text-indigo-600" />
                    Reset Account Password
                  </h4>
                  <button
                    type="button"
                    onClick={() => setShowPasswordRecovery(false)}
                    className="text-xs text-slate-500 hover:text-slate-800"
                  >
                    Back to login
                  </button>
                </div>

                {recoveryMessage && (
                  <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-indigo-800 text-xs">
                    {recoveryMessage}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Student Identifier (Roll No or Email)</label>
                  <input
                    type="text"
                    required
                    value={recoveryIdentifier}
                    onChange={(e) => setRecoveryIdentifier(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Registered Email Address</label>
                  <input
                    type="email"
                    required
                    value={recoveryEmail}
                    onChange={(e) => setRecoveryEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">New Password</label>
                    <input
                      type="password"
                      required
                      value={recoveryPassword}
                      onChange={(e) => setRecoveryPassword(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Confirm New Password</label>
                    <input
                      type="password"
                      required
                      value={recoveryConfirmPassword}
                      onChange={(e) => setRecoveryConfirmPassword(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs cursor-pointer"
                >
                  Save New Password
                </button>
              </form>
            )}

            {/* ============================================================== */}
            {/* 3. PLACEMENT OFFICER / ADMIN PORTAL AUTH                       */}
            {/* ============================================================== */}
            {portalRole === 'admin' && (
              <div className="space-y-4">
                <div className="flex bg-slate-100 p-1 rounded-2xl w-full text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => { setAdminError(null); setAdminSuccess(null); }}
                    className="flex-1 py-1.5 rounded-xl bg-white text-emerald-800 font-bold shadow-xs flex items-center justify-center gap-1.5"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Officer Sign In</span>
                  </button>
                </div>

                {adminError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{adminError}</span>
                  </div>
                )}
                {adminSuccess && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2 font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{adminSuccess}</span>
                  </div>
                )}

                <form onSubmit={handleAdminLoginSubmit} className="space-y-4">
                  {adminAuthType === 'passkey' ? (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Officer Institutional Email Address *
                        </label>
                        <input
                          type="email"
                          required
                          value={adminEmail}
                          onChange={(e) => setAdminEmail(e.target.value)}
                          placeholder="tpo.officer@campus.edu"
                          className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 font-medium"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Officer Security Passkey *
                        </label>
                        <div className="relative">
                          <input
                            type={showAdminPass ? 'text' : 'password'}
                            required
                            value={adminPassword}
                            onChange={(e) => setAdminPassword(e.target.value)}
                            placeholder="Enter master passkey"
                            className="w-full pl-3 pr-8 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 font-medium"
                          />
                          <button
                            type="button"
                            onClick={() => setShowAdminPass(!showAdminPass)}
                            className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                          >
                            {showAdminPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">6-Digit Master Emergency PIN</label>
                      <input
                        type="password"
                        maxLength={6}
                        value={adminPin}
                        onChange={(e) => setAdminPin(e.target.value)}
                        placeholder="749215"
                        className="w-full px-3 py-2 text-center font-mono tracking-widest text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  )}

                  {/* Demo Placement Officer Credentials Autofill */}
                  <div className="p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl flex items-center justify-between">
                    <div>
                      <span className="font-bold text-emerald-950 text-xs block">Demo Officer Credentials</span>
                      <span className="text-[11px] text-emerald-700 font-mono">tpo.officer@campus.edu | Admin@2025</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setAdminAuthType('passkey');
                        setAdminEmail('tpo.officer@campus.edu');
                        setAdminPassword('Admin@2025');
                      }}
                      className="px-2.5 py-1 text-xs font-bold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 rounded-lg cursor-pointer"
                    >
                      Autofill Demo
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <button
                      type="button"
                      onClick={() => setAdminAuthType(adminAuthType === 'passkey' ? 'pin' : 'passkey')}
                      className="text-emerald-700 hover:text-emerald-900 font-semibold cursor-pointer"
                    >
                      {adminAuthType === 'passkey' ? 'Use 6-Digit Master PIN instead' : 'Use Passkey login instead'}
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={isAdminSubmitting}
                    className="w-full py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>{isAdminSubmitting ? 'Authenticating...' : 'Access Central Placement Portal'}</span>
                  </button>
                </form>
              </div>
            )}

          </div>

        </div>
      </div>

      {/* Profile Photo Studio Modal */}
      {showPhotoModal && (
        <PhotoCaptureModal
          currentPhoto={regAvatarUrl}
          onSavePhoto={(url) => {
            setRegAvatarUrl(url);
            setShowPhotoModal(false);
          }}
          onRemovePhoto={() => {
            setRegAvatarUrl(undefined);
            setShowPhotoModal(false);
          }}
          onClose={() => setShowPhotoModal(false)}
          title="Choose Profile Picture or AI Avatar"
        />
      )}
    </>
  );
};
