'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus, BarChart3, Bell, CheckCircle, Clock, AlertCircle, Target, Kanban } from 'lucide-react';
import KanbanBoard from '@/components/kanban-board';
import RemindersList from '@/components/reminders-list';
import EditVacancyModal from '@/components/edit-vacancy-modal';
import TodoList from '@/components/todo-list';
import { Application, Status, Vacancy, VacancyForm } from '@/lib/types';

export default function DashboardPage() {
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [overdueReminders, setOverdueReminders] = useState<Application[]>([]);
  const [todayReminders, setTodayReminders] = useState<Application[]>([]);
  const [upcomingReminders, setUpcomingReminders] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [activeView, setActiveView] = useState<'kanban' | 'analytics' | 'todos'>('kanban');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [editVacancyModal, setEditVacancyModal] = useState<{
    isOpen: boolean;
    vacancy: Vacancy | null;
  }>({
    isOpen: false,
    vacancy: null,
  });

  useEffect(() => {
    const checkAuthAndLoadData = async () => {
      try {
        // Check if token exists in localStorage
        const token = localStorage.getItem('auth_token');
        if (!token) {
          router.push('/auth');
          return;
        }

        // Verify token with API
        const authResponse = await fetch('/api/auth/check', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!authResponse.ok) {
          // Token invalid, redirect to auth
          localStorage.removeItem('auth_token');
          router.push('/auth');
          return;
        }

        const authData = await authResponse.json();
        if (!authData.authenticated) {
          localStorage.removeItem('auth_token');
          router.push('/auth');
          return;
        }

        setIsAuthLoading(false);
        await loadData();
      } catch (error) {
        console.error('Auth check failed:', error);
        router.push('/auth');
      }
    };

    checkAuthAndLoadData();
  }, [router]);

  useEffect(() => {
    if (!isAuthLoading) {
      loadData();
    }
  }, [refreshTrigger, isAuthLoading]);

  const loadData = async () => {
    try {
      // Load applications
      const appsResponse = await fetch('/api/applications');
      let apps: Application[] = [];
      if (appsResponse.ok) {
        apps = await appsResponse.json();
        console.log('Dashboard - Loaded applications from API:', apps.length, 'items');
        console.log('Dashboard - Sample application:', apps[0]);
        setApplications(apps);
      } else {
        console.error('Dashboard - Failed to load applications:', appsResponse.status, await appsResponse.text());
      }

      // Load analytics (which includes reminders)
      const analyticsResponse = await fetch('/api/analytics');
      if (analyticsResponse.ok) {
        const analytics = await analyticsResponse.json();

        // Filter reminders by due date using the loaded applications
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const weekFromNow = new Date(today);
        weekFromNow.setDate(today.getDate() + 7);

        const overdue: Application[] = [];
        const todayRemindersList: Application[] = [];
        const upcoming: Application[] = [];

        apps.forEach(app => {
          if (app.nextStepDueDate) {
            const dueDate = new Date(app.nextStepDueDate);

            if (dueDate < today) {
              overdue.push(app);
            } else if (dueDate.toDateString() === today.toDateString()) {
              todayRemindersList.push(app);
            } else if (dueDate <= weekFromNow) {
              upcoming.push(app);
            }
          }
        });

        setOverdueReminders(overdue);
        setTodayReminders(todayRemindersList);
        setUpcomingReminders(upcoming);
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (
    applicationId: string,
    newStatus: Status,
    nextStep: string,
    nextStepDueDate?: string
  ) => {
    console.log('Dashboard - handleStatusChange called:', {
      applicationId,
      newStatus,
      nextStep,
      nextStepDueDate,
      nextStepEmpty: !nextStep || nextStep.trim() === ''
    });

    try {
      const response = await fetch(`/api/applications/${applicationId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus,
          nextStep,
          nextStepDueDate,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update status');
      }

      // Reload data to reflect changes
      await loadData();
    } catch (error) {
      console.error('Failed to update application status:', error);
      throw error;
    }
  };

  const handleEditVacancy = async (vacancyId: string) => {
    try {
      const response = await fetch(`/api/vacancies/${vacancyId}`);
      if (!response.ok) {
        throw new Error('Failed to load vacancy');
      }
      const vacancy = await response.json();
      console.log('Dashboard - handleEditVacancy - Loaded vacancy:', vacancy);
      setEditVacancyModal({ isOpen: true, vacancy });
    } catch (error) {
      console.error('Failed to load vacancy for editing:', error);
    }
  };

  const handleSaveVacancy = async (vacancyId: string, updates: Partial<VacancyForm>) => {
    try {
      console.log('Dashboard - handleSaveVacancy:', { vacancyId, updates });
      const response = await fetch(`/api/vacancies/${vacancyId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update vacancy');
      }

      // Trigger data reload to reflect changes
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error('Failed to update vacancy:', error);
      throw error;
    }
  };

  const handleDeleteApplication = async (applicationId: string) => {
    try {
      // For now, we'll just show that deletion would work
      // In a real app, you'd call a DELETE API endpoint
      console.log('Would delete application:', applicationId);
      await loadData(); // Reload to show the change
    } catch (error) {
      console.error('Failed to delete application:', error);
      throw error;
    }
  };

  if (isAuthLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {isAuthLoading ? 'Checking authentication...' : 'Loading your applications...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <Target className="h-8 w-8 text-blue-400" />
                <div>
                  <h1 className="text-2xl font-bold text-white">ApplyFlow</h1>
                  <p className="text-sm text-slate-400">Smart job application tracker</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {/* View Toggle */}
              <div className="bg-slate-700 rounded-lg p-1 flex">
                <button
                  onClick={() => setActiveView('kanban')}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                    activeView === 'kanban'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white hover:bg-slate-600'
                  }`}
                >
                  <Kanban className="h-4 w-4" />
                  <span>Board</span>
                </button>
                <button
                  onClick={() => setActiveView('analytics')}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                    activeView === 'analytics'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white hover:bg-slate-600'
                  }`}
                >
                  <BarChart3 className="h-4 w-4" />
                  <span>Analytics</span>
                </button>
                <button
                  onClick={() => setActiveView('todos')}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                    activeView === 'todos'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white hover:bg-slate-600'
                  }`}
                >
                  <CheckCircle className="h-4 w-4" />
                  <span>To Do</span>
                </button>
              </div>

              <Link
                href="/dashboard/add-vacancy"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-all flex items-center space-x-2 shadow-lg hover:shadow-xl"
              >
                <Plus className="h-4 w-4" />
                <span>Add Vacancy</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium">Total Applications</p>
                <p className="text-2xl font-bold text-white mt-1">{applications.length}</p>
              </div>
              <Target className="h-8 w-8 text-blue-400" />
            </div>
          </div>

          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium">Active Applications</p>
                <p className="text-2xl font-bold text-green-400 mt-1">
                  {applications.filter(app => app.status !== 'rejected' && app.status !== 'offer').length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-400" />
            </div>
          </div>

          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium">Today's Tasks</p>
                <p className="text-2xl font-bold text-yellow-400 mt-1">{todayReminders.length}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-400" />
            </div>
          </div>

          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium">Overdue</p>
                <p className="text-2xl font-bold text-red-400 mt-1">{overdueReminders.length}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-400" />
            </div>
          </div>
        </div>

        {/* Reminders Section */}
        {(overdueReminders.length > 0 || todayReminders.length > 0 || upcomingReminders.length > 0) && (
          <div className="mb-8">
            <RemindersList
              overdueReminders={overdueReminders}
              todayReminders={todayReminders}
              upcomingReminders={upcomingReminders}
            />
          </div>
        )}

        {/* Content based on active view */}
        {activeView === 'kanban' ? (
          <div className="bg-slate-800 rounded-xl border border-slate-700 shadow-lg overflow-hidden">
            <div className="p-6 border-b border-slate-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Kanban className="h-6 w-6 text-blue-400" />
                  <h2 className="text-xl font-semibold text-white">Application Board</h2>
                </div>
                <div className="flex items-center space-x-4 text-sm text-slate-400">
                  <span>{applications.length} total applications</span>
                  <span>•</span>
                  <span>
                    {applications.filter(app => app.status === 'applied').length} in progress
                  </span>
                </div>
              </div>
            </div>

            <div className="p-6">
              {applications.length === 0 ? (
                <div className="text-center py-16">
                  <Target className="h-16 w-16 text-slate-600 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-white mb-2">No applications yet</h3>
                  <p className="text-slate-400 mb-6 max-w-md mx-auto">
                    Start building your application pipeline by adding your first job vacancy.
                  </p>
                  <Link
                    href="/dashboard/add-vacancy"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-all inline-flex items-center space-x-2 shadow-lg hover:shadow-xl"
                  >
                    <Plus className="h-5 w-5" />
                    <span>Add Your First Vacancy</span>
                  </Link>
                </div>
              ) : (
                <KanbanBoard
                  applications={applications}
                  onStatusChange={handleStatusChange}
                  onDeleteApplication={handleDeleteApplication}
                  onEditVacancy={handleEditVacancy}
                />
              )}
            </div>
          </div>
        ) : activeView === 'todos' ? (
          <div className="space-y-6">
            <TodoList />
          </div>
        ) : (
          /* Embedded Analytics */
          <div className="space-y-6">
            <div className="bg-slate-800 rounded-xl border border-slate-700 shadow-lg p-6">
              <div className="flex items-center space-x-3 mb-6">
                <BarChart3 className="h-6 w-6 text-blue-400" />
                <h2 className="text-xl font-semibold text-white">Application Analytics</h2>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Status Distribution */}
                <div>
                  <h3 className="text-lg font-medium text-white mb-4">Status Distribution</h3>
                  <div className="space-y-3">
                    {['saved', 'applied', 'screening', 'test', 'interview', 'offer', 'rejected'].map(status => {
                      const count = applications.filter(app => app.status === status).length;
                      const percentage = applications.length > 0 ? Math.round((count / applications.length) * 100) : 0;

                      return (
                        <div key={status} className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className={`w-3 h-3 rounded-full ${
                              status === 'saved' ? 'bg-slate-500' :
                              status === 'applied' ? 'bg-blue-500' :
                              status === 'screening' ? 'bg-yellow-500' :
                              status === 'test' ? 'bg-orange-500' :
                              status === 'interview' ? 'bg-purple-500' :
                              status === 'offer' ? 'bg-green-500' :
                              'bg-red-500'
                            }`} />
                            <span className="text-slate-300 capitalize">{status}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-white font-medium">{count}</span>
                            <span className="text-slate-500">({percentage}%)</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Conversion Funnel */}
                <div>
                  <h3 className="text-lg font-medium text-white mb-4">Conversion Rates</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-slate-700 rounded-lg">
                      <span className="text-slate-300">Saved → Applied</span>
                      <span className="text-green-400 font-medium">
                        {applications.length > 0
                          ? Math.round((applications.filter(app => app.status === 'applied' || app.status === 'screening' || app.status === 'test' || app.status === 'interview' || app.status === 'offer').length / applications.length) * 100)
                          : 0
                        }%
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-slate-700 rounded-lg">
                      <span className="text-slate-300">Applied → Interview</span>
                      <span className="text-blue-400 font-medium">
                        {applications.filter(app => app.status === 'applied' || app.status === 'screening' || app.status === 'test' || app.status === 'interview' || app.status === 'offer').length > 0
                          ? Math.round((applications.filter(app => app.status === 'interview' || app.status === 'offer').length / applications.filter(app => app.status === 'applied' || app.status === 'screening' || app.status === 'test' || app.status === 'interview' || app.status === 'offer').length) * 100)
                          : 0
                        }%
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-slate-700 rounded-lg">
                      <span className="text-slate-300">Interview → Offer</span>
                      <span className="text-purple-400 font-medium">
                        {applications.filter(app => app.status === 'interview' || app.status === 'offer').length > 0
                          ? Math.round((applications.filter(app => app.status === 'offer').length / applications.filter(app => app.status === 'interview' || app.status === 'offer').length) * 100)
                          : 0
                        }%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Vacancy Modal */}
        <EditVacancyModal
          vacancy={editVacancyModal.vacancy}
          isOpen={editVacancyModal.isOpen}
          onClose={() => setEditVacancyModal({ isOpen: false, vacancy: null })}
          onSave={handleSaveVacancy}
        />
      </main>
    </div>
  );
}
