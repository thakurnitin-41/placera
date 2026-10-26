import { StudentProfileData } from '../types';

// Default empty preset list so the user starts with a clean slate and creates their own custom demo profiles
export const PRESET_STUDENT_PROFILES: { label: string; profile: StudentProfileData }[] = [];

// Fallback blank template helper for building a brand new candidate profile
export const createBlankStudentProfile = (name = 'Candidate'): StudentProfileData => ({
  student_id: `STU-${Date.now()}`,
  name: name,
  collegeEmail: '',
  personalEmail: '',
  contactNumber: '',
  email: '',
  rollNumber: '',
  collegeName: 'National Institute of Technology',
  course: 'B.Tech',
  branch: 'CSE',
  admissionYear: 2021,
  graduationYear: 2025,
  academicStanding: '4th Year (Final Year)',
  GPA: 8.0,
  tenthPercentage: 88.0,
  twelfthPercentage: 86.0,
  activeBacklogs: 0,
  historyOfBacklogs: 0,
  skills: ['Python', 'SQL', 'Data Structures & Algorithms'],
  certifications: [],
  achievements: [],
  projects: [],
  experience: 'Fresher',
  experienceLevel: 'Entry Level (Fresher)',
  preferred_role: 'Software Development Engineer',
  preferred_location: 'Bangalore / Hyderabad / Pune',
  job_type: 'Full-Time',
  coreSubjects: [
    'Data Structures & Algorithms',
    'Database Management Systems (DBMS)',
    'Operating Systems',
    'Computer Networks'
  ],
  atsResumeScore: 85,
  resumeFileName: 'Aarav_Sharma_Resume.pdf',
  resumeFileSize: '240 KB',
  willingToRelocate: true
});

export const DEFAULT_REGISTERED_STUDENTS: StudentProfileData[] = [
  {
    student_id: 'STU-2025-001',
    name: 'Aarav Sharma',
    collegeEmail: 'aarav.sharma@nitk.edu.in',
    personalEmail: 'aarav.sharma99@gmail.com',
    contactNumber: '+91 98765 43210',
    email: 'aarav.sharma@nitk.edu.in',
    rollNumber: '21BCSE042',
    collegeName: 'National Institute of Technology Karnataka',
    course: 'B.Tech',
    branch: 'CSE',
    admissionYear: 2021,
    graduationYear: 2025,
    academicStanding: '4th Year (Final Year)',
    GPA: 8.9,
    tenthPercentage: 94.5,
    twelfthPercentage: 92.0,
    activeBacklogs: 0,
    historyOfBacklogs: 0,
    skills: ['Python', 'SQL', 'Data Structures & Algorithms', 'Machine Learning', 'Pandas', 'FastAPI'],
    certifications: [
      { id: 'cert-1', name: 'AWS Certified Cloud Practitioner', issuingOrganization: 'Amazon Web Services', issueYear: '2024' },
      { id: 'cert-2', name: 'Deep Learning Specialization', issuingOrganization: 'Coursera / DeepLearning.AI', issueYear: '2023' }
    ],
    achievements: [
      { id: 'ach-1', title: '1st Place in Smart India Hackathon', category: 'Hackathon', organization: 'Ministry of Education', issueDate: 'Oct 2023', description: 'Built an AI-driven agricultural disease detector.' }
    ],
    projects: [
      {
        id: 'proj-1',
        title: 'Distributed Recommendation Engine',
        technologies: ['Python', 'SQL', 'FastAPI', 'Redis'],
        description: 'Engineered high-throughput content-based filtering pipeline processing 50k requests/min.'
      }
    ],
    experience: 'Fresher',
    experienceLevel: 'Entry Level (Fresher)',
    preferred_role: 'Software Development Engineer',
    preferred_location: 'Bangalore / Hyderabad / Pune',
    job_type: 'Full-Time',
    coreSubjects: [
      'Data Structures & Algorithms',
      'Database Management Systems (DBMS)',
      'Operating Systems',
      'Computer Networks',
      'System Design'
    ],
    atsResumeScore: 92,
    willingToRelocate: true,
    verificationStatus: 'Pending Review',
    studentProof: {
      documentType: 'College ID Card',
      fileName: 'aarav_nitk_id_card.pdf',
      fileUrl: 'data:application/pdf;base64,JVBERi0xLjQKJUlEQ2FyZ...NITK_Aarav',
      fileSize: '1.2 MB',
      uploadedAt: '2024-08-10',
      isVerified: false
    },
    adminNotes: 'Candidate registration submitted. Awaiting administrative review and verification.',
    uploadedMarksheets: [
      {
        id: 'ms-nitk-sem6',
        semesterOrYear: 'Semester 6',
        academicYear: '2023–2024 (3rd Year)',
        scoreOrGpa: '9.10 SGPA',
        issuingAuthority: 'NITK Autonomous Examination Board',
        fileName: 'aarav_nitk_sem6_gradecard.pdf',
        fileUrl: 'data:application/pdf;base64,JVBERi0xLjQKJUl...NITK_Gradecard',
        fileType: 'pdf',
        fileSize: '1.4 MB',
        uploadedAt: '2024-07-15',
        isVerified: true,
        verifiedBy: 'NITK TPO Office'
      },
      {
        id: 'ms-nitk-sem5',
        semesterOrYear: 'Semester 5',
        academicYear: '2023–2024 (3rd Year)',
        scoreOrGpa: '8.85 SGPA',
        issuingAuthority: 'NITK Autonomous Examination Board',
        fileName: 'aarav_nitk_sem5_marksheet.png',
        fileUrl: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800&auto=format&fit=crop&q=80',
        fileType: 'image',
        fileSize: '820 KB',
        uploadedAt: '2024-01-20',
        isVerified: true,
        verifiedBy: 'NITK TPO Office'
      },
      {
        id: 'ms-12th-board',
        semesterOrYear: 'Class 12th / Intermediate',
        academicYear: '2020–2021',
        scoreOrGpa: '92.00%',
        issuingAuthority: 'Central Board of Secondary Education (CBSE)',
        fileName: 'aarav_cbse_class12_marksheet.pdf',
        fileUrl: 'data:application/pdf;base64,JVBERi0xLjQKJUl...CBSE12',
        fileType: 'pdf',
        fileSize: '1.1 MB',
        uploadedAt: '2024-01-10',
        isVerified: true,
        verifiedBy: 'Dean Academic Affairs'
      }
    ],
    uploadedCertificates: [
      {
        id: 'cert-sih-2023',
        title: 'Smart India Hackathon 2023 - 1st Prize Winner',
        category: 'Hackathon & Competitions',
        issuingOrganization: 'Ministry of Education & AICTE',
        issueDate: 'Oct 2023',
        credentialId: 'SIH23-AI-9021',
        fileName: 'sih_2023_winner_certificate.png',
        fileUrl: 'https://images.unsplash.com/photo-1589330694653-dad6bc01cf0f?w=800&auto=format&fit=crop&q=80',
        fileType: 'image',
        fileSize: '950 KB',
        uploadedAt: '2023-11-02',
        isVerified: true
      },
      {
        id: 'cert-aws-cloud',
        title: 'AWS Certified Cloud Practitioner',
        category: 'Technical Certification',
        issuingOrganization: 'Amazon Web Services',
        issueDate: 'Feb 2024',
        credentialId: 'AWS-CC-874291',
        verificationUrl: 'https://aws.amazon.com/verification/AWS-CC-874291',
        fileName: 'aws_certified_cloud_practitioner.pdf',
        fileUrl: 'data:application/pdf;base64,JVBERi0xLjQKJUl...AWS',
        fileType: 'pdf',
        fileSize: '650 KB',
        uploadedAt: '2024-02-18',
        isVerified: true
      }
    ]
  },
  {
    student_id: 'STU-2025-002',
    name: 'Priya Nair',
    collegeEmail: 'priya.nair@iitd.ac.in',
    personalEmail: 'priya.nair.dev@outlook.com',
    contactNumber: '+91 91234 56789',
    email: 'priya.nair@iitd.ac.in',
    rollNumber: '22AI088',
    collegeName: 'Indian Institute of Technology Delhi',
    course: 'B.Tech',
    branch: 'AI & DS',
    admissionYear: 2022,
    graduationYear: 2026,
    academicStanding: '3rd Year (Pre-Final Year)',
    GPA: 9.2,
    tenthPercentage: 96.0,
    twelfthPercentage: 95.4,
    activeBacklogs: 0,
    historyOfBacklogs: 0,
    skills: ['Python', 'SQL', 'C++', 'Data Structures & Algorithms', 'Machine Learning', 'TensorFlow', 'NLP'],
    certifications: [
      { id: 'cert-3', name: 'TensorFlow Developer Certificate', issuingOrganization: 'Google', issueYear: '2024' }
    ],
    achievements: [
      { id: 'ach-2', title: 'Winner, IEEE Student Research Paper', category: 'Research & Publication', organization: 'IEEE Computational Intelligence Society', issueDate: 'May 2024', description: 'Authored paper on Low-Rank Adaptation of LLMs.' }
    ],
    projects: [
      {
        id: 'proj-2',
        title: 'Neural Placement Matcher',
        technologies: ['Python', 'PyTorch', 'SQL', 'Streamlit'],
        description: 'Fine-tuned bi-encoder neural network for semantic candidate-job matching.'
      }
    ],
    experience: 'Fresher',
    experienceLevel: 'Entry Level (Fresher)',
    preferred_role: 'Associate Data Scientist & Analyst',
    preferred_location: 'Bangalore / Hyderabad',
    job_type: 'Full-Time',
    coreSubjects: [
      'Data Structures & Algorithms',
      'Database Management Systems (DBMS)',
      'Operating Systems',
      'Artificial Intelligence & ML'
    ],
    atsResumeScore: 95,
    willingToRelocate: true,
    verificationStatus: 'Pending Review',
    studentProof: {
      documentType: 'Previous Semester Marksheet',
      fileName: 'priya_sem4_marksheet_2024.pdf',
      fileUrl: 'data:application/pdf;base64,JVBERi0xLjQKJUl...IITD_Marksheet',
      fileSize: '2.4 MB',
      uploadedAt: '2024-09-01',
      isVerified: false
    },
    marksheetProof: {
      documentType: 'Previous Semester Marksheet',
      fileName: 'priya_sem4_marksheet_2024.pdf',
      fileUrl: 'data:application/pdf;base64,JVBERi0xLjQKJUl...IITD_Marksheet',
      fileSize: '2.4 MB',
      uploadedAt: '2024-09-01',
      isVerified: false
    }
  },
  {
    student_id: 'STU-2025-003',
    name: 'Nathan Roy',
    collegeEmail: 'nathan.roy@nitk.edu.in',
    personalEmail: 'nathan.roy.dev@gmail.com',
    contactNumber: '+91 98112 34567',
    email: 'nathan.roy@nitk.edu.in',
    rollNumber: '21BCSE089',
    collegeName: 'National Institute of Technology Karnataka',
    course: 'B.Tech',
    branch: 'CSE',
    admissionYear: 2021,
    graduationYear: 2025,
    academicStanding: '4th Year (Final Year)',
    GPA: 8.75,
    tenthPercentage: 91.2,
    twelfthPercentage: 89.5,
    activeBacklogs: 0,
    historyOfBacklogs: 0,
    skills: ['React', 'Node.js', 'TypeScript', 'Python', 'SQL', 'MongoDB', 'Data Structures & Algorithms'],
    certifications: [
      { id: 'cert-nr-1', name: 'Meta Full-Stack Engineer Certificate', issuingOrganization: 'Meta / Coursera', issueYear: '2024' }
    ],
    achievements: [
      { id: 'ach-nr-1', title: 'Top 5 Finalist, National Web Hackathon', category: 'Hackathon', organization: 'AICTE', issueDate: 'Jan 2024', description: 'Built real-time collaborative dev environment.' }
    ],
    projects: [
      {
        id: 'proj-nr-1',
        title: 'Microservices Placement Gateway',
        technologies: ['Node.js', 'TypeScript', 'Docker', 'Redis'],
        description: 'Engineered secure auth and placement event dispatching microservice.'
      }
    ],
    experience: 'Fresher',
    experienceLevel: 'Entry Level (Fresher)',
    preferred_role: 'Full Stack Engineer / SDE-1',
    preferred_location: 'Bangalore / Pune / Hyderabad',
    job_type: 'Full-Time',
    coreSubjects: ['Data Structures & Algorithms', 'Operating Systems', 'Database Systems', 'Computer Networks'],
    atsResumeScore: 91,
    willingToRelocate: true,
    verificationStatus: 'Pending Review',
    studentProof: {
      documentType: 'College ID Card',
      fileName: 'nathan_nitk_id_card.pdf',
      fileUrl: 'data:application/pdf;base64,JVBERi0xLjQKJUlEQ2FyZF9OYXRoYW5fTklUSw==',
      fileSize: '1.1 MB',
      uploadedAt: '2024-09-12',
      isVerified: false,
      documentChecksum: 'sha256-nathan-college-id-card-nitk-2024'
    },
    adminNotes: 'Candidate registered. College ID card uploaded for manual verification.'
  },
  {
    student_id: 'STU-2025-004',
    name: 'Sunil Verma',
    collegeEmail: 'sunil.verma@nitk.edu.in',
    personalEmail: 'sunil.verma.tech@gmail.com',
    contactNumber: '+91 97234 56781',
    email: 'sunil.verma@nitk.edu.in',
    rollNumber: '22BAIDS014',
    collegeName: 'National Institute of Technology Karnataka',
    course: 'B.Tech',
    branch: 'AI & DS',
    admissionYear: 2022,
    graduationYear: 2026,
    academicStanding: '3rd Year (Pre-Final Year)',
    GPA: 8.42,
    tenthPercentage: 88.0,
    twelfthPercentage: 86.5,
    activeBacklogs: 0,
    historyOfBacklogs: 0,
    skills: ['Python', 'SQL', 'Data Science', 'Machine Learning', 'Tableau', 'Power BI', 'Pandas'],
    certifications: [
      { id: 'cert-sv-1', name: 'IBM Data Analyst Professional', issuingOrganization: 'IBM', issueYear: '2024' }
    ],
    achievements: [],
    projects: [
      {
        id: 'proj-sv-1',
        title: 'Customer Churn Predictor',
        technologies: ['Python', 'Scikit-learn', 'Streamlit'],
        description: 'Constructed ensemble XGBoost model predicting user attrition with 93% ROC-AUC.'
      }
    ],
    experience: 'Fresher',
    experienceLevel: 'Entry Level (Fresher)',
    preferred_role: 'Data Analyst & ML Associate',
    preferred_location: 'Bangalore / Hyderabad / Noida',
    job_type: 'Full-Time',
    coreSubjects: ['Database Management Systems (DBMS)', 'Python for Data Analysis', 'Statistical Inference'],
    atsResumeScore: 87,
    willingToRelocate: true,
    verificationStatus: 'Pending Review',
    studentProof: {
      documentType: 'College ID Card',
      fileName: 'sunil_id_scan.pdf',
      fileUrl: 'data:application/pdf;base64,JVBERi0xLjQKJUlEQ2FyZF9TdW5pbF9OSVRK==',
      fileSize: '950 KB',
      uploadedAt: '2024-09-14',
      isVerified: false,
      documentChecksum: 'sha256-sunil-college-id-card-nitk-2024'
    },
    adminNotes: 'Fresh registration pending administrative clearance.'
  },
  {
    student_id: 'STU-2025-005',
    name: 'Rohan Patel',
    collegeEmail: 'rohan.patel@nitk.edu.in',
    personalEmail: 'rohan.patel.ece@gmail.com',
    contactNumber: '+91 98451 23456',
    email: 'rohan.patel@nitk.edu.in',
    rollNumber: '21BECE015',
    collegeName: 'National Institute of Technology Karnataka',
    course: 'B.Tech',
    branch: 'ECE',
    admissionYear: 2021,
    graduationYear: 2025,
    academicStanding: '4th Year (Final Year)',
    GPA: 8.4,
    tenthPercentage: 91.0,
    twelfthPercentage: 88.5,
    activeBacklogs: 0,
    historyOfBacklogs: 0,
    skills: ['C++', 'Operating Systems', 'Linux', 'Computer Networks', 'Embedded Systems', 'Python'],
    certifications: [
      { id: 'cert-rp-1', name: 'ARM Embedded Systems Associate', issuingOrganization: 'ARM', issueYear: '2023' }
    ],
    achievements: [],
    projects: [],
    experience: 'Fresher',
    experienceLevel: 'Entry Level (Fresher)',
    preferred_role: 'Associate Embedded Systems & AI Engineer',
    preferred_location: 'Bangalore / Hyderabad',
    job_type: 'Full-Time',
    coreSubjects: ['Microprocessors', 'Digital Signal Processing', 'Operating Systems'],
    atsResumeScore: 89,
    willingToRelocate: true,
    verificationStatus: 'Verified',
    studentProof: {
      documentType: 'Previous Semester Marksheet',
      fileName: 'rohan_sem6_marksheet.pdf',
      fileUrl: 'data:application/pdf;base64,JVBERi0xLjQK...Rohan',
      fileSize: '1.5 MB',
      uploadedAt: '2024-08-15',
      isVerified: true,
      verifiedBy: 'TPO Officer',
      verifiedAt: '2024-08-16'
    }
  },
  {
    student_id: 'STU-2025-006',
    name: 'Ananya Iyer',
    collegeEmail: 'ananya.iyer@nitk.edu.in',
    personalEmail: 'ananya.iyer.dev@gmail.com',
    contactNumber: '+91 97412 89012',
    email: 'ananya.iyer@nitk.edu.in',
    rollNumber: '22BIT032',
    collegeName: 'National Institute of Technology Karnataka',
    course: 'B.Tech',
    branch: 'IT',
    admissionYear: 2022,
    graduationYear: 2026,
    academicStanding: '3rd Year (Pre-Final Year)',
    GPA: 7.6,
    tenthPercentage: 86.4,
    twelfthPercentage: 84.0,
    activeBacklogs: 0,
    historyOfBacklogs: 0,
    skills: ['JavaScript', 'HTML', 'CSS', 'React.js', 'Node.js', 'SQL'],
    certifications: [],
    achievements: [],
    projects: [],
    experience: 'Fresher',
    experienceLevel: 'Entry Level (Fresher)',
    preferred_role: 'Frontend Platform Engineering Intern',
    preferred_location: 'Bangalore',
    job_type: 'Full-Time',
    coreSubjects: ['Web Technologies', 'Database Management Systems', 'Computer Networks'],
    atsResumeScore: 84,
    willingToRelocate: true,
    verificationStatus: 'Pending Review',
    studentProof: {
      documentType: 'College ID Card',
      fileName: 'ananya_id_card.png',
      fileUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80',
      fileSize: '620 KB',
      uploadedAt: '2024-09-18',
      isVerified: false
    }
  },
  {
    student_id: 'STU-2025-007',
    name: 'Vikram Verma',
    collegeEmail: 'vikram.verma@nitk.edu.in',
    personalEmail: 'vikram.verma.cse@gmail.com',
    contactNumber: '+91 99001 23890',
    email: 'vikram.verma@nitk.edu.in',
    rollNumber: '21BCSE102',
    collegeName: 'National Institute of Technology Karnataka',
    course: 'B.Tech',
    branch: 'CSE',
    admissionYear: 2021,
    graduationYear: 2025,
    academicStanding: '4th Year (Final Year)',
    GPA: 7.2,
    tenthPercentage: 82.0,
    twelfthPercentage: 80.5,
    activeBacklogs: 1,
    historyOfBacklogs: 1,
    skills: ['Python', 'SQL', 'Machine Learning', 'HTML', 'CSS'],
    certifications: [],
    achievements: [],
    projects: [],
    experience: 'Fresher',
    experienceLevel: 'Entry Level (Fresher)',
    preferred_role: 'AI & Analytics Engineer',
    preferred_location: 'Pune / Mumbai / Bangalore',
    job_type: 'Full-Time',
    coreSubjects: ['Data Structures', 'Operating Systems', 'DBMS'],
    atsResumeScore: 80,
    willingToRelocate: true,
    verificationStatus: 'Flagged / Action Needed',
    adminNotes: 'Discrepancy in active backlog count versus semester 5 grade card.',
    studentProof: {
      documentType: 'Previous Semester Marksheet',
      fileName: 'vikram_marksheet.pdf',
      fileUrl: 'data:application/pdf;base64,JVBERi0xLjQK...Vikram',
      fileSize: '1.2 MB',
      uploadedAt: '2024-08-20',
      isVerified: false
    }
  },
  {
    student_id: 'STU-2025-008',
    name: 'Meera Deshmukh',
    collegeEmail: 'meera.deshmukh@nitk.edu.in',
    personalEmail: 'meera.d.ai@gmail.com',
    contactNumber: '+91 98860 11223',
    email: 'meera.deshmukh@nitk.edu.in',
    rollNumber: '22BAIDS055',
    collegeName: 'National Institute of Technology Karnataka',
    course: 'B.Tech',
    branch: 'AI & DS',
    admissionYear: 2022,
    graduationYear: 2026,
    academicStanding: '3rd Year (Pre-Final Year)',
    GPA: 8.1,
    tenthPercentage: 89.5,
    twelfthPercentage: 88.0,
    activeBacklogs: 0,
    historyOfBacklogs: 0,
    skills: ['Python', 'Machine Learning', 'SQL', 'Scikit-learn', 'NLP', 'PyTorch'],
    certifications: [],
    achievements: [],
    projects: [],
    experience: 'Fresher',
    experienceLevel: 'Entry Level (Fresher)',
    preferred_role: 'AI/ML Engineering Associate',
    preferred_location: 'Bangalore / Hyderabad',
    job_type: 'Full-Time',
    coreSubjects: ['Deep Learning', 'Statistics & Probability', 'DBMS'],
    atsResumeScore: 88,
    willingToRelocate: true,
    verificationStatus: 'Verified',
    studentProof: {
      documentType: 'Previous Semester Marksheet',
      fileName: 'meera_sem4_marksheet.pdf',
      fileUrl: 'data:application/pdf;base64,JVBERi0xLjQK...Meera',
      fileSize: '1.8 MB',
      uploadedAt: '2024-08-25',
      isVerified: true,
      verifiedBy: 'TPO Officer',
      verifiedAt: '2024-08-26'
    }
  }
];

export interface PlacementCellStudent {
  id: string;
  name: string;
  branch: string;
  gpa: number;
  skills: string[];
  topMatchRole: string;
  topMatchCompany: string;
  matchScore: number;
  placementStatus: 'Placed' | 'Shortlisted' | 'Interviewing' | 'Open';
  ctcOffered?: string;
}

export const MOCK_PLACEMENT_STUDENTS: PlacementCellStudent[] = [
  { id: 'STU-102', name: 'Aarav Sharma', branch: 'AI & DS', gpa: 8.9, skills: ['Python', 'Machine Learning', 'Pandas', 'SQL', 'NLP'], topMatchRole: 'Associate Data Scientist & Analyst', topMatchCompany: 'Zomato', matchScore: 96, placementStatus: 'Placed', ctcOffered: '₹21 LPA' },
  { id: 'STU-103', name: 'Priya Nair', branch: 'CSE', gpa: 8.7, skills: ['C++', 'Data Structures & Algorithms', 'Python', 'SQL', 'System Design'], topMatchRole: 'Software Development Engineer I', topMatchCompany: 'Microsoft IDC', matchScore: 95, placementStatus: 'Placed', ctcOffered: '₹44 LPA' },
  { id: 'STU-104', name: 'Rohan Patel', branch: 'ECE', gpa: 8.4, skills: ['C++', 'Operating Systems', 'Linux', 'Computer Networks'], topMatchRole: 'Associate Embedded Systems & AI Engineer', topMatchCompany: 'Qualcomm India', matchScore: 91, placementStatus: 'Interviewing' },
  { id: 'STU-105', name: 'Ananya Iyer', branch: 'IT', gpa: 7.6, skills: ['JavaScript', 'HTML', 'CSS', 'React.js', 'Node.js'], topMatchRole: 'Frontend Platform Engineering Intern + PPO', topMatchCompany: 'Postman', matchScore: 89, placementStatus: 'Shortlisted' },
  { id: 'STU-106', name: 'Vikram Verma', branch: 'CSE', gpa: 7.2, skills: ['Python', 'SQL', 'Machine Learning', 'HTML', 'CSS'], topMatchRole: 'TCS Digital - AI & Analytics Engineer', topMatchCompany: 'Tata Consultancy Services', matchScore: 88, placementStatus: 'Placed', ctcOffered: '₹8.5 LPA' },
  { id: 'STU-107', name: 'Meera Deshmukh', branch: 'AI & DS', gpa: 8.1, skills: ['Python', 'Machine Learning', 'SQL', 'Scikit-learn', 'NLP'], topMatchRole: 'AI/ML Engineering Associate', topMatchCompany: 'Razorpay', matchScore: 92, placementStatus: 'Interviewing' },
  { id: 'STU-108', name: 'Karthik Raja', branch: 'ECE', gpa: 7.9, skills: ['Python', 'Computer Networks', 'Operating Systems', 'SQL'], topMatchRole: 'Consulting Engineer - Cloud Networking', topMatchCompany: 'Cisco Systems', matchScore: 87, placementStatus: 'Shortlisted' },
  { id: 'STU-109', name: 'Sanya Mirza', branch: 'IT', gpa: 8.5, skills: ['Python', 'Java', 'SQL', 'Operating Systems', 'Computer Networks'], topMatchRole: 'Cloud Associate Software Engineer', topMatchCompany: 'Amazon Web Services', matchScore: 93, placementStatus: 'Placed', ctcOffered: '₹34 LPA' },
  { id: 'STU-110', name: 'Aditya Sen', branch: 'CSE', gpa: 6.9, skills: ['Java', 'SQL', 'HTML', 'CSS', 'JavaScript'], topMatchRole: 'GenC Next - Full Stack Developer', topMatchCompany: 'Cognizant', matchScore: 84, placementStatus: 'Placed', ctcOffered: '₹7 LPA' },
  { id: 'STU-111', name: 'Divya Reddy', branch: 'CSE', gpa: 7.8, skills: ['C++', 'Python', 'SQL', 'Data Structures & Algorithms'], topMatchRole: 'Specialist Programmer (Power Programmer)', topMatchCompany: 'Infosys', matchScore: 86, placementStatus: 'Shortlisted' },
  { id: 'STU-112', name: 'Harsh Vardhan', branch: 'EEE', gpa: 7.4, skills: ['C++', 'Java', 'SQL', 'HTML'], topMatchRole: 'Exceller - Software Engineer', topMatchCompany: 'Capgemini', matchScore: 78, placementStatus: 'Open' },
  { id: 'STU-113', name: 'Tanvi Joshi', branch: 'CSE', gpa: 8.6, skills: ['C++', 'Python', 'SQL', 'Kafka', 'Computer Networks'], topMatchRole: 'Associate Software Development Engineer (SDE-1)', topMatchCompany: 'Flipkart', matchScore: 92, placementStatus: 'Interviewing' },
  { id: 'STU-114', name: 'Nikhil Kulkarni', branch: 'IT', gpa: 7.5, skills: ['Python', 'Machine Learning', 'SQL', 'Data Analysis'], topMatchRole: 'Analyst - AI & Cognitive Computing', topMatchCompany: 'Deloitte USI', matchScore: 88, placementStatus: 'Placed', ctcOffered: '₹9 LPA' },
  { id: 'STU-115', name: 'Sneha Roy', branch: 'AI & DS', gpa: 8.3, skills: ['Python', 'SQL', 'Machine Learning', 'Data Preprocessing'], topMatchRole: 'Graduate Engineer Trainee - Jio AI Labs', topMatchCompany: 'Jio Platforms', matchScore: 90, placementStatus: 'Shortlisted' }
];
