import React, { useState, useMemo } from 'react';
import {
  Plus,
  Search,
  CheckCircle2,
  Circle,
  Clock,
  AlertCircle,
  Edit,
  Trash2,
} from 'lucide-react';
import type { Task, TaskStatus } from '../../types';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { formatDate } from '../../utils/formatters';
import { useToast } from '../../contexts/ToastContext';

interface TasksListProps {
  tasks: Task[];
  onOpenCreate: () => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (id: string) => Promise<void>;
  onUpdateStatus: (id: string, status: TaskStatus) => Promise<void>;
}

export const TasksList: React.FC<TasksListProps> = ({
  tasks,
  onOpenCreate,
  onEditTask,
  onDeleteTask,
  onUpdateStatus,
}) => {
  const { showToast } = useToast();
  const [tab, setTab] = useState<'today' | 'overdue' | 'upcoming' | 'completed' | 'all'>('today');
  const [search, setSearch] = useState('');
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [deleting, setDeleting] = useState(false);

  const todayStr = new Date().toISOString().slice(0, 10);

  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      const term = search.toLowerCase().trim();
      const matchesSearch =
        !term ||
        t.title.toLowerCase().includes(term) ||
        t.description.toLowerCase().includes(term) ||
        (t.relatedLeadName && t.relatedLeadName.toLowerCase().includes(term));

      if (!matchesSearch) return false;

      if (tab === 'today') {
        return t.dueDate === todayStr && t.status !== 'Completed';
      }
      if (tab === 'overdue') {
        return t.dueDate < todayStr && t.status !== 'Completed';
      }
      if (tab === 'upcoming') {
        return t.dueDate > todayStr && t.status !== 'Completed';
      }
      if (tab === 'completed') {
        return t.status === 'Completed';
      }
      return true; // 'all'
    });
  }, [tasks, search, tab, todayStr]);

  const overdueCount = tasks.filter((t) => t.dueDate < todayStr && t.status !== 'Completed').length;
  const todayCount = tasks.filter((t) => t.dueDate === todayStr && t.status !== 'Completed').length;

  const handleDelete = async () => {
    if (!taskToDelete) return;
    setDeleting(true);
    try {
      await onDeleteTask(taskToDelete.id);
      showToast('Task deleted.');
      setTaskToDelete(null);
    } catch (err: any) {
      showToast('Failed to delete task: ' + err.message, 'error');
    } finally {
      setDeleting(false);
    }
  };

  const toggleTaskStatus = async (task: Task) => {
    const nextStatus: TaskStatus = task.status === 'Completed' ? 'Todo' : 'Completed';
    await onUpdateStatus(task.id, nextStatus);
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Task Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real estate documentation, registry visits, verification checklists
          </p>
        </div>

        <Button size="sm" onClick={onOpenCreate} icon={<Plus className="w-3.5 h-3.5" />}>
          Create Task
        </Button>
      </div>

      {/* Tabs and Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl w-fit overflow-x-auto">
          <button
            onClick={() => setTab('today')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              tab === 'today'
                ? 'bg-white shadow-xs text-indigo-700'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Due Today ({todayCount})
          </button>
          <button
            onClick={() => setTab('overdue')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1 ${
              tab === 'overdue'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-rose-700 hover:bg-rose-50'
            }`}
          >
            {overdueCount > 0 && <span className="w-2 h-2 rounded-full bg-rose-400" />}
            Overdue ({overdueCount})
          </button>
          <button
            onClick={() => setTab('upcoming')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              tab === 'upcoming'
                ? 'bg-white shadow-xs text-indigo-700'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Upcoming
          </button>
          <button
            onClick={() => setTab('completed')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              tab === 'completed'
                ? 'bg-white shadow-xs text-indigo-700'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Completed
          </button>
          <button
            onClick={() => setTab('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              tab === 'all'
                ? 'bg-white shadow-xs text-indigo-700'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All ({tasks.length})
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-2.5">
        {filteredTasks.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400 bg-white rounded-xl border border-slate-200">
            No tasks found under &ldquo;{tab}&rdquo;.
          </div>
        ) : (
          filteredTasks.map((task) => {
            const isCompleted = task.status === 'Completed';
            const isOverdue = task.dueDate < todayStr && !isCompleted;

            return (
              <Card
                key={task.id}
                bodyClassName="p-3.5"
                className={`transition ${
                  isOverdue ? 'border-rose-200 bg-rose-50/20' : 'hover:border-indigo-200'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => toggleTaskStatus(task)}
                      className="mt-0.5 text-slate-400 hover:text-indigo-600 transition shrink-0"
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      ) : (
                        <Circle className="w-5 h-5" />
                      )}
                    </button>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`text-sm font-bold ${
                            isCompleted ? 'line-through text-slate-400' : 'text-slate-900'
                          }`}
                        >
                          {task.title}
                        </span>
                        <Badge
                          size="sm"
                          variant={
                            task.priority === 'High'
                              ? 'danger'
                              : task.priority === 'Medium'
                              ? 'warning'
                              : 'neutral'
                          }
                        >
                          {task.priority}
                        </Badge>
                        <Badge
                          size="sm"
                          variant={
                            task.status === 'Completed'
                              ? 'success'
                              : task.status === 'In Progress'
                              ? 'purple'
                              : 'default'
                          }
                        >
                          {task.status}
                        </Badge>
                      </div>

                      {task.description && (
                        <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                          {task.description}
                        </p>
                      )}

                      <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-400 font-medium flex-wrap">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          Due: {formatDate(task.dueDate)}
                        </span>
                        {task.relatedLeadName && (
                          <>
                            <span>•</span>
                            <span className="text-indigo-600 font-semibold">
                              For: {task.relatedLeadName}
                            </span>
                          </>
                        )}
                        <span>•</span>
                        <span>Assigned to {task.assignedAgentName}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => onEditTask(task)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setTaskToDelete(task)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>

      <ConfirmDialog
        isOpen={Boolean(taskToDelete)}
        onClose={() => setTaskToDelete(null)}
        onConfirm={handleDelete}
        title="Delete Task"
        message={`Are you sure you want to delete task "${taskToDelete?.title}"?`}
        confirmLabel="Delete"
        loading={deleting}
      />
    </div>
  );
};
