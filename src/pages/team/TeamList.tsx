import React, { useState } from 'react';
import {
  UserPlus,
  Shield,
  ShieldCheck,
  User,
  Phone,
  Mail,
  MoreVertical,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import type { Member, UserRole } from '../../types';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { formatDate, getInitials } from '../../utils/formatters';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';

interface TeamListProps {
  members: Member[];
  onOpenInvite: () => void;
  onUpdateRole: (userId: string, role: UserRole) => Promise<void>;
  onToggleStatus: (userId: string, currentStatus: string) => Promise<void>;
}

export const TeamList: React.FC<TeamListProps> = ({
  members,
  onOpenInvite,
  onUpdateRole,
  onToggleStatus,
}) => {
  const { role: currentRole, userProfile } = useAuth();
  const { showToast } = useToast();
  const canManage = currentRole === 'owner' || currentRole === 'admin';

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Team &amp; Access Control
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage real estate brokers, administrators, and assigned permissions
          </p>
        </div>

        {canManage && (
          <Button size="sm" onClick={onOpenInvite} icon={<UserPlus className="w-3.5 h-3.5" />}>
            Invite Member
          </Button>
        )}
      </div>

      {/* Role explanation */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs">
        <div className="p-3.5 rounded-xl bg-purple-50/60 border border-purple-200/60">
          <span className="font-bold text-purple-900 block mb-1">Owner</span>
          <p className="text-purple-700 leading-snug">
            Full control over billing, agency configuration, team members, and deletion.
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-indigo-50/60 border border-indigo-200/60">
          <span className="font-bold text-indigo-900 block mb-1">Admin</span>
          <p className="text-indigo-700 leading-snug">
            Can manage all leads, listings, clients, team assignments, and deals pipeline.
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-100/70 border border-slate-200/60">
          <span className="font-bold text-slate-900 block mb-1">Agent</span>
          <p className="text-slate-600 leading-snug">
            Manages personal assigned leads, listings, client follow-ups, and site visits.
          </p>
        </div>
      </div>

      {/* Members Table */}
      <Card bodyClassName="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-200/80 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Member Name</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4">Joined Date</th>
                {canManage && <th className="py-3 px-4 text-right">Manage Role</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {members.map((m) => (
                <tr key={m.userId} className="hover:bg-slate-50/60 transition">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center shrink-0">
                        {getInitials(m.name)}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          {m.name}
                          {m.userId === userProfile?.uid && (
                            <span className="text-[10px] text-slate-400 font-normal">(You)</span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-400">{m.email}</span>
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <Badge
                      size="sm"
                      variant={
                        m.role === 'owner' ? 'purple' : m.role === 'admin' ? 'primary' : 'neutral'
                      }
                    >
                      {m.role.toUpperCase()}
                    </Badge>
                  </td>

                  <td className="py-3 px-4">
                    <Badge
                      size="sm"
                      variant={
                        m.status === 'active'
                          ? 'success'
                          : m.status === 'invited'
                          ? 'warning'
                          : 'danger'
                      }
                    >
                      {m.status}
                    </Badge>
                  </td>

                  <td className="py-3 px-4 text-slate-600">
                    {m.phone ? (
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3 text-slate-400" />
                        {m.phone}
                      </span>
                    ) : (
                      '—'
                    )}
                  </td>

                  <td className="py-3 px-4 text-slate-500">{formatDate(m.joinedAt)}</td>

                  {canManage && (
                    <td className="py-3 px-4 text-right">
                      {m.userId !== userProfile?.uid ? (
                        <div className="flex items-center justify-end gap-2">
                          <select
                            value={m.role}
                            onChange={async (e) => {
                              await onUpdateRole(m.userId, e.target.value as UserRole);
                              showToast(`Updated ${m.name}'s role to ${e.target.value}`);
                            }}
                            className="text-[11px] font-semibold rounded-md border border-slate-200 bg-white px-2 py-1 text-slate-700 cursor-pointer"
                          >
                            <option value="agent">Agent</option>
                            <option value="admin">Admin</option>
                            <option value="owner">Owner</option>
                          </select>

                          <button
                            onClick={async () => {
                              await onToggleStatus(m.userId, m.status);
                              showToast(
                                `${m.name} is now ${m.status === 'active' ? 'inactive' : 'active'}`
                              );
                            }}
                            className={`p-1.5 rounded-lg text-xs font-semibold transition ${
                              m.status === 'active'
                                ? 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                                : 'text-emerald-600 hover:bg-emerald-50'
                            }`}
                            title={m.status === 'active' ? 'Deactivate Member' : 'Activate Member'}
                          >
                            {m.status === 'active' ? (
                              <XCircle className="w-4 h-4" />
                            ) : (
                              <CheckCircle2 className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">Current User</span>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
