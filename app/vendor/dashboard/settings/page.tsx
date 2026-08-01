'use client';

import { useState, useEffect } from 'react';
import { Store, Save, Check } from 'lucide-react';
import { VendorDashboardLayout } from '@/components/vendor/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth/context';
import { supabase } from '@/lib/supabase/client';
import type { VendorApplication } from '@/lib/types';

export default function VendorSettingsPage() {
  const { user } = useAuth();
  const [app, setApp] = useState<VendorApplication | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    business_name: '',
    contact_name: '',
    email: '',
    phone: '',
    description: '',
    website: '',
    address: '',
  });

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from('vendor_applications')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'approved')
        .maybeSingle();

      if (data) {
        const va = data as VendorApplication;
        setApp(va);
        setForm({
          business_name: va.business_name,
          contact_name: va.contact_name,
          email: va.email,
          phone: va.phone,
          description: va.description ?? '',
          website: va.website ?? '',
          address: va.address ?? '',
        });
      }
    })();
  }, [user]);

  const handleSave = async () => {
    if (!app) return;
    setSaving(true);
    await supabase
      .from('vendor_applications')
      .update({
        business_name: form.business_name,
        contact_name: form.contact_name,
        email: form.email,
        phone: form.phone,
        description: form.description || null,
        website: form.website || null,
        address: form.address || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', app.id);

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <VendorDashboardLayout
      title="Settings"
      subtitle="Update your business profile and contact information."
      breadcrumbs={[{ label: 'Vendor', href: '/vendor' }, { label: 'Dashboard', href: '/vendor/dashboard' }, { label: 'Settings' }]}
    >
      <div className="space-y-6">
        <Card className="glass-card p-6">
          <CardHeader className="px-0 pt-0">
            <CardTitle className="flex items-center gap-2">
              <Store className="h-5 w-5 text-primary" /> Business Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 px-0">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="business_name">Business Name</Label>
                <Input id="business_name" value={form.business_name} onChange={(e) => setForm((f) => ({ ...f, business_name: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact_name">Contact Person</Label>
                <Input id="contact_name" value={form.contact_name} onChange={(e) => setForm((f) => ({ ...f, contact_name: e.target.value }))} />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input id="website" value={form.website} onChange={(e) => setForm((f) => ({ ...f, website: e.target.value }))} placeholder="https://yourbusiness.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input id="address" value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Business Description</Label>
              <Textarea id="description" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={3} />
            </div>
            <div className="flex items-center gap-3 pt-2">
              <Button className="btn-shine bg-primary-gradient" onClick={handleSave} disabled={saving}>
                <Save className="mr-2 h-4 w-4" /> {saving ? 'Saving...' : 'Save Changes'}
              </Button>
              {saved && (
                <span className="flex items-center gap-1.5 text-sm font-semibold text-success">
                  <Check className="h-4 w-4" /> Saved successfully
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </VendorDashboardLayout>
  );
}
