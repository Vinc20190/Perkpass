'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, AlertCircle, LogIn } from 'lucide-react';
import Link from 'next/link';
import { VendorForm, type VendorFormData } from '@/components/ui/vendor-form';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth/context';
import { supabase } from '@/lib/supabase/client';

export default function VendorRegisterPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (data: VendorFormData) => {
    setSubmitError(null);
    if (!user) {
      router.push('/login?redirect=/vendor/register');
      return;
    }

    const { error } = await supabase
      .from('vendor_applications')
      .insert({
        user_id: user.id,
        business_name: data.business_name,
        contact_name: data.contact_name,
        email: data.email,
        phone: data.phone,
        business_type: data.business_type,
        country_id: data.country_id,
        city: data.city,
        address: data.address || null,
        website: data.website || null,
        description: data.description || null,
        logo_url: data.logo_url || null,
        license_url: data.license_url || null,
        gallery_urls: data.gallery_urls,
        status: 'pending',
      });

    if (error) {
      setSubmitError(error.message);
      return;
    }

    setSubmitted(true);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="h-16" />
        <div className="mx-auto max-w-md px-4 py-20 text-center">
          <div className="glass-card rounded-3xl p-8">
            <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-primary/10">
              <LogIn className="h-8 w-8 text-primary" />
            </div>
            <h1 className="font-display text-xl font-bold">Sign in to Continue</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              You need an account to submit a vendor application. Please log in or create an account.
            </p>
            <div className="mt-6 flex flex-col gap-2">
              <Link href="/login?redirect=/vendor/register">
                <Button className="btn-shine w-full bg-primary-gradient">Log In</Button>
              </Link>
              <Link href="/signup?redirect=/vendor/register">
                <Button variant="outline" className="w-full">Create Account</Button>
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="h-16" />
        <div className="mx-auto max-w-md px-4 py-20 text-center">
          <div className="glass-card rounded-3xl p-8">
            <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-success/10">
              <CheckCircle2 className="h-8 w-8 text-success" />
            </div>
            <h1 className="font-display text-xl font-bold">Application Submitted!</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Your vendor application has been received. Our team will review it within 2-3 business days.
            </p>
            <Link href="/vendor/status" className="mt-6 inline-block">
              <Button className="btn-shine bg-primary-gradient">Track Application Status</Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="h-16" />
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <Breadcrumbs items={[
          { label: 'Vendor', href: '/vendor' },
          { label: 'Register' },
        ]} />
        <div className="mt-6 mb-8">
          <h1 className="font-display text-3xl font-extrabold tracking-tight">Vendor Application</h1>
          <p className="mt-2 text-muted-foreground">Complete the form below to apply as a PerkPass vendor partner.</p>
        </div>

        {submitError && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm font-medium text-destructive">
            <AlertCircle className="h-5 w-5 shrink-0" />
            {submitError}
          </div>
        )}

        <VendorForm onSubmit={handleSubmit} />
      </div>
      <Footer />
    </div>
  );
}
