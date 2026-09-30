import React, { useState, useEffect } from 'react';
import { Modal } from '../../components/common/Modal';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Button } from '../../components/common/Button';
import type { FollowUp, FollowUpType, FollowUpStatus } from '../../types';

interface FollowUpFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<FollowUp, 'id' | 'createdAt'>) => Promise<void>;
  initialData?: FollowUp | null;
  agentName: string;
  agentId: string;
  defaultRelated?: { type: 'lead' | 'client'; id: string; name: string };
}

export const FollowUpFormModal: React.FC<FollowUpFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  agentName,
  agentId,
  defaultRelated,
}) => {
  const [relatedType, setRelatedType] = useState<'lead' | 'client'>('lead');
  const [relatedName, setRelatedName] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [time, setTime] = useState('11:00');
  const [type, setType] = useState<FollowUpType>('Call');
  const [priority, setPriority] = useState<'Low' | 'Medium' | 'High'>('High');
  const [status, setStatus] = useState<FollowUpStatus>('Pending');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setRelatedType(initialData.relatedType);
      setRelatedName(initialData.relatedName);
      setDate(initialData.date);
      setTime(initialData.time);
      setType(initialData.type);
      setPriority(initialData.priority);
      setStatus(initialData.status);
      setNotes(initialData.notes);
    } else if (defaultRelated) {
      setRelatedType(defaultRelated.type);
      setRelatedName(defaultRelated.name);
      setDate(new Date().toISOString().slice(0, 10));
      setTime('11:00');
      setType('Call');
      setPriority('High');
      setStatus('Pending');
      setNotes('');
    } else {
      setRelatedType('lead');
      setRelatedName('');
      setDate(new Date().toISOString().slice(0, 10));
      setTime('11:00');
      setType('Call');
      setPriority('High');
      setStatus('Pending');
      setNotes('');
    }
    setError('');
  }, [initialData, defaultRelated, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!relatedName.trim()) {
      setError('Lead or Client name is required.');
      return;
    }
    if (!date) {
      setError('Date is required.');
      return;
    }

    setError('');
    setLoading(true);
    try {
      await onSubmit({
        relatedType,
        relatedId: defaultRelated?.id || initialData?.relatedId || 'manual',
        relatedName: relatedName.trim(),
        date,
        time,
        type,
        priority,
        assignedAgentId: initialData?.assignedAgentId || agentId,
        assignedAgentName: initialData?.assignedAgentName || agentName,
        notes: notes.trim(),
        status,
        isDemo: initialData?.isDemo || false,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save follow-up.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Follow-up' : 'Schedule Follow-up'}
      subtitle="Plan client interaction, phone call, or meeting"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs">
            {error}
          </div>
        )}

        <div className="grid grid-cols-3 gap-3">
          <Select
            label="Contact Type"
            value={relatedType}
            onChange={(e) => setRelatedType(e.target.value as any)}
            options={[
              { value: 'lead', label: 'Lead' },
              { value: 'client', label: 'Client' },
            ]}
          />
          <div className="col-span-2">
            <Input
              label="Contact / Lead Name"
              required
              placeholder="e.g. Vikramaditya Singhania"
              value={relatedName}
              onChange={(e) => setRelatedName(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3.5">
          <Input
            label="Follow-up Date"
            type="date"
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
          <Input
            label="Time (24h)"
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-3 gap-3.5">
          <Select
            label="Channel"
            value={type}
            onChange={(e) => setType(e.target.value as FollowUpType)}
            options={[
              { value: 'Call', label: 'Phone Call' },
              { value: 'WhatsApp', label: 'WhatsApp' },
              { value: 'Meeting', label: 'In-person Meeting' },
              { value: 'Email', label: 'Email' },
              { value: 'Other', label: 'Other' },
            ]}
          />
          <Select
            label="Priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value as any)}
            options={[
              { value: 'High', label: 'High' },
              { value: 'Medium', label: 'Medium' },
              { value: 'Low', label: 'Low' },
            ]}
          />
          <Select
            label="Status"
            value={status}
            onChange={(e) => setStatus(e.target.value as FollowUpStatus)}
            options={[
              { value: 'Pending', label: 'Pending' },
              { value: 'Completed', label: 'Completed' },
              { value: 'Missed', label: 'Missed' },
              { value: 'Cancelled', label: 'Cancelled' },
            ]}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-700">Agenda / Discussion Notes</label>
          <textarea
            rows={3}
            placeholder="Key discussion topics, questions to ask, documents to request..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            {initialData ? 'Update Schedule' : 'Schedule Follow-up'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
