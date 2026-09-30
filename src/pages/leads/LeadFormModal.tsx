import React, { useState, useEffect } from 'react';
import { Modal } from '../../components/common/Modal';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Button } from '../../components/common/Button';
import { isValidPhone, isValidEmail } from '../../utils/formatters';
import type { Lead, LeadStatus, LeadPriority } from '../../types';

interface LeadFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (leadData: Omit<Lead, 'id' | 'createdAt'>) => Promise<void>;
  initialData?: Lead | null;
  agentName: string;
  agentId: string;
}

export const LeadFormModal: React.FC<LeadFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  agentName,
  agentId,
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [source, setSource] = useState('MagicBricks');
  const [budgetMin, setBudgetMin] = useState<number>(10000000);
  const [budgetMax, setBudgetMax] = useState<number>(20000000);
  const [propertyType, setPropertyType] = useState('Apartment');
  const [preferredLocation, setPreferredLocation] = useState('Gurugram, Golf Course Road');
  const [purpose, setPurpose] = useState<'Buy' | 'Rent' | 'Investment'>('Buy');
  const [bedrooms, setBedrooms] = useState('3 BHK');
  const [status, setStatus] = useState<LeadStatus>('New');
  const [priority, setPriority] = useState<LeadPriority>('Warm');
  const [notes, setNotes] = useState('');
  const [nextFollowUpDate, setNextFollowUpDate] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setPhone(initialData.phone);
      setWhatsapp(initialData.whatsapp || '');
      setEmail(initialData.email || '');
      setSource(initialData.source);
      setBudgetMin(initialData.budgetMin || 0);
      setBudgetMax(initialData.budgetMax || 0);
      setPropertyType(initialData.propertyType);
      setPreferredLocation(initialData.preferredLocation);
      setPurpose(initialData.purpose);
      setBedrooms(initialData.bedrooms || '3 BHK');
      setStatus(initialData.status);
      setPriority(initialData.priority);
      setNotes(initialData.notes || '');
      setNextFollowUpDate(initialData.nextFollowUpDate || '');
    } else {
      setName('');
      setPhone('');
      setWhatsapp('');
      setEmail('');
      setSource('MagicBricks');
      setBudgetMin(10000000);
      setBudgetMax(25000000);
      setPropertyType('Apartment');
      setPreferredLocation('Golf Course Extension Road, Gurugram');
      setPurpose('Buy');
      setBedrooms('3 BHK');
      setStatus('New');
      setPriority('Warm');
      setNotes('');
      setNextFollowUpDate('');
    }
    setError('');
  }, [initialData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Lead name is required.');
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
        whatsapp: whatsapp.trim() || phone.trim(),
        email: email.trim(),
        source,
        budgetMin: Number(budgetMin),
        budgetMax: Number(budgetMax),
        propertyType,
        preferredLocation: preferredLocation.trim(),
        purpose,
        bedrooms,
        status,
        priority,
        assignedAgentId: initialData?.assignedAgentId || agentId,
        assignedAgentName: initialData?.assignedAgentName || agentName,
        notes: notes.trim(),
        nextFollowUpDate,
        isDemo: initialData?.isDemo || false,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save lead.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Lead' : 'Create New Lead'}
      subtitle="Fill in client requirements and property preferences"
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
            label="Client / Lead Name"
            required
            placeholder="e.g. Vikramaditya Singhania"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Input
            label="Phone Number"
            type="tel"
            required
            placeholder="+91 98112 34567"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <Input
            label="WhatsApp Number (Optional)"
            type="tel"
            placeholder="+91 98112 34567"
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
          />
          <Input
            label="Email Address (Optional)"
            type="email"
            placeholder="client@gmail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <Select
            label="Lead Source"
            value={source}
            onChange={(e) => setSource(e.target.value)}
            options={[
              { value: 'MagicBricks', label: 'MagicBricks' },
              { value: '99acres', label: '99acres' },
              { value: 'Housing.com', label: 'Housing.com' },
              { value: 'Website', label: 'Website Inquiry' },
              { value: 'Referral', label: 'Client Referral' },
              { value: 'Walk-in', label: 'Walk-in' },
              { value: 'Meta Ads', label: 'Meta (FB/Insta) Ads' },
              { value: 'Google Ads', label: 'Google Search Ads' },
              { value: 'Other', label: 'Other Source' },
            ]}
          />
          <Select
            label="Purchase Purpose"
            value={purpose}
            onChange={(e) => setPurpose(e.target.value as any)}
            options={[
              { value: 'Buy', label: 'Buy (End Use)' },
              { value: 'Investment', label: 'Investment' },
              { value: 'Rent', label: 'Rental' },
            ]}
          />
          <Select
            label="Property Type"
            value={propertyType}
            onChange={(e) => setPropertyType(e.target.value)}
            options={[
              { value: 'Apartment', label: 'Apartment / Flat' },
              { value: 'Villa', label: 'Luxury Villa' },
              { value: 'Independent House', label: 'Independent House / Kothi' },
              { value: 'Plot', label: 'Residential Plot' },
              { value: 'Commercial', label: 'Commercial Retail' },
              { value: 'Office', label: 'Office Space' },
              { value: 'Warehouse', label: 'Warehouse / Industrial' },
            ]}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <Input
            label="Budget Min (₹)"
            type="number"
            step="50000"
            value={budgetMin}
            onChange={(e) => setBudgetMin(Number(e.target.value))}
          />
          <Input
            label="Budget Max (₹)"
            type="number"
            step="50000"
            value={budgetMax}
            onChange={(e) => setBudgetMax(Number(e.target.value))}
          />
          <Select
            label="Bedrooms / Config"
            value={bedrooms}
            onChange={(e) => setBedrooms(e.target.value)}
            options={[
              { value: '1 BHK', label: '1 BHK' },
              { value: '2 BHK', label: '2 BHK' },
              { value: '3 BHK', label: '3 BHK' },
              { value: '4+ BHK', label: '4+ BHK / Penthouse' },
              { value: 'Plot', label: 'Plot' },
              { value: 'Commercial', label: 'Commercial' },
            ]}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <Input
            label="Preferred Location"
            placeholder="e.g. Golf Course Road, Sector 54"
            className="sm:col-span-1"
            value={preferredLocation}
            onChange={(e) => setPreferredLocation(e.target.value)}
          />
          <Select
            label="Lead Status"
            value={status}
            onChange={(e) => setStatus(e.target.value as LeadStatus)}
            options={[
              { value: 'New', label: 'New' },
              { value: 'Contacted', label: 'Contacted' },
              { value: 'Qualified', label: 'Qualified' },
              { value: 'Site Visit', label: 'Site Visit' },
              { value: 'Negotiation', label: 'Negotiation' },
              { value: 'Won', label: 'Won' },
              { value: 'Lost', label: 'Lost' },
            ]}
          />
          <Select
            label="Priority Level"
            value={priority}
            onChange={(e) => setPriority(e.target.value as LeadPriority)}
            options={[
              { value: 'Hot', label: '🔥 Hot' },
              { value: 'Warm', label: '⚡ Warm' },
              { value: 'Cold', label: '❄️ Cold' },
            ]}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <Input
            label="Next Follow-up Date"
            type="date"
            value={nextFollowUpDate}
            onChange={(e) => setNextFollowUpDate(e.target.value)}
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-700">Internal Agent Notes</label>
            <textarea
              rows={2}
              placeholder="Preferences, family members, token discussion notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-lg border border-slate-300 p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            {initialData ? 'Update Lead' : 'Save Lead'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
