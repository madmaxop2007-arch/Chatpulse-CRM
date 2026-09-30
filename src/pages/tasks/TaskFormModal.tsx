import React, { useState, useEffect } from 'react';
import { Modal } from '../../components/common/Modal';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Button } from '../../components/common/Button';
import type { Task, TaskPriority, TaskStatus } from '../../types';

interface TaskFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Task, 'id' | 'createdAt'>) => Promise<void>;
  initialData?: Task | null;
  agentName: string;
  agentId: string;
  defaultRelated?: { leadId?: string; leadName?: string; clientId?: string; clientName?: string };
}

export const TaskFormModal: React.FC<TaskFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  agentName,
  agentId,
  defaultRelated,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState(new Date().toISOString().slice(0, 10));
  const [priority, setPriority] = useState<TaskPriority>('Medium');
  const [status, setStatus] = useState<TaskStatus>('Todo');
  const [relatedLeadName, setRelatedLeadName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setDescription(initialData.description);
      setDueDate(initialData.dueDate);
      setPriority(initialData.priority);
      setStatus(initialData.status);
      setRelatedLeadName(initialData.relatedLeadName || initialData.relatedClientName || '');
    } else {
      setTitle('');
      setDescription('');
      setDueDate(new Date().toISOString().slice(0, 10));
      setPriority('Medium');
      setStatus('Todo');
      setRelatedLeadName(defaultRelated?.leadName || defaultRelated?.clientName || '');
    }
    setError('');
  }, [initialData, defaultRelated, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Task title is required.');
      return;
    }
    if (!dueDate) {
      setError('Due date is required.');
      return;
    }

    setError('');
    setLoading(true);
    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim(),
        dueDate,
        priority,
        status,
        assignedAgentId: initialData?.assignedAgentId || agentId,
        assignedAgentName: initialData?.assignedAgentName || agentName,
        relatedLeadId: defaultRelated?.leadId || initialData?.relatedLeadId,
        relatedLeadName: relatedLeadName.trim() || undefined,
        relatedClientId: defaultRelated?.clientId || initialData?.relatedClientId,
        relatedClientName: defaultRelated?.clientName || undefined,
        isDemo: initialData?.isDemo || false,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save task.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Task' : 'Create Task'}
      subtitle="Track action items, documentation, and client errands"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs">
            {error}
          </div>
        )}

        <Input
          label="Task Title"
          required
          placeholder="e.g. Verify Title Deed at Registrar Office"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <Input
            label="Due Date"
            type="date"
            required
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
          <Select
            label="Priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value as TaskPriority)}
            options={[
              { value: 'High', label: 'High' },
              { value: 'Medium', label: 'Medium' },
              { value: 'Low', label: 'Low' },
            ]}
          />
          <Select
            label="Status"
            value={status}
            onChange={(e) => setStatus(e.target.value as TaskStatus)}
            options={[
              { value: 'Todo', label: 'Todo' },
              { value: 'In Progress', label: 'In Progress' },
              { value: 'Completed', label: 'Completed' },
            ]}
          />
        </div>

        <Input
          label="Related Lead or Client (Optional)"
          placeholder="e.g. Col. R.K. Bhalla"
          value={relatedLeadName}
          onChange={(e) => setRelatedLeadName(e.target.value)}
        />

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-700">Detailed Description</label>
          <textarea
            rows={3}
            placeholder="Action checklist, required documents, notes..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            {initialData ? 'Update Task' : 'Create Task'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
