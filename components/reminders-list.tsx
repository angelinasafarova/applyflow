"use client";

import React from "react";
import { ApplicationWithVacancy } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import dayjs from "dayjs";

interface RemindersListProps {
  todayReminders: ApplicationWithVacancy[];
  overdueReminders: ApplicationWithVacancy[];
}

export function RemindersList({
  todayReminders,
  overdueReminders,
}: RemindersListProps) {
  const hasReminders = todayReminders.length > 0 || overdueReminders.length > 0;

  if (!hasReminders) {
    return null; // Don't render anything if there are no reminders
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {overdueReminders.length > 0 && (
        <Card className="border-red-500">
          <CardHeader>
            <CardTitle className="text-xl text-red-600">Overdue Next Steps</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {overdueReminders.map((app) => (
                <li key={app.id} className="text-red-800">
                  <Link href={`/dashboard/application/${app.id}`}>
                    <span className="font-medium">
                      {app.vacancies.company_name} - {app.vacancies.role_title}
                    </span>
                    : {app.next_step} (Due: {dayjs(app.next_step_due_date).format("MMM D, YYYY")})
                  </Link>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {todayReminders.length > 0 && (
        <Card className="border-yellow-500">
          <CardHeader>
            <CardTitle className="text-xl text-yellow-700">Today&apos;s Next Steps</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {todayReminders.map((app) => (
                <li key={app.id} className="text-yellow-900">
                  <Link href={`/dashboard/application/${app.id}`}>
                    <span className="font-medium">
                      {app.vacancies.company_name} - {app.vacancies.role_title}
                    </span>
                    : {app.next_step} (Today)
                  </Link>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

