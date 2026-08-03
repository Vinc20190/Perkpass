'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, Check, ChevronLeft, ChevronRight, AlertCircle, Store, Loader2, FileText, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import { uploadFile, deleteFile } from '@/lib/storage/upload';

const BUSINESS_TYPES = [
  { value: 'restaurant', label: 'Restaurant / Dining' },
  { value: 'hotel', label: 'Hotel / Accommodation' },
  { value: 'spa', label: 'Spa / Wellness' },
  { value: 'beauty', label: 'Beauty / Salon' },
  { value: 'fitness', label: 'Fitness / Gym' },
  { value: 'retail', label: 'Retail / Shopping' },
  { value: 'entertainment', label: 'Entertainment' },
  { value: 'travel', label: 'Travel / Tourism' },
  { value: 'other', label: 'Other' },
];

const COUNTRIES = [
  { value: 'NG', label: 'Nigeria' },
  { value: 'KE', label: 'Kenya' },
  { value: 'GH', label: 'Ghana' },
  { value: 'ZA', label: 'South Africa' },
  { value: 'EG', label: 'Egypt' },
  { value: 'MA', label: 'Morocco' },
  { value: 'ET', label: 'Ethiopia' },
  { value: 'RW', label: 'Rwanda' },
  { value: 'TZ', label: 'Tanzania' },
  { value: 'UG', label: 'Uganda' },
];

export interface VendorFormData {
  business_name: string;
  contact_name: string;
  email: string;
  phone: string;
  business_type: string;
  country_id: string;
  city: string;
  address: string;
  website: string;
  description: string;
  logo_url: string;
  license_url: string;
  gallery_urls: string[];
}

const STEPS = ['Business Info', 'Contact Details', 'Documents', 'Review'];

interface VendorFormProps {
  onSubmit: (data: VendorFormData) => Promise<void>;
  initialData?: Partial<VendorFormData>;
}

export function VendorForm({ onSubmit, initialData }: VendorFormProps) {
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [data, setData] = useState<VendorFormData>({
    business_name: initialData?.business_name ?? '',
    contact_name: initialData?.contact_name ?? '',
    email: initialData?.email ?? '',
    phone: initialData?.phone ?? '',
    business_type: initialData?.business_type ?? 'restaurant',
    country_id: initialData?.country_id ?? 'NG',
    city: initialData?.city ?? '',
    address: initialData?.address ?? '',
    website: initialData?.website ?? '',
    description: initialData?.description ?? '',
    logo_url: initialData?.logo_url ?? '',
    license_url: initialData?.license_url ?? '',
    gallery_urls: initialData?.gallery_urls ?? [],
  });

  const update = (field: keyof VendorFormData, value: string) => {
    setData((d) => ({ ...d, [field]: value }));
    setErrors((e) => { const n = { ...e }; delete n[field]; return n; });
  };

  const validateStep = (s: number): boolean => {
    const e: Record<string, string> = {};
    if (s === 0) {
      if (!data.business_name.trim()) e.business_name = 'Business name is required';
      if (!data.city.trim()) e.city = 'City is required';
      if (!data.business_type) e.business_type = 'Select a business type';
    }
    if (s === 1) {
      if (!data.contact_name.trim()) e.contact_name = 'Contact name is required';
      if (!data.email.trim()) e.email = 'Email is required';
      else if (!/\S+@\S+\.\S+/.test(data.email)) e.email = 'Invalid email format';
      if (!data.phone.trim()) e.phone = 'Phone is required';
    }
    if (s === 2) {
      if (!data.license_url.trim()) e.license_url = 'Commercial license is required';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => {
    if (validateStep(step)) setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };
  const prev = () => setStep((s) => Math.max(s - 1, 0));

  const handleSubmit = async () => {
    if (!validateStep(0) || !validateStep(1) || !validateStep(2)) {
      setStep(0);
      return;
    }
    setSubmitting(true);
    await onSubmit(data);
    setSubmitting(false);
  };

  return (
    <div className="glass-card mx-auto max-w-2xl rounded-3xl p-6 sm:p-8">
      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {STEPS.map((label, i) => (
            <div key={i} className="flex flex-1 items-center">
              <div className={cn(
                'grid h-9 w-9 shrink-0 place-items-center rounded-xl text-sm font-bold transition-all',
                i < step && 'bg-success text-white',
                i === step && 'bg-primary-gradient text-white shadow-glow',
                i > step && 'bg-muted text-muted-foreground'
              )}>
                {i < step ? <Check className="h-5 w-5" /> : i + 1}
              </div>
              {i < STEPS.length - 1 && (
                <div className={cn('h-1 flex-1 rounded-full transition-all', i < step ? 'bg-success' : 'bg-border')} />
              )}
            </div>
          ))}
        </div>
        <div className="mt-3 flex justify-between">
          {STEPS.map((label, i) => (
            <span key={i} className={cn(
              'flex-1 text-center text-xs font-semibold',
              i === step ? 'text-primary' : 'text-muted-foreground'
            )}>
              {label}
            </span>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {/* Step 0: Business Info */}
          {step === 0 && (
            <div className="space-y-5">
              <div className="flex items-center gap-2">
                <Store className="h-5 w-5 text-primary" />
                <h3 className="font-display text-lg font-bold">Business Information</h3>
              </div>
              <div className="space-y-2">
                <Label htmlFor="business_name">Business Name *</Label>
                <Input id="business_name" value={data.business_name} onChange={(e) => update('business_name', e.target.value)} placeholder="Sky Restaurant" />
                {errors.business_name && <FieldError msg={errors.business_name} />}
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="business_type">Business Type *</Label>
                  <Select value={data.business_type} onValueChange={(v) => update('business_type', v)}>
                    <SelectTrigger id="business_type"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {BUSINESS_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country *</Label>
                  <Select value={data.country_id} onValueChange={(v) => update('country_id', v)}>
                    <SelectTrigger id="country"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {COUNTRIES.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
                <Input id="city" value={data.city} onChange={(e) => update('city', e.target.value)} placeholder="Lagos" />
                {errors.city && <FieldError msg={errors.city} />}
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Business Address</Label>
                <Input id="address" value={data.address} onChange={(e) => update('address', e.target.value)} placeholder="123 Victoria Island, Lagos" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">Website (optional)</Label>
                <Input id="website" value={data.website} onChange={(e) => update('website', e.target.value)} placeholder="https://skyrestaurant.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Business Description</Label>
                <Textarea id="description" value={data.description} onChange={(e) => update('description', e.target.value)} placeholder="Tell us about your business..." rows={3} />
              </div>
            </div>
          )}

          {/* Step 1: Contact Details */}
          {step === 1 && (
            <div className="space-y-5">
              <div className="flex items-center gap-2">
                <Store className="h-5 w-5 text-primary" />
                <h3 className="font-display text-lg font-bold">Contact Details</h3>
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact_name">Contact Person Name *</Label>
                <Input id="contact_name" value={data.contact_name} onChange={(e) => update('contact_name', e.target.value)} placeholder="Amara Okafor" />
                {errors.contact_name && <FieldError msg={errors.contact_name} />}
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input id="email" type="email" value={data.email} onChange={(e) => update('email', e.target.value)} placeholder="contact@business.com" />
                  {errors.email && <FieldError msg={errors.email} />}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone *</Label>
                  <Input id="phone" value={data.phone} onChange={(e) => update('phone', e.target.value)} placeholder="+234 800 123 4567" />
                  {errors.phone && <FieldError msg={errors.phone} />}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Documents */}
          {step === 2 && (
            <div className="space-y-5">
              <div className="flex items-center gap-2">
                <Store className="h-5 w-5 text-primary" />
                <h3 className="font-display text-lg font-bold">Documents & Branding</h3>
              </div>
              <div className="space-y-2">
                <Label>Commercial License *</Label>
                <FileUploadField
                  value={data.license_url}
                  onChange={(v) => update('license_url', v)}
                  accept="image/*,.pdf"
                  label="Upload Commercial License"
                  error={errors.license_url}
                  folder="licenses"
                />
              </div>
              <div className="space-y-2">
                <Label>Business Logo</Label>
                <FileUploadField
                  value={data.logo_url}
                  onChange={(v) => update('logo_url', v)}
                  accept="image/*"
                  label="Upload Logo (PNG/SVG)"
                  folder="logos"
                />
              </div>
              <div className="space-y-2">
                <Label>Gallery Images (optional)</Label>
                <GalleryUpload
                  urls={data.gallery_urls}
                  onChange={(urls) => setData((d) => ({ ...d, gallery_urls: urls }))}
                />
              </div>
            </div>
          )}

          {/* Step 3: Review */}
          {step === 3 && (
            <div className="space-y-5">
              <div className="flex items-center gap-2">
                <Store className="h-5 w-5 text-primary" />
                <h3 className="font-display text-lg font-bold">Review & Submit</h3>
              </div>
              <div className="space-y-4 rounded-2xl border border-border p-5">
                <ReviewRow label="Business" value={data.business_name} />
                <ReviewRow label="Type" value={BUSINESS_TYPES.find((t) => t.value === data.business_type)?.label ?? data.business_type} />
                <ReviewRow label="Location" value={`${data.city}, ${COUNTRIES.find((c) => c.value === data.country_id)?.label ?? data.country_id}`} />
                <ReviewRow label="Contact" value={data.contact_name} />
                <ReviewRow label="Email" value={data.email} />
                <ReviewRow label="Phone" value={data.phone} />
                <ReviewRow label="License" value={data.license_url ? 'Uploaded' : 'Not uploaded'} />
                <ReviewRow label="Logo" value={data.logo_url ? 'Uploaded' : 'Not uploaded'} />
              </div>
              <p className="rounded-xl bg-primary/10 p-3 text-sm text-primary">
                By submitting, you confirm that all information is accurate. Your application will be reviewed by our admin team within 2-3 business days.
              </p>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="mt-8 flex items-center justify-between">
        <Button variant="ghost" onClick={prev} disabled={step === 0 || submitting}>
          <ChevronLeft className="mr-1 h-4 w-4" /> Back
        </Button>
        {step < STEPS.length - 1 ? (
          <Button className="btn-shine bg-primary-gradient" onClick={next}>
            Next <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        ) : (
          <Button className="btn-shine bg-primary-gradient" onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit Application'}
          </Button>
        )}
      </div>
    </div>
  );
}

function FieldError({ msg }: { msg: string }) {
  return (
    <p className="flex items-center gap-1.5 text-sm font-medium text-destructive">
      <AlertCircle className="h-4 w-4" /> {msg}
    </p>
  );
}

function FileUploadField({
  value, onChange, accept, label, error, folder,
}: {
  value: string; onChange: (v: string) => void; accept: string; label: string; error?: string; folder: string;
}) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [currentPath, setCurrentPath] = useState('');

  const handleFile = async (file: File) => {
    setUploading(true);
    setUploadError(null);

    if (currentPath) {
      await deleteFile('vendor-assets', currentPath);
    }

    const userId = (await supabase.auth.getUser()).data.user?.id;
    if (!userId) {
      setUploadError('You must be signed in to upload files.');
      setUploading(false);
      return;
    }

    const isPdf = file.type === 'application/pdf';
    const result = await uploadFile('vendor-assets', userId, file, {
      allowedTypes: isPdf
        ? ['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
        : ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
      maxSizeMB: 5,
    });

    setUploading(false);

    if (result.error) {
      setUploadError(result.error);
      return;
    }

    setCurrentPath(result.path);
    onChange(result.url);
  };

  return (
    <div>
      <label className={cn(
        'flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center transition-all hover:border-primary',
        value ? 'border-success/50 bg-success/5' : 'border-border',
        uploading && 'border-primary/50 bg-primary/5'
      )}>
        {uploading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-7 w-7 animate-spin text-primary" />
            <p className="text-sm font-semibold text-primary">Uploading...</p>
          </div>
        ) : value ? (
          <div className="flex flex-col items-center gap-2">
            <Check className="h-6 w-6 text-success" />
            <p className="text-sm font-semibold text-success">File uploaded</p>
            <p className="text-xs text-muted-foreground">Click to replace</p>
          </div>
        ) : (
          <>
            <UploadCloud className="h-8 w-8 text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground">{label}</p>
            <p className="mt-1 text-xs text-muted-foreground">PDF, PNG, JPG up to 5MB</p>
          </>
        )}
        <input
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />
      </label>
      {uploadError && <FieldError msg={uploadError} />}
      {error && <FieldError msg={error} />}
    </div>
  );
}

function GalleryUpload({ urls, onChange }: { urls: string[]; onChange: (urls: string[]) => void }) {
  const [uploading, setUploading] = useState(false);

  const handleFile = async (file: File) => {
    if (urls.length >= 5) return;
    setUploading(true);

    const userId = (await supabase.auth.getUser()).data.user?.id;
    if (!userId) {
      setUploading(false);
      return;
    }

    const result = await uploadFile('vendor-assets', userId, file, {
      allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
      maxSizeMB: 5,
    });

    setUploading(false);

    if (result.error) return;
    onChange([...urls, result.url]);
  };

  return (
    <div>
      <div className="flex flex-wrap gap-3">
        {urls.map((url, i) => (
          <div key={i} className="relative h-20 w-20 overflow-hidden rounded-xl border border-border">
            <img src={url} alt={`Gallery ${i + 1}`} className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => onChange(urls.filter((_, idx) => idx !== i))}
              className="absolute right-1 top-1 grid h-5 w-5 place-items-center rounded-full bg-destructive/90 text-white"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
        {urls.length < 5 && (
          <label className="flex h-20 w-20 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border transition-all hover:border-primary">
            {uploading ? (
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            ) : (
              <>
                <UploadCloud className="h-5 w-5 text-muted-foreground" />
                <span className="mt-0.5 text-[10px] font-medium text-muted-foreground">Add</span>
              </>
            )}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFile(file);
              }}
            />
          </label>
        )}
      </div>
      <p className="mt-2 text-xs text-muted-foreground">Up to 5 images. PNG, JPG up to 5MB each.</p>
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border/50 pb-2 last:border-0">
      <span className="text-sm font-medium text-muted-foreground">{label}</span>
      <span className="text-sm font-bold">{value}</span>
    </div>
  );
}
