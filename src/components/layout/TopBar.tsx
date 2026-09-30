import React, { useState, useRef, useEffect } from 'react';
import {
  Menu,
  Search,
  Plus,
  User,
  Settings,
  LogOut,
  ChevronDown,
  Building,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { NotificationsPopover } from './NotificationsPopover';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { getInitials } from '../../utils/formatters';
import type { PageId } from './Sidebar';

interface TopBarProps {
  onOpenMobileMenu: () => void;
  onOpenSearch: () => void;
  onOpenNewLead: () => void;
  onNavigate: (page: PageId) => void;
  currentPageTitle?: string;
}

export const TopBar: React.FC<TopBarProps> = ({
  onOpenMobileMenu,
  onOpenSearch,
  onOpenNewLead,
  onNavigate,
  currentPageTitle,
}) => {
  const { userProfile, organization, role, logout } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    if (profileOpen) {
      document.addEventListener('mousedown', handleOutside);
    }
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [profileOpen]);

  return (
    <header className="h-16 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 transition-all">
      {/* Left section: Mobile menu + breadcrumbs + search */}
      <div className="flex items-center gap-3 sm:gap-4 min-w-0">
        <button
          onClick={onOpenMobileMenu}
          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 lg:hidden transition"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search Bar Button */}
        <button
          onClick={onOpenSearch}
          className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50/70 hover:bg-slate-100 hover:border-slate-300 text-slate-400 hover:text-slate-600 transition w-40 sm:w-64 cursor-pointer text-left"
        >
          <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="text-xs text-slate-400 truncate">Search CRM (Leads, Deals...)...</span>
          <kbd className="hidden sm:inline-block ml-auto text-[10px] font-mono font-medium bg-white border border-slate-200 text-slate-400 px-1.5 py-0.5 rounded shadow-2xs">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right Section: Add Lead, Notifications, Profile */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <Button
          size="sm"
          onClick={onOpenNewLead}
          icon={<Plus className="w-3.5 h-3.5" />}
          className="shadow-xs shadow-indigo-600/15"
        >
          New Lead
        </Button>

        <NotificationsPopover />

        {/* User profile dropdown */}
        <div className="relative" ref={profileMenuRef}>
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2 p-1 rounded-lg hover:bg-slate-100/70 transition cursor-pointer"
          >
            {userProfile?.photoURL ? (
              <img
                src={userProfile.photoURL}
                alt={userProfile.displayName}
                className="w-7 h-7 rounded-md object-cover border border-slate-200"
              />
            ) : (
              <div className="w-7 h-7 rounded-md bg-slate-900 text-white font-bold text-xs flex items-center justify-center shadow-2xs">
                {getInitials(userProfile?.displayName || 'User')}
              </div>
            )}
            <div className="hidden md:flex flex-col items-start text-left">
              <span className="text-xs font-semibold text-slate-800 leading-tight">
                {userProfile?.displayName || 'Broker'}
              </span>
              <span className="text-[10px] text-slate-400 uppercase font-medium">
                {role}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2 w-60 bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden z-50 divide-y divide-slate-100 animate-in fade-in duration-100">
              <div className="p-3.5 bg-slate-50/50">
                <p className="text-xs font-bold text-slate-900 truncate">
                  {userProfile?.displayName}
                </p>
                <p className="text-[11px] text-slate-500 truncate">{userProfile?.email}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge size="sm" variant={role === 'owner' ? 'purple' : 'primary'}>
                    {role.toUpperCase()}
                  </Badge>
                  {organization?.name && (
                    <span className="text-[11px] text-slate-500 truncate flex items-center gap-1 font-medium">
                      <Building className="w-3 h-3 text-slate-400 shrink-0" />
                      {organization.name}
                    </span>
                  )}
                </div>
              </div>

              <div className="p-1.5">
                <button
                  onClick={() => {
                    setProfileOpen(false);
                    onNavigate('settings');
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 rounded-md transition"
                >
                  <Settings className="w-3.5 h-3.5 text-slate-400" />
                  Agency Settings &amp; Setup
                </button>
                <button
                  onClick={() => {
                    setProfileOpen(false);
                    onNavigate('team');
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 rounded-md transition"
                >
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  Team Members &amp; Permissions
                </button>
              </div>

              <div className="p-1.5">
                <button
                  onClick={() => {
                    setProfileOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-md transition"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-500" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
