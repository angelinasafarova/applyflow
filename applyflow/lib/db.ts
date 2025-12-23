import Database from 'better-sqlite3';
import path from 'path';

// Initialize database
const dbPath = path.join(process.cwd(), 'applyflow.db');
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Create tables
const createTables = () => {
  // Users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Vacancies table
  db.exec(`
    CREATE TABLE IF NOT EXISTS vacancies (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      company_name TEXT NOT NULL,
      role_title TEXT NOT NULL,
      link TEXT NOT NULL,
      source TEXT CHECK(source IN ('linkedin', 'hh', 'indeed', 'telegram', 'direct', 'other')),
      salary_range TEXT,
      location TEXT,
      notes TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  // Applications table
  db.exec(`
    CREATE TABLE IF NOT EXISTS applications (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      vacancy_id TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      status TEXT DEFAULT 'saved' CHECK(status IN ('saved', 'applied', 'screening', 'test', 'interview', 'offer', 'rejected')),
      applied_date DATE,
      last_status_change_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      next_step TEXT,
      next_step_due_date DATE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (vacancy_id) REFERENCES vacancies(id) ON DELETE CASCADE
    );
  `);

  // Contacts table
  db.exec(`
    CREATE TABLE IF NOT EXISTS contacts (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      vacancy_id TEXT,
      application_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      name TEXT NOT NULL,
      role TEXT CHECK(role IN ('recruiter', 'hiring_manager', 'other')),
      email TEXT,
      linkedin TEXT,
      last_message_at DATE,
      notes TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (vacancy_id) REFERENCES vacancies(id),
      FOREIGN KEY (application_id) REFERENCES applications(id)
    );
  `);

  // Todos table
  db.exec(`
    CREATE TABLE IF NOT EXISTS todos (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      application_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      title TEXT NOT NULL,
      description TEXT,
      completed BOOLEAN DEFAULT FALSE,
      priority TEXT DEFAULT 'medium' CHECK(priority IN ('high', 'medium', 'low')),
      due_date DATE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (application_id) REFERENCES applications(id)
    );
  `);

  // Create indexes for better performance
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_vacancies_user_id ON vacancies(user_id);
    CREATE INDEX IF NOT EXISTS idx_applications_user_id ON applications(user_id);
    CREATE INDEX IF NOT EXISTS idx_applications_vacancy_id ON applications(vacancy_id);
    CREATE INDEX IF NOT EXISTS idx_contacts_user_id ON contacts(user_id);
    CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
    CREATE INDEX IF NOT EXISTS idx_applications_next_step_due_date ON applications(next_step_due_date);
    CREATE INDEX IF NOT EXISTS idx_todos_user_id ON todos(user_id);
    CREATE INDEX IF NOT EXISTS idx_todos_application_id ON todos(application_id);
  `);
};

// Initialize database
createTables();

// Prepared statements for common operations
export const dbStatements = {
  // Users
  createUser: db.prepare(`
    INSERT OR IGNORE INTO users (id, email) VALUES (?, ?)
  `),

  getUserById: db.prepare(`
    SELECT * FROM users WHERE id = ?
  `),

  getUserByEmail: db.prepare(`
    SELECT * FROM users WHERE email = ?
  `),

  // Vacancies
  createVacancy: db.prepare(`
    INSERT INTO vacancies (id, user_id, company_name, role_title, link, source, salary_range, location, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `),

  getVacanciesByUserId: db.prepare(`
    SELECT * FROM vacancies WHERE user_id = ? ORDER BY created_at DESC
  `),

  getVacancyById: db.prepare(`
    SELECT
      id,
      user_id as userId,
      company_name as companyName,
      role_title as roleTitle,
      link,
      source,
      salary_range as salaryRange,
      location,
      notes,
      created_at as createdAt,
      updated_at as updatedAt
    FROM vacancies WHERE id = ? AND user_id = ?
  `),

  updateVacancy: db.prepare(`
    UPDATE vacancies SET
      company_name = ?,
      role_title = ?,
      link = ?,
      source = ?,
      salary_range = ?,
      location = ?,
      notes = ?,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ? AND user_id = ?
  `),

  // Applications
  createApplication: db.prepare(`
    INSERT INTO applications (id, user_id, vacancy_id, status, next_step, next_step_due_date)
    VALUES (?, ?, ?, ?, ?, ?)
  `),

  getApplicationsByUserId: db.prepare(`
    SELECT
      a.*,
      v.company_name as companyName,
      v.role_title as roleTitle,
      v.link as vacancyLink,
      v.source as vacancySource,
      v.location,
      v.salary_range as salaryRange,
      v.notes,
      a.vacancy_id as vacancyId
    FROM applications a
    JOIN vacancies v ON a.vacancy_id = v.id
    WHERE a.user_id = ?
    ORDER BY a.created_at DESC
  `),

  getApplicationById: db.prepare(`
    SELECT
      a.*,
      v.company_name,
      v.role_title,
      v.link,
      v.source,
      v.location,
      v.salary_range,
      v.notes,
      a.vacancy_id as vacancyId
    FROM applications a
    JOIN vacancies v ON a.vacancy_id = v.id
    WHERE a.id = ? AND a.user_id = ?
  `),

  updateApplicationStatus: db.prepare(`
    UPDATE applications SET
      status = ?,
      last_status_change_at = CURRENT_TIMESTAMP,
      next_step = ?,
      next_step_due_date = ?,
      applied_date = ?,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ? AND user_id = ?
  `),

  updateApplicationNextStep: db.prepare(`
    UPDATE applications SET
      next_step = ?,
      next_step_due_date = ?,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ? AND user_id = ?
  `),

  // Analytics queries
  getStatusDistribution: db.prepare(`
    SELECT status, COUNT(*) as count
    FROM applications
    WHERE user_id = ?
    GROUP BY status
  `),

  getStalledApplications: db.prepare(`
    SELECT
      a.*,
      v.company_name,
      v.role_title
    FROM applications a
    JOIN vacancies v ON a.vacancy_id = v.id
    WHERE a.user_id = ?
      AND a.updated_at < datetime('now', '-7 days')
      AND a.status NOT IN ('offer', 'rejected')
  `),

  getOverdueReminders: db.prepare(`
    SELECT
      a.*,
      v.company_name,
      v.role_title
    FROM applications a
    JOIN vacancies v ON a.vacancy_id = v.id
    WHERE a.user_id = ?
      AND a.next_step_due_date < date('now')
      AND a.status NOT IN ('offer', 'rejected')
  `),

  // Contacts
  createContact: db.prepare(`
    INSERT INTO contacts (id, user_id, vacancy_id, application_id, name, role, email, linkedin, last_message_at, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `),

  getContactsByUserId: db.prepare(`
    SELECT * FROM contacts WHERE user_id = ? ORDER BY created_at DESC
  `),

  getContactsByApplicationId: db.prepare(`
    SELECT * FROM contacts WHERE application_id = ? ORDER BY created_at DESC
  `),

  // Todos
  createTodo: db.prepare(`
    INSERT INTO todos (id, user_id, application_id, title, description, priority, due_date, completed)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `),

  getTodosByUserId: db.prepare(`
    SELECT * FROM todos WHERE user_id = ? ORDER BY
      CASE priority
        WHEN 'high' THEN 1
        WHEN 'medium' THEN 2
        WHEN 'low' THEN 3
      END,
      due_date ASC,
      created_at DESC
  `),

  updateTodo: db.prepare(`
    UPDATE todos SET
      title = ?,
      description = ?,
      completed = ?,
      priority = ?,
      due_date = ?,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ? AND user_id = ?
  `),

  deleteTodo: db.prepare(`
    DELETE FROM todos WHERE id = ? AND user_id = ?
  `),
};

// Utility functions
export const generateId = () => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

export { db };

// For development: log database file location
console.log('Database initialized at:', dbPath);
