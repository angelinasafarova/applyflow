'use client';

import { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { VacancyForm, Source, Vacancy } from '@/lib/types';

interface EditVacancyModalProps {
  vacancy: Vacancy | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (vacancyId: string, updates: Partial<VacancyForm>) => Promise<void>;
}

const sourceOptions: { value: Source; label: string }[] = [
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'hh', label: 'HH.ru' },
  { value: 'indeed', label: 'Indeed' },
  { value: 'telegram', label: 'Telegram' },
  { value: 'direct', label: 'Direct' },
  { value: 'other', label: 'Other' },
];

export default function EditVacancyModal({ vacancy, isOpen, onClose, onSave }: EditVacancyModalProps) {
  const [formData, setFormData] = useState<Partial<VacancyForm>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (vacancy && isOpen) {
      console.log('EditVacancyModal - Loading vacancy data:', vacancy);
      setFormData({
        companyName: vacancy.companyName || '',
        roleTitle: vacancy.roleTitle || '',
        link: vacancy.link || '',
        source: vacancy.source,
        salaryRange: vacancy.salaryRange || '',
        location: vacancy.location || '',
        notes: vacancy.notes || '',
      });
      const newFormData = {
        companyName: vacancy.companyName || '',
        roleTitle: vacancy.roleTitle || '',
        link: vacancy.link || '',
        source: vacancy.source,
        salaryRange: vacancy.salaryRange || '',
        location: vacancy.location || '',
        notes: vacancy.notes || '',
      };
      console.log('EditVacancyModal - Set form data:', newFormData);
      setFormData(newFormData);
    }
  }, [vacancy, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vacancy) return;

    setError('');
    setIsSubmitting(true);

    try {
      // Basic validation
      if (!formData.companyName?.trim() || !formData.roleTitle?.trim() || !formData.link?.trim()) {
        throw new Error('Please fill in all required fields');
      }

      // Basic URL validation
      try {
        new URL(formData.link);
      } catch {
        throw new Error('Please enter a valid URL');
      }

      console.log('EditVacancyModal - Saving:', { vacancyId: vacancy.id, formData });
      await onSave(vacancy.id, formData);
      console.log('EditVacancyModal - Save completed successfully');
      onClose();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update vacancy');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setError('');
    setFormData({});
    onClose();
  };

  if (!isOpen || !vacancy) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">Edit Vacancy</h2>
          <button
            onClick={handleClose}
            className="p-2 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-slate-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-900/20 border border-red-500/20 rounded-lg">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Company Name */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Company Name *
              </label>
              <input
                type="text"
                value={formData.companyName || ''}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter company name"
                required
              />
            </div>

            {/* Role Title */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Role Title *
              </label>
              <input
                type="text"
                value={formData.roleTitle || ''}
                onChange={(e) => setFormData({ ...formData, roleTitle: e.target.value })}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter job title"
                required
              />
            </div>
          </div>

          {/* Job Link */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Job Link *
            </label>
            <input
              type="url"
              value={formData.link || ''}
              onChange={(e) => setFormData({ ...formData, link: e.target.value })}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="https://..."
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Source */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Source
              </label>
              <select
                value={formData.source || ''}
                onChange={(e) => setFormData({ ...formData, source: e.target.value as Source || undefined })}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select source</option>
                {sourceOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Location
              </label>
              <input
                type="text"
                value={formData.location || ''}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="City, Country"
              />
            </div>
          </div>

          {/* Salary Range */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Salary Range
            </label>
            <input
              type="text"
              value={formData.salaryRange || ''}
              onChange={(e) => setFormData({ ...formData, salaryRange: e.target.value })}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., $50,000 - $70,000"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Notes
            </label>
            <textarea
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={4}
              placeholder="Additional notes about this vacancy..."
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-700">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-slate-300 bg-slate-600 rounded-lg hover:bg-slate-500 transition-colors font-medium"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all shadow-lg hover:shadow-xl flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              <Save className="h-4 w-4" />
              <span>{isSubmitting ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
