import React, { useState, useMemo } from 'react';
import {
  Plus,
  Search,
  Compass,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Edit,
  Trash2,
} from 'lucide-react';
import type { SiteVisit, SiteVisitStatus } from '../../types';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { formatDate } from '../../utils/formatters';
import { useToast } from '../../contexts/ToastContext';

interface SiteVisitsListProps {
  siteVisits: SiteVisit[];
  onOpenCreate: () => void;
  onEditVisit: (visit: SiteVisit) => void;
  onDeleteVisit: (id: string) => Promise<void>;
  onUpdateStatus: (id: string, status: SiteVisitStatus) => Promise<void>;
}

export const SiteVisitsList: React.FC<SiteVisitsListProps> = ({
  siteVisits,
  onOpenCreate,
  onEditVisit,
  onDeleteVisit,
  onUpdateStatus,
}) => {
  const { showToast } = useToast();
  const [tab, setTab] = useState<'upcoming' | 'completed' | 'all'>('upcoming');
  const [search, setSearch] = useState('');
  const [visitToDelete, setVisitToDelete] = useState<SiteVisit | null>(null);
  const [deleting, setDeleting] = useState(false);

  const todayStr = new Date().toISOString().slice(0, 10);

  const filteredVisits = useMemo(() => {
    return siteVisits.filter((v) => {
      const term = search.toLowerCase().trim();
      const matchesSearch =
        !term ||
        (v.leadName && v.leadName.toLowerCase().includes(term)) ||
        (v.clientName && v.clientName.toLowerCase().includes(term)) ||
        v.propertyTitle.toLowerCase().includes(term) ||
        v.location.toLowerCase().includes(term);

      if (!matchesSearch) return false;

      if (tab === 'upcoming') {
        return v.date >= todayStr && v.status === 'Scheduled';
      }
      if (tab === 'completed') {
        return v.status === 'Completed';
      }
      return true; // 'all'
    });
  }, [siteVisits, search, tab, todayStr]);

  const handleDelete = async () => {
    if (!visitToDelete) return;
    setDeleting(true);
    try {
      await onDeleteVisit(visitToDelete.id);
      showToast('Site visit record removed.');
      setVisitToDelete(null);
    } catch (err: any) {
      showToast('Failed to delete visit: ' + err.message, 'error');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Site Visits &amp; Tours
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Coordinate physical property walk-throughs with verified buyers and agents
          </p>
        </div>

        <Button size="sm" onClick={onOpenCreate} icon={<Plus className="w-3.5 h-3.5" />}>
          Schedule Site Visit
        </Button>
      </div>

      {/* Tabs and Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl w-fit">
          <button
            onClick={() => setTab('upcoming')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              tab === 'upcoming'
                ? 'bg-white shadow-xs text-indigo-700'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Upcoming Scheduled
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
            All Visits ({siteVisits.length})
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by client or property..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Site Visits Cards */}
      <div className="space-y-3">
        {filteredVisits.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400 bg-white rounded-xl border border-slate-200">
            No site visits found for &ldquo;{tab}&rdquo;.
          </div>
        ) : (
          filteredVisits.map((visit) => (
            <Card key={visit.id} bodyClassName="p-4" className="hover:border-indigo-200 transition">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600 shrink-0">
                    <Compass className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-bold text-slate-900">{visit.propertyTitle}</h3>
                      <Badge
                        size="sm"
                        variant={
                          visit.status === 'Completed'
                            ? 'success'
                            : visit.status === 'Cancelled'
                            ? 'danger'
                            : visit.status === 'No Show'
                            ? 'warning'
                            : 'purple'
                        }
                      >
                        {visit.status}
                      </Badge>
                    </div>

                    <p className="text-xs text-indigo-600 font-semibold mt-0.5">
                      Client / Visitor: {visit.leadName || visit.clientName || 'Lead'}
                    </p>

                    <div className="flex items-center gap-4 mt-2 text-[11px] text-slate-500 flex-wrap">
                      <span className="flex items-center gap-1 font-medium text-slate-700">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {formatDate(visit.date)} at {visit.time}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {visit.location}
                      </span>
                      <span>•</span>
                      <span>Representative: {visit.assignedAgentName}</span>
                    </div>

                    {visit.notes && (
                      <p className="text-xs text-slate-600 mt-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                        {visit.notes}
                      </p>
                    )}
                  </div>
                </div>

                {/* Actions & Status Changers */}
                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  {visit.status === 'Scheduled' && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onUpdateStatus(visit.id, 'Completed')}
                        icon={<CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                        className="text-emerald-700 hover:bg-emerald-50"
                      >
                        Done
                      </Button>
                      <button
                        onClick={() => onUpdateStatus(visit.id, 'No Show')}
                        className="text-xs font-semibold px-2 py-1 text-amber-700 hover:bg-amber-50 rounded-lg transition"
                      >
                        No Show
                      </button>
                    </>
                  )}

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onEditVisit(visit)}
                    icon={<Edit className="w-3.5 h-3.5" />}
                  >
                    Edit
                  </Button>

                  <button
                    onClick={() => setVisitToDelete(visit)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      <ConfirmDialog
        isOpen={Boolean(visitToDelete)}
        onClose={() => setVisitToDelete(null)}
        onConfirm={handleDelete}
        title="Delete Site Visit"
        message={`Are you sure you want to delete site visit for "${visitToDelete?.propertyTitle}"?`}
        confirmLabel="Delete"
        loading={deleting}
      />
    </div>
  );
};
