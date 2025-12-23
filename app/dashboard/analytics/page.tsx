import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AnalyticsDashboard } from "@/components/analytics-dashboard";
import { ApplicationStatus, ApplicationWithVacancy } from "@/lib/types";

export default async function AnalyticsPage() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: applications, error } = await supabase
    .from("applications")
    .select(`
      *,
      vacancies (company_name, role_title)
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching applications for analytics:", error);
    return <p>Error loading analytics data.</p>;
  }

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
      <h1 className="text-3xl font-bold mb-6">Analytics Dashboard</h1>
      <AnalyticsDashboard applications={applications || []} statuses={statuses} />
    </div>
  );
}

