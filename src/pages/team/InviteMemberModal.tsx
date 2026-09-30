import React, { useState } from 'react';
import { Modal } from '../../components/common/Modal';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Button } from '../../components/common/Button';
import { Mail, Shield, AlertCircle } from 'lucide-react';
import type { UserRole, Member } from '../../types';
import { isValidEmail } from '../../utils/formatters';

interface InviteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInvite: (member: Omit<Member, 'joinedAt'>) => Promise<void>;
}

export const InviteMemberModal: React.FC<InviteMemberModalProps> = ({
  isOpen,
  onClose,
  onInvite,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<UserRole>('agent');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setError('Agent name and email are required.');
      return;
    }
    if (!isValidEmail(email)) {
      setError('Please provide a valid email address.');
      return;
    }

    setError('');
    setLoading(true);
    try {
      const pseudoUserId = `agent_${Date.now()}`;
      await onInvite({
        userId: pseudoUserId,
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        role,
        status: 'invited',
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to add member.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Invite Team Member"
      subtitle="Provision access to your agency workspace"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs">
            {error}
          </div>
        )}

        <div className="p-3 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-900 text-xs flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-700" />
          <span>
            <strong>Invitation Workflow:</strong> This adds the member record directly to your agency in Firestore with status <em>&ldquo;invited&rdquo;</em>. When the agent signs up using this email, they will be bound to this agency.
          </span>
        </div>

        <Input
          label="Full Name"
          required
          placeholder="e.g. Neha Sharma"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <Input
          label="Work Email"
          type="email"
          required
          placeholder="neha@agency.in"
          icon={<Mail className="w-4 h-4" />}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <Input
          label="Phone Number (Optional)"
          type="tel"
          placeholder="+91 98201 98765"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        <Select
          label="Permission Role"
          value={role}
          onChange={(e) => setRole(e.target.value as UserRole)}
          options={[
            { value: 'agent', label: 'Agent (Manage assigned leads & properties)' },
            { value: 'admin', label: 'Admin (Manage team, all leads, deals, properties)' },
            { value: 'owner', label: 'Owner (Full administrative rights)' },
          ]}
        />

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" loading={loading} icon={<Shield className="w-3.5 h-3.5" />}>
            Create Invitation
          </Button>
        </div>
      </form>
    </Modal>
  );
};
