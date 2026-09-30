import React, { useState, useMemo } from 'react';
import {
  Plus,
  Search,
  Download,
  Phone,
  MessageCircle,
  Mail,
  Edit,
  Trash2,
  Calendar,
  Briefcase,
  MapPin,
  MoreVertical,
} from 'lucide-react';
import type { Client, ClientType } from '../../types';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { formatINR, formatDate } from '../../utils/formatters';
import { exportToCSV } from '../../utils/csv';
import { useToast } from '../../contexts/ToastContext';

interface ClientsListProps {
  clients: Client[];
  onOpenCreate: () => void;
  onEditClient: (client: Client) => void;
  onDeleteClient: (clientId: string) => Promise<void>;
  onCreateDealForClient: (client: Client) => void;
  onAddFollowUpForClient: (client: Client) => void;
}

export const ClientsList: React.FC<ClientsListProps> = ({
  clients,
  onOpenCreate,
  onEditClient,
  onDeleteClient,
  onCreateDealForClient,
  onAddFollowUpForClient,
}) => {
  const { showToast } = useToast();

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [propTypeFilter, setPropTypeFilter] = useState<string>('all');

  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const filteredClients = useMemo(() => {
    return clients.filter((c) => {
      const term = search.toLowerCase().trim();
      const matchesSearch =
        !term ||
        c.name.toLowerCase().includes(term) ||
        c.phone.includes(term) ||
        (c.email && c.email.toLowerCase().includes(term)) ||
        c.preferredLocation.toLowerCase().includes(term);

      const matchesType = typeFilter === 'all' || c.clientType === typeFilter;
      const matchesProp = propTypeFilter === 'all' || c.propertyType === propTypeFilter;

      return matchesSearch && matchesType && matchesProp;
    });
  }, [clients, search, typeFilter, propTypeFilter]);

  const totalPages = Math.ceil(filteredClients.length / pageSize) || 1;
  const paginatedClients = filteredClients.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleExport = () => {
    exportToCSV(
      filteredClients,
      [
        { header: 'Client Name', key: 'name' },
        { header: 'Type', key: 'clientType' },
        { header: 'Phone', key: 'phone' },
        { header: 'Email', key: 'email' },
        { header: 'Budget', key: 'budget' },
        { header: 'Property Type', key: 'propertyType' },
        { header: 'Location', key: 'preferredLocation' },
        { header: 'Requirements', key: 'requirements' },
        { header: 'Created Date', key: (r) => formatDate(r.createdAt) },
      ],
      'ChatPulse_Clients'
    );
  };

  const handleDelete = async () => {
    if (!clientToDelete) return;
    setDeleting(true);
    try {
      await onDeleteClient(clientToDelete.id);
      showToast('Client record deleted.');
      setClientToDelete(null);
    } catch (err: any) {
      showToast('Failed to delete client: ' + err.message, 'error');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Clients Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Total {filteredClients.length} verified buyers, tenants, and property owners
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2.5">
          <Button
            size="sm"
            variant="outline"
            onClick={handleExport}
            icon={<Download className="w-3.5 h-3.5" />}
          >
            Export
          </Button>

          <Button size="sm" onClick={onOpenCreate} icon={<Plus className="w-3.5 h-3.5" />}>
            Add Client
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card bodyClassName="p-3.5">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <div className="relative md:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by client name, phone, email, location..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition"
            />
          </div>

          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="text-xs rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-100"
          >
            <option value="all">All Client Types</option>
            <option value="Buyer">Buyer</option>
            <option value="Investor">Investor</option>
            <option value="Tenant">Tenant</option>
            <option value="Seller">Seller</option>
            <option value="Landlord">Landlord</option>
          </select>

          <select
            value={propTypeFilter}
            onChange={(e) => {
              setPropTypeFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="text-xs rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-100"
          >
            <option value="all">All Property Types</option>
            <option value="Apartment">Apartment</option>
            <option value="Villa">Villa</option>
            <option value="Independent House">Independent House</option>
            <option value="Plot">Plot</option>
            <option value="Commercial">Commercial</option>
            <option value="Office">Office</option>
          </select>
        </div>
      </Card>

      {/* Clients Table */}
      <Card bodyClassName="p-0 overflow-hidden">
        {filteredClients.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            No clients match your search criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-200/80 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Client Name</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Budget</th>
                  <th className="py-3 px-4">Preference &amp; Location</th>
                  <th className="py-3 px-4">Requirements</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedClients.map((client) => (
                  <tr key={client.id} className="hover:bg-indigo-50/30 transition">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{client.name}</div>
                      <span className="text-[10px] text-slate-400">
                        Added {formatDate(client.createdAt)}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <Badge
                        size="sm"
                        variant={
                          client.clientType === 'Buyer'
                            ? 'primary'
                            : client.clientType === 'Investor'
                            ? 'purple'
                            : client.clientType === 'Seller'
                            ? 'warning'
                            : 'neutral'
                        }
                      >
                        {client.clientType}
                      </Badge>
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <a
                          href={`tel:${client.phone}`}
                          className="font-medium text-slate-700 hover:text-indigo-600 flex items-center gap-1"
                        >
                          <Phone className="w-3 h-3 text-slate-400" />
                          {client.phone}
                        </a>
                        {client.whatsapp && (
                          <a
                            href={`https://wa.me/${client.whatsapp.replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-emerald-600 hover:text-emerald-700"
                            title="Chat on WhatsApp"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                      {client.email && (
                        <div className="text-[11px] text-slate-400 truncate max-w-[140px]">
                          {client.email}
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-4 font-bold text-slate-800">
                      {formatINR(client.budget)}
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-800">{client.propertyType}</div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5 truncate max-w-[140px]">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        {client.preferredLocation}
                      </div>
                    </td>

                    <td className="py-3 px-4 text-slate-600 max-w-xs truncate">
                      {client.requirements || client.notes || '—'}
                    </td>

                    <td className="py-3 px-4 text-right relative">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => onCreateDealForClient(client)}
                          className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                          title="Create Deal"
                        >
                          <Briefcase className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onAddFollowUpForClient(client)}
                          className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition"
                          title="Schedule Follow-up"
                        >
                          <Calendar className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onEditClient(client)}
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
                          title="Edit Client"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setClientToDelete(client)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          title="Delete Client"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {filteredClients.length > pageSize && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 bg-slate-50/50 text-xs">
            <span className="text-slate-500">
              Showing {(currentPage - 1) * pageSize + 1} to{' '}
              {Math.min(currentPage * pageSize, filteredClients.length)} of {filteredClients.length}{' '}
              clients
            </span>
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                Previous
              </Button>
              <span className="px-2 font-semibold text-slate-700">
                {currentPage} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>

      <ConfirmDialog
        isOpen={Boolean(clientToDelete)}
        onClose={() => setClientToDelete(null)}
        onConfirm={handleDelete}
        title="Delete Client"
        message={`Are you sure you want to delete client record "${clientToDelete?.name}"?`}
        confirmLabel="Delete"
        loading={deleting}
      />
    </div>
  );
};
