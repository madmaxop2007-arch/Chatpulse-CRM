import React, { useState, useEffect } from 'react';
import { Modal } from '../../components/common/Modal';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Button } from '../../components/common/Button';
import { Upload, X, Image as ImageIcon, Plus, Link as LinkIcon } from 'lucide-react';
import type { Property, PropertyStatus, TransactionType } from '../../types';
import { uploadPropertyImage } from '../../services/crmService';
import { isStorageAvailable } from '../../firebase/config';

interface PropertyFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (propData: Omit<Property, 'id' | 'createdAt'>) => Promise<void>;
  initialData?: Property | null;
  agentName: string;
  agentId: string;
  orgId: string;
}

const COMMON_AMENITIES = [
  'Swimming Pool',
  'Gymnasium',
  'Clubhouse',
  'Power Backup',
  '24x7 Security',
  'Lift / Elevator',
  'Reserved Parking',
  'Park / Garden',
  'Children Play Area',
  'Golf Course View',
  'Intercom',
  'Vastu Compliant',
  'Gas Pipeline',
];

export const PropertyFormModal: React.FC<PropertyFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  agentName,
  agentId,
  orgId,
}) => {
  const [propertyCode, setPropertyCode] = useState('');
  const [title, setTitle] = useState('');
  const [propertyType, setPropertyType] = useState('Apartment');
  const [transactionType, setTransactionType] = useState<TransactionType>('Sale');
  const [price, setPrice] = useState<number>(15000000);
  const [location, setLocation] = useState('Golf Course Road');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Gurugram');
  const [locality, setLocality] = useState('DLF Phase 5');
  const [bedrooms, setBedrooms] = useState<number>(3);
  const [bathrooms, setBathrooms] = useState<number>(3);
  const [area, setArea] = useState<number>(2200);
  const [furnishing, setFurnishing] = useState<'Furnished' | 'Semi-Furnished' | 'Unfurnished'>('Semi-Furnished');
  const [floor, setFloor] = useState<number>(7);
  const [totalFloors, setTotalFloors] = useState<number>(20);
  const [parking, setParking] = useState<number>(2);
  const [facing, setFacing] = useState('North-East');
  const [possessionStatus, setPossessionStatus] = useState('Ready to Move');
  const [description, setDescription] = useState('');
  const [amenities, setAmenities] = useState<string[]>(['Power Backup', '24x7 Security', 'Lift / Elevator']);
  const [ownerName, setOwnerName] = useState('');
  const [ownerPhone, setOwnerPhone] = useState('');
  const [status, setStatus] = useState<PropertyStatus>('Available');
  const [images, setImages] = useState<string[]>([]);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setPropertyCode(initialData.propertyCode);
      setTitle(initialData.title);
      setPropertyType(initialData.propertyType);
      setTransactionType(initialData.transactionType);
      setPrice(initialData.price);
      setLocation(initialData.location);
      setAddress(initialData.address);
      setCity(initialData.city);
      setLocality(initialData.locality);
      setBedrooms(initialData.bedrooms);
      setBathrooms(initialData.bathrooms);
      setArea(initialData.area);
      setFurnishing(initialData.furnishing);
      setFloor(initialData.floor);
      setTotalFloors(initialData.totalFloors);
      setParking(initialData.parking);
      setFacing(initialData.facing);
      setPossessionStatus(initialData.possessionStatus);
      setDescription(initialData.description);
      setAmenities(initialData.amenities || []);
      setOwnerName(initialData.ownerName);
      setOwnerPhone(initialData.ownerPhone);
      setStatus(initialData.status);
      setImages(initialData.images || []);
    } else {
      const code = `PROP-${Math.floor(1000 + Math.random() * 9000)}`;
      setPropertyCode(code);
      setTitle('');
      setPropertyType('Apartment');
      setTransactionType('Sale');
      setPrice(18500000);
      setLocation('Golf Course Extension Road');
      setAddress('');
      setCity('Gurugram');
      setLocality('Sector 65');
      setBedrooms(3);
      setBathrooms(3);
      setArea(2250);
      setFurnishing('Semi-Furnished');
      setFloor(8);
      setTotalFloors(24);
      setParking(2);
      setFacing('North-East');
      setPossessionStatus('Ready to Move');
      setDescription('');
      setAmenities(['Power Backup', '24x7 Security', 'Lift / Elevator', 'Clubhouse']);
      setOwnerName('');
      setOwnerPhone('');
      setStatus('Available');
      // Properties can be created without images on Spark plan
      setImages([]);
    }
    setImageUrlInput('');
    setError('');
  }, [initialData, isOpen]);

  const toggleAmenity = (item: string) => {
    if (amenities.includes(item)) {
      setAmenities(amenities.filter((a) => a !== item));
    } else {
      setAmenities([...amenities, item]);
    }
  };

  const handleAddImageUrl = () => {
    const trimmed = imageUrlInput.trim();
    if (!trimmed) return;
    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
      setError('Please provide a valid web URL starting with https:// or http://');
      return;
    }
    setError('');
    setImages((prev) => [...prev, trimmed]);
    setImageUrlInput('');
  };

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!isStorageAvailable) {
      setError('Firebase Storage is currently not enabled (Spark plan). Please add direct image URLs.');
      return;
    }
    setUploadingImage(true);
    try {
      const downloadUrl = await uploadPropertyImage(orgId, file);
      setImages((prev) => [...prev, downloadUrl]);
    } catch (err: any) {
      setError('Could not process image: ' + err.message);
    } finally {
      setUploadingImage(false);
      e.target.value = '';
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Property title is required.');
      return;
    }
    if (!price || price <= 0) {
      setError('Valid price is required.');
      return;
    }

    setError('');
    setLoading(true);
    try {
      await onSubmit({
        propertyCode: propertyCode || `PROP-${Date.now().toString().slice(-4)}`,
        title: title.trim(),
        propertyType,
        transactionType,
        price: Number(price),
        location: location.trim(),
        address: address.trim(),
        city: city.trim(),
        locality: locality.trim(),
        bedrooms: Number(bedrooms),
        bathrooms: Number(bathrooms),
        area: Number(area),
        furnishing,
        floor: Number(floor),
        totalFloors: Number(totalFloors),
        parking: Number(parking),
        facing,
        possessionStatus,
        description: description.trim(),
        amenities,
        ownerName: ownerName.trim(),
        ownerPhone: ownerPhone.trim(),
        assignedAgentId: initialData?.assignedAgentId || agentId,
        assignedAgentName: initialData?.assignedAgentName || agentName,
        status,
        images,
        isDemo: initialData?.isDemo || false,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save property listing.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Property Listing' : 'Add Property Listing'}
      subtitle="Complete inventory specifications and amenities"
      maxWidth="3xl"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <Input
            label="Property Code"
            placeholder="e.g. PROP-1001"
            value={propertyCode}
            onChange={(e) => setPropertyCode(e.target.value)}
          />
          <div className="sm:col-span-2">
            <Input
              label="Listing Title"
              required
              placeholder="e.g. Luxury 4 BHK Sky Villa in DLF The Camellias"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5">
          <Select
            label="Property Type"
            value={propertyType}
            onChange={(e) => setPropertyType(e.target.value)}
            options={[
              { value: 'Apartment', label: 'Apartment / Flat' },
              { value: 'Villa', label: 'Villa' },
              { value: 'Independent House', label: 'Independent House / Kothi' },
              { value: 'Plot', label: 'Residential Plot' },
              { value: 'Commercial', label: 'Commercial Retail' },
              { value: 'Office', label: 'Office Space' },
              { value: 'Warehouse', label: 'Warehouse / Industrial' },
              { value: 'Other', label: 'Other' },
            ]}
          />
          <Select
            label="Transaction"
            value={transactionType}
            onChange={(e) => setTransactionType(e.target.value as any)}
            options={[
              { value: 'Sale', label: 'For Sale' },
              { value: 'Rent', label: 'For Rent' },
            ]}
          />
          <Input
            label={transactionType === 'Sale' ? 'Price (₹)' : 'Monthly Rent (₹)'}
            type="number"
            step="10000"
            required
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
          />
          <Select
            label="Inventory Status"
            value={status}
            onChange={(e) => setStatus(e.target.value as PropertyStatus)}
            options={[
              { value: 'Available', label: 'Available' },
              { value: 'Reserved', label: 'Reserved' },
              { value: 'Sold', label: 'Sold' },
              { value: 'Rented', label: 'Rented' },
              { value: 'Inactive', label: 'Inactive' },
            ]}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <Input
            label="City"
            placeholder="e.g. Gurugram"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
          <Input
            label="Locality / Sector"
            placeholder="e.g. DLF Phase 5"
            value={locality}
            onChange={(e) => setLocality(e.target.value)}
          />
          <Input
            label="Address / Project Name"
            placeholder="e.g. Tower B, Flat 1402, DLF Magnolias"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
          <Input
            label="Bedrooms"
            type="number"
            value={bedrooms}
            onChange={(e) => setBedrooms(Number(e.target.value))}
          />
          <Input
            label="Bathrooms"
            type="number"
            value={bathrooms}
            onChange={(e) => setBathrooms(Number(e.target.value))}
          />
          <Input
            label="Super Area (Sq Ft)"
            type="number"
            value={area}
            onChange={(e) => setArea(Number(e.target.value))}
          />
          <Select
            label="Furnishing"
            value={furnishing}
            onChange={(e) => setFurnishing(e.target.value as any)}
            options={[
              { value: 'Semi-Furnished', label: 'Semi-Furnished' },
              { value: 'Furnished', label: 'Furnished' },
              { value: 'Unfurnished', label: 'Unfurnished' },
            ]}
          />
          <Input
            label="Parking Slots"
            type="number"
            value={parking}
            onChange={(e) => setParking(Number(e.target.value))}
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          <Input
            label="Floor"
            type="number"
            value={floor}
            onChange={(e) => setFloor(Number(e.target.value))}
          />
          <Input
            label="Total Floors"
            type="number"
            value={totalFloors}
            onChange={(e) => setTotalFloors(Number(e.target.value))}
          />
          <Select
            label="Facing"
            value={facing}
            onChange={(e) => setFacing(e.target.value)}
            options={[
              { value: 'North-East', label: 'North-East (Vaastu)' },
              { value: 'East', label: 'East' },
              { value: 'North', label: 'North' },
              { value: 'West', label: 'West' },
              { value: 'South', label: 'South' },
            ]}
          />
          <Select
            label="Possession"
            value={possessionStatus}
            onChange={(e) => setPossessionStatus(e.target.value)}
            options={[
              { value: 'Ready to Move', label: 'Ready to Move' },
              { value: 'Under Construction', label: 'Under Construction' },
            ]}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <Input
            label="Owner / Landlord Name"
            placeholder="e.g. Vikramjit Sahni"
            value={ownerName}
            onChange={(e) => setOwnerName(e.target.value)}
          />
          <Input
            label="Owner Phone Number"
            type="tel"
            placeholder="+91 98110 11223"
            value={ownerPhone}
            onChange={(e) => setOwnerPhone(e.target.value)}
          />
        </div>

        {/* Amenities Selection */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-700">Society &amp; Unit Amenities</label>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {COMMON_AMENITIES.map((item) => {
              const active = amenities.includes(item);
              return (
                <button
                  type="button"
                  key={item}
                  onClick={() => toggleAmenity(item)}
                  className={`text-xs px-2.5 py-1 rounded-full border transition cursor-pointer ${
                    active
                      ? 'bg-indigo-600 border-indigo-600 text-white font-semibold'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  {item}
                </button>
              );
            })}
          </div>
        </div>

        {/* Description */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-700">Property Description</label>
          <textarea
            rows={3}
            placeholder="Highlight view, finishes, layout, modular kitchen, maintenance fees, etc."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full text-xs p-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500"
          />
        </div>

        {/* Property Images (URL Input & Optional Firebase Storage) */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-700">
              Property Images <span className="text-[11px] font-normal text-slate-400">(Optional)</span>
            </label>
            <span className="text-[11px] text-slate-400">
              {images.length} image{images.length !== 1 ? 's' : ''} added
            </span>
          </div>

          {/* Add Image URL Row */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <LinkIcon className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="url"
                placeholder="Paste direct image URL (e.g. https://images.unsplash.com/...)"
                value={imageUrlInput}
                onChange={(e) => setImageUrlInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddImageUrl();
                  }
                }}
                className="w-full text-xs pl-8 pr-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500"
              />
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddImageUrl}
              icon={<Plus className="w-3.5 h-3.5" />}
            >
              Add URL
            </Button>
          </div>

          {/* Spark plan notice when storage is disabled */}
          {!isStorageAvailable && (
            <p className="text-[11px] text-slate-500 bg-slate-50 border border-slate-200/80 rounded-lg px-3 py-2">
              <span className="font-semibold text-slate-700">Spark Plan Mode:</span> Cloud Storage file uploads are disabled. Attach photos using web URLs above, or save without images.
            </p>
          )}

          {/* Image Previews & Optional Upload Dropzone */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
            {images.map((url, idx) => (
              <div
                key={idx}
                className="relative rounded-lg overflow-hidden border border-slate-200 aspect-video group bg-slate-100"
              >
                <img src={url} alt={`Property preview ${idx + 1}`} className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="absolute top-1 right-1 p-1 bg-slate-900/70 hover:bg-rose-600 text-white rounded-md transition cursor-pointer"
                  title="Remove image"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}

            {/* Upload Button: Rendered ONLY if Firebase Storage is enabled (e.g. Blaze plan) */}
            {isStorageAvailable && (
              <label className="border-2 border-dashed border-slate-300 hover:border-indigo-400 rounded-lg aspect-video flex flex-col items-center justify-center p-3 text-center cursor-pointer transition bg-slate-50 hover:bg-indigo-50/30">
                <Upload className="w-5 h-5 text-slate-400 mb-1" />
                <span className="text-[11px] font-semibold text-slate-600">
                  {uploadingImage ? 'Compressing...' : 'Upload Image'}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={uploadingImage}
                  onChange={handleImageFileChange}
                />
              </label>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            {initialData ? 'Update Listing' : 'Publish Property'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
