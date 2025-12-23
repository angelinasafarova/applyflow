'use client';

import { Bell } from 'lucide-react';
import { Application } from '@/lib/types';

interface RemindersListProps {
  overdueReminders: Application[];
  todayReminders: Application[];
  upcomingReminders: Application[];
}

export default function RemindersList({
  overdueReminders,
  todayReminders,
  upcomingReminders
}: RemindersListProps) {
  const allReminders = [
    { title: 'Overdue', items: overdueReminders, color: 'bg-red-900/20 border-red-500/20', iconColor: 'text-red-400', badgeColor: 'bg-red-500' },
    { title: 'Today', items: todayReminders, color: 'bg-yellow-900/20 border-yellow-500/20', iconColor: 'text-yellow-400', badgeColor: 'bg-yellow-500' },
    { title: 'Upcoming', items: upcomingReminders, color: 'bg-blue-900/20 border-blue-500/20', iconColor: 'text-blue-400', badgeColor: 'bg-blue-500' },
  ];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 shadow-lg p-6">
      <div className="flex items-center space-x-3 mb-6">
        <Bell className="h-6 w-6 text-blue-400" />
        <h2 className="text-xl font-semibold text-white">Next Steps</h2>
        <span className="bg-slate-700 text-slate-300 text-sm px-2 py-1 rounded-full">
          {overdueReminders.length + todayReminders.length + upcomingReminders.length} tasks
        </span>
      </div>

      {allReminders.every(reminder => reminder.items.length === 0) ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🎯</div>
          <p className="text-white font-medium">No upcoming tasks</p>
          <p className="text-slate-400 text-sm mt-1">You're all caught up!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {allReminders.map(reminder => (
            reminder.items.length > 0 && (
              <div key={reminder.title} className={`rounded-xl border p-4 ${reminder.color}`}>
                <div className="flex items-center space-x-2 mb-3">
                  <div className={`w-2 h-2 rounded-full ${reminder.badgeColor}`} />
                  <h3 className="text-sm font-semibold text-white">
                    {reminder.title}
                  </h3>
                  <span className="text-xs text-slate-400 bg-slate-700 px-2 py-1 rounded-full">
                    {reminder.items.length}
                  </span>
                </div>

                <div className="space-y-2">
                  {reminder.items.map(application => (
                    <div
                      key={application.id}
                      className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors cursor-pointer"
                    >
                      <div className="flex-1">
                        <div className="font-medium text-white">
                          {application.companyName}
                        </div>
                        <div className="text-sm text-slate-300">
                          {application.roleTitle}
                        </div>
                        <div className="text-xs text-slate-400 mt-1">
                          {application.nextStep}
                        </div>
                      </div>

                      {application.nextStepDueDate && (
                        <div className={`text-sm font-medium px-2 py-1 rounded ${
                          reminder.title === 'Overdue'
                            ? 'text-red-300 bg-red-900/20'
                            : reminder.title === 'Today'
                            ? 'text-yellow-300 bg-yellow-900/20'
                            : 'text-blue-300 bg-blue-900/20'
                        }`}>
                          {formatDate(application.nextStepDueDate)}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )
          ))}
        </div>
      )}
    </div>
  );
}
