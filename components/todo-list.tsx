'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, Circle, Clock, Plus, Trash2 } from 'lucide-react';
import { Todo } from '@/lib/types';

interface TodoListProps {
  applicationId?: string; // Optional: show only todos for specific application
}

export default function TodoList({ applicationId }: TodoListProps) {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newTodoTitle, setNewTodoTitle] = useState('');
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadTodos();
  }, [applicationId]);

  const loadTodos = async () => {
    try {
      const response = await fetch('/api/todos');
      if (response.ok) {
        const allTodos: Todo[] = await response.json();
        const filteredTodos = applicationId
          ? allTodos.filter(todo => todo.applicationId === applicationId)
          : allTodos;
        setTodos(filteredTodos);
      }
    } catch (error) {
      console.error('Failed to load todos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTodo = async (todoId: string, completed: boolean) => {
    console.log('Toggling todo:', todoId, 'to completed:', completed);
    try {
      const response = await fetch(`/api/todos/${todoId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed }),
      });

      console.log('Toggle response status:', response.status);
      if (response.ok) {
        const updatedTodo = await response.json();
        console.log('Updated todo from API:', updatedTodo);
        setTodos(todos.map(todo =>
          todo.id === todoId ? updatedTodo : todo
        ));
      } else {
        const errorText = await response.text();
        console.error('API error:', response.status, errorText);
        alert(`Failed to update todo: ${response.status}`);
      }
    } catch (error) {
      console.error('Network error:', error);
      alert(`Network error: ${error}`);
    }
  };

  const deleteTodo = async (todoId: string) => {
    try {
      const response = await fetch(`/api/todos/${todoId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setTodos(todos.filter(todo => todo.id !== todoId));
      }
    } catch (error) {
      console.error('Failed to delete todo:', error);
    }
  };

  const addTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodoTitle.trim()) return;

    try {
      console.log('Creating todo with title:', newTodoTitle);
      const response = await fetch('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTodoTitle,
          applicationId,
          priority: 'medium',
        }),
      });

      console.log('API response status:', response.status);
      if (response.ok) {
        const newTodo = await response.json();
        console.log('Created todo:', newTodo);
        setTodos([newTodo, ...todos]);
        setNewTodoTitle('');
        setShowForm(false);
      } else {
        const errorData = await response.text();
        console.error('API error:', response.status, errorData);
        alert(`Failed to create todo: ${response.status} ${errorData}`);
      }
    } catch (error) {
      console.error('Network error:', error);
      alert(`Network error: ${error}`);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-green-400';
      default: return 'text-slate-400';
    }
  };

  if (isLoading) {
    return (
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
        <div className="animate-pulse">Loading todos...</div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <CheckCircle className="h-5 w-5" />
          To Do List
          {applicationId && <span className="text-sm text-slate-400">(Application Tasks)</span>}
        </h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      {showForm && (
        <form onSubmit={addTodo} className="mb-4 p-4 bg-slate-700 rounded-lg">
          <input
            type="text"
            value={newTodoTitle}
            onChange={(e) => setNewTodoTitle(e.target.value)}
            placeholder="What needs to be done?"
            className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
          <div className="flex justify-end gap-2 mt-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-3 py-1 text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
            >
              Add
            </button>
          </div>
        </form>
      )}

      <div className="space-y-2">
        {todos.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <CheckCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No tasks yet</p>
            <p className="text-sm">Add your first todo above</p>
          </div>
        ) : (
          todos.map((todo) => (
            <div
              key={todo.id}
              className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
                todo.completed
                  ? 'bg-slate-700/50 border-slate-600'
                  : 'bg-slate-700 border-slate-600'
              }`}
            >
              <button
                onClick={() => toggleTodo(todo.id, !todo.completed)}
                className={`mt-1 transition-colors ${
                  todo.completed ? 'text-green-400' : 'text-slate-400 hover:text-white'
                }`}
              >
                {todo.completed ? (
                  <CheckCircle className="h-5 w-5" />
                ) : (
                  <Circle className="h-5 w-5" />
                )}
              </button>

              <div className="flex-1 min-w-0">
                <h4 className={`font-medium ${
                  todo.completed ? 'text-slate-400 line-through' : 'text-white'
                }`}>
                  {todo.title}
                </h4>
                {todo.description && (
                  <p className={`text-sm mt-1 ${
                    todo.completed ? 'text-slate-500' : 'text-slate-300'
                  }`}>
                    {todo.description}
                  </p>
                )}
                <div className="flex items-center gap-2 mt-2">
                  <span className={`text-xs px-2 py-1 rounded ${getPriorityColor(todo.priority)} bg-slate-700`}>
                    {todo.priority}
                  </span>
                  {todo.dueDate && (
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(todo.dueDate).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>

              <button
                onClick={() => deleteTodo(todo.id)}
                className="p-1 text-slate-400 hover:text-red-400 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
