import React, { useState, useMemo } from 'react';
import {
  Plus,
  Search,
  Download,
  Upload,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Calendar,
  CheckSquare,
  Compass,
  UserCheck,
  Phone,
  MessageCircle,
  FileSpreadsheet,
} from 'lucide-react';
import type { Lead, LeadStatus, LeadPriority } from '../../types';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { Modal } from '../../components/common/Modal';
import { formatINR, formatDate } from '../../utils/formatters';
import { exportToCSV, parseCSVText } from '../../utils/csv';
import { useToast } from '../../contexts/ToastContext';

interface LeadsListProps {
  leads: Lead[];
  onOpenCreate: () => void;
  onEditLead: (lead: Lead) => void;
  onDeleteLead: (leadId: string) => Promise<void>;
  onViewLead: (leadId: string) => void;
  onAddFollowUpForLead: (lead: Lead) => void;
  onScheduleSiteVisitForLead: (lead: Lead) => void;
  onConvertToClient: (lead: Lead) => Promise<void>;
  onImportLeads: (leads: Omit<Lead, 'id' | 'createdAt'>[]) => Promise<void>;
}

export const LeadsList: React.FC<LeadsListProps> = ({
  leads,
  onOpenCreate,
  onEditLead,
  onDeleteLead,
  onViewLead,
  onAddFollowUpForLead,
  onScheduleSiteVisitForLead,
  onConvertToClient,
  onImportLeads,
}) => {
  const { showToast } = useToast();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [propertyTypeFilter, setPropertyTypeFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  // Active action menu
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Delete confirm dialog
  const [leadToDelete, setLeadToDelete] = useState<Lead | null>(null);
  const [deleting, setDeleting] = useState(false);

  // CSV Import Modal
  const [csvModalOpen, setCsvModalOpen] = useState(false);
  const [csvPreviewRows, setCsvPreviewRows] = useState<Omit<Lead, 'id' | 'createdAt'>[]>([]);
  const [csvErrors, setCsvErrors] = useState<string[]>([]);
  const [importing, setImporting] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Filtered Leads
  const filteredLeads = useMemo(() => {
    return leads.filter((l) => {
      const term = search.toLowerCase().trim();
      const matchesSearch =
        !term ||
        l.name.toLowerCase().includes(term) ||
        l.phone.includes(term) ||
        (l.email && l.email.toLowerCase().includes(term)) ||
        l.preferredLocation.toLowerCase().includes(term);

      const matchesStatus = statusFilter === 'all' || l.status === statusFilter;
      const matchesSource = sourceFilter === 'all' || l.source === sourceFilter;
      const matchesType = propertyTypeFilter === 'all' || l.propertyType === propertyTypeFilter;
      const matchesPriority = priorityFilter === 'all' || l.priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesSource && matchesType && matchesPriority;
    });
  }, [leads, search, statusFilter, sourceFilter, propertyTypeFilter, priorityFilter]);

  const totalPages = Math.ceil(filteredLeads.length / pageSize) || 1;
  const paginatedLeads = filteredLeads.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleExport = () => {
    exportToCSV(
      filteredLeads,
      [
        { header: 'Lead Name', key: 'name' },
        { header: 'Phone', key: 'phone' },
        { header: 'Email', key: 'email' },
        { header: 'Source', key: 'source' },
        { header: 'Budget Min', key: 'budgetMin' },
        { header: 'Budget Max', key: 'budgetMax' },
        { header: 'Property Type', key: 'propertyType' },
        { header: 'Location', key: 'preferredLocation' },
        { header: 'Status', key: 'status' },
        { header: 'Priority', key: 'priority' },
        { header: 'Assigned Agent', key: 'assignedAgentName' },
        { header: 'Created Date', key: (r) => formatDate(r.createdAt) },
      ],
      'ChatPulse_Leads'
    );
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const matrix = parseCSVText(content);
      if (matrix.length < 2) {
        setCsvErrors(['CSV file is empty or does not contain a header row.']);
        return;
      }

      const headers = matrix[0].map((h) => h.toLowerCase().trim());
      const nameIdx = headers.findIndex((h) => h.includes('name'));
      const phoneIdx = headers.findIndex((h) => h.includes('phone') || h.includes('mobile'));
      const emailIdx = headers.findIndex((h) => h.includes('email'));
      const sourceIdx = headers.findIndex((h) => h.includes('source'));
      const budgetMinIdx = headers.findIndex((h) => h.includes('min') || h.includes('budget'));
      const typeIdx = headers.findIndex((h) => h.includes('type') || h.includes('property'));
      const locIdx = headers.findIndex((h) => h.includes('loc') || h.includes('location'));

      if (nameIdx === -1 || phoneIdx === -1) {
        setCsvErrors(['CSV must contain at least "Name" and "Phone" columns.']);
        return;
      }

      const parsed: Omit<Lead, 'id' | 'createdAt'>[] = [];
      const errs: string[] = [];

      for (let i = 1; i < matrix.length; i++) {
        const row = matrix[i];
        if (!row[nameIdx] || !row[phoneIdx]) {
          errs.push(`Row ${i + 1}: Missing name or phone number.`);
          continue;
        }

        parsed.push({
          name: row[nameIdx],
          phone: row[phoneIdx],
          whatsapp: row[phoneIdx],
          email: emailIdx !== -1 ? row[emailIdx] : '',
          source: sourceIdx !== -1 && row[sourceIdx] ? row[sourceIdx] : 'CSV Import',
          budgetMin: budgetMinIdx !== -1 ? Number(row[budgetMinIdx]) || 10000000 : 10000000,
          budgetMax: 20000000,
          propertyType: typeIdx !== -1 && row[typeIdx] ? row[typeIdx] : 'Apartment',
          preferredLocation: locIdx !== -1 && row[locIdx] ? row[locIdx] : 'Gurugram',
          purpose: 'Buy',
          status: 'New',
          priority: 'Warm',
          assignedAgentId: 'agent',
          assignedAgentName: 'Agent',
        });
      }

      setCsvPreviewRows(parsed);
      setCsvErrors(errs);
      setCsvModalOpen(true);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleConfirmImport = async () => {
    if (csvPreviewRows.length === 0) return;
    setImporting(true);
    try {
      await onImportLeads(csvPreviewRows);
      showToast(`Successfully imported ${csvPreviewRows.length} leads!`, 'success');
      setCsvModalOpen(false);
      setCsvPreviewRows([]);
    } catch (err: any) {
      showToast('Failed to import leads: ' + err.message, 'error');
    } finally {
      setImporting(false);
    }
  };

  const handleDelete = async () => {
    if (!leadToDelete) return;
    setDeleting(true);
    try {
      await onDeleteLead(leadToDelete.id);
      showToast('Lead deleted successfully.');
      setLeadToDelete(null);
    } catch (err: any) {
      showToast('Failed to delete lead: ' + err.message, 'error');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Leads Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Total {filteredLeads.length} leads in pipeline
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2.5">
          {/* CSV Import */}
          <label className="inline-flex items-center justify-center font-medium rounded-lg text-xs px-3 py-2 gap-1.5 border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 cursor-pointer shadow-xs transition">
            <Upload className="w-3.5 h-3.5" />
            <span>Import CSV</span>
            <input
              type="file"
              accept=".csv"
              className="hidden"
              onChange={handleFileUpload}
            />
          </label>

          {/* CSV Export */}
          <Button
            size="sm"
            variant="outline"
            onClick={handleExport}
            icon={<Download className="w-3.5 h-3.5" />}
          >
            Export
          </Button>

          {/* New Lead */}
          <Button size="sm" onClick={onOpenCreate} icon={<Plus className="w-3.5 h-3.5" />}>
            Create Lead
          </Button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <Card bodyClassName="p-3.5">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
          {/* Search */}
          <div className="relative md:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by name, phone, email, locality..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="text-xs rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-100"
          >
            <option value="all">All Statuses</option>
            <option value="New">New</option>
            <option value="Contacted">Contacted</option>
            <option value="Qualified">Qualified</option>
            <option value="Site Visit">Site Visit</option>
            <option value="Negotiation">Negotiation</option>
            <option value="Won">Won</option>
            <option value="Lost">Lost</option>
          </select>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => {
              setPriorityFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="text-xs rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-100"
          >
            <option value="all">All Priorities</option>
            <option value="Hot">🔥 Hot</option>
            <option value="Warm">⚡ Warm</option>
            <option value="Cold">❄️ Cold</option>
          </select>

          {/* Property Type Filter */}
          <select
            value={propertyTypeFilter}
            onChange={(e) => {
              setPropertyTypeFilter(e.target.value);
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

      {/* Leads Table */}
      <Card bodyClassName="p-0 overflow-hidden">
        {filteredLeads.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            No leads match your search criteria. Try modifying your filters or create a new lead.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-200/80 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Lead Name</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Source</th>
                  <th className="py-3 px-4">Budget Range</th>
                  <th className="py-3 px-4">Type &amp; Locality</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Next Follow-up</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedLeads.map((lead) => (
                  <tr
                    key={lead.id}
                    className="hover:bg-indigo-50/30 transition group cursor-pointer"
                    onClick={() => onViewLead(lead.id)}
                  >
                    {/* Name */}
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 group-hover:text-indigo-600 transition flex items-center gap-1.5">
                        {lead.name}
                        {lead.isDemo && (
                          <span className="px-1 py-0.2 rounded bg-slate-100 text-slate-400 text-[9px] font-mono">
                            DEMO
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400">
                        Added {formatDate(lead.createdAt)}
                      </span>
                    </td>

                    {/* Contact */}
                    <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-2">
                        <a
                          href={`tel:${lead.phone}`}
                          className="font-medium text-slate-700 hover:text-indigo-600 flex items-center gap-1"
                        >
                          <Phone className="w-3 h-3 text-slate-400" />
                          {lead.phone}
                        </a>
                        {lead.whatsapp && (
                          <a
                            href={`https://wa.me/${lead.whatsapp.replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-emerald-600 hover:text-emerald-700 p-0.5"
                            title="Chat on WhatsApp"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                      {lead.email && <div className="text-[11px] text-slate-400">{lead.email}</div>}
                    </td>

                    {/* Source */}
                    <td className="py-3 px-4 text-slate-600 font-medium">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200/60 text-[11px]">
                        {lead.source}
                      </span>
                    </td>

                    {/* Budget */}
                    <td className="py-3 px-4 font-semibold text-slate-800">
                      {formatINR(lead.budgetMin)} - {formatINR(lead.budgetMax)}
                    </td>

                    {/* Property Type & Locality */}
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-800">
                        {lead.bedrooms ? `${lead.bedrooms} ` : ''}{lead.propertyType}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate max-w-[150px]">
                        {lead.preferredLocation}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4">
                      <Badge
                        size="sm"
                        variant={
                          lead.status === 'Won'
                            ? 'success'
                            : lead.status === 'Lost'
                            ? 'danger'
                            : lead.status === 'Negotiation'
                            ? 'warning'
                            : 'primary'
                        }
                      >
                        {lead.status}
                      </Badge>
                    </td>

                    {/* Priority */}
                    <td className="py-3 px-4">
                      <Badge
                        size="sm"
                        variant={
                          lead.priority === 'Hot'
                            ? 'hot'
                            : lead.priority === 'Warm'
                            ? 'warm'
                            : 'cold'
                        }
                      >
                        {lead.priority}
                      </Badge>
                    </td>

                    {/* Next Follow-up */}
                    <td className="py-3 px-4 text-slate-500">
                      {lead.nextFollowUpDate ? formatDate(lead.nextFollowUpDate) : '—'}
                    </td>

                    {/* Actions Menu */}
                    <td
                      className="py-3 px-4 text-right relative"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() =>
                          setActiveMenuId(activeMenuId === lead.id ? null : lead.id)
                        }
                        className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {activeMenuId === lead.id && (
                        <div className="absolute right-4 mt-1 w-48 bg-white rounded-xl border border-slate-200 shadow-xl z-20 divide-y divide-slate-100 text-left animate-in fade-in duration-75">
                          <div className="p-1">
                            <button
                              onClick={() => {
                                setActiveMenuId(null);
                                onViewLead(lead.id);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 rounded-lg transition"
                            >
                              <Eye className="w-3.5 h-3.5 text-slate-400" /> View Profile
                            </button>
                            <button
                              onClick={() => {
                                setActiveMenuId(null);
                                onEditLead(lead);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 rounded-lg transition"
                            >
                              <Edit className="w-3.5 h-3.5 text-slate-400" /> Edit Lead
                            </button>
                            <button
                              onClick={() => {
                                setActiveMenuId(null);
                                onAddFollowUpForLead(lead);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 rounded-lg transition"
                            >
                              <Calendar className="w-3.5 h-3.5 text-amber-500" /> Schedule Follow-up
                            </button>
                            <button
                              onClick={() => {
                                setActiveMenuId(null);
                                onScheduleSiteVisitForLead(lead);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 rounded-lg transition"
                            >
                              <Compass className="w-3.5 h-3.5 text-indigo-500" /> Schedule Site Visit
                            </button>
                            <button
                              onClick={async () => {
                                setActiveMenuId(null);
                                await onConvertToClient(lead);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-emerald-700 hover:bg-emerald-50 rounded-lg transition font-semibold"
                            >
                              <UserCheck className="w-3.5 h-3.5 text-emerald-600" /> Convert to Client
                            </button>
                          </div>
                          <div className="p-1">
                            <button
                              onClick={() => {
                                setActiveMenuId(null);
                                setLeadToDelete(lead);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 rounded-lg transition font-semibold"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-rose-500" /> Delete Lead
                            </button>
                          </div>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination bar */}
        {filteredLeads.length > pageSize && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 bg-slate-50/50 text-xs">
            <span className="text-slate-500">
              Showing {(currentPage - 1) * pageSize + 1} to{' '}
              {Math.min(currentPage * pageSize, filteredLeads.length)} of {filteredLeads.length}{' '}
              leads
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

      {/* Delete Lead Dialog */}
      <ConfirmDialog
        isOpen={Boolean(leadToDelete)}
        onClose={() => setLeadToDelete(null)}
        onConfirm={handleDelete}
        title="Delete Lead"
        message={`Are you sure you want to delete lead "${leadToDelete?.name}"? All associated notes and follow-ups will remain intact.`}
        confirmLabel="Delete"
        loading={deleting}
      />

      {/* CSV Import Preview Modal */}
      <Modal
        isOpen={csvModalOpen}
        onClose={() => setCsvModalOpen(false)}
        title="Import Leads from CSV"
        subtitle={`Parsed ${csvPreviewRows.length} valid rows from file`}
        maxWidth="2xl"
      >
        <div className="flex flex-col gap-4">
          {csvErrors.length > 0 && (
            <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1">
              <p className="font-bold">Notice during parsing:</p>
              {csvErrors.slice(0, 3).map((e, idx) => (
                <p key={idx}>{e}</p>
              ))}
            </div>
          )}

          <div className="max-h-60 overflow-y-auto border border-slate-200 rounded-lg">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 sticky top-0">
                <tr>
                  <th className="p-2">Name</th>
                  <th className="p-2">Phone</th>
                  <th className="p-2">Source</th>
                  <th className="p-2">Property Type</th>
                  <th className="p-2">Location</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {csvPreviewRows.map((r, i) => (
                  <tr key={i}>
                    <td className="p-2 font-medium">{r.name}</td>
                    <td className="p-2 text-slate-500">{r.phone}</td>
                    <td className="p-2">{r.source}</td>
                    <td className="p-2">{r.propertyType}</td>
                    <td className="p-2">{r.preferredLocation}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <Button variant="ghost" size="sm" onClick={() => setCsvModalOpen(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              loading={importing}
              onClick={handleConfirmImport}
              icon={<FileSpreadsheet className="w-3.5 h-3.5" />}
            >
              Confirm Import ({csvPreviewRows.length} Leads)
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
