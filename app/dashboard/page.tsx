import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { KanbanBoard } from "@/components/kanban-board";
import { ApplicationStatus } from "@/lib/types";
import { RemindersList } from "@/components/reminders-list";
import dayjs from "dayjs";

export default async function DashboardPage() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: applicationsData, error } = await supabase
    .from("applications")
    .select(`
      *,
      vacancies (company_name, role_title)
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching applications:", error);
    return <p>Error loading applications.</p>;
  }

  const applications = applicationsData || [];
  const today = dayjs().startOf("day");

  const todayReminders = applications.filter(
    (app) =>
      app.next_step_due_date &&
      dayjs(app.next_step_due_date).isSame(today, "day")
  );

  const overdueReminders = applications.filter(
    (app) =>
      app.next_step_due_date &&
      dayjs(app.next_step_due_date).isBefore(today, "day")
  );

  const statuses: ApplicationStatus[] = [
    "saved",
    "applied",
    "screening",
    "test",
    "interview",
    "offer",
    "rejected",
  ];

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Your Applications</h1>
      <div className="mb-6">
        <RemindersList todayReminders={todayReminders} overdueReminders={overdueReminders} />
      </div>
      <KanbanBoard applications={applications || []} statuses={statuses} />
    </div>
  );
}

