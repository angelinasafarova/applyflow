'use client';

import { useState, useEffect } from 'react';
import { Application, Status } from '@/lib/types';
import { ChevronDown, ChevronUp, MoreVertical, Trash2, ExternalLink, Calendar, Clock, MapPin, DollarSign, Target, Edit3, Hash } from 'lucide-react';

interface KanbanBoardProps {
  applications: Application[];
  onStatusChange: (applicationId: string, newStatus: Status, nextStep: string, nextStepDueDate?: string) => Promise<void>;
  onDeleteApplication: (applicationId: string) => Promise<void>;
  onEditVacancy?: (vacancyId: string) => void;
}

const statusColumns: { status: Status; title: string; color: string; accentColor: string }[] = [
  { status: 'saved', title: 'Saved', color: 'bg-slate-700 border-slate-600', accentColor: 'border-slate-500' },
  { status: 'applied', title: 'Applied', color: 'bg-blue-900/20 border-blue-500/20', accentColor: 'border-blue-500' },
  { status: 'screening', title: 'Screening', color: 'bg-yellow-900/20 border-yellow-500/20', accentColor: 'border-yellow-500' },
  { status: 'test', title: 'Test', color: 'bg-orange-900/20 border-orange-500/20', accentColor: 'border-orange-500' },
  { status: 'interview', title: 'Interview', color: 'bg-purple-900/20 border-purple-500/20', accentColor: 'border-purple-500' },
  { status: 'offer', title: 'Offer', color: 'bg-green-900/20 border-green-500/20', accentColor: 'border-green-500' },
  { status: 'rejected', title: 'Rejected', color: 'bg-red-900/20 border-red-500/20', accentColor: 'border-red-500' },
];

interface StatusChangeModalProps {
  application: Application;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (nextStep: string, nextStepDueDate?: string) => void;
}

function StatusChangeModal({ application, isOpen, onClose, onConfirm }: StatusChangeModalProps) {
  const [nextStep, setNextStep] = useState('');
  const [nextStepDueDate, setNextStepDueDate] = useState('');

  if (!isOpen || !application) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(nextStep, nextStepDueDate || undefined);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 max-w-md w-full shadow-2xl">
        <h3 className="text-xl font-semibold text-white mb-4">Update Status</h3>
        <p className="text-slate-300 mb-6">
          Moving <span className="text-white font-medium">"{application.companyName} - {application.roleTitle}"</span> to next status.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Create a new task (optional)
            </label>
            <textarea
              value={nextStep}
              onChange={(e) => setNextStep(e.target.value)}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={3}
              placeholder="Enter a custom task (optional)"
            />
            <p className="text-xs text-slate-400 mt-1">
              Task will be added to your To Do List if provided
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Due Date (optional)
            </label>
            <input
              type="date"
              value={nextStepDueDate}
              onChange={(e) => setNextStepDueDate(e.target.value)}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-300 bg-slate-600 rounded-lg hover:bg-slate-500 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all shadow-lg hover:shadow-xl"
            >
              Обновить статус
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function KanbanBoard({ applications, onStatusChange, onDeleteApplication, onEditVacancy }: KanbanBoardProps) {
  const [draggedApplication, setDraggedApplication] = useState<Application | null>(null);
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    application: Application | null;
    targetStatus: Status | null;
  }>({
    isOpen: false,
    application: null,
    targetStatus: null,
  });
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const getApplicationsByStatus = (status: Status) => {
    return applications.filter(app => app.status === status);
  };

  const handleDragStart = (application: Application) => {
    setDraggedApplication(application);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetStatus: Status) => {
    e.preventDefault();

    if (!draggedApplication || draggedApplication.status === targetStatus) {
      setDraggedApplication(null);
      return;
    }

    // For offer and rejected statuses, no next step required
    if (targetStatus === 'offer' || targetStatus === 'rejected') {
      handleStatusChange(draggedApplication, targetStatus, draggedApplication.nextStep || 'Status updated');
      return;
    }

    // Show modal for next step
    setModalState({
      isOpen: true,
      application: draggedApplication,
      targetStatus,
    });

    setDraggedApplication(null);
  };

  const handleStatusChange = async (
    application: Application,
    newStatus: Status,
    nextStep: string,
    nextStepDueDate?: string
  ) => {
    console.log('KanbanBoard - handleStatusChange:', {
      applicationId: application.id,
      newStatus,
      nextStep,
      nextStepDueDate,
      nextStepEmpty: !nextStep || nextStep.trim() === ''
    });

    try {
      await onStatusChange(application.id, newStatus, nextStep, nextStepDueDate);
    } catch (error) {
      console.error('Failed to update status:', error);
      // In a real app, show error toast
    }
  };

  const handleModalConfirm = (nextStep: string, nextStepDueDate?: string) => {
    if (modalState.application && modalState.targetStatus) {
      handleStatusChange(modalState.application, modalState.targetStatus, nextStep, nextStepDueDate);
    }
    setModalState({ isOpen: false, application: null, targetStatus: null });
  };

  const handleModalClose = () => {
    setModalState({ isOpen: false, application: null, targetStatus: null });
  };

  const toggleCardExpansion = (applicationId: string) => {
    const newExpanded = new Set(expandedCards);
    if (newExpanded.has(applicationId)) {
      newExpanded.delete(applicationId);
    } else {
      newExpanded.add(applicationId);
    }
    setExpandedCards(newExpanded);
  };

  const handleDeleteApplication = async (applicationId: string) => {
    try {
      setShowDeleteConfirm(null);

      const response = await fetch(`/api/applications/${applicationId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete application');
      }

      // Refresh the page to update the data
      window.location.reload();
    } catch (error) {
      console.error('Failed to delete application:', error);
      // You could show a toast notification here
    }
  };

  // Close delete menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (showDeleteConfirm && !target.closest('.delete-menu')) {
        setShowDeleteConfirm(null);
      }
    };

    if (showDeleteConfirm) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showDeleteConfirm]);

  const getNextStepStatus = (nextStepDueDate?: string) => {
    if (!nextStepDueDate) return 'normal';

    const dueDate = new Date(nextStepDueDate);
    const today = new Date();
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'overdue';
    if (diffDays <= 3) return 'urgent';
    return 'normal';
  };

  return (
    <div className="flex space-x-6 overflow-x-auto pb-4">
      {statusColumns.map(column => (
        <div
          key={column.status}
          className={`flex-shrink-0 w-80 ${column.color} rounded-xl border-2 p-4 min-h-[600px]`}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, column.status)}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white text-lg">
              {column.title}
            </h3>
            <span className="bg-slate-600 text-slate-300 text-sm px-2 py-1 rounded-full">
              {getApplicationsByStatus(column.status).length}
            </span>
          </div>

          <div className="space-y-3">
            {getApplicationsByStatus(column.status).map(application => {
              const nextStepStatus = getNextStepStatus(application.nextStepDueDate);
              const isExpanded = expandedCards.has(application.id);

              return (
                <div
                  key={application.id}
                  className={`bg-slate-700 rounded-lg border-l-4 transition-all duration-200 hover:shadow-lg ${
                    nextStepStatus === 'overdue' ? 'border-l-red-500' :
                    nextStepStatus === 'urgent' ? 'border-l-yellow-500' :
                    column.accentColor
                  } ${isExpanded ? 'ring-2 ring-blue-500/50' : ''}`}
                >
                  <div
                    className="p-5 cursor-pointer"
                    onClick={() => toggleCardExpansion(application.id)}
                    draggable
                    onDragStart={(e) => {
                      e.stopPropagation();
                      handleDragStart(application);
                    }}
                  >
                    <div className="mb-3">
                      <h4 className="font-bold text-white text-lg leading-tight truncate mb-1">
                        {application.companyName || 'No company'}
                      </h4>
                      <p className="text-slate-300 text-base font-medium leading-tight mb-1">
                        {application.roleTitle || 'No position'}
                      </p>
                      <div className="flex items-center gap-3 mt-1">
                        {application.salaryRange && (
                          <span className="text-slate-400 text-sm font-medium">
                            💰 {application.salaryRange}
                          </span>
                        )}
                        {application.location && (
                          <span className="text-slate-400 text-sm">
                            📍 {application.location}
                          </span>
                        )}
                        {application.vacancySource && (
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                            application.vacancySource === 'linkedin' ? 'bg-blue-600/20 text-blue-300' :
                            application.vacancySource === 'hh' ? 'bg-green-600/20 text-green-300' :
                            application.vacancySource === 'indeed' ? 'bg-purple-600/20 text-purple-300' :
                            'bg-slate-600/50 text-slate-400'
                          }`}>
                            {application.vacancySource}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-end gap-2">
                      <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleCardExpansion(application.id);
                          }}
                          className="p-1 text-slate-400 hover:text-white transition-colors rounded hover:bg-slate-600"
                        >
                          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </button>

                        <div className="relative">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowDeleteConfirm(showDeleteConfirm === application.id ? null : application.id);
                            }}
                            className="p-1 text-slate-400 hover:text-white transition-colors rounded hover:bg-slate-600"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </button>

                          {showDeleteConfirm === application.id && (
                            <div className="delete-menu absolute right-0 top-6 bg-slate-800 border border-slate-600 rounded-lg shadow-xl z-20 w-48">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteApplication(application.id);
                                }}
                                className="w-full flex items-center space-x-2 px-4 py-3 text-red-400 hover:bg-red-900/20 transition-colors rounded-lg"
                              >
                                <Trash2 className="h-4 w-4" />
                                <span>Delete Application</span>
                              </button>
                            </div>
                          )}
                        </div>
                    </div>
                  </div>

                  <div className="text-sm text-slate-400 mb-4">
                    {(() => {
                      const status = application.status;
                      const appliedDate = application.appliedDate ? new Date(application.appliedDate) : new Date(application.createdAt);
                      const dueDate = application.nextStepDueDate ? new Date(application.nextStepDueDate) : null;

                      switch (status) {
                        case 'applied':
                          return (
                            <div className="flex items-center space-x-2">
                              <Calendar className="h-4 w-4" />
                              <span className="font-medium">Applied {appliedDate.toLocaleDateString()}</span>
                            </div>
                          );
                        case 'screening':
                          return dueDate ? (
                            <div className="flex items-center space-x-2">
                              <Clock className="h-4 w-4" />
                              <span className="font-medium">Screening due {dueDate.toLocaleDateString()}</span>
                            </div>
                          ) : null;
                        case 'test':
                          return dueDate ? (
                            <div className={`flex items-center space-x-2 px-2 py-1 rounded-full ${
                              nextStepStatus === 'overdue' ? 'bg-red-900/20 text-red-400 border border-red-500/30' :
                              nextStepStatus === 'urgent' ? 'bg-yellow-900/20 text-yellow-400 border border-yellow-500/30' :
                              'bg-slate-700/50 text-slate-400 border border-slate-600/30'
                            }`}>
                              <Clock className="h-4 w-4" />
                              <span className="font-medium">Test due {dueDate.toLocaleDateString()}</span>
                            </div>
                          ) : null;
                        case 'interview':
                          return dueDate ? (
                            <div className="flex items-center space-x-2">
                              <Calendar className="h-4 w-4" />
                              <span className="font-medium">Interview {dueDate.toLocaleDateString()}</span>
                            </div>
                          ) : null;
                        case 'offer':
                          return (
                            <div className="flex items-center space-x-2">
                              <Calendar className="h-4 w-4" />
                              <span className="font-medium">Offer received {appliedDate.toLocaleDateString()}</span>
                            </div>
                          );
                        case 'rejected':
                          return (
                            <div className="flex items-center space-x-2">
                              <Calendar className="h-4 w-4" />
                              <span className="font-medium">Rejected {appliedDate.toLocaleDateString()}</span>
                            </div>
                          );
                        default:
                          return (
                            <div className="flex items-center space-x-2">
                              <Calendar className="h-4 w-4" />
                              <span className="font-medium">Created {appliedDate.toLocaleDateString()}</span>
                            </div>
                          );
                      }
                    })()}
                  </div>


                  {isExpanded && (
                    <div className="border-t border-slate-600/50 p-5 bg-slate-800/50 rounded-b-lg">
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs text-slate-400 font-medium block mb-1">Company</label>
                            <p className="text-sm text-white">{application.companyName}</p>
                          </div>
                          <div>
                            <label className="text-xs text-slate-400 font-medium block mb-1">Position</label>
                            <p className="text-sm text-white">{application.roleTitle}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          {application.location && (
                            <div>
                              <label className="text-xs text-slate-400 font-medium block mb-1">Location</label>
                              <div className="flex items-center space-x-1">
                                <MapPin className="h-3 w-3 text-slate-400" />
                                <span className="text-sm text-white">{application.location}</span>
                              </div>
                            </div>
                          )}
                          {application.salaryRange && (
                            <div>
                              <label className="text-xs text-slate-400 font-medium block mb-1">Salary</label>
                              <div className="flex items-center space-x-1">
                                <DollarSign className="h-3 w-3 text-slate-400" />
                                <span className="text-sm text-white">{application.salaryRange}</span>
                              </div>
                            </div>
                          )}
                        </div>

                        {application.vacancyLink && (
                          <div>
                            <label className="text-xs text-slate-400 font-medium block mb-1">Job Link</label>
                            <a
                              href={application.vacancyLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center space-x-2 text-blue-400 hover:text-blue-300 transition-colors"
                            >
                              <ExternalLink className="h-4 w-4" />
                              <span className="text-sm">View Job Posting</span>
                            </a>
                          </div>
                        )}


                        <div className="flex space-x-3 pt-4">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setModalState({
                                isOpen: true,
                                application,
                                targetStatus: application.status === 'saved' ? 'applied' : application.status
                              });
                            }}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
                          >
                            <Target className="h-4 w-4" />
                            <span>Update Status</span>
                          </button>
                          {onEditVacancy && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onEditVacancy(application.vacancyId);
                              }}
                              className="bg-slate-600 hover:bg-slate-700 text-white text-sm font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
                              title="Edit vacancy"
                            >
                              <Edit3 className="h-4 w-4" />
                            </button>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteApplication(application.id);
                            }}
                            className="bg-red-600 hover:bg-red-700 text-white text-sm font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {getApplicationsByStatus(column.status).length === 0 && (
              <div className="text-center py-8 text-slate-500">
                <div className="text-2xl mb-2">📋</div>
                <p className="text-sm">No applications</p>
              </div>
            )}
          </div>
        </div>
      ))}

      <StatusChangeModal
        application={modalState.application!}
        isOpen={modalState.isOpen}
        onClose={handleModalClose}
        onConfirm={handleModalConfirm}
      />
    </div>
  );
}
