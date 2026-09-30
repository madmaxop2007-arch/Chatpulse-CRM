import React, { useState, useMemo } from 'react';
import {
  Plus,
  Search,
  Download,
  Upload,
  LayoutGrid,
  List,
  Building2,
  MapPin,
  Bed,
  Bath,
  Maximize2,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Compass,
} from 'lucide-react';
import type { Property, PropertyStatus, TransactionType } from '../../types';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { PropertyImage } from '../../components/properties/PropertyImage';
import { formatINR, formatDate } from '../../utils/formatters';
import { exportToCSV } from '../../utils/csv';
import { useToast } from '../../contexts/ToastContext';

interface PropertiesListProps {
  properties: Property[];
  onOpenCreate: () => void;
  onEditProperty: (prop: Property) => void;
  onDeleteProperty: (propId: string) => Promise<void>;
  onViewProperty: (propId: string) => void;
  onScheduleSiteVisitForProperty: (prop: Property) => void;
}

export const PropertiesList: React.FC<PropertiesListProps> = ({
  properties,
  onOpenCreate,
  onEditProperty,
  onDeleteProperty,
  onViewProperty,
  onScheduleSiteVisitForProperty,
}) => {
  const { showToast } = useToast();

  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [transFilter, setTransFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [cityFilter, setCityFilter] = useState<string>('all');

  const [propToDelete, setPropToDelete] = useState<Property | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = viewMode === 'grid' ? 9 : 10;

  // Filtered Properties
  const filteredProperties = useMemo(() => {
    return properties.filter((p) => {
      const term = search.toLowerCase().trim();
      const matchesSearch =
        !term ||
        p.title.toLowerCase().includes(term) ||
        p.propertyCode.toLowerCase().includes(term) ||
        p.locality.toLowerCase().includes(term) ||
        p.city.toLowerCase().includes(term);

      const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
      const matchesTrans = transFilter === 'all' || p.transactionType === transFilter;
      const matchesType = typeFilter === 'all' || p.propertyType === typeFilter;
      const matchesCity = cityFilter === 'all' || p.city.toLowerCase() === cityFilter.toLowerCase();

      return matchesSearch && matchesStatus && matchesTrans && matchesType && matchesCity;
    });
  }, [properties, search, statusFilter, transFilter, typeFilter, cityFilter]);

  const totalPages = Math.ceil(filteredProperties.length / pageSize) || 1;
  const paginatedProperties = filteredProperties.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleExport = () => {
    exportToCSV(
      filteredProperties,
      [
        { header: 'Property Code', key: 'propertyCode' },
        { header: 'Title', key: 'title' },
        { header: 'Type', key: 'propertyType' },
        { header: 'Transaction', key: 'transactionType' },
        { header: 'Price', key: 'price' },
        { header: 'Locality', key: 'locality' },
        { header: 'City', key: 'city' },
        { header: 'Bedrooms', key: 'bedrooms' },
        { header: 'Area (Sq Ft)', key: 'area' },
        { header: 'Status', key: 'status' },
        { header: 'Owner Name', key: 'ownerName' },
        { header: 'Owner Phone', key: 'ownerPhone' },
      ],
      'ChatPulse_Properties'
    );
  };

  const handleDelete = async () => {
    if (!propToDelete) return;
    setDeleting(true);
    try {
      await onDeleteProperty(propToDelete.id);
      showToast('Property listing deleted successfully.');
      setPropToDelete(null);
    } catch (err: any) {
      showToast('Failed to delete property: ' + err.message, 'error');
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
            Properties Inventory
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Total {filteredProperties.length} active listings
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2.5">
          {/* View toggle */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md transition ${
                viewMode === 'grid'
                  ? 'bg-white shadow-xs text-indigo-600 font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md transition ${
                viewMode === 'table'
                  ? 'bg-white shadow-xs text-indigo-600 font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={handleExport}
            icon={<Download className="w-3.5 h-3.5" />}
          >
            Export
          </Button>

          <Button size="sm" onClick={onOpenCreate} icon={<Plus className="w-3.5 h-3.5" />}>
            Add Property
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card bodyClassName="p-3.5">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
          <div className="relative md:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by title, property code, locality..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="text-xs rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-100"
          >
            <option value="all">All Statuses</option>
            <option value="Available">Available</option>
            <option value="Reserved">Reserved</option>
            <option value="Sold">Sold</option>
            <option value="Rented">Rented</option>
            <option value="Inactive">Inactive</option>
          </select>

          <select
            value={transFilter}
            onChange={(e) => {
              setTransFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="text-xs rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-100"
          >
            <option value="all">Sale &amp; Rent</option>
            <option value="Sale">For Sale</option>
            <option value="Rent">For Rent</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
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
            <option value="Warehouse">Warehouse</option>
          </select>
        </div>
      </Card>

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {paginatedProperties.length === 0 ? (
            <div className="col-span-full p-12 text-center text-slate-400 text-xs bg-white rounded-xl border border-slate-200">
              No properties found matching your criteria.
            </div>
          ) : (
            paginatedProperties.map((prop) => (
              <Card
                key={prop.id}
                className="overflow-hidden group hover:border-indigo-300 transition flex flex-col justify-between"
                bodyClassName="p-0 flex flex-col h-full"
                onClick={() => onViewProperty(prop.id)}
              >
                {/* Image and Badges */}
                <div className="relative aspect-video bg-slate-100 overflow-hidden">
                  <PropertyImage
                    src={prop.images?.[0]}
                    alt={prop.title}
                    propertyType={prop.propertyType}
                    className="group-hover:scale-105 transition duration-300"
                  />
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded-md bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-bold">
                      {prop.propertyCode}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold text-white shadow-xs ${
                        prop.transactionType === 'Sale' ? 'bg-indigo-600' : 'bg-emerald-600'
                      }`}
                    >
                      {prop.transactionType}
                    </span>
                  </div>

                  <div className="absolute top-2.5 right-2.5">
                    <Badge
                      size="sm"
                      variant={
                        prop.status === 'Available'
                          ? 'success'
                          : prop.status === 'Sold'
                          ? 'danger'
                          : 'warning'
                      }
                    >
                      {prop.status}
                    </Badge>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="text-lg font-black text-slate-900 tracking-tight">
                        {formatINR(prop.price)}
                        {prop.transactionType === 'Rent' && (
                          <span className="text-xs font-normal text-slate-500">/mo</span>
                        )}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-500">
                        {prop.propertyType}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-800 line-clamp-1 mt-1 group-hover:text-indigo-600 transition">
                      {prop.title}
                    </h3>

                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-1 line-clamp-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      {prop.locality}, {prop.city}
                    </p>
                  </div>

                  {/* Property features row */}
                  <div className="grid grid-cols-3 gap-2 py-3 my-3 border-y border-slate-100 text-slate-600 text-xs">
                    {prop.bedrooms > 0 ? (
                      <span className="flex items-center gap-1">
                        <Bed className="w-3.5 h-3.5 text-slate-400" /> {prop.bedrooms} BHK
                      </span>
                    ) : (
                      <span className="text-slate-400">Commercial</span>
                    )}
                    {prop.bathrooms > 0 && (
                      <span className="flex items-center gap-1">
                        <Bath className="w-3.5 h-3.5 text-slate-400" /> {prop.bathrooms} Bath
                      </span>
                    )}
                    <span className="flex items-center gap-1 truncate">
                      <Maximize2 className="w-3.5 h-3.5 text-slate-400 shrink-0" /> {prop.area} sqft
                    </span>
                  </div>

                  {/* Actions Row */}
                  <div
                    className="flex items-center justify-between pt-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => onScheduleSiteVisitForProperty(prop)}
                      className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                    >
                      <Compass className="w-3.5 h-3.5" /> Site Visit
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onEditProperty(prop)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
                        title="Edit Property"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setPropToDelete(prop)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                        title="Delete Property"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Table View */}
      {viewMode === 'table' && (
        <Card bodyClassName="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-200/80 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Code</th>
                  <th className="py-3 px-4">Property Title</th>
                  <th className="py-3 px-4">Locality &amp; City</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Config</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedProperties.map((prop) => (
                  <tr
                    key={prop.id}
                    onClick={() => onViewProperty(prop.id)}
                    className="hover:bg-indigo-50/30 transition cursor-pointer"
                  >
                    <td className="py-3 px-4 font-mono font-bold text-slate-700">
                      {prop.propertyCode}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-900 line-clamp-1">{prop.title}</span>
                      <span className="text-[10px] text-slate-400">
                        Listed {formatDate(prop.createdAt)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {prop.locality}, {prop.city}
                    </td>
                    <td className="py-3 px-4 font-black text-slate-900">
                      {formatINR(prop.price)}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-[11px] font-medium">
                        {prop.propertyType}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {prop.bedrooms > 0 ? `${prop.bedrooms} BHK` : '—'} • {prop.area} sqft
                    </td>
                    <td className="py-3 px-4">
                      <Badge
                        size="sm"
                        variant={prop.status === 'Available' ? 'success' : 'neutral'}
                      >
                        {prop.status}
                      </Badge>
                    </td>
                    <td
                      className="py-3 px-4 text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => onViewProperty(prop.id)}
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onEditProperty(prop)}
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setPropToDelete(prop)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
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
        </Card>
      )}

      {/* Pagination */}
      {filteredProperties.length > pageSize && (
        <div className="flex items-center justify-between px-4 py-3 bg-white rounded-xl border border-slate-200 text-xs">
          <span className="text-slate-500">
            Showing {(currentPage - 1) * pageSize + 1} to{' '}
            {Math.min(currentPage * pageSize, filteredProperties.length)} of{' '}
            {filteredProperties.length} properties
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

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(propToDelete)}
        onClose={() => setPropToDelete(null)}
        onConfirm={handleDelete}
        title="Delete Property"
        message={`Are you sure you want to delete listing "${propToDelete?.title}" (${propToDelete?.propertyCode})?`}
        confirmLabel="Delete Listing"
        loading={deleting}
      />
    </div>
  );
};
