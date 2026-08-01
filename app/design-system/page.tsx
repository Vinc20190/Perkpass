'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles, Users, TrendingUp, Wallet, Search, Filter, Download,
  Check, AlertCircle, Info, X, QrCode, Clock, MapPin, Star,
  Bell, Crown, Award, Zap, Shield, ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { BadgeGrid, PointsDisplay, LevelBadge, type BadgeLevel } from '@/components/ui/gamification';
import { PerkCard, PerkCardGrid, type PerkOffer } from '@/components/ui/perk-card';
import { SectionHeading, PageHeader, StatCard, EmptyState } from '@/components/ui/primitives';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const sampleOffers: PerkOffer[] = [
  {
    id: '1',
    title: 'Buy One Get One — Fine Dining',
    partner: 'Sky Restaurant',
    city: 'Lagos',
    flag: 'NG',
    category: 'Dining',
    discount: 'BOGO',
    type: 'bogo',
    rating: 4.9,
    reviews: 1280,
    image: 'https://images.pexels.com/photos/2611817/pexels-photo-2611817.jpeg?auto=compress&cs=tinysrgb&w=800',
    expiry: 'Dec 31, 2026',
    distance: '2.3 km',
  },
  {
    id: '2',
    title: '40% Off Luxury Spa Day',
    partner: 'Serenity Spa',
    city: 'Nairobi',
    flag: 'KE',
    category: 'Spa',
    discount: '40% OFF',
    type: 'discount',
    rating: 4.8,
    reviews: 860,
    image: 'https://images.pexels.com/photos/3997989/pexels-photo-3997989.jpeg?auto=compress&cs=tinysrgb&w=800',
    expiry: 'Nov 30, 2026',
    distance: '5.1 km',
  },
  {
    id: '3',
    title: 'Free Coffee Every Morning',
    partner: 'Addis Brew House',
    city: 'Addis Ababa',
    flag: 'ET',
    category: 'Dining',
    discount: 'FREE',
    type: 'free',
    rating: 4.7,
    reviews: 720,
    image: 'https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg?auto=compress&cs=tinysrgb&w=800',
    expiry: 'Dec 15, 2026',
    distance: '0.8 km',
  },
];

const sampleBadges: BadgeLevel[] = [
  { id: '1', name: 'First Perk', description: 'Redeemed your first offer', icon: 'zap', color: 'pink', earned: true },
  { id: '2', name: 'Explorer', description: 'Tried 5 categories', icon: 'star', color: 'violet', earned: true },
  { id: '3', name: 'Saver', description: 'Saved $500+', icon: 'trending', color: 'green', earned: true },
  { id: '4', name: 'Loyal', description: 'Member for 6 months', icon: 'shield', color: 'silver', earned: true },
  { id: '5', name: 'VIP', description: 'Reached Gold tier', icon: 'crown', color: 'gold', earned: false, progress: 65 },
  { id: '6', name: 'Champion', description: 'Redeemed 50 offers', icon: 'award', color: 'bronze', earned: false, progress: 34 },
];

const tableRows = [
  { perk: 'Sky Restaurant BOGO', employee: 'Amara Okafor', status: 'Redeemed', date: 'Jan 12, 2026', value: '$45' },
  { perk: 'Serenity Spa 40% Off', employee: 'Kwame Mensah', status: 'Active', date: 'Jan 14, 2026', value: '$80' },
  { perk: 'Atlas Fitness 25% Off', employee: 'Fatima Zahra', status: 'Active', date: 'Jan 15, 2026', value: '$60' },
  { perk: 'Palm Beach Resort', employee: 'Thabo Nkosi', status: 'Expired', date: 'Jan 08, 2026', value: '$180' },
  { perk: 'Addis Brew Free Coffee', employee: 'Aisha Bello', status: 'Redeemed', date: 'Jan 16, 2026', value: '$25' },
];

export default function DesignSystemPage() {
  const [sliderValue, setSliderValue] = useState([50]);
  const [toggleState, setToggleState] = useState(true);

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky top pad for fixed header */}
      <div className="h-16" />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Breadcrumbs items={[{ label: 'Design System' }]} />
        <div className="mt-6">
          <PageHeader
            title="PerkPass Design System"
            subtitle="A modular, scalable component library for the PerkPass platform"
            icon={Sparkles}
            actions={
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" /> Export
              </Button>
            }
          />
        </div>

        {/* Color Palette */}
        <section className="mt-12">
          <SectionHeading eyebrow="Foundation" title="Color Palette" subtitle="The core colors that define PerkPass identity." />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {[
              { name: 'Deep Violet', hex: '#7B2CBF', className: 'bg-primary' },
              { name: 'Neon Purple', hex: '#C45BFF', className: 'bg-secondary' },
              { name: 'Punchy Pink', hex: '#FF66C4', className: 'bg-accent' },
              { name: 'Lavender', hex: '#F7E9FF', className: 'bg-lavender' },
              { name: 'Success', hex: '#22C55E', className: 'bg-success' },
              { name: 'Warning', hex: '#F59E0B', className: 'bg-warning' },
            ].map((c) => (
              <Card key={c.name} className="card-lift overflow-hidden">
                <div className={`h-24 ${c.className}`} />
                <CardContent className="p-4">
                  <p className="font-display text-sm font-bold">{c.name}</p>
                  <p className="text-xs text-muted-foreground">{c.hex}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Typography */}
        <section className="mt-16">
          <SectionHeading eyebrow="Foundation" title="Typography" subtitle="Montserrat — clean, modern, highly legible." />
          <Card className="glass-card p-8">
            <div className="space-y-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Display / H1</p>
                <p className="font-display text-5xl font-extrabold tracking-tight">Unlock More. Spend Less.</p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Heading / H2</p>
                <p className="font-display text-3xl font-bold">Premium Perks for Everyone</p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Body / Paragraph</p>
                <p className="text-base leading-relaxed text-muted-foreground">
                  One membership for dining, hotels, travel, fitness, beauty and exclusive experiences
                  across all 54 African countries. PerkPass gives you premium access at your fingertips.
                </p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Caption / Small</p>
                <p className="text-sm text-muted-foreground">Terms apply. Offers subject to availability.</p>
              </div>
            </div>
          </Card>
        </section>

        {/* Buttons */}
        <section className="mt-16">
          <SectionHeading eyebrow="Components" title="Buttons" subtitle="Four variants with micro-interactions." />
          <Card className="glass-card p-8">
            <div className="flex flex-wrap items-center gap-4">
              <Button className="btn-shine bg-primary-gradient shadow-glow hover:scale-105">Primary</Button>
              <Button variant="secondary" className="bg-accent-gradient text-white shadow-glow-pink hover:scale-105">Secondary</Button>
              <Button variant="outline">Ghost</Button>
              <Button variant="destructive">Danger</Button>
              <Button variant="ghost">Ghost Link</Button>
              <Button variant="link">Link</Button>
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-4">
              <Button size="sm" className="btn-shine bg-primary-gradient">Small</Button>
              <Button className="btn-shine bg-primary-gradient">Default</Button>
              <Button size="lg" className="btn-shine bg-primary-gradient">Large</Button>
              <Button disabled>Disabled</Button>
              <Button className="btn-shine bg-primary-gradient">
                <Sparkles className="mr-2 h-4 w-4" /> With Icon
              </Button>
            </div>
          </Card>
        </section>

        {/* Badges */}
        <section className="mt-16">
          <SectionHeading eyebrow="Components" title="Badges & Tags" subtitle="Status indicators and category tags." />
          <Card className="glass-card p-8">
            <div className="flex flex-wrap items-center gap-3">
              <Badge>Default</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="outline">Outline</Badge>
              <Badge variant="destructive">Expired</Badge>
              <Badge className="bg-success/10 text-success">Active</Badge>
              <Badge className="bg-warning/10 text-warning">Pending</Badge>
              <Badge className="bg-primary-gradient text-white">Premium</Badge>
              <Badge className="bg-accent-gradient text-white">BOGO</Badge>
              <LevelBadge level="Gold Member" />
            </div>
          </Card>
        </section>

        {/* Cards — Perk showcase */}
        <section className="mt-16">
          <SectionHeading eyebrow="Components" title="Perk Cards" subtitle="Offer cards in compact and detailed variants." />
          <PerkCardGrid offers={sampleOffers} />
        </section>

        {/* Forms & Inputs */}
        <section className="mt-16">
          <SectionHeading eyebrow="Components" title="Inputs & Forms" subtitle="Premium minimalist form controls." />
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="glass-card p-6">
              <CardHeader className="px-0 pt-0">
                <CardTitle>Form Controls</CardTitle>
                <CardDescription>Text fields, toggles, sliders</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5 px-0">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" placeholder="Amara Okafor" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="amara@example.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="search">Search</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input id="search" className="pl-10" placeholder="Search offers..." />
                  </div>
                </div>
                <div className="flex items-center justify-between rounded-xl border border-border p-4">
                  <div>
                    <Label htmlFor="notifications">Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">Get alerted on new offers</p>
                  </div>
                  <Switch id="notifications" checked={toggleState} onCheckedChange={setToggleState} />
                </div>
                <div className="space-y-3">
                  <Label>Max Distance: {sliderValue[0]} km</Label>
                  <Slider value={sliderValue} onValueChange={setSliderValue} max={100} step={5} />
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card p-6">
              <CardHeader className="px-0 pt-0">
                <CardTitle>Validation States</CardTitle>
                <CardDescription>Clear error and success feedback</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5 px-0">
                <div className="space-y-2">
                  <Label htmlFor="valid">Username (Valid)</Label>
                  <Input id="valid" defaultValue="amara_o" className="border-success/50 focus-visible:ring-success/30" />
                  <p className="flex items-center gap-1.5 text-sm font-medium text-success">
                    <Check className="h-4 w-4" /> Username is available
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="invalid">Password (Error)</Label>
                  <Input id="invalid" type="password" defaultValue="123" className="border-destructive/50 focus-visible:ring-destructive/30" />
                  <p className="flex items-center gap-1.5 text-sm font-medium text-destructive">
                    <AlertCircle className="h-4 w-4" /> Password must be at least 8 characters
                  </p>
                </div>
                <div className="flex items-start gap-3 rounded-xl border border-border bg-muted/50 p-4">
                  <Info className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                  <p className="text-sm text-muted-foreground">
                    Password must contain at least one uppercase letter, one number, and one special character.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Modals / Dialogs */}
        <section className="mt-16">
          <SectionHeading eyebrow="Components" title="Modals" subtitle="Glassmorphism dialogs for QR codes and confirmations." />
          <div className="flex flex-wrap gap-4">
            <Dialog>
              <DialogTrigger asChild>
                <Button className="btn-shine bg-primary-gradient">
                  <QrCode className="mr-2 h-4 w-4" /> Open QR Modal
                </Button>
              </DialogTrigger>
              <DialogContent className="glass-card border-0">
                <DialogHeader>
                  <DialogTitle className="text-center font-display text-xl">Your Perk QR Code</DialogTitle>
                  <DialogDescription className="text-center">
                    Present this code at the venue to redeem your offer.
                  </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col items-center gap-4 py-4">
                  <div className="grid h-48 w-48 place-items-center rounded-2xl border-4 border-primary/20 bg-white">
                    <QrCode className="h-32 w-32 text-primary" />
                  </div>
                  <div className="text-center">
                    <p className="font-display text-lg font-bold">Sky Restaurant BOGO</p>
                    <p className="text-sm text-muted-foreground">Code: PP-X4F2-9K8L</p>
                  </div>
                  <div className="flex items-center gap-2 rounded-xl bg-warning/10 px-4 py-2 text-sm font-medium text-warning">
                    <Clock className="h-4 w-4" /> Expires in 23:45:12
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">Confirmation Dialog</Button>
              </DialogTrigger>
              <DialogContent className="glass-card border-0 sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Redeem this offer?</DialogTitle>
                  <DialogDescription>
                    This will use one of your monthly perk allowances. The QR code will be valid for 24 hours.
                  </DialogDescription>
                </DialogHeader>
                <div className="flex justify-end gap-3 pt-4">
                  <Button variant="outline">Cancel</Button>
                  <Button className="btn-shine bg-primary-gradient">Confirm Redeem</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </section>

        {/* Tables */}
        <section className="mt-16">
          <SectionHeading eyebrow="Components" title="Tables" subtitle="Sortable, filterable data tables for dashboards." />
          <Card className="glass-card overflow-hidden p-0">
            <div className="flex items-center justify-between border-b border-border p-4">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-semibold">Redemption History</span>
              </div>
              <Button variant="ghost" size="sm">
                <Download className="mr-2 h-4 w-4" /> Export
              </Button>
            </div>
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="font-bold">Perk</TableHead>
                  <TableHead className="font-bold">Employee</TableHead>
                  <TableHead className="font-bold">Status</TableHead>
                  <TableHead className="font-bold">Date</TableHead>
                  <TableHead className="text-right font-bold">Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tableRows.map((row) => (
                  <TableRow key={row.perk}>
                    <TableCell className="font-medium">{row.perk}</TableCell>
                    <TableCell>{row.employee}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          row.status === 'Redeemed' ? 'border-success/30 bg-success/10 text-success' :
                          row.status === 'Active' ? 'border-primary/30 bg-primary/10 text-primary' :
                          'border-destructive/30 bg-destructive/10 text-destructive'
                        }
                      >
                        {row.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{row.date}</TableCell>
                    <TableCell className="text-right font-bold">{row.value}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </section>

        {/* Gamification */}
        <section className="mt-16">
          <SectionHeading eyebrow="Components" title="Gamification" subtitle="Badges, points, and levels to drive engagement." />
          <div className="space-y-8">
            <PointsDisplay points={4250} level="Gold" nextLevelPoints={5000} />
            <div>
              <h3 className="mb-4 font-display text-lg font-bold">Achievement Badges</h3>
              <BadgeGrid badges={sampleBadges} />
            </div>
          </div>
        </section>

        {/* Stat Cards */}
        <section className="mt-16">
          <SectionHeading eyebrow="Components" title="Stat Cards" subtitle="Dashboard metrics at a glance." />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Active Members" value="250K+" icon={Users} trend={{ value: '12%', up: true }} index={0} />
            <StatCard label="Total Savings" value="$18M" icon={Wallet} trend={{ value: '8%', up: true }} index={1} />
            <StatCard label="Redemptions" value="84.2K" icon={TrendingUp} trend={{ value: '23%', up: true }} index={2} />
            <StatCard label="Churn Rate" value="2.1%" icon={X} trend={{ value: '0.3%', up: false }} index={3} />
          </div>
        </section>

        {/* Tabs */}
        <section className="mt-16">
          <SectionHeading eyebrow="Components" title="Tabs" subtitle="For sub-section navigation within pages." />
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="bg-muted">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="usage">Usage Metrics</TabsTrigger>
              <TabsTrigger value="satisfaction">Satisfaction</TabsTrigger>
              <TabsTrigger value="roi">ROI</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="mt-4">
              <Card className="glass-card p-6">
                <p className="text-sm text-muted-foreground">
                  Overview: A snapshot of your company's PerkPass activity — members, redemptions, and total savings.
                </p>
              </Card>
            </TabsContent>
            <TabsContent value="usage" className="mt-4">
              <Card className="glass-card p-6">
                <p className="text-sm text-muted-foreground">
                  Usage Metrics: Track which categories are most popular among your employees.
                </p>
              </Card>
            </TabsContent>
            <TabsContent value="satisfaction" className="mt-4">
              <Card className="glass-card p-6">
                <p className="text-sm text-muted-foreground">
                  Satisfaction: Employee satisfaction scores based on post-redemption surveys.
                </p>
              </Card>
            </TabsContent>
            <TabsContent value="roi" className="mt-4">
              <Card className="glass-card p-6">
                <p className="text-sm text-muted-foreground">
                  ROI: Compare spend on PerkPass vs. the value employees derive from redeemed offers.
                </p>
              </Card>
            </TabsContent>
          </Tabs>
        </section>

        {/* Empty State */}
        <section className="mt-16">
          <SectionHeading eyebrow="Components" title="Empty States" subtitle="Graceful fallbacks when there's no data." />
          <EmptyState
            icon={Sparkles}
            title="No perks redeemed yet"
            description="Once you start redeeming offers, your redemption history will appear here."
            action={{ label: 'Browse Offers', href: '/pricing' }}
          />
        </section>

        {/* Shadows & Effects */}
        <section className="mt-16">
          <SectionHeading eyebrow="Foundation" title="Shadows & Effects" subtitle="Premium depth and glassmorphism utilities." />
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            <div className="rounded-2xl bg-card p-8 text-center shadow-card">
              <p className="text-sm font-bold">Card Shadow</p>
            </div>
            <div className="rounded-2xl bg-card p-8 text-center shadow-premium">
              <p className="text-sm font-bold">Premium Shadow</p>
            </div>
            <div className="rounded-2xl bg-card p-8 text-center shadow-glow">
              <p className="text-sm font-bold">Glow Shadow</p>
            </div>
            <div className="glass-card rounded-2xl p-8 text-center">
              <p className="text-sm font-bold">Glass Card</p>
            </div>
          </div>
        </section>

        {/* UX Flows */}
        <section className="mt-16">
          <SectionHeading eyebrow="Flows" title="UX Flows" subtitle="Functional user journeys, not decorative." />
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="glass-card p-6">
              <CardHeader className="px-0 pt-0">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Sparkles className="h-5 w-5 text-primary" /> Flow 1: Discover a Perk
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 px-0">
                {['Home', 'Categories', 'Category → Offers', 'Offer → Details', 'Redeem → QR code', 'Confirmation'].map((step, i) => (
                  <div key={i} className="flex items-center gap-3 py-2">
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-primary-gradient text-xs font-bold text-white">
                      {i + 1}
                    </span>
                    <span className="text-sm font-medium">{step}</span>
                    {i < 5 && <ChevronRight className="ml-auto h-4 w-4 text-muted-foreground" />}
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="glass-card p-6">
              <CardHeader className="px-0 pt-0">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <TrendingUp className="h-5 w-5 text-primary" /> Flow 2: HR Analytics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 px-0">
                {['Login', 'HR Dashboard', 'Usage Metrics', 'Satisfaction', 'ROI', 'Export (if authorized)'].map((step, i) => (
                  <div key={i} className="flex items-center gap-3 py-2">
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-accent-gradient text-xs font-bold text-white">
                      {i + 1}
                    </span>
                    <span className="text-sm font-medium">{step}</span>
                    {i < 5 && <ChevronRight className="ml-auto h-4 w-4 text-muted-foreground" />}
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="glass-card p-6">
              <CardHeader className="px-0 pt-0">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Users className="h-5 w-5 text-primary" /> Flow 3: Partner → Create Offer
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 px-0">
                {['Partner Portal', 'Create Offer', 'Upload Images', 'Set Conditions', 'Publish', 'Preview'].map((step, i) => (
                  <div key={i} className="flex items-center gap-3 py-2">
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 text-xs font-bold text-white">
                      {i + 1}
                    </span>
                    <span className="text-sm font-medium">{step}</span>
                    {i < 5 && <ChevronRight className="ml-auto h-4 w-4 text-muted-foreground" />}
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="glass-card p-6">
              <CardHeader className="px-0 pt-0">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Shield className="h-5 w-5 text-primary" /> Flow 4: Admin Multi-Tenant
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 px-0">
                {['Admin Dashboard', 'Companies', 'Categories', 'Offers', 'Users', 'Analytics'].map((step, i) => (
                  <div key={i} className="flex items-center gap-3 py-2">
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 text-xs font-bold text-white">
                      {i + 1}
                    </span>
                    <span className="text-sm font-medium">{step}</span>
                    {i < 5 && <ChevronRight className="ml-auto h-4 w-4 text-muted-foreground" />}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Footer pad */}
        <div className="h-12" />
      </div>
    </div>
  );
}
