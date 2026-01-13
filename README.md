# ApplyFlow

A personal job application tracking CRM system. Helps job seekers efficiently manage job applications, track progress, and stay organized throughout their job search journey.

## Features

### 📋 Job Vacancy Management
- Create and edit job postings you're interested in
- Track application status for each position
- Organize vacancies by company, role, and source

### 📝 Application Tracking
- Track your applications through different stages
- Monitor application status (saved, applied, screening, test, interview, offer, rejected)
- Set reminders for next steps and deadlines

### 📊 Kanban Board
- Visual representation of your job application pipeline
- Drag and drop applications between stages
- Quick overview of your job search progress

### 📈 Analytics & Reports
- Statistics on your applications
- Track success rates and response times
- Monitor your job search metrics

### 🔔 Reminders & Tasks
- Create tasks for each application
- Set reminders for follow-ups
- Track important deadlines

### 👥 Contact Management
- Store recruiter and hiring manager contacts
- Track communication history
- Manage relationships with potential employers

## Quick Start

### Requirements
- Node.js 18+
- npm or yarn
- SQLite (included)

### Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/angelinasafarova/applyflow.git
   cd applyflow
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up the database:**
   ```bash
   npm run db:generate
   npm run db:migrate
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Open in your browser:**
   ```
   http://localhost:3000
   ```

## Project Structure

- `app/` - Next.js application pages and API routes
- `components/` - Reusable React components
- `lib/` - Utility functions and database configuration
- `prisma/` - Database schema and migrations
- `public/` - Static assets

## Tech Stack

- **Framework:** Next.js 16
- **Language:** TypeScript
- **Database:** SQLite with Prisma ORM
- **Styling:** Tailwind CSS
- **Icons:** Lucide React

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:generate` - Generate Prisma client
- `npm run db:migrate` - Run database migrations
- `npm run db:studio` - Open Prisma Studio

## License

This project is private and personal use only.

## Contributing

This is a personal project. Contributions are not expected, but feedback is welcome.

---

**Built with ❤️ for efficient job searching**
