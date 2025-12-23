export type ApplicationStatus = "saved" | "applied" | "screening" | "test" | "interview" | "offer" | "rejected";

export type ApplicationWithVacancy = {
  id: string;
  user_id: string;
  vacancy_id: string;
  created_at: string;
  updated_at: string;
  status: ApplicationStatus;
  applied_date: string | null;
  last_status_change_at: string;
  next_step: string;
  next_step_due_date: string | null;
  vacancies: {
    company_name: string;
    role_title: string;
  };
};

export type Vacancy = {
  id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  company_name: string;
  role_title: string;
  link: string;
  source: string | null;
  salary_range: string | null;
  location: string | null;
  notes: string | null;
};

