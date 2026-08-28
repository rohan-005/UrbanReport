'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { complaintRepository } from '@/lib/repositories/complaint.repository';
import { Category, Severity, Complaint } from '@/lib/types';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { ImageUploader } from '@/components/ui/ImageUploader';
import { LocationPicker } from '@/components/map/LocationPicker';
import { Modal } from '@/components/ui/Modal';
import { SeverityBadge } from '@/components/ui/SeverityBadge';
import { 
  Send, 
  MapPin, 
  AlertCircle, 
  CheckCircle2, 
  FileText, 
  Info,
  ShieldCheck,
  ArrowRight,
  Construction,
  Trash2,
  Lightbulb,
  Waves,
  Droplet,
  Activity,
  HelpCircle
} from 'lucide-react';

const categoryOptions: { name: Category; description: string; icon: React.ElementType }[] = [
  { name: 'Pothole', description: 'Road craters, sunken asphalt, hazardous holes', icon: Construction },
  { name: 'Garbage', description: 'Solid waste heaps, uncollected debris, illegal dumping', icon: Trash2 },
  { name: 'Streetlight', description: 'Dark fixtures, flickering LEDs, exposed electrical wires', icon: Lightbulb },
  { name: 'Drainage', description: 'Clogged storm drains, missing manhole covers, sewer leaks', icon: Waves },
  { name: 'Road Damage', description: 'Caving pavement, broken dividers, missing signage', icon: Construction },
  { name: 'Water Supply', description: 'Burst main pipelines, low pressure, contaminated tap water', icon: Droplet },
  { name: 'Traffic', description: 'Signal malfunctions, stuck controllers, missing speed humps', icon: Activity },
  { name: 'Other', description: 'Vandalism, fallen trees, general civic public safety', icon: HelpCircle },
];

const severities: { value: Severity; label: string; desc: string; color: string }[] = [
  { value: 'LOW', label: 'Low', desc: 'Minor cosmetic defect or routine maintenance', color: 'border-slate-700 bg-slate-800/40' },
  { value: 'MEDIUM', label: 'Medium', desc: 'Noticeable defect causing inconvenience', color: 'border-amber-700/60 bg-amber-950/20' },
  { value: 'HIGH', label: 'High', desc: 'Significant hazard disrupting traffic/utilities', color: 'border-orange-700/60 bg-orange-950/20' },
  { value: 'CRITICAL', label: 'Critical', desc: 'Emergency threat to human safety or life', color: 'border-rose-600/80 bg-rose-950/30' },
];

export default function ReportPage() {
  const router = useRouter();

  // Form State
  const [category, setCategory] = useState<Category>('Pothole');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState<Severity>('MEDIUM');
  const [address, setAddress] = useState('Outer Ring Road, Near Silk Board Junction, HSR Layout, Bengaluru');
  const [latitude, setLatitude] = useState(12.9172);
  const [longitude, setLongitude] = useState(77.6228);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  // Status & Validation
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [createdComplaint, setCreatedComplaint] = useState<Complaint | null>(null);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) {
      newErrors.title = 'Title is required.';
    } else if (title.trim().length < 5) {
      newErrors.title = 'Title must be at least 5 characters long.';
    }

    if (!description.trim()) {
      newErrors.description = 'Problem description is required.';
    } else if (description.trim().length < 15) {
      newErrors.description = 'Please provide a detailed description (at least 15 characters).';
    }

    if (!address.trim()) {
      newErrors.address = 'Location address is required.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setSubmitting(true);

    try {
      const mediaList = imageUrl
        ? [{ id: `med-${Date.now()}`, url: imageUrl, type: 'image' as const, caption: 'Citizen uploaded evidence photo' }]
        : [{
            id: `med-${Date.now()}`,
            url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
            type: 'image' as const,
            caption: 'Default evidence preview',
          }];

      const newReport = await complaintRepository.createComplaint({
        title: title.trim(),
        category,
        description: description.trim(),
        severity,
        status: 'SUBMITTED',
        latitude,
        longitude,
        address: address.trim(),
        reporter: {
          id: 'user-001',
          name: 'Aarav Sharma',
        },
        media: mediaList,
      });

      setCreatedComplaint(newReport);
      setIsSuccessModalOpen(true);
    } catch (err) {
      setErrors({ form: 'Failed to submit report. Please check input.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 w-full space-y-8">
      <PageHeader
        title="Report a Civic Issue"
        description="Help municipal authorities locate and fix infrastructure, sanitation, and safety problems in your community."
      />

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Step 1: Category Selection */}
        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-4 shadow-xl">
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-sky-600 text-xs font-bold text-white">
              1
            </span>
            Select Issue Category
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {categoryOptions.map((cat) => {
              const Icon = cat.icon;
              const isSelected = category === cat.name;

              return (
                <button
                  key={cat.name}
                  type="button"
                  onClick={() => setCategory(cat.name)}
                  className={`flex flex-col items-start p-3.5 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'border-sky-500 bg-sky-950/40 shadow-lg shadow-sky-500/10'
                      : 'border-slate-800 bg-slate-800/40 hover:bg-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div
                    className={`p-2 rounded-lg mb-2 ${
                      isSelected ? 'bg-sky-600 text-white' : 'bg-slate-800 text-sky-400'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className={`text-sm font-semibold ${isSelected ? 'text-white' : 'text-slate-200'}`}>
                    {cat.name}
                  </span>
                  <span className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-tight">
                    {cat.description}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 2: Issue Details */}
        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-6 shadow-xl">
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-sky-600 text-xs font-bold text-white">
              2
            </span>
            Issue Details & Description
          </h3>

          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
              Complaint Title *
            </label>
            <input
              type="text"
              placeholder="e.g. Hazardous Pothole on 100 Feet Ring Road"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500"
            />
            {errors.title && <p className="text-xs text-rose-400 font-medium">{errors.title}</p>}
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
              Detailed Description *
            </label>
            <textarea
              rows={4}
              placeholder="Describe the exact problem, size, duration, vehicle safety hazard, or any landmark details..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500 resize-none"
            />
            {errors.description && (
              <p className="text-xs text-rose-400 font-medium">{errors.description}</p>
            )}
          </div>

          {/* Severity Radio Group */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
              Assess Severity Level *
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {severities.map((sev) => {
                const isSelected = severity === sev.value;
                return (
                  <button
                    key={sev.value}
                    type="button"
                    onClick={() => setSeverity(sev.value)}
                    className={`flex flex-col p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'border-sky-500 bg-sky-950/40 ring-1 ring-sky-500'
                        : `${sev.color} hover:border-slate-600`
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <SeverityBadge severity={sev.value} size="sm" />
                      <input
                        type="radio"
                        name="severity"
                        checked={isSelected}
                        onChange={() => setSeverity(sev.value)}
                        className="accent-sky-500"
                      />
                    </div>
                    <span className="text-xs text-slate-400 mt-1 leading-tight">{sev.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Step 3: Geospatial Location */}
        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-6 shadow-xl">
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-sky-600 text-xs font-bold text-white">
              3
            </span>
            Geospatial Location
          </h3>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
              Street Address / Landmark *
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-sky-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Enter street address or landmark"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500"
              />
            </div>
            {errors.address && <p className="text-xs text-rose-400 font-medium">{errors.address}</p>}
          </div>

          <LocationPicker
            latitude={latitude}
            longitude={longitude}
            onLocationChange={(newLat, newLng, sampleAddr) => {
              setLatitude(newLat);
              setLongitude(newLng);
              if (sampleAddr) setAddress(sampleAddr);
            }}
          />
        </div>

        {/* Step 4: Photo Evidence Upload */}
        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-4 shadow-xl">
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-sky-600 text-xs font-bold text-white">
              4
            </span>
            Photo Evidence (Optional but Recommended)
          </h3>

          <ImageUploader onImageSelected={(url) => setImageUrl(url)} />
        </div>

        {/* Submit Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="text-xs text-slate-400">
            <p>© UrbanReports Citizen Dispatch Platform.</p>
            <p className="mt-0.5 text-slate-500">
              Submitted reports receive a unique tracking ID and appear instantly on the public map.
            </p>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={submitting}
            leftIcon={<Send className="w-4 h-4" />}
            className="w-full sm:w-auto px-8"
          >
            Submit Complaint Report
          </Button>
        </div>
      </form>

      {/* Success Confirmation Modal */}
      <Modal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        title="Complaint Successfully Submitted"
      >
        {createdComplaint && (
          <div className="space-y-6 text-center py-2">
            <div className="flex items-center justify-center">
              <div className="p-4 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-700/60 animate-bounce">
                <CheckCircle2 className="w-12 h-12" />
              </div>
            </div>

            <div>
              <span className="text-xs text-slate-400 font-mono uppercase tracking-wider block mb-1">
                Generated Tracking Reference Number
              </span>
              <h2 className="text-3xl font-extrabold text-sky-400 font-mono tracking-wider">
                {createdComplaint.id}
              </h2>
            </div>

            <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 text-left text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Title:</span>
                <span className="font-semibold text-slate-100">{createdComplaint.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Category:</span>
                <span className="font-semibold text-slate-100">{createdComplaint.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Status:</span>
                <span className="font-semibold text-sky-400">{createdComplaint.status}</span>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Your civic report has been registered in the municipal triage queue. You can track its live timeline and status updates anytime.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <Button
                variant="primary"
                className="w-full"
                onClick={() => router.push(`/complaints/${createdComplaint.id}`)}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Track Complaint Timeline
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setIsSuccessModalOpen(false);
                  setTitle('');
                  setDescription('');
                }}
              >
                Report Another Issue
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
