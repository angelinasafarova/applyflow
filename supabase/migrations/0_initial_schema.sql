
-- Create Enums
CREATE TYPE source_enum AS ENUM ('linkedin', 'hh', 'indeed', 'telegram', 'direct', 'other');
CREATE TYPE status_enum AS ENUM ('saved', 'applied', 'screening', 'test', 'interview', 'offer', 'rejected');
CREATE TYPE contact_role_enum AS ENUM ('recruiter', 'hiring_manager', 'other');

-- Create Vacancies Table
CREATE TABLE public.vacancies (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid REFERENCES auth.users(id) NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    company_name text NOT NULL,
    role_title text NOT NULL,
    link text NOT NULL,
    source source_enum,
    salary_range text,
    location text,
    notes text,
    CONSTRAINT vacancies_pkey PRIMARY KEY (id)
);

ALTER TABLE public.vacancies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own vacancies." ON public.vacancies
    FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own vacancies." ON public.vacancies
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own vacancies." ON public.vacancies
    FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own vacancies." ON public.vacancies
    FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Create Applications Table
CREATE TABLE public.applications (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid REFERENCES auth.users(id) NOT NULL,
    vacancy_id uuid REFERENCES public.vacancies(id) NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    status status_enum DEFAULT 'saved'::status_enum NOT NULL,
    applied_date date,
    last_status_change_at timestamp with time zone DEFAULT now() NOT NULL,
    next_step text NOT NULL,
    next_step_due_date date,
    CONSTRAINT applications_pkey PRIMARY KEY (id)
);

ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own applications." ON public.applications
    FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own applications." ON public.applications
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own applications." ON public.applications
    FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own applications." ON public.applications
    FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Create Contacts Table
CREATE TABLE public.contacts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid REFERENCES auth.users(id) NOT NULL,
    vacancy_id uuid REFERENCES public.vacancies(id),
    application_id uuid REFERENCES public.applications(id),
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    name text NOT NULL,
    role contact_role_enum,
    email text,
    linkedin text,
    last_message_at date,
    notes text,
    CONSTRAINT contacts_pkey PRIMARY KEY (id)
);

ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own contacts." ON public.contacts
    FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own contacts." ON public.contacts
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own contacts." ON public.contacts
    FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own contacts." ON public.contacts
    FOR DELETE TO authenticated USING (auth.uid() = user_id);

