import React, { useState, useEffect } from 'react';
import { Modal } from '../../components/common/Modal';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Button } from '../../components/common/Button';
import type { SiteVisit, SiteVisitStatus, Property, Lead } from '../../types';

interface SiteVisitFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<SiteVisit, 'id' | 'createdAt'>) => Promise<void>;
  initialData?: SiteVisit | null;
  agentName: string;
  agentId: string;
  properties: Property[];
  leads: Lead[];
  defaultProperty?: Property | null;
  defaultLead?: Lead | null;
}

export const SiteVisitFormModal: React.FC<SiteVisitFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  agentName,
  agentId,
  properties,
  leads,
  defaultProperty,
  defaultLead,
}) => {
  const [visitorName, setVisitorName] = useState('');
  const [selectedPropId, setSelectedPropId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [time, setTime] = useState('11:00');
  const [location, setLocation] = useState('');
  const [status, setStatus] = useState<SiteVisitStatus>('Scheduled');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setVisitorName(initialData.leadName || initialData.clientName || '');
      setSelectedPropId(initialData.propertyId);
      setDate(initialData.date);
      setTime(initialData.time);
      setLocation(initialData.location);
      setStatus(initialData.status);
      setNotes(initialData.notes || '');
    } else {
      setVisitorName(defaultLead?.name || '');
      const propId = defaultProperty?.id || (properties[0]?.id ?? '');
      setSelectedPropId(propId);
      const chosenProp = properties.find((p) => p.id === propId);
      setLocation(chosenProp ? `${chosenProp.locality}, ${chosenProp.city}` : '');
      setDate(new Date().toISOString().slice(0, 10));
      setTime('11:00');
      setStatus('Scheduled');
      setNotes('');
    }
    setError('');
  }, [initialData, defaultProperty, defaultLead, properties, isOpen]);

  const handlePropChange = (id: string) => {
    setSelectedPropId(id);
    const chosen = properties.find((p) => p.id === id);
    if (chosen) {
      setLocation(`${chosen.address || chosen.locality}, ${chosen.city}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!visitorName.trim()) {
      setError('Client or Lead name is required.');
      return;
    }
    if (!selectedPropId) {
      setError('Please select a target property.');
      return;
    }

    const chosenProp = properties.find((p) => p.id === selectedPropId);
    const propertyTitle = chosenProp?.title || 'Selected Property';

    setError('');
    setLoading(true);
    try {
      await onSubmit({
        leadName: visitorName.trim(),
        propertyId: selectedPropId,
        propertyTitle,
        date,
        time,
        location: location.trim() || chosenProp?.locality || 'On-site',
        assignedAgentId: initialData?.assignedAgentId || agentId,
        assignedAgentName: initialData?.assignedAgentName || agentName,
        status,
        notes: notes.trim(),
        isDemo: initialData?.isDemo || false,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save site visit.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Site Visit' : 'Schedule Site Visit'}
      subtitle="Arrange physical viewing with buyer and property representative"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs">
            {error}
          </div>
        )}

        <Input
          label="Visitor / Lead Name"
          required
          placeholder="e.g. Vikramaditya Singhania"
          value={visitorName}
          onChange={(e) => setVisitorName(e.target.value)}
        />

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-700">Target Property Listing *</label>
          <select
            value={selectedPropId}
            onChange={(e) => handlePropChange(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-100"
          >
            {properties.map((p) => (
              <option key={p.id} value={p.id}>
                [{p.propertyCode}] {p.title} ({p.locality})
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3.5">
          <Input
            label="Visit Date"
            type="date"
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
          <Input
            label="Time (24h)"
            type="time"
            required
            value={time}
            onChange={(e) => setTime(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-3.5">
          <Input
            label="Meeting Location / Gate"
            placeholder="e.g. Main Gate, Tower B"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
          <Select
            label="Status"
            value={status}
            onChange={(e) => setStatus(e.target.value as SiteVisitStatus)}
            options={[
              { value: 'Scheduled', label: 'Scheduled' },
              { value: 'Completed', label: 'Completed' },
              { value: 'Cancelled', label: 'Cancelled' },
              { value: 'No Show', label: 'No Show' },
            ]}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-700">Visit Notes / Client Focus</label>
          <textarea
            rows={2}
            placeholder="Key preferences to highlight: Vaastu, balcony view, parking..."
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
            {initialData ? 'Update Schedule' : 'Schedule Visit'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
