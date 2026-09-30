import React, { useState, useEffect } from 'react';
import { Search, Users, Building2, UserCheck, Briefcase, ArrowRight, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { getLeads, getProperties, getClients, getDeals } from '../../services/crmService';
import type { Lead, Property, Client, Deal } from '../../types';
import { formatINR } from '../../utils/formatters';
import type { PageId } from './Sidebar';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectResult: (page: PageId, id?: string) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectResult,
}) => {
  const { userProfile } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && userProfile?.organizationId) {
      setLoading(true);
      Promise.all([
        getLeads(userProfile.organizationId),
        getProperties(userProfile.organizationId),
        getClients(userProfile.organizationId),
        getDeals(userProfile.organizationId),
      ])
        .then(([l, p, c, d]) => {
          setLeads(l);
          setProperties(p);
          setClients(c);
          setDeals(d);
        })
        .finally(() => setLoading(false));
    }
  }, [isOpen, userProfile]);

  if (!isOpen) return null;

  const term = searchTerm.toLowerCase().trim();

  const filteredLeads = term
    ? leads.filter(
        (l) =>
          l.name.toLowerCase().includes(term) ||
          l.phone.includes(term) ||
          (l.email && l.email.toLowerCase().includes(term)) ||
          l.preferredLocation.toLowerCase().includes(term) ||
          l.propertyType.toLowerCase().includes(term)
      ).slice(0, 4)
    : [];

  const filteredProperties = term
    ? properties.filter(
        (p) =>
          p.title.toLowerCase().includes(term) ||
          p.propertyCode.toLowerCase().includes(term) ||
          p.locality.toLowerCase().includes(term) ||
          p.city.toLowerCase().includes(term) ||
          p.propertyType.toLowerCase().includes(term)
      ).slice(0, 4)
    : [];

  const filteredClients = term
    ? clients.filter(
        (c) =>
          c.name.toLowerCase().includes(term) ||
          c.phone.includes(term) ||
          (c.email && c.email.toLowerCase().includes(term)) ||
          c.clientType.toLowerCase().includes(term)
      ).slice(0, 4)
    : [];

  const filteredDeals = term
    ? deals.filter(
        (d) =>
          d.dealName.toLowerCase().includes(term) ||
          (d.leadName && d.leadName.toLowerCase().includes(term)) ||
          d.stage.toLowerCase().includes(term)
      ).slice(0, 4)
    : [];

  const totalResults =
    filteredLeads.length + filteredProperties.length + filteredClients.length + filteredDeals.length;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-100">
      <div
        className="w-full max-w-2xl bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-100">
          <Search className="w-5 h-5 text-indigo-600 shrink-0" />
          <input
            autoFocus
            type="text"
            placeholder="Search leads, properties, clients, deals..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none bg-transparent"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="text-xs bg-slate-100 text-slate-500 font-semibold px-2 py-1 rounded-md hover:bg-slate-200"
          >
            ESC
          </button>
        </div>

        {/* Results Area */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-4">
          {loading ? (
            <div className="p-8 text-center text-xs text-slate-400">Loading records...</div>
          ) : !term ? (
            <div className="p-8 text-center text-xs text-slate-400">
              Type to search across leads by name/phone/location, properties by code/title/locality, clients, and deals.
            </div>
          ) : totalResults === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              No results found for &ldquo;{searchTerm}&rdquo;.
            </div>
          ) : (
            <>
              {/* Leads */}
              {filteredLeads.length > 0 && (
                <div>
                  <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-blue-600" /> Leads ({filteredLeads.length})
                  </h4>
                  <div className="space-y-1">
                    {filteredLeads.map((l) => (
                      <div
                        key={l.id}
                        onClick={() => {
                          onSelectResult('leads', l.id);
                          onClose();
                        }}
                        className="flex items-center justify-between p-2.5 rounded-xl hover:bg-indigo-50/60 cursor-pointer group transition"
                      >
                        <div>
                          <p className="text-xs font-semibold text-slate-800 group-hover:text-indigo-900">
                            {l.name}
                          </p>
                          <p className="text-[11px] text-slate-500">
                            {l.phone} • {l.propertyType} • {l.preferredLocation}
                          </p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 transition" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Properties */}
              {filteredProperties.length > 0 && (
                <div>
                  <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-indigo-600" /> Properties ({filteredProperties.length})
                  </h4>
                  <div className="space-y-1">
                    {filteredProperties.map((p) => (
                      <div
                        key={p.id}
                        onClick={() => {
                          onSelectResult('properties', p.id);
                          onClose();
                        }}
                        className="flex items-center justify-between p-2.5 rounded-xl hover:bg-indigo-50/60 cursor-pointer group transition"
                      >
                        <div>
                          <p className="text-xs font-semibold text-slate-800 group-hover:text-indigo-900">
                            [{p.propertyCode}] {p.title}
                          </p>
                          <p className="text-[11px] text-slate-500">
                            {p.locality}, {p.city} • {formatINR(p.price)} • {p.status}
                          </p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 transition" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Clients */}
              {filteredClients.length > 0 && (
                <div>
                  <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-emerald-600" /> Clients ({filteredClients.length})
                  </h4>
                  <div className="space-y-1">
                    {filteredClients.map((c) => (
                      <div
                        key={c.id}
                        onClick={() => {
                          onSelectResult('clients', c.id);
                          onClose();
                        }}
                        className="flex items-center justify-between p-2.5 rounded-xl hover:bg-indigo-50/60 cursor-pointer group transition"
                      >
                        <div>
                          <p className="text-xs font-semibold text-slate-800 group-hover:text-indigo-900">
                            {c.name} ({c.clientType})
                          </p>
                          <p className="text-[11px] text-slate-500">
                            {c.phone} • {c.email}
                          </p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 transition" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Deals */}
              {filteredDeals.length > 0 && (
                <div>
                  <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-amber-600" /> Deals ({filteredDeals.length})
                  </h4>
                  <div className="space-y-1">
                    {filteredDeals.map((d) => (
                      <div
                        key={d.id}
                        onClick={() => {
                          onSelectResult('deals', d.id);
                          onClose();
                        }}
                        className="flex items-center justify-between p-2.5 rounded-xl hover:bg-indigo-50/60 cursor-pointer group transition"
                      >
                        <div>
                          <p className="text-xs font-semibold text-slate-800 group-hover:text-indigo-900">
                            {d.dealName}
                          </p>
                          <p className="text-[11px] text-slate-500">
                            {formatINR(d.dealValue)} • Stage: {d.stage} ({d.probability}%)
                          </p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 transition" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
