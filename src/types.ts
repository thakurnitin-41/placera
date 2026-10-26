export type Branch = 
  | 'CSE' 
  | 'AI & DS' 
  | 'IT' 
  | 'ECE' 
  | 'EEE' 
  | 'MECH' 
  | 'Mechanical' 
  | 'Civil'
  | (string & {});

export type JobType = 'Full-Time' | 'Internship' | 'Intern + PPO';

export type ApplicationStatus = 'Saved' | 'Applied' | 'Assessment' | 'Interview' | 'Offer' | 'Rejected';

export interface ApplicationRecord {
  jobId: string;
  status: ApplicationStatus;
  updatedAt: string;
}

export type ExperienceLevel = 
  | 'Entry Level (Fresher)' 
  | '0-1 Years' 
  | '1-2 Years'
  | 'Internship / Trainee (0 Years)'
  | 'Entry Level / Fresher (0-1 Years)'
  | 'Junior Associate (1-2 Years)'
  | 'Mid-Level (2-3+ Years)';

export interface Project {
  id: string;
  title: string;
  description: string;
  technologies: string[];
}

export interface Certification {
  id: string;
  name: string;
  issuingOrganization: string;
  issueYear?: string;
}

export type AchievementCategory = 
  | 'Hackathon' 
  | 'Competitive Programming' 
  | 'Academic Honor' 
  | 'Research & Publication' 
  | 'Open Source' 
  | 'Leadership & Club';

export interface Achievement {
  id: string;
  title: string;
  category: AchievementCategory;
  organization: string;
  issueDate: string; // e.g. "Oct 2024"
  date?: string; // alias for issueDate
  description: string;
  badgeLevel?: string; // e.g. "Winner / 1st Place", "Runner-Up", "Finalist", "Top 1%"
  rank?: string; // alias for badgeLevel
  link?: string;
  proofUrl?: string; // alias for link
}

export interface StudentProofDocument {
  documentType: 'College ID Card' | 'Previous Semester Marksheet' | 'Tuition Fee Receipt' | 'Admission Letter' | 'Bonafide Certificate';
  fileName: string;
  fileUrl: string; // Base64 or document URL
  fileSize?: string;
  uploadedAt: string;
  isVerified?: boolean;
  verificationNotes?: string;
  verifiedAt?: string;
  verifiedBy?: string;
  // Security & Fraud Detection metadata
  isDuplicateDetected?: boolean;
  duplicateMatchStudentName?: string;
  duplicateMatchRollNumber?: string;
  duplicateMatchStudentId?: string;
  documentHash?: string;
  documentChecksum?: string;
}

export interface AcademicMarksheetDocument {
  id: string;
  semesterOrYear: string; // e.g. "Semester 1", "Semester 2", "Semester 3", "Semester 4", "1st Year Consolidated", "Class 10th Board", "Class 12th / Diploma"
  academicYear: string; // e.g. "2024–2025"
  scoreOrGpa?: string; // e.g. "8.95 SGPA" or "92.4%"
  issuingAuthority?: string; // e.g. "Autonomous Examination Cell / University"
  fileName: string;
  fileType: 'image' | 'pdf' | 'document';
  fileUrl: string; // Base64 data or URL
  fileSize?: string;
  uploadedAt: string;
  isVerified?: boolean;
  verifiedBy?: string;
  verifiedAt?: string;
  notes?: string;
}

export interface UploadedCertificateDocument {
  id: string;
  title: string; // e.g. "AWS Certified Solutions Architect", "1st Prize Smart India Hackathon"
  category: 'Technical Certification' | 'Hackathon & Competitions' | 'Academic Honor' | 'Research & Publication' | 'Internship Completion' | 'Leadership & Extracurricular';
  issuingOrganization: string; // e.g. "Amazon Web Services", "Ministry of Education"
  issueDate: string; // e.g. "Oct 2024"
  credentialId?: string; // e.g. "AWS-CERT-94821"
  verificationUrl?: string; // e.g. "https://aws.amazon.com/verification/..."
  fileName: string;
  fileType: 'image' | 'pdf' | 'document';
  fileUrl: string; // Base64 data or URL
  fileSize?: string;
  uploadedAt: string;
  isVerified?: boolean;
  verifiedBy?: string;
  verifiedAt?: string;
  notes?: string;
}

export interface VerificationFeedback {
  flaggedAt: string;
  flaggedBy: string;
  status: 'Flagged / Action Needed' | 'Rejected';
  unverifiedDataItems: string[]; // e.g. ["Previous Year Marksheet", "Claimed CGPA / Backlogs", "College ID Proof", "10th / 12th Board Records", "Achievement Certificate"]
  issues: string[]; // e.g. ["Official university stamp or seal missing", "Photo/scan is blurry or illegible", "Discrepancy in CGPA vs Grade Card"]
  requiredChanges: string; // Instructions on what the student needs to correct
  customNotes?: string;
  actionDeadline?: string;
  resolved?: boolean;
  resolvedAt?: string;
}

export interface StudentProfileData {
  student_id: string;
  name: string;
  collegeEmail?: string; // Institutional email (e.g. 21bce042@college.edu.in)
  personalEmail?: string; // Personal email (e.g. candidate@gmail.com)
  contactNumber?: string; // Mobile / Phone number (e.g. +91 98765 43210)
  studentProof?: StudentProofDocument; // College student verification document
  marksheetProof?: StudentProofDocument; // Verified previous year / semester marksheet
  uploadedMarksheets?: AcademicMarksheetDocument[]; // Previous year mark sheets & semester grade cards
  uploadedCertificates?: UploadedCertificateDocument[]; // Achievement, hackathon & technical certificates
  verificationStatus?: 'Verified' | 'Pending Review' | 'Flagged / Action Needed' | 'Rejected';
  verificationFeedback?: VerificationFeedback; // Detailed admin reasons & required fixes
  adminNotes?: string;
  verifiedBy?: string;
  verifiedAt?: string;
  email?: string; // Backward compatibility alias
  password?: string;
  passwordHash?: string; // SHA-256 salted encrypted hash
  passwordSalt?: string; // Cryptographic salt
  avatarUrl?: string; // base64 or photo URL
  rollNumber: string; // USN / University Registration No
  collegeName: string; // University / College Name
  collegeCity?: string; // Campus city (e.g. Noida, Bengaluru, Pune)
  course?: string; // Degree / Program (e.g. B.Tech, B.Sc, MBA, BBA, BCA, M.Tech, MCA, B.Com, BA)
  branch: Branch;
  admissionYear?: number; // e.g. 2021
  graduationYear: number; // e.g. 2025
  academicStanding?: string; // e.g. "2nd Year (Sophomore)"
  cgpaSemesterContext?: string; // e.g. "Up to 2nd Semester / 1st Year"
  academicSession?: string; // e.g. "2026–2027"
  GPA: number; // CGPA out of 10.0
  tenthPercentage: number; // 10th Board %
  twelfthPercentage: number; // 12th Board / Diploma %
  activeBacklogs: number; // Active standing backlogs (critical for placement eligibility)
  historyOfBacklogs: number; // Historical cleared backlogs
  skills: string[];
  certifications: Certification[];
  achievements?: Achievement[];
  projects: Project[];
  experience: string;
  experienceLevel: ExperienceLevel;
  preferred_role: string;
  preferred_location: string;
  job_type: JobType;
  // Competitive coding and professional profiles
  leetcodeHandle?: string;
  leetcodeSolved?: number;
  codeforcesOrChefRating?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  // Academic coursework & leadership
  coreSubjects?: string[];
  leadershipAndExtracurriculars?: string[];
  atsResumeScore?: number; // ATS Resume Score out of 100
  resumeFileName?: string;
  resumeText?: string;
  willingToRelocate?: boolean;
}

export type TargetRole =
  | 'Software Development Engineer (SDE-1)'
  | 'Frontend Engineer'
  | 'Backend Systems Engineer'
  | 'AI / Machine Learning Engineer'
  | 'Data Scientist / Analytics'
  | 'Cloud & DevOps Engineer'
  | 'Cybersecurity Analyst'
  | 'Product & Business Analyst';

export interface TargetRoleInfo {
  id: string;
  title: TargetRole;
  category: 'Software Engineering' | 'Data & AI' | 'Cloud & Systems' | 'Security & Analytics';
  description: string;
  coreSkills: string[];
  secondarySkills: string[];
  commonCoursework: string[];
  avgPackageRange: string;
  typicalInterviewRounds: string[];
}

export interface EligibilityReport {
  overallStatus: 'Eligible' | 'Borderline' | 'Ineligible';
  cgpaPassed: boolean;
  cgpaDiff: number;
  backlogsPassed: boolean;
  activeBacklogs: number;
  maxBacklogsAllowed: number;
  branchPassed: boolean;
  graduationYearPassed: boolean;
  notes: string[];
}

export interface ExplainableScoreReason {
  type: 'positive' | 'warning' | 'info';
  title: string;
  detail: string;
  weightImpact: string;
}

export interface ExplainableScoreBreakdown {
  semantic_nlp_score: number; // 35% weight
  multi_criteria_fit_score: number; // 35% weight
  skill_overlap_score: number; // 30% weight
  target_role_bonus: number;
  reasons: ExplainableScoreReason[];
}

export interface JobPosting {
  job_id: string;
  company: string;
  job_title: string;
  required_skills: string[];
  preferred_skills: string[];
  experience_level: ExperienceLevel;
  minimum_gpa: number;
  eligible_branches: Branch[];
  location: string;
  job_type: JobType;
  description: string;
  ctc_range?: string;
  category?: 'Tier 1 (Dream)' | 'Tier 2' | 'Core IT' | 'Start-up' | 'Tier 3 (Core/Mass)';
  role_category?: string;
  interview_rounds?: string[];
  max_allowed_backlogs?: number;
  eligible_graduation_years?: number[];
  work_mode?: 'On-site' | 'Hybrid' | 'Remote';
  application_deadline?: string;
  application_url?: string;
  isSyntheticDemoData?: boolean;
}

export interface RecommendationResult {
  recommendation_id: string;
  student_id: string;
  job: JobPosting;
  cosine_similarity_score: number; // 0 - 100
  multi_criteria_fit_score: number; // 0 - 100 (formerly rf_fit_score)
  rf_fit_score?: number; // Backwards-compatibility alias
  final_match_score: number; // 0 - 100
  matching_skills: string[];
  missing_skills: string[];
  gpa_eligible: boolean;
  branch_eligible: boolean;
  relevant_projects: string[];
  relevant_certifications: string[];
  recommendation_reason: string;
  score_breakdown?: ExplainableScoreBreakdown;
  eligibility_report?: EligibilityReport;
  timestamp: string;
}

export interface ATSResumeAnalysis {
  atsScore: number; // 0 to 100
  readinessGrade: 'Elite' | 'Competitive' | 'Needs Improvement' | 'Critical Gaps';
  foundSkills: string[];
  missingKeySkills: string[];
  metricsDetectedCount: number;
  actionVerbsCount: number;
  wordCount: number;
  sectionScores: {
    skillsMatch: number;
    experienceImpact: number;
    projectRelevance: number;
    formattingStructure: number;
  };
  suggestions: string[];
}

export interface SimulationResult {
  addedSkills: string[];
  addedLeetCodeCount: number;
  addedCertifications: string[];
  originalAverageMatch: number;
  simulatedAverageMatch: number;
  averageDelta: number;
  newlyEligibleJobCount: number;
  topGains: {
    jobTitle: string;
    company: string;
    beforeMatch: number;
    afterMatch: number;
    delta: number;
  }[];
}

export interface SkillGapItem {
  skill: string;
  status: 'matching' | 'partial' | 'missing';
  priority: 'High' | 'Medium' | 'Low';
  category: 'Languages' | 'AI/ML' | 'Web & Backend' | 'Databases' | 'DevOps & Tools';
  importance_score: number; // 1 to 10
  learning_resources?: string;
}

export interface PipelineStep {
  id: number;
  name: string;
  shortDesc: string;
  status: 'pending' | 'processing' | 'completed';
  details: string;
  vivaKeyPoint: string;
  formula?: string;
}

export type ActivePage =
  | 'landing'
  | 'about'
  | 'dashboard'
  | 'onboarding'
  | 'profile'
  | 'pipeline'
  | 'recommendations'
  | 'skill-gap'
  | 'jobs'
  | 'ai-insights'
  | 'placement-cell'
  | 'admin'
  | 'waiting-approval';
