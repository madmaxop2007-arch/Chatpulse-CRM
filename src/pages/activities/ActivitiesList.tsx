import React, { useState, useMemo } from 'react';
import {
  History,
  Phone,
  MessageCircle,
  Mail,
  Calendar,
  Compass,
  Briefcase,
  FileText,
  UserPlus,
  RefreshCw,
} from 'lucide-react';
import type { Activity, ActivityType } from '../../types';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { formatDate } from '../../utils/formatters';

interface ActivitiesListProps {
  activities: Activity[];
}

export const ActivitiesList: React.FC<ActivitiesListProps> = ({ activities }) => {
  const [filterType, setFilterType] = useState<string>('all');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    return activities.filter((a) => {
      const matchesType = filterType === 'all' || a.activityType === filterType;
      const term = search.toLowerCase().trim();
      const matchesSearch =
        !term ||
        a.description.toLowerCase().includes(term) ||
        a.userName.toLowerCase().includes(term) ||
        a.relatedName.toLowerCase().includes(term);

      return matchesType && matchesSearch;
    });
  }, [activities, filterType, search]);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'Call':
        return <Phone className="w-4 h-4 text-blue-600" />;
      case 'WhatsApp':
        return <MessageCircle className="w-4 h-4 text-emerald-600" />;
      case 'Email':
        return <Mail className="w-4 h-4 text-sky-600" />;
      case 'Meeting':
        return <Calendar className="w-4 h-4 text-purple-600" />;
      case 'Site Visit':
        return <Compass className="w-4 h-4 text-indigo-600" />;
      case 'Deal Update':
        return <Briefcase className="w-4 h-4 text-amber-600" />;
      case 'Lead Created':
      case 'Lead Updated':
        return <UserPlus className="w-4 h-4 text-emerald-600" />;
      default:
        return <FileText className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Audit &amp; Activity Stream
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Centralized chronological log of all communications, updates, and milestones
        </p>
      </div>

      {/* Filters */}
      <Card bodyClassName="p-3.5">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl overflow-x-auto w-full sm:w-auto">
            {['all', 'Call', 'WhatsApp', 'Meeting', 'Site Visit', 'Deal Update', 'Note'].map((t) => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition shrink-0 ${
                  filterType === t
                    ? 'bg-white shadow-xs text-indigo-700'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t === 'all' ? 'All Activities' : t}
              </button>
            ))}
          </div>

          <input
            type="text"
            placeholder="Search by agent, note, client..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-64 pl-3 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100"
          />
        </div>
      </Card>

      {/* Timeline Card */}
      <Card bodyClassName="p-6">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-xs text-slate-400">
            No activity records match the selected filter.
          </div>
        ) : (
          <div className="relative pl-6 space-y-6 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
            {filtered.map((item) => (
              <div key={item.id} className="relative">
                <div className="absolute -left-6 top-1 w-6 h-6 rounded-full bg-white border border-slate-200 shadow-2xs flex items-center justify-center">
                  {getActivityIcon(item.activityType)}
                </div>

                <div className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-200/60 ml-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">
                        {item.userName}
                      </span>
                      <span className="text-[11px] text-slate-400">•</span>
                      <Badge size="sm" variant="default">
                        {item.activityType}
                      </Badge>
                    </div>
                    <span className="text-[10px] text-slate-400">
                      {formatDate(item.timestamp)}
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 mt-1.5 leading-relaxed">
                    {item.description}
                  </p>

                  {item.relatedName && (
                    <div className="mt-2 text-[10px] font-semibold text-indigo-600 bg-indigo-50/60 px-2 py-0.5 rounded w-fit">
                      Target: {item.relatedName}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};
