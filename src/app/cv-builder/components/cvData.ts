export type SkillLevel = 'Básico' | 'Intermedio' | 'Avanzado' | 'Experto';
export type LanguageProficiency = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2' | 'Nativo';

export interface PersonalInfo {
  fullName: string;
  professionalTitle: string;
  email: string;
  phone: string;
  country: string;
  city: string;
  linkedin: string;
  website: string;
  nationality: string;
  summary: string;
}

export interface WorkExperience {
  id: string;
  jobTitle: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  description: string;
  achievements: string;
}

export interface Education {
  id: string;
  degree: string;
  institution: string;
  location: string;
  startYear: string;
  endYear: string;
  isCurrent: boolean;
  gpa: string;
  description: string;
}

export interface Project {
  id: string;
  name: string;
  role: string;
  description: string;
  technologies: string;
  url: string;
  startDate: string;
  endDate: string;
}

export interface Skill {
  id: string;
  name: string;
  level: SkillLevel;
  category: string;
}

export interface Language {
  id: string;
  language: string;
  proficiency: LanguageProficiency;
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  issueDate: string;
  expiryDate: string;
  credentialId: string;
  credentialUrl: string;
}

export interface Achievement {
  id: string;
  title: string;
  organization: string;
  date: string;
  description: string;
}

export interface CVData {
  personal: PersonalInfo;
  experience: WorkExperience[];
  education: Education[];
  projects: Project[];
  skills: Skill[];
  languages: Language[];
  certifications: Certification[];
  achievements: Achievement[];
  templateId: string;
  title: string;
  photo?: string;
  accentColor?: string;
  fontStyle?: 'sans' | 'serif' | 'mono' | 'calibri';
  fontSize?: string; // numeric string like "12", or legacy 'sm'|'md'|'lg'
}

export const defaultCVData: CVData = {
  title: 'Mi CV',
  templateId: 'moderno',
  personal: {
    fullName: '',
    professionalTitle: '',
    email: '',
    phone: '',
    country: '',
    city: '',
    linkedin: '',
    website: '',
    nationality: '',
    summary: '',
  },
  experience: [],
  education: [],
  projects: [],
  skills: [],
  languages: [],
  certifications: [],
  achievements: [],
  accentColor: '',
  fontStyle: 'sans',
  fontSize: '12',
};