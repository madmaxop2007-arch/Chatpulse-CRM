import React, { useState, useMemo } from 'react';
import {
  Plus,
  Search,
  Calendar,
  Phone,
  MessageCircle,
  Users,
  CheckCircle2,
  Clock,
  AlertCircle,
  MoreVertical,
  Edit,
  Trash2,
} from 'lucide-react';
import type { FollowUp, FollowUpStatus } from '../../types';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { formatDate } from '../../utils/formatters';
import { useToast } from '../../contexts/ToastContext';

interface FollowUpsListProps {
  followUps: FollowUp[];
  onOpenCreate: () => void;
  onEditFollowUp: (followUp: FollowUp) => void;
  onDeleteFollowUp: (id: string) => Promise<void>;
  onUpdateStatus: (id: string, status: FollowUpStatus) => Promise<void>;
}

export const FollowUpsList: React.FC<FollowUpsListProps> = ({
  followUps,
  onOpenCreate,
  onEditFollowUp,
  onDeleteFollowUp,
  onUpdateStatus,
}) => {
  const { showToast } = useToast();
  const [tab, setTab] = useState<'today' | 'overdue' | 'upcoming' | 'completed' | 'all'>('today');
  const [search, setSearch] = useState('');
  const [itemToDelete, setItemToDelete] = useState<FollowUp | null>(null);
  const [deleting, setDeleting] = useState(false);

  const todayStr = new Date().toISOString().slice(0, 10);

  const filtered = useMemo(() => {
    return followUps.filter((f) => {
      const term = search.toLowerCase().trim();
      const matchesSearch =
        !term ||
        f.relatedName.toLowerCase().includes(term) ||
        f.notes.toLowerCase().includes(term) ||
        f.type.toLowerCase().includes(term);

      if (!matchesSearch) return false;

      if (tab === 'today') {
        return f.date === todayStr && f.status === 'Pending';
      }
      if (tab === 'overdue') {
        return f.date < todayStr && f.status === 'Pending';
      }
      if (tab === 'upcoming') {
        return f.date > todayStr && f.status === 'Pending';
      }
      if (tab === 'completed') {
        return f.status === 'Completed';
      }
      return true; // 'all'
    });
  }, [followUps, search, tab, todayStr]);

  const overdueCount = followUps.filter((f) => f.date < todayStr && f.status === 'Pending').length;
  const todayCount = followUps.filter((f) => f.date === todayStr && f.status === 'Pending').length;

  const handleDelete = async () => {
    if (!itemToDelete) return;
    setDeleting(true);
    try {
      await onDeleteFollowUp(itemToDelete.id);
      showToast('Follow-up deleted.');
      setItemToDelete(null);
    } catch (err: any) {
      showToast('Failed to delete follow-up: ' + err.message, 'error');
    } finally {
      setDeleting(false);
    }
  };

  const getChannelIcon = (type: string) => {
    switch (type) {
      case 'Call':
        return <Phone className="w-4 h-4 text-blue-600" />;
      case 'WhatsApp':
        return <MessageCircle className="w-4 h-4 text-emerald-600" />;
      case 'Meeting':
        return <Users className="w-4 h-4 text-purple-600" />;
      default:
        return <Calendar className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Follow-ups &amp; Communications
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Never miss a prospect call, site feedback, or negotiation meeting
          </p>
        </div>

        <Button size="sm" onClick={onOpenCreate} icon={<Plus className="w-3.5 h-3.5" />}>
          Schedule Follow-up
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
            Today ({todayCount})
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
            All ({followUps.length})
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by contact or agenda..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Follow-up Cards List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400 bg-white rounded-xl border border-slate-200">
            No follow-ups found under &ldquo;{tab}&rdquo;.
          </div>
        ) : (
          filtered.map((item) => {
            const isOverdue = item.date < todayStr && item.status === 'Pending';

            return (
              <Card
                key={item.id}
                bodyClassName="p-4"
                className={`transition ${
                  isOverdue ? 'border-rose-200 bg-rose-50/20' : 'hover:border-indigo-200'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 shrink-0">
                      {getChannelIcon(item.type)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-slate-900">
                          {item.relatedName}
                        </span>
                        <span className="text-[10px] uppercase font-semibold text-slate-400">
                          ({item.relatedType})
                        </span>
                        <Badge
                          size="sm"
                          variant={
                            item.priority === 'High'
                              ? 'danger'
                              : item.priority === 'Medium'
                              ? 'warning'
                              : 'neutral'
                          }
                        >
                          {item.priority}
                        </Badge>
                        <Badge
                          size="sm"
                          variant={
                            item.status === 'Completed'
                              ? 'success'
                              : item.status === 'Missed'
                              ? 'danger'
                              : 'primary'
                          }
                        >
                          {item.status}
                        </Badge>
                      </div>

                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">{item.notes}</p>

                      <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-400 font-medium">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          {formatDate(item.date)} at {item.time} ({item.type})
                        </span>
                        <span>•</span>
                        <span>Assigned to {item.assignedAgentName}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    {item.status === 'Pending' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onUpdateStatus(item.id, 'Completed')}
                        icon={<CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                        className="text-emerald-700 hover:bg-emerald-50"
                      >
                        Complete
                      </Button>
                    )}

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onEditFollowUp(item)}
                      icon={<Edit className="w-3.5 h-3.5" />}
                    >
                      Edit
                    </Button>

                    <button
                      onClick={() => setItemToDelete(item)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>

      <ConfirmDialog
        isOpen={Boolean(itemToDelete)}
        onClose={() => setItemToDelete(null)}
        onConfirm={handleDelete}
        title="Delete Follow-up"
        message={`Are you sure you want to remove follow-up with "${itemToDelete?.relatedName}"?`}
        confirmLabel="Delete"
        loading={deleting}
      />
    </div>
  );
};
