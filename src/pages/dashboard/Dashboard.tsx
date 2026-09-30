import React, { useState, useEffect } from 'react';
import {
  Users,
  Building2,
  CalendarCheck2,
  CalendarClock,
  Briefcase,
  TrendingUp,
  DollarSign,
  Flame,
  Clock,
  ArrowRight,
  Plus,
  AlertCircle,
  CheckCircle2,
  Phone,
  Compass,
  Building,
  Sparkles,
  ArrowUpRight,
  Calendar,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import {
  subscribeToLeads,
  subscribeToProperties,
  subscribeToFollowUps,
  subscribeToTasks,
  subscribeToSiteVisits,
  subscribeToDeals,
  subscribeToActivities,
} from '../../services/crmService';
import type {
  Lead,
  Property,
  FollowUp,
  Task,
  SiteVisit,
  Deal,
  Activity,
  LeadStatus,
} from '../../types';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { formatINR, formatDate, getInitials } from '../../utils/formatters';
import type { PageId } from '../../components/layout/Sidebar';

interface DashboardProps {
  onNavigate: (page: PageId) => void;
  onOpenNewLead: () => void;
  onSelectLead?: (leadId: string) => void;
  onSelectProperty?: (propId: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  onNavigate,
  onOpenNewLead,
  onSelectLead,
  onSelectProperty,
}) => {
  const { userProfile, organization } = useAuth();
  const orgId = userProfile?.organizationId || '';

  const [leads, setLeads] = useState<Lead[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [siteVisits, setSiteVisits] = useState<SiteVisit[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orgId) return;

    let unsubs: (() => void)[] = [];

    const unsubLeads = subscribeToLeads(orgId, (data) => setLeads(data));
    const unsubProps = subscribeToProperties(orgId, (data) => setProperties(data));
    const unsubFollows = subscribeToFollowUps(orgId, (data) => setFollowUps(data));
    const unsubTasks = subscribeToTasks(orgId, (data) => setTasks(data));
    const unsubVisits = subscribeToSiteVisits(orgId, (data) => setSiteVisits(data));
    const unsubDeals = subscribeToDeals(orgId, (data) => setDeals(data));
    const unsubActs = subscribeToActivities(orgId, (data) => {
      setActivities(data);
      setLoading(false);
    });

    unsubs = [unsubLeads, unsubProps, unsubFollows, unsubTasks, unsubVisits, unsubDeals, unsubActs];

    return () => {
      unsubs.forEach((u) => u && u());
    };
  }, [orgId]);

  // Calculations from real Firestore data
  const totalLeads = leads.length;
  const newLeads = leads.filter((l) => l.status === 'New').length;
  const qualifiedLeads = leads.filter((l) => l.status === 'Qualified').length;
  const hotLeads = leads.filter((l) => l.priority === 'Hot').length;
  const activeProperties = properties.filter((p) => p.status === 'Available').length;
  const dealsWon = deals.filter((d) => d.stage === 'Closed Won').length;

  const wonRevenue = deals
    .filter((d) => d.stage === 'Closed Won')
    .reduce((sum, d) => sum + (d.dealValue || 0), 0);

  const pipelineValue = deals
    .filter((d) => d.stage !== 'Closed Won' && d.stage !== 'Closed Lost')
    .reduce((sum, d) => sum + (d.dealValue || 0), 0);

  const todayStr = new Date().toISOString().slice(0, 10);
  const tasksDueToday = tasks.filter((t) => t.dueDate === todayStr && t.status !== 'Completed');
  const overdueFollowUps = followUps.filter(
    (f) => f.date < todayStr && f.status === 'Pending'
  );
  const upcomingFollowUps = followUps
    .filter((f) => f.date >= todayStr && f.status === 'Pending')
    .slice(0, 5);
  const upcomingSiteVisits = siteVisits
    .filter((v) => v.date >= todayStr && v.status === 'Scheduled')
    .slice(0, 4);

  // Lead Funnel counts
  const funnelStages: LeadStatus[] = [
    'New',
    'Contacted',
    'Qualified',
    'Site Visit',
    'Negotiation',
    'Won',
    'Lost',
  ];
  const funnelCounts = funnelStages.map((stage) => {
    const count = leads.filter((l) => l.status === stage).length;
    const percentage = totalLeads > 0 ? Math.round((count / totalLeads) * 100) : 0;
    return { stage, count, percentage };
  });

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Top Executive Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white rounded-2xl p-6 sm:p-7 shadow-lg border border-slate-800 relative overflow-hidden">
        {/* Subtle decorative geometric lines */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 pointer-events-none bg-[radial-gradient(#818cf8_1px,transparent_1px)] [background-size:16px_16px]" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-indigo-300 bg-indigo-500/20 px-2.5 py-0.5 rounded border border-indigo-400/20">
                {organization?.name || 'Real Estate Agency'}
              </span>
              <span className="text-xs text-slate-400">·</span>
              <span className="text-xs text-slate-300 font-medium">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-display">
              {getGreeting()}, {userProfile?.displayName ? userProfile.displayName.split(' ')[0] : 'Broker'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
              You have <strong className="text-white font-semibold">{newLeads} new leads</strong> to review and{' '}
              <strong className="text-white font-semibold">{upcomingFollowUps.length} follow-ups</strong> scheduled today.
            </p>
          </div>

          <div className="flex items-center flex-wrap gap-2.5 shrink-0">
            <Button
              size="sm"
              onClick={onOpenNewLead}
              icon={<Plus className="w-3.5 h-3.5" />}
              className="bg-indigo-500 hover:bg-indigo-600 text-white shadow-md shadow-indigo-500/25 border-0 font-semibold"
            >
              Add Lead
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onNavigate('properties')}
              icon={<Building2 className="w-3.5 h-3.5" />}
              className="bg-white/10 hover:bg-white/20 text-white border-white/20 hover:border-white/30 backdrop-blur-xs"
            >
              View Inventory
            </Button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {/* Total Leads */}
        <Card className="hover:border-slate-300 hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Inquiries
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight font-mono tabular-nums">
              {totalLeads}
            </span>
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-1.5 py-0.5 rounded">
              +{newLeads} new
            </span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            <span>{hotLeads} hot priority leads</span>
          </div>
        </Card>

        {/* Active Properties */}
        <Card className="hover:border-slate-300 hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Inventory Listings
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight font-mono tabular-nums">
              {activeProperties}
            </span>
            <span className="text-xs text-slate-500 font-mono tabular-nums">/ {properties.length} total</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>Available for purchase &amp; lease</span>
          </div>
        </Card>

        {/* Pipeline Value */}
        <Card className="hover:border-slate-300 hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Active Pipeline
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight truncate block font-mono tabular-nums">
              {formatINR(pipelineValue)}
            </span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            <span>In active negotiation stages</span>
          </div>
        </Card>

        {/* Deals Won / Closed Revenue */}
        <Card className="hover:border-slate-300 hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Closed Revenue
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-xl sm:text-2xl font-bold text-emerald-700 tracking-tight truncate block font-mono tabular-nums">
              {formatINR(wonRevenue)}
            </span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
            <span>{dealsWon} deals closed won</span>
          </div>
        </Card>
      </div>

      {/* Overdue Alerts (if any) */}
      {overdueFollowUps.length > 0 && (
        <div className="p-4 rounded-xl bg-amber-50/90 border border-amber-200/90 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
              <AlertCircle className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-amber-900">
                Action Required: {overdueFollowUps.length} overdue client follow-up{overdueFollowUps.length > 1 ? 's' : ''}
              </p>
              <p className="text-[11px] text-amber-700">
                Prompt follow-ups increase deal closure rates by over 40%.
              </p>
            </div>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="bg-white border-amber-300 text-amber-900 hover:bg-amber-50"
            onClick={() => onNavigate('followups')}
          >
            Review Follow-ups
          </Button>
        </div>
      )}

      {/* Main Grid: Funnel + Upcoming Follow-ups & Visits */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Lead Funnel + Recent Inquiries */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Lead Conversion Funnel */}
          <Card
            title="Pipeline Conversion Funnel"
            subtitle="Real-time distribution of buyer and tenant inquiries across pipeline stages"
            action={
              <button
                onClick={() => onNavigate('leads')}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 cursor-pointer transition"
              >
                All Leads <ArrowRight className="w-3.5 h-3.5" />
              </button>
            }
          >
            {totalLeads === 0 ? (
              <div className="py-8 text-center">
                <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-2">
                  <Users className="w-5 h-5" />
                </div>
                <p className="text-xs font-semibold text-slate-700">No leads recorded yet</p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Create your first lead or seed demo agency data in Settings.
                </p>
                <Button size="sm" onClick={onOpenNewLead} className="mt-3">
                  Create First Lead
                </Button>
              </div>
            ) : (
              <div className="space-y-3 pt-1">
                {funnelCounts.map((f) => (
                  <div key={f.stage} className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-800">{f.stage}</span>
                      </div>
                      <span className="text-slate-500 font-mono tabular-nums text-[11px]">
                        <strong>{f.count}</strong> leads · {f.percentage}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          f.stage === 'Won'
                            ? 'bg-emerald-500'
                            : f.stage === 'Lost'
                            ? 'bg-slate-400'
                            : f.stage === 'Negotiation'
                            ? 'bg-amber-500'
                            : f.stage === 'Site Visit'
                            ? 'bg-purple-500'
                            : 'bg-indigo-600'
                        }`}
                        style={{ width: `${Math.max(f.percentage, f.count > 0 ? 4 : 0)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Recent Inquiries Table preview */}
          <Card
            title="Recent Inquiries"
            subtitle="Latest incoming buyer and tenant requests"
            action={
              <Button size="sm" variant="ghost" onClick={() => onNavigate('leads')}>
                View Table <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            }
          >
            {leads.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No leads available.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                      <th className="pb-2.5">Client Name</th>
                      <th className="pb-2.5">Contact</th>
                      <th className="pb-2.5">Target Location</th>
                      <th className="pb-2.5">Stage</th>
                      <th className="pb-2.5 text-right">Priority</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {leads.slice(0, 5).map((l) => (
                      <tr
                        key={l.id}
                        onClick={() => onSelectLead && onSelectLead(l.id)}
                        className="hover:bg-slate-50/80 transition cursor-pointer group"
                      >
                        <td className="py-2.5">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-md bg-indigo-50 text-indigo-700 font-bold text-[11px] flex items-center justify-center border border-indigo-100 shrink-0">
                              {getInitials(l.name)}
                            </div>
                            <span className="font-semibold text-slate-800 group-hover:text-indigo-600 transition">
                              {l.name}
                            </span>
                          </div>
                        </td>
                        <td className="py-2.5 text-slate-500 font-mono tabular-nums">{l.phone}</td>
                        <td className="py-2.5 text-slate-600 truncate max-w-[130px]">
                          {l.preferredLocation || 'Any'}
                        </td>
                        <td className="py-2.5">
                          <Badge size="sm" variant={l.status === 'Won' ? 'success' : 'primary'}>
                            {l.status}
                          </Badge>
                        </td>
                        <td className="py-2.5 text-right">
                          <Badge
                            size="sm"
                            variant={
                              l.priority === 'Hot' ? 'hot' : l.priority === 'Warm' ? 'warm' : 'cold'
                            }
                          >
                            {l.priority}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>

        {/* Right Column: Follow-ups, Tasks & Site Visits */}
        <div className="flex flex-col gap-6">
          {/* Upcoming Follow-ups */}
          <Card
            title="Scheduled Follow-ups"
            subtitle="Today's calls & client syncs"
            action={
              <button
                onClick={() => onNavigate('followups')}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 cursor-pointer"
              >
                All ({followUps.length})
              </button>
            }
          >
            {upcomingFollowUps.length === 0 ? (
              <div className="text-center py-6 text-slate-400">
                <CalendarClock className="w-6 h-6 mx-auto mb-1 opacity-40" />
                <p className="text-xs">No pending follow-ups scheduled.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {upcomingFollowUps.map((f) => (
                  <div
                    key={f.id}
                    className="p-3 rounded-xl bg-slate-50/70 border border-slate-200/70 hover:border-slate-300 transition"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-slate-800">{f.relatedName}</p>
                      <Badge size="sm" variant={f.priority === 'High' ? 'danger' : 'neutral'}>
                        {f.priority}
                      </Badge>
                    </div>
                    {f.notes && (
                      <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">{f.notes}</p>
                    )}
                    <div className="flex items-center gap-1.5 mt-2 text-[10px] text-slate-500 font-mono">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>{formatDate(f.date)} · {f.time} ({f.type})</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Site Visits */}
          <Card
            title="Upcoming Site Visits"
            subtitle="Scheduled property tours"
            action={
              <button
                onClick={() => onNavigate('sitevisits')}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 cursor-pointer"
              >
                All ({siteVisits.length})
              </button>
            }
          >
            {upcomingSiteVisits.length === 0 ? (
              <div className="text-center py-6 text-slate-400">
                <Compass className="w-6 h-6 mx-auto mb-1 opacity-40" />
                <p className="text-xs">No site visits scheduled.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {upcomingSiteVisits.map((v) => (
                  <div
                    key={v.id}
                    className="p-3 rounded-xl bg-slate-50/70 border border-slate-200/70 hover:border-slate-300 transition"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-slate-800 truncate">{v.propertyTitle}</p>
                      <Badge size="sm" variant="purple">
                        {v.status}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-indigo-700 font-medium mt-0.5">
                      Client: {v.leadName || v.clientName || 'Inquiry'}
                    </p>
                    <p className="text-[10px] text-slate-500 mt-1 flex items-center gap-1 font-mono">
                      <Compass className="w-3 h-3 text-slate-400" />
                      {formatDate(v.date)} · {v.time} · {v.location}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Recent Activity Stream */}
          <Card
            title="Audit Trail"
            subtitle="Recent actions across your agency"
            action={
              <button
                onClick={() => onNavigate('activities')}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 cursor-pointer"
              >
                History
              </button>
            }
          >
            {activities.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No activity logged yet.</p>
            ) : (
              <div className="space-y-3">
                {activities.slice(0, 4).map((a) => (
                  <div key={a.id} className="flex items-start gap-2.5 text-xs">
                    <div className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                    <div>
                      <p className="text-slate-800 font-medium leading-snug">{a.description}</p>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {formatDate(a.timestamp)} · by {a.userName}
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
