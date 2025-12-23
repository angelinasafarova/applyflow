export type Source = 'linkedin' | 'hh' | 'indeed' | 'telegram' | 'direct' | 'other';

export type Status = 'saved' | 'applied' | 'screening' | 'test' | 'interview' | 'offer' | 'rejected';

export type ContactRole = 'recruiter' | 'hiring_manager' | 'other';

export interface User {
  id: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface Vacancy {
  id: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  companyName: string;
  roleTitle: string;
  link: string;
  source?: Source;
  salaryRange?: string;
  location?: string;
  notes?: string;
}

export interface Application {
  id: string;
  userId: string;
  vacancyId: string;
  createdAt: string;
  updatedAt: string;
  status: Status;
  appliedDate?: string;
  lastStatusChangeAt: string;
  nextStep?: string;
  nextStepDueDate?: string;
  // Joined data
  companyName?: string;
  roleTitle?: string;
  vacancyLink?: string;
  vacancySource?: Source;
  location?: string;
  salaryRange?: string;
  notes?: string;
}

export interface Contact {
  id: string;
  userId: string;
  vacancyId?: string;
  applicationId?: string;
  createdAt: string;
  name: string;
  role?: ContactRole;
  email?: string;
  linkedin?: string;
  lastMessageAt?: string;
  notes?: string;
}

// Form types
export interface VacancyForm {
  companyName: string;
  roleTitle: string;
  link: string;
  source?: Source;
  salaryRange?: string;
  location?: string;
  notes?: string;
}

export interface ApplicationForm {
  vacancyId: string;
  status: Status;
  appliedDate?: string;
  nextStep: string;
  nextStepDueDate?: string;
}

export interface ContactForm {
  name: string;
  role?: ContactRole;
  email?: string;
  linkedin?: string;
  lastMessageAt?: string;
  notes?: string;
}

// Todo types
export interface Todo {
  id: string;
  userId: string;
  applicationId?: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

// Analytics types
export interface StatusDistribution {
  status: Status;
  count: number;
}

export interface ConversionMetrics {
  stage: string;
  count: number;
  conversion: number;
}

export interface TimeInStage {
  status: Status;
  medianTime: number; // in days
}
