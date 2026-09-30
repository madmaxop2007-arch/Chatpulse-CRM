import React, { useState, useEffect } from 'react';
import { Modal } from '../../components/common/Modal';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Button } from '../../components/common/Button';
import { isValidPhone, isValidEmail } from '../../utils/formatters';
import type { Client, ClientType } from '../../types';

interface ClientFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (clientData: Omit<Client, 'id' | 'createdAt'>) => Promise<void>;
  initialData?: Client | null;
  agentName: string;
  agentId: string;
}

export const ClientFormModal: React.FC<ClientFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  agentName,
  agentId,
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [clientType, setClientType] = useState<ClientType>('Buyer');
  const [budget, setBudget] = useState<number>(25000000);
  const [preferredLocation, setPreferredLocation] = useState('Golf Course Road, Gurugram');
  const [propertyType, setPropertyType] = useState('Apartment');
  const [requirements, setRequirements] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setPhone(initialData.phone);
      setEmail(initialData.email || '');
      setWhatsapp(initialData.whatsapp || '');
      setClientType(initialData.clientType);
      setBudget(initialData.budget);
      setPreferredLocation(initialData.preferredLocation);
      setPropertyType(initialData.propertyType);
      setRequirements(initialData.requirements || '');
      setNotes(initialData.notes || '');
    } else {
      setName('');
      setPhone('');
      setEmail('');
      setWhatsapp('');
      setClientType('Buyer');
      setBudget(25000000);
      setPreferredLocation('Golf Course Road, Gurugram');
      setPropertyType('Apartment');
      setRequirements('');
      setNotes('');
    }
    setError('');
  }, [initialData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Client name is required.');
      return;
    }
    if (!isValidPhone(phone)) {
      setError('Please provide a valid 10-digit mobile number.');
      return;
    }
    if (email && !isValidEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    setError('');
    setLoading(true);
    try {
      await onSubmit({
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
        whatsapp: whatsapp.trim() || phone.trim(),
        clientType,
        budget: Number(budget),
        preferredLocation: preferredLocation.trim(),
        propertyType,
        requirements: requirements.trim(),
        assignedAgentId: initialData?.assignedAgentId || agentId,
        assignedAgentName: initialData?.assignedAgentName || agentName,
        notes: notes.trim(),
        isDemo: initialData?.isDemo || false,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save client.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Client Record' : 'Add New Client'}
      subtitle="Track verified buyers, tenants, landlords, and sellers"
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <Input
            label="Client Full Name"
            required
            placeholder="e.g. Vikramaditya Singhania"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Select
            label="Client Classification"
            value={clientType}
            onChange={(e) => setClientType(e.target.value as ClientType)}
            options={[
              { value: 'Buyer', label: 'Buyer (End User)' },
              { value: 'Investor', label: 'Investor (Commercial / High Yield)' },
              { value: 'Tenant', label: 'Tenant' },
              { value: 'Seller', label: 'Seller / Property Owner' },
              { value: 'Landlord', label: 'Landlord / Rental Owner' },
            ]}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <Input
            label="Phone Number"
            type="tel"
            required
            placeholder="+91 98112 34567"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <Input
            label="WhatsApp Number"
            type="tel"
            placeholder="+91 98112 34567"
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
          />
          <Input
            label="Email Address"
            type="email"
            placeholder="client@company.in"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <Input
            label="Approx. Budget (₹)"
            type="number"
            step="50000"
            value={budget}
            onChange={(e) => setBudget(Number(e.target.value))}
          />
          <Select
            label="Target Property Type"
            value={propertyType}
            onChange={(e) => setPropertyType(e.target.value)}
            options={[
              { value: 'Apartment', label: 'Apartment' },
              { value: 'Villa', label: 'Villa' },
              { value: 'Independent House', label: 'Independent House / Kothi' },
              { value: 'Plot', label: 'Plot' },
              { value: 'Commercial', label: 'Commercial' },
              { value: 'Office', label: 'Office' },
            ]}
          />
          <Input
            label="Preferred Location"
            placeholder="e.g. Golf Course Road"
            value={preferredLocation}
            onChange={(e) => setPreferredLocation(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-700">Specific Requirements</label>
            <textarea
              rows={2}
              placeholder="e.g. 4 BHK higher floor, east facing, 2 car parking slots..."
              value={requirements}
              onChange={(e) => setRequirements(e.target.value)}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-700">Internal Relationship Notes</label>
            <textarea
              rows={2}
              placeholder="Client occupation, family details, referral source..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            {initialData ? 'Update Client' : 'Save Client'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
