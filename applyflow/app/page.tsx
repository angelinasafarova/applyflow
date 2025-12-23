'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Target, Kanban, Bell, BarChart3 } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated by calling API
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        const headers: Record<string, string> = {};
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch('/api/auth/check', {
          headers
        });
        if (response.ok) {
          const data = await response.json();
          if (data.authenticated) {
            router.push('/dashboard');
            return;
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
      <div className="max-w-4xl mx-auto text-center px-4">
        <div className="flex items-center justify-center mb-8">
          <Target className="h-16 w-16 text-blue-400 mr-4" />
          <h1 className="text-5xl font-bold text-white">
            ApplyFlow
          </h1>
        </div>

        <p className="text-xl text-slate-300 mb-12 max-w-2xl mx-auto leading-relaxed">
          Smart job application tracker. Manage your pipeline, track progress, and never miss an opportunity.
        </p>

        <div className="space-y-6">
          <Link
            href="/auth"
            className="inline-flex items-center space-x-3 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all shadow-2xl hover:shadow-blue-500/25 hover:scale-105"
          >
            <Target className="h-5 w-5" />
            <span>Get Started</span>
          </Link>

          <div className="text-sm text-slate-400">
            <p>Demo account: test@example.com / password</p>
          </div>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-slate-800 p-8 rounded-xl border border-slate-700 shadow-lg hover:shadow-xl transition-all hover:scale-105">
            <div className="flex items-center space-x-4 mb-4">
              <Kanban className="h-8 w-8 text-blue-400" />
              <h3 className="text-xl font-semibold text-white">Visual Board</h3>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Organize applications with an intuitive Kanban board. Drag and drop between stages with visual feedback.
            </p>
          </div>

          <div className="bg-slate-800 p-8 rounded-xl border border-slate-700 shadow-lg hover:shadow-xl transition-all hover:scale-105">
            <div className="flex items-center space-x-4 mb-4">
              <Bell className="h-8 w-8 text-yellow-400" />
              <h3 className="text-xl font-semibold text-white">Smart Reminders</h3>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Never miss deadlines with intelligent reminders. Track overdue tasks and upcoming follow-ups.
            </p>
          </div>

          <div className="bg-slate-800 p-8 rounded-xl border border-slate-700 shadow-lg hover:shadow-xl transition-all hover:scale-105">
            <div className="flex items-center space-x-4 mb-4">
              <BarChart3 className="h-8 w-8 text-green-400" />
              <h3 className="text-xl font-semibold text-white">Deep Analytics</h3>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Understand your job search performance with detailed analytics and conversion rate insights.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}