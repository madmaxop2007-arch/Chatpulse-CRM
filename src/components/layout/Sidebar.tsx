import React from 'react';
import {
  LayoutDashboard,
  Users,
  Building2,
  UserCheck,
  CalendarClock,
  CheckSquare,
  Compass,
  Briefcase,
  History,
  ShieldCheck,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Building,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { getInitials } from '../../utils/formatters';

export type PageId =
  | 'dashboard'
  | 'leads'
  | 'properties'
  | 'clients'
  | 'followups'
  | 'tasks'
  | 'sitevisits'
  | 'deals'
  | 'activities'
  | 'team'
  | 'settings';

interface SidebarProps {
  currentPage: PageId;
  onNavigate: (page: PageId) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

interface NavSection {
  label?: string;
  items: {
    id: PageId;
    label: string;
    icon: React.ReactNode;
    badge?: string;
  }[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onNavigate,
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
}) => {
  const { organization, userProfile, role, logout } = useAuth();

  const navSections: NavSection[] = [
    {
      label: 'Overview',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
      ],
    },
    {
      label: 'Pipeline & Sales',
      items: [
        { id: 'leads', label: 'Leads Pipeline', icon: <Users className="w-4 h-4" /> },
        { id: 'deals', label: 'Deals & Stage', icon: <Briefcase className="w-4 h-4" /> },
        { id: 'clients', label: 'Clients Directory', icon: <UserCheck className="w-4 h-4" /> },
      ],
    },
    {
      label: 'Inventory & Actions',
      items: [
        { id: 'properties', label: 'Property Inventory', icon: <Building2 className="w-4 h-4" /> },
        { id: 'followups', label: 'Follow-ups', icon: <CalendarClock className="w-4 h-4" /> },
        { id: 'tasks', label: 'Action Tasks', icon: <CheckSquare className="w-4 h-4" /> },
        { id: 'sitevisits', label: 'Site Visits', icon: <Compass className="w-4 h-4" /> },
      ],
    },
    {
      label: 'Agency & System',
      items: [
        { id: 'activities', label: 'Audit Trail', icon: <History className="w-4 h-4" /> },
        { id: 'team', label: 'Team & Agents', icon: <ShieldCheck className="w-4 h-4" /> },
        { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
      ],
    },
  ];

  const handleNav = (id: PageId) => {
    onNavigate(id);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-xs lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 bg-[#0B0F19] text-slate-300 border-r border-slate-800/80 flex flex-col transition-all duration-200 ease-in-out ${
          collapsed ? 'w-18' : 'w-64'
        } ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand / Agency Header */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-slate-800/80 bg-slate-950/40">
          <div className="flex items-center gap-3 overflow-hidden">
            {organization?.logoUrl ? (
              <img
                src={organization.logoUrl}
                alt={organization.name}
                className="w-8 h-8 rounded-lg object-contain border border-slate-700 bg-white p-0.5 shrink-0"
              />
            ) : (
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 via-indigo-600 to-indigo-700 text-white flex items-center justify-center font-bold text-xs shadow-md shadow-indigo-600/30 shrink-0 border border-indigo-400/30">
                <Building className="w-4 h-4" />
              </div>
            )}
            {!collapsed && (
              <div className="truncate">
                <span className="text-sm font-bold text-white tracking-tight block truncate font-display">
                  {organization?.name || 'ChatPulse CRM'}
                </span>
                <span className="text-[10px] font-medium text-indigo-400 tracking-wider flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse" />
                  Real Estate Suite
                </span>
              </div>
            )}
          </div>
          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-800/80 transition"
            aria-label="Toggle sidebar"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
          {navSections.map((section, idx) => (
            <div key={idx} className="space-y-1">
              {!collapsed && section.label && (
                <div className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-300">
                  {section.label}
                </div>
              )}
              {section.items.map((item) => {
                const active = currentPage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNav(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all group relative ${
                      active
                        ? 'bg-indigo-600/15 text-white font-semibold shadow-xs'
                        : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                    } ${collapsed ? 'justify-center px-0' : ''}`}
                    title={collapsed ? item.label : undefined}
                  >
                    {active && (
                      <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-indigo-500 rounded-r-full" />
                    )}
                    <div
                      className={`shrink-0 transition-colors ${
                        active ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-300'
                      }`}
                    >
                      {item.icon}
                    </div>
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* User Profile Footer */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/30">
          <div
            className={`flex items-center gap-2.5 p-2 rounded-lg bg-slate-900/60 border border-slate-800 ${
              collapsed ? 'justify-center p-2' : ''
            }`}
          >
            <div className="relative shrink-0">
              <div className="w-8 h-8 rounded-md bg-indigo-900/60 text-indigo-300 border border-indigo-700/50 font-bold text-xs flex items-center justify-center">
                {getInitials(userProfile?.displayName || 'User')}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 border border-slate-900" />
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-white truncate">
                  {userProfile?.displayName || 'Broker'}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-slate-400">
                  <span className="capitalize text-indigo-400 font-medium">{role}</span>
                  <span>·</span>
                  <span className="truncate text-slate-400">{organization?.name || 'Active'}</span>
                </div>
              </div>
            )}
            {!collapsed && (
              <button
                onClick={() => logout()}
                className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 rounded-md transition"
                title="Log out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};
