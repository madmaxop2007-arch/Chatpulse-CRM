import React, { useState } from 'react';
import {
  ArrowLeft,
  Phone,
  MessageCircle,
  Mail,
  Calendar,
  Compass,
  CheckSquare,
  Edit,
  UserCheck,
  Clock,
  Send,
  Building,
  MapPin,
  TrendingUp,
} from 'lucide-react';
import type { Lead, Activity, FollowUp, SiteVisit, Task, LeadStatus, LeadPriority } from '../../types';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { formatINR, formatDate } from '../../utils/formatters';
import { useToast } from '../../contexts/ToastContext';

interface LeadDetailProps {
  lead: Lead;
  activities: Activity[];
  followUps: FollowUp[];
  siteVisits: SiteVisit[];
  tasks: Task[];
  onBack: () => void;
  onEdit: () => void;
  onUpdateStatus: (newStatus: LeadStatus) => Promise<void>;
  onUpdatePriority: (newPriority: LeadPriority) => Promise<void>;
  onAddNote: (noteText: string) => Promise<void>;
  onAddFollowUp: () => void;
  onScheduleSiteVisit: () => void;
  onCreateTask: () => void;
  onConvertToClient: () => Promise<void>;
}

export const LeadDetail: React.FC<LeadDetailProps> = ({
  lead,
  activities,
  followUps,
  siteVisits,
  tasks,
  onBack,
  onEdit,
  onUpdateStatus,
  onUpdatePriority,
  onAddNote,
  onAddFollowUp,
  onScheduleSiteVisit,
  onCreateTask,
  onConvertToClient,
}) => {
  const { showToast } = useToast();
  const [newNote, setNewNote] = useState('');
  const [addingNote, setAddingNote] = useState(false);

  // Filter activities related to this lead
  const leadActivities = activities.filter(
    (a) => a.relatedId === lead.id || a.relatedName === lead.name
  );
  const leadFollowUps = followUps.filter((f) => f.relatedId === lead.id || f.relatedName === lead.name);
  const leadSiteVisits = siteVisits.filter(
    (v) => v.leadId === lead.id || v.leadName === lead.name
  );
  const leadTasks = tasks.filter(
    (t) => t.relatedLeadId === lead.id || t.relatedLeadName === lead.name
  );

  const handleNoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    setAddingNote(true);
    try {
      await onAddNote(newNote.trim());
      setNewNote('');
      showToast('Note added to lead activity log.');
    } catch (err: any) {
      showToast('Failed to add note: ' + err.message, 'error');
    } finally {
      setAddingNote(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Top Navigation & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition w-fit"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Leads
        </button>

        <div className="flex items-center flex-wrap gap-2.5">
          <Button variant="outline" size="sm" onClick={onEdit} icon={<Edit className="w-3.5 h-3.5" />}>
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onAddFollowUp}
            icon={<Calendar className="w-3.5 h-3.5 text-amber-500" />}
          >
            Follow-up
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onScheduleSiteVisit}
            icon={<Compass className="w-3.5 h-3.5 text-indigo-500" />}
          >
            Site Visit
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onCreateTask}
            icon={<CheckSquare className="w-3.5 h-3.5 text-blue-500" />}
          >
            Task
          </Button>
          <Button
            size="sm"
            onClick={onConvertToClient}
            icon={<UserCheck className="w-3.5 h-3.5" />}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            Convert to Client
          </Button>
        </div>
      </div>

      {/* Main Profile Header Card */}
      <Card bodyClassName="p-6">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-700 font-bold text-lg flex items-center justify-center border border-indigo-100 shrink-0">
              {lead.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  {lead.name}
                </h1>
                <Badge
                  variant={
                    lead.status === 'Won'
                      ? 'success'
                      : lead.status === 'Lost'
                      ? 'danger'
                      : lead.status === 'Negotiation'
                      ? 'warning'
                      : 'primary'
                  }
                >
                  {lead.status}
                </Badge>
                <Badge
                  variant={
                    lead.priority === 'Hot' ? 'hot' : lead.priority === 'Warm' ? 'warm' : 'cold'
                  }
                >
                  {lead.priority} Priority
                </Badge>
              </div>

              <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5 flex-wrap">
                <span>Source: <strong>{lead.source}</strong></span>
                <span>•</span>
                <span>Assigned to: <strong>{lead.assignedAgentName}</strong></span>
                <span>•</span>
                <span>Created {formatDate(lead.createdAt)}</span>
              </p>

              {/* Direct Communication Quick Buttons */}
              <div className="flex items-center gap-2 mt-4 flex-wrap">
                <a
                  href={`tel:${lead.phone}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-xs font-bold transition"
                >
                  <Phone className="w-3.5 h-3.5" /> Call ({lead.phone})
                </a>
                {lead.whatsapp && (
                  <a
                    href={`https://wa.me/${lead.whatsapp.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-bold transition"
                  >
                    <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                  </a>
                )}
                {lead.email && (
                  <a
                    href={`mailto:${lead.email}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-medium transition"
                  >
                    <Mail className="w-3.5 h-3.5" /> Email
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Quick Status / Priority Pickers */}
          <div className="flex sm:flex-row lg:flex-col gap-3 shrink-0">
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Stage
              </label>
              <select
                value={lead.status}
                onChange={(e) => onUpdateStatus(e.target.value as LeadStatus)}
                className="text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white"
              >
                <option value="New">New</option>
                <option value="Contacted">Contacted</option>
                <option value="Qualified">Qualified</option>
                <option value="Site Visit">Site Visit</option>
                <option value="Negotiation">Negotiation</option>
                <option value="Won">Won</option>
                <option value="Lost">Lost</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Priority
              </label>
              <select
                value={lead.priority}
                onChange={(e) => onUpdatePriority(e.target.value as LeadPriority)}
                className="text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white"
              >
                <option value="Hot">🔥 Hot</option>
                <option value="Warm">⚡ Warm</option>
                <option value="Cold">❄️ Cold</option>
              </select>
            </div>
          </div>
        </div>
      </Card>

      {/* Grid: Requirements vs Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Property Requirements & Notes */}
        <div className="flex flex-col gap-6">
          <Card title="Property Requirements">
            <div className="space-y-3.5 text-xs">
              <div>
                <span className="text-slate-400 block font-medium">Budget Range</span>
                <span className="text-sm font-bold text-slate-900">
                  {formatINR(lead.budgetMin)} - {formatINR(lead.budgetMax)}
                </span>
              </div>

              <div>
                <span className="text-slate-400 block font-medium">Configuration &amp; Type</span>
                <span className="font-semibold text-slate-800">
                  {lead.bedrooms ? `${lead.bedrooms} • ` : ''}
                  {lead.propertyType} ({lead.purpose})
                </span>
              </div>

              <div>
                <span className="text-slate-400 block font-medium">Preferred Location</span>
                <span className="font-semibold text-slate-800 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {lead.preferredLocation}
                </span>
              </div>

              <div>
                <span className="text-slate-400 block font-medium">Next Follow-up</span>
                <span className="font-semibold text-slate-800">
                  {lead.nextFollowUpDate ? formatDate(lead.nextFollowUpDate) : 'Not scheduled'}
                </span>
              </div>

              {lead.notes && (
                <div className="pt-2 border-t border-slate-100">
                  <span className="text-slate-400 block font-medium mb-1">Agent Notes</span>
                  <p className="text-slate-700 bg-slate-50 p-2.5 rounded-lg leading-relaxed text-xs">
                    {lead.notes}
                  </p>
                </div>
              )}
            </div>
          </Card>

          {/* Site Visits list for this lead */}
          <Card
            title={`Site Visits (${leadSiteVisits.length})`}
            action={
              <button
                onClick={onScheduleSiteVisit}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
              >
                + Schedule
              </button>
            }
          >
            {leadSiteVisits.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">No visits scheduled yet.</p>
            ) : (
              <div className="space-y-2">
                {leadSiteVisits.map((v) => (
                  <div
                    key={v.id}
                    className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/60 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 truncate">{v.propertyTitle}</span>
                      <Badge size="sm" variant="purple">
                        {v.status}
                      </Badge>
                    </div>
                    <span className="text-[11px] text-slate-500 mt-1 block">
                      {formatDate(v.date)} at {v.time} • {v.location}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Follow-ups list for this lead */}
          <Card
            title={`Follow-ups (${leadFollowUps.length})`}
            action={
              <button
                onClick={onAddFollowUp}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
              >
                + Add
              </button>
            }
          >
            {leadFollowUps.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">No pending follow-ups.</p>
            ) : (
              <div className="space-y-2">
                {leadFollowUps.map((f) => (
                  <div
                    key={f.id}
                    className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/60 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">
                        {f.type} ({formatDate(f.date)} {f.time})
                      </span>
                      <Badge size="sm" variant={f.status === 'Completed' ? 'success' : 'neutral'}>
                        {f.status}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-1">{f.notes}</p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Right column: Activity Timeline & Note Composer (2 cols) */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Note Composer */}
          <Card title="Add Note or Interaction Log">
            <form onSubmit={handleNoteSubmit} className="flex flex-col gap-3">
              <textarea
                rows={2}
                placeholder="Log discussion notes, budget updates, or feedback from call..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                className="w-full text-xs p-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500"
              />
              <div className="flex justify-end">
                <Button
                  type="submit"
                  size="sm"
                  loading={addingNote}
                  icon={<Send className="w-3.5 h-3.5" />}
                >
                  Post Activity
                </Button>
              </div>
            </form>
          </Card>

          {/* Activity Timeline */}
          <Card title="Activity Timeline">
            {leadActivities.length === 0 ? (
              <p className="text-xs text-slate-400 py-8 text-center">
                No recorded interactions yet. Use the note composer above to log your first call or meeting note.
              </p>
            ) : (
              <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                {leadActivities.map((act) => (
                  <div key={act.id} className="relative">
                    <div className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-indigo-600 ring-4 ring-white" />
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-slate-900">
                          {act.activityType}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {formatDate(act.timestamp)}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        {act.description}
                      </p>
                      <span className="text-[10px] text-slate-400 mt-1 block">
                        Logged by {act.userName}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};
