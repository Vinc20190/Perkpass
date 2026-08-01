'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ImagePlus, Save, Send, Archive, Trash2, ChevronLeft, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import type { VendorOffer, VendorOfferType } from '@/lib/types';

const CATEGORIES = [
  { value: 'dining', label: 'Dining' },
  { value: 'hotels', label: 'Hotels' },
  { value: 'spa', label: 'Spa' },
  { value: 'beauty', label: 'Beauty' },
  { value: 'fitness', label: 'Fitness' },
  { value: 'retail', label: 'Retail' },
  { value: 'entertainment', label: 'Entertainment' },
  { value: 'travel', label: 'Travel' },
];

const OFFER_TYPES: { value: VendorOfferType; label: string }[] = [
  { value: 'discount', label: 'Discount' },
  { value: 'bogo', label: 'Buy One Get One' },
  { value: 'free', label: 'Free Item' },
];

export interface OfferEditorData {
  id?: string;
  title: string;
  description: string;
  category: string;
  offer_type: VendorOfferType;
  discount_value: string;
  image_url: string;
  terms_conditions: string;
  original_price_cents: number;
  city: string;
  expires_at: string;
  status: VendorOffer['status'];
}

interface OfferEditorProps {
  initialData?: Partial<OfferEditorData>;
  onSave: (data: OfferEditorData, publish: boolean) => Promise<void>;
  onDelete?: () => Promise<void>;
  onCancel: () => void;
}

export function OfferEditor({ initialData, onSave, onDelete, onCancel }: OfferEditorProps) {
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [data, setData] = useState<OfferEditorData>({
    id: initialData?.id,
    title: initialData?.title ?? '',
    description: initialData?.description ?? '',
    category: initialData?.category ?? 'dining',
    offer_type: initialData?.offer_type ?? 'discount',
    discount_value: initialData?.discount_value ?? '10% OFF',
    image_url: initialData?.image_url ?? '',
    terms_conditions: initialData?.terms_conditions ?? '',
    original_price_cents: initialData?.original_price_cents ?? 0,
    city: initialData?.city ?? '',
    expires_at: initialData?.expires_at ?? '',
    status: initialData?.status ?? 'draft',
  });

  const update = (field: keyof OfferEditorData, value: string | number) => {
    setData((d) => ({ ...d, [field]: value }));
    setErrors((e) => { const n = { ...e }; delete n[field]; return n; });
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!data.title.trim()) e.title = 'Title is required';
    if (!data.city.trim()) e.city = 'City is required';
    if (!data.discount_value.trim()) e.discount_value = 'Discount value is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async (publish: boolean) => {
    if (!validate()) return;
    setSaving(true);
    await onSave({ ...data, status: publish ? 'published' : 'draft' }, publish);
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <ChevronLeft className="mr-1 h-4 w-4" /> Back
          </Button>
          <h2 className="font-display text-xl font-bold">
            {data.id ? 'Edit Offer' : 'Create New Offer'}
          </h2>
        </div>
        {data.id && onDelete && (
          <Button variant="destructive" size="sm" onClick={onDelete}>
            <Trash2 className="mr-1 h-4 w-4" /> Delete
          </Button>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main form */}
        <div className="space-y-5 lg:col-span-2">
          <div className="glass-card rounded-2xl p-6">
            <h3 className="mb-4 font-display text-sm font-bold uppercase tracking-wider text-muted-foreground">
              Offer Details
            </h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Offer Title *</Label>
                <Input id="title" value={data.title} onChange={(e) => update('title', e.target.value)} placeholder="40% Off Fine Dining" />
                {errors.title && <FieldError msg={errors.title} />}
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" value={data.description} onChange={(e) => update('description', e.target.value)} placeholder="Describe your offer..." rows={3} />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={data.category} onValueChange={(v) => update('category', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Offer Type</Label>
                  <Select value={data.offer_type} onValueChange={(v) => update('offer_type', v as VendorOfferType)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {OFFER_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="discount_value">Discount Value *</Label>
                  <Input id="discount_value" value={data.discount_value} onChange={(e) => update('discount_value', e.target.value)} placeholder="40% OFF" />
                  {errors.discount_value && <FieldError msg={errors.discount_value} />}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">City *</Label>
                  <Input id="city" value={data.city} onChange={(e) => update('city', e.target.value)} placeholder="Lagos" />
                  {errors.city && <FieldError msg={errors.city} />}
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="price">Original Price (USD cents)</Label>
                  <Input id="price" type="number" value={data.original_price_cents} onChange={(e) => update('original_price_cents', Number(e.target.value))} placeholder="4500" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expires_at">Expiry Date</Label>
                  <Input id="expires_at" type="date" value={data.expires_at ? data.expires_at.split('T')[0] : ''} onChange={(e) => update('expires_at', e.target.value ? new Date(e.target.value).toISOString() : '')} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="terms">Terms & Conditions</Label>
                <Textarea id="terms" value={data.terms_conditions} onChange={(e) => update('terms_conditions', e.target.value)} placeholder="Valid on weekdays only. Not combinable with other offers..." rows={2} />
              </div>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-6">
            <h3 className="mb-4 font-display text-sm font-bold uppercase tracking-wider text-muted-foreground">
              Offer Image
            </h3>
            <div className={cn(
              'cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition-all hover:border-primary',
              data.image_url ? 'border-primary/50' : 'border-border'
            )}>
              {data.image_url ? (
                <div className="relative overflow-hidden rounded-xl">
                  <img src={data.image_url} alt="Offer preview" className="mx-auto max-h-48 rounded-xl object-cover" />
                </div>
              ) : (
                <>
                  <ImagePlus className="mx-auto h-10 w-10 text-muted-foreground" />
                  <p className="mt-2 text-sm text-muted-foreground">Click to upload an offer image</p>
                </>
              )}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) update('image_url', URL.createObjectURL(file));
                }}
              />
            </div>
          </div>
        </div>

        {/* Sidebar: preview + actions */}
        <div className="space-y-4">
          <div className="glass-card rounded-2xl p-5">
            <h3 className="mb-3 font-display text-sm font-bold uppercase tracking-wider text-muted-foreground">
              Live Preview
            </h3>
            <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-card">
              {data.image_url ? (
                <img src={data.image_url} alt={data.title} className="h-40 w-full object-cover" />
              ) : (
                <div className="grid h-40 w-full place-items-center bg-muted">
                  <ImagePlus className="h-10 w-10 text-muted-foreground" />
                </div>
              )}
              <div className="p-4">
                <span className="inline-block rounded-lg bg-primary-gradient px-2 py-0.5 text-xs font-bold text-white">
                  {data.discount_value || 'DISCOUNT'}
                </span>
                <p className="mt-2 font-display text-sm font-bold leading-tight">{data.title || 'Offer title'}</p>
                <p className="text-xs text-muted-foreground">{data.city || 'City'}</p>
              </div>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-5">
            <div className="flex flex-col gap-2">
              <Button className="btn-shine bg-primary-gradient" onClick={() => handleSave(false)} disabled={saving}>
                <Save className="mr-2 h-4 w-4" /> Save as Draft
              </Button>
              <Button className="btn-shine bg-accent-gradient text-white" onClick={() => handleSave(true)} disabled={saving}>
                <Send className="mr-2 h-4 w-4" /> {saving ? 'Publishing...' : 'Publish Offer'}
              </Button>
              {data.id && data.status === 'published' && (
                <Button variant="outline" onClick={() => handleSave(false)} disabled={saving}>
                  <Archive className="mr-2 h-4 w-4" /> Archive
                </Button>
              )}
            </div>
          </div>
        </div>
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
