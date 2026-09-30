import React, { useState } from 'react';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Share2,
  Compass,
  Phone,
  MapPin,
  Bed,
  Bath,
  Maximize2,
  CheckCircle2,
  Calendar,
  Building,
  User,
  Users,
} from 'lucide-react';
import type { Property, Lead, SiteVisit } from '../../types';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { PropertyImage } from '../../components/properties/PropertyImage';
import { formatINR, formatDate } from '../../utils/formatters';
import { useToast } from '../../contexts/ToastContext';

interface PropertyDetailProps {
  property: Property;
  leads: Lead[];
  siteVisits: SiteVisit[];
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onScheduleSiteVisit: () => void;
  onSelectLead?: (leadId: string) => void;
}

export const PropertyDetail: React.FC<PropertyDetailProps> = ({
  property,
  leads,
  siteVisits,
  onBack,
  onEdit,
  onDelete,
  onScheduleSiteVisit,
  onSelectLead,
}) => {
  const { showToast } = useToast();
  const hasImages = Boolean(property.images && property.images.length > 0);
  const fallbackImage = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80';
  const [selectedImage, setSelectedImage] = useState<string>(
    property.images?.[0] || fallbackImage
  );

  React.useEffect(() => {
    if (property.images && property.images.length > 0) {
      setSelectedImage(property.images[0]);
    } else {
      setSelectedImage(fallbackImage);
    }
  }, [property.images]);

  // Match interested leads based on matching budget and property type
  const matchingLeads = leads.filter(
    (l) =>
      l.propertyType.toLowerCase() === property.propertyType.toLowerCase() ||
      (l.budgetMax >= property.price * 0.8 && l.budgetMin <= property.price * 1.2)
  );

  const propertySiteVisits = siteVisits.filter((v) => v.propertyId === property.id);

  const handleShare = () => {
    const text = `Check out this listing on ChatPulse CRM: ${property.title} in ${property.locality}, ${property.city}. Price: ${formatINR(property.price)}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      showToast('Listing details copied to clipboard!');
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition w-fit"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Properties
        </button>

        <div className="flex items-center flex-wrap gap-2.5">
          <Button variant="outline" size="sm" onClick={handleShare} icon={<Share2 className="w-3.5 h-3.5" />}>
            Share
          </Button>
          <Button variant="outline" size="sm" onClick={onEdit} icon={<Edit className="w-3.5 h-3.5" />}>
            Edit
          </Button>
          <Button
            size="sm"
            onClick={onScheduleSiteVisit}
            icon={<Compass className="w-3.5 h-3.5" />}
          >
            Schedule Site Visit
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={onDelete}
            icon={<Trash2 className="w-3.5 h-3.5" />}
          >
            Delete
          </Button>
        </div>
      </div>

      {/* Main Details & Gallery Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Gallery and Specs */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Gallery Card */}
          <Card bodyClassName="p-0 overflow-hidden">
            <div className="aspect-video w-full bg-slate-100 overflow-hidden relative">
              <PropertyImage
                src={selectedImage}
                alt={property.title}
                propertyType={property.propertyType}
              />
              <div className="absolute top-3 left-3 flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-md bg-slate-900/80 backdrop-blur-xs text-white font-mono text-xs font-bold">
                  {property.propertyCode}
                </span>
                <span className="px-2.5 py-1 rounded-md bg-indigo-600 text-white text-xs font-bold">
                  {property.transactionType}
                </span>
              </div>
              {!hasImages && (
                <div className="absolute top-3 right-3">
                  <span className="px-2.5 py-1 rounded-md bg-slate-900/75 backdrop-blur-xs text-slate-200 text-[11px] font-medium">
                    No images attached
                  </span>
                </div>
              )}
            </div>

            {/* Thumbnail row if multiple images */}
            {property.images && property.images.length > 1 && (
              <div className="flex gap-2 p-3 overflow-x-auto bg-slate-50 border-t border-slate-100">
                {property.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(img)}
                    className={`w-20 h-14 rounded-lg overflow-hidden border-2 shrink-0 transition ${
                      selectedImage === img ? 'border-indigo-600 shadow-sm' : 'border-transparent opacity-70'
                    }`}
                  >
                    <img src={img} alt="thumb" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </Card>

          {/* Property Specifications */}
          <Card title="Listing Overview">
            <div className="flex items-baseline justify-between gap-4 mb-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  {property.title}
                </h1>
                <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-1">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                  {property.address || property.locality}, {property.city}
                </p>
              </div>

              <div className="text-right">
                <span className="text-2xl font-black text-indigo-700 tracking-tight block">
                  {formatINR(property.price)}
                </span>
                <span className="text-xs text-slate-400">
                  {property.transactionType === 'Rent' ? 'Monthly Rent' : 'Expected Price'}
                </span>
              </div>
            </div>

            {/* Key feature chips */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-4 my-4 border-y border-slate-100">
              <div className="flex items-center gap-2 text-xs">
                <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                  <Bed className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Bedrooms</span>
                  <span className="font-bold text-slate-800">{property.bedrooms} BHK</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                  <Bath className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Bathrooms</span>
                  <span className="font-bold text-slate-800">{property.bathrooms} Baths</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                  <Maximize2 className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Super Area</span>
                  <span className="font-bold text-slate-800">{property.area} Sq Ft</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                  <Building className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Floor</span>
                  <span className="font-bold text-slate-800">
                    {property.floor} of {property.totalFloors}
                  </span>
                </div>
              </div>
            </div>

            {/* Detailed Parameters */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-3 gap-x-6 text-xs mb-6">
              <div>
                <span className="text-slate-400 block">Property Type</span>
                <span className="font-semibold text-slate-800">{property.propertyType}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Furnishing</span>
                <span className="font-semibold text-slate-800">{property.furnishing}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Parking</span>
                <span className="font-semibold text-slate-800">{property.parking} Covered Slots</span>
              </div>
              <div>
                <span className="text-slate-400 block">Facing</span>
                <span className="font-semibold text-slate-800">{property.facing}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Possession</span>
                <span className="font-semibold text-slate-800">{property.possessionStatus}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Listed Date</span>
                <span className="font-semibold text-slate-800">{formatDate(property.createdAt)}</span>
              </div>
            </div>

            {/* Description */}
            {property.description && (
              <div className="mb-6">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                  Description &amp; Highlights
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                  {property.description}
                </p>
              </div>
            )}

            {/* Amenities Chips */}
            {property.amenities && property.amenities.length > 0 && (
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5">
                  Society &amp; Unit Amenities
                </h3>
                <div className="flex flex-wrap gap-2">
                  {property.amenities.map((item, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Right Col: Owner Info, Site Visits & Interested Leads */}
        <div className="flex flex-col gap-6">
          {/* Owner Info Card */}
          <Card title="Owner / Landlord Details">
            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 block font-medium">Owner Name</span>
                <span className="font-bold text-slate-800 text-sm">
                  {property.ownerName || 'Direct Developer / Not Disclosed'}
                </span>
              </div>

              {property.ownerPhone && (
                <div>
                  <span className="text-slate-400 block font-medium">Contact Number</span>
                  <a
                    href={`tel:${property.ownerPhone}`}
                    className="font-semibold text-indigo-600 hover:text-indigo-700 inline-flex items-center gap-1.5 mt-0.5"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    {property.ownerPhone}
                  </a>
                </div>
              )}

              <div>
                <span className="text-slate-400 block font-medium">Assigned Agent</span>
                <span className="font-semibold text-slate-800">{property.assignedAgentName}</span>
              </div>
            </div>
          </Card>

          {/* Scheduled Site Visits */}
          <Card
            title={`Site Visits (${propertySiteVisits.length})`}
            action={
              <button
                onClick={onScheduleSiteVisit}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
              >
                + Schedule
              </button>
            }
          >
            {propertySiteVisits.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No visits scheduled yet.</p>
            ) : (
              <div className="space-y-2.5">
                {propertySiteVisits.map((v) => (
                  <div
                    key={v.id}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">
                        {v.leadName || v.clientName || 'Visitor'}
                      </span>
                      <Badge size="sm" variant="purple">
                        {v.status}
                      </Badge>
                    </div>
                    <span className="text-[11px] text-slate-500 mt-1 block">
                      {formatDate(v.date)} at {v.time}
                    </span>
                    {v.notes && <p className="text-[11px] text-slate-600 mt-1">{v.notes}</p>}
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Interested / Matching Leads */}
          <Card
            title={`Interested Leads (${matchingLeads.length})`}
            subtitle="Matching budget & property type"
          >
            {matchingLeads.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">
                No matching leads currently in database.
              </p>
            ) : (
              <div className="space-y-2 max-h-72 overflow-y-auto">
                {matchingLeads.slice(0, 6).map((lead) => (
                  <div
                    key={lead.id}
                    onClick={() => onSelectLead && onSelectLead(lead.id)}
                    className="p-2.5 rounded-lg bg-slate-50 hover:bg-indigo-50/60 border border-slate-200/60 cursor-pointer transition flex items-center justify-between"
                  >
                    <div>
                      <p className="text-xs font-bold text-slate-800">{lead.name}</p>
                      <p className="text-[11px] text-slate-500">
                        Budget: {formatINR(lead.budgetMin)} - {formatINR(lead.budgetMax)}
                      </p>
                    </div>
                    <Badge size="sm" variant={lead.status === 'Won' ? 'success' : 'primary'}>
                      {lead.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};
