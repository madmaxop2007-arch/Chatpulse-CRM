import React, { useState, useEffect } from 'react';
import { Modal } from '../../components/common/Modal';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Button } from '../../components/common/Button';
import type { Deal, DealStage, Property, Lead, Client } from '../../types';

interface DealFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Deal, 'id' | 'createdAt'>) => Promise<void>;
  initialData?: Deal | null;
  agentName: string;
  agentId: string;
  properties: Property[];
  leads: Lead[];
  clients: Client[];
  defaultClient?: Client | null;
  defaultLead?: Lead | null;
}

export const DealFormModal: React.FC<DealFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  agentName,
  agentId,
  properties,
  leads,
  clients,
  defaultClient,
  defaultLead,
}) => {
  const [dealName, setDealName] = useState('');
  const [leadName, setLeadName] = useState('');
  const [propertyTitle, setPropertyTitle] = useState('');
  const [dealValue, setDealValue] = useState<number>(35000000);
  const [expectedClosingDate, setExpectedClosingDate] = useState(
    new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10)
  );
  const [stage, setStage] = useState<DealStage>('Negotiation');
  const [probability, setProbability] = useState<number>(75);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setDealName(initialData.dealName);
      setLeadName(initialData.leadName || initialData.clientName || '');
      setPropertyTitle(initialData.propertyTitle || '');
      setDealValue(initialData.dealValue);
      setExpectedClosingDate(initialData.expectedClosingDate);
      setStage(initialData.stage);
      setProbability(initialData.probability);
      setNotes(initialData.notes || '');
    } else {
      const clientOrLead = defaultClient?.name || defaultLead?.name || '';
      setDealName(clientOrLead ? `${clientOrLead} Acquisition Deal` : '');
      setLeadName(clientOrLead);
      setPropertyTitle(properties[0]?.title || '');
      setDealValue(35000000);
      setExpectedClosingDate(new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10));
      setStage('Negotiation');
      setProbability(75);
      setNotes('');
    }
    setError('');
  }, [initialData, defaultClient, defaultLead, properties, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dealName.trim()) {
      setError('Deal name is required.');
      return;
    }
    if (!dealValue || dealValue <= 0) {
      setError('Valid deal value is required.');
      return;
    }

    setError('');
    setLoading(true);
    try {
      await onSubmit({
        dealName: dealName.trim(),
        leadName: leadName.trim() || undefined,
        propertyTitle: propertyTitle.trim() || undefined,
        assignedAgentId: initialData?.assignedAgentId || agentId,
        assignedAgentName: initialData?.assignedAgentName || agentName,
        dealValue: Number(dealValue),
        expectedClosingDate,
        stage,
        probability: Number(probability),
        notes: notes.trim(),
        isDemo: initialData?.isDemo || false,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save deal.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Pipeline Deal' : 'Create Sales Deal'}
      subtitle="Track transactions, commission revenue, and closing milestones"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs">
            {error}
          </div>
        )}

        <Input
          label="Deal Name"
          required
          placeholder="e.g. DLF The Camellias Sky Villa Deal"
          value={dealName}
          onChange={(e) => setDealName(e.target.value)}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <Input
            label="Client or Lead Name"
            placeholder="e.g. Vikramaditya Singhania"
            value={leadName}
            onChange={(e) => setLeadName(e.target.value)}
          />
          <Input
            label="Property Title / Unit"
            placeholder="e.g. 4 BHK Camellias Tower B"
            value={propertyTitle}
            onChange={(e) => setPropertyTitle(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <Input
            label="Deal Value (₹)"
            type="number"
            step="100000"
            required
            value={dealValue}
            onChange={(e) => setDealValue(Number(e.target.value))}
          />
          <Input
            label="Expected Closing Date"
            type="date"
            required
            value={expectedClosingDate}
            onChange={(e) => setExpectedClosingDate(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <Select
            label="Pipeline Stage"
            value={stage}
            onChange={(e) => setStage(e.target.value as DealStage)}
            options={[
              { value: 'New', label: '1. New Inquiry' },
              { value: 'Qualified', label: '2. Qualified' },
              { value: 'Site Visit', label: '3. Site Visit' },
              { value: 'Negotiation', label: '4. Negotiation' },
              { value: 'Documentation', label: '5. Documentation / Bank' },
              { value: 'Closed Won', label: '6. Closed Won (Closed)' },
              { value: 'Closed Lost', label: '7. Closed Lost' },
            ]}
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-700">
              Win Probability: {probability}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={probability}
              onChange={(e) => setProbability(Number(e.target.value))}
              className="mt-2 w-full accent-indigo-600 cursor-pointer"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-700">Deal Notes &amp; Status</label>
          <textarea
            rows={2}
            placeholder="Token advance details, loan sanction status, advocate notes..."
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
            {initialData ? 'Update Deal' : 'Add to Pipeline'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
