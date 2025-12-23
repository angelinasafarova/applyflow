'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { VacancyForm, Source } from '@/lib/types';

interface AddVacancyFormProps {
  onSubmit: (vacancy: VacancyForm) => Promise<void>;
  onCancel?: () => void;
  initialData?: Partial<VacancyForm>;
}

const sourceOptions: { value: Source; label: string }[] = [
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'hh', label: 'HH.ru' },
  { value: 'indeed', label: 'Indeed' },
  { value: 'telegram', label: 'Telegram' },
  { value: 'direct', label: 'Direct' },
  { value: 'other', label: 'Other' },
];

export default function AddVacancyForm({ onSubmit, onCancel, initialData }: AddVacancyFormProps) {
  const [formData, setFormData] = useState<VacancyForm>({
    companyName: initialData?.companyName || '',
    roleTitle: initialData?.roleTitle || '',
    link: initialData?.link || '',
    source: initialData?.source,
    salaryRange: initialData?.salaryRange || '',
    location: initialData?.location || '',
    notes: initialData?.notes || '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      // Basic validation
      if (!formData.companyName.trim() || !formData.roleTitle.trim() || !formData.link.trim()) {
        throw new Error('Please fill in all required fields');
      }

      // Basic URL validation
      try {
        new URL(formData.link);
      } catch {
        throw new Error('Please enter a valid URL');
      }

      await onSubmit(formData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof VacancyForm, value: string | Source) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="max-w-2xl mx-auto bg-slate-800 rounded-xl border border-slate-700 shadow-2xl p-8">
      <div className="flex items-center space-x-3 mb-8">
        <div className="p-2 bg-blue-600 rounded-lg">
          <Plus className="h-6 w-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Add New Vacancy</h2>
          <p className="text-slate-400">Start tracking a new job application</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Required fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="companyName" className="block text-sm font-medium text-slate-300 mb-2">
              Company Name *
            </label>
            <input
              type="text"
              id="companyName"
              value={formData.companyName}
              onChange={(e) => handleInputChange('companyName', e.target.value)}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Google, Yandex"
              required
            />
          </div>

          <div>
            <label htmlFor="roleTitle" className="block text-sm font-medium text-slate-300 mb-2">
              Role Title *
            </label>
            <input
              type="text"
              id="roleTitle"
              value={formData.roleTitle}
              onChange={(e) => handleInputChange('roleTitle', e.target.value)}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Senior Frontend Developer"
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="link" className="block text-sm font-medium text-slate-300 mb-2">
            Job Link *
          </label>
          <input
            type="url"
            id="link"
            value={formData.link}
            onChange={(e) => handleInputChange('link', e.target.value)}
            className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="https://..."
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="source" className="block text-sm font-medium text-slate-300 mb-2">
              Source
            </label>
            <select
              id="source"
              value={formData.source || ''}
              onChange={(e) => handleInputChange('source', e.target.value as Source)}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="" className="bg-slate-700">Select source</option>
              {sourceOptions.map(option => (
                <option key={option.value} value={option.value} className="bg-slate-700">
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="location" className="block text-sm font-medium text-slate-300 mb-2">
              Location
            </label>
            <input
              type="text"
              id="location"
              value={formData.location || ''}
              onChange={(e) => handleInputChange('location', e.target.value)}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Moscow, Remote"
            />
          </div>
        </div>

        <div>
          <label htmlFor="salaryRange" className="block text-sm font-medium text-slate-300 mb-2">
            Salary Range
          </label>
          <input
            type="text"
            id="salaryRange"
            value={formData.salaryRange || ''}
            onChange={(e) => handleInputChange('salaryRange', e.target.value)}
            className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., 150k-200k RUB, $80k-100k"
          />
        </div>

        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-slate-300 mb-2">
            Notes
          </label>
          <textarea
            id="notes"
            value={formData.notes || ''}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            rows={3}
            className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            placeholder="Additional notes about the vacancy..."
          />
        </div>

        {error && (
          <div className="text-red-400 text-sm bg-red-900/20 border border-red-500/20 p-4 rounded-lg">
            {error}
          </div>
        )}

        <div className="flex justify-end space-x-3 pt-6">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 text-slate-300 bg-slate-600 rounded-lg hover:bg-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-500 transition-all font-medium"
              disabled={isSubmitting}
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Adding...</span>
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                <span>Add Vacancy</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
