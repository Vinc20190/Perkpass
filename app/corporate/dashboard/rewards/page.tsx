'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Gift, Plus, Search, Edit2, Trash2, X, Loader2, AlertCircle,
  MoreVertical, Package, TrendingUp, Clock,
} from 'lucide-react';
import { useAuth } from '@/lib/auth/context';
import { useCompany } from '@/lib/company/context';
import { supabase } from '@/lib/supabase/client';
import { DashboardSidebar, DashboardTopBar } from '@/components/dashboard/sidebar';
import { formatCents, formatDate } from '@/lib/utils';
import { FileUpload } from '@/components/ui/file-upload';
import type { RewardCatalogItem } from '@/lib/types';

const CATEGORIES = [
  'food', 'coffee', 'transport', 'gift_cards', 'shopping', 'gym',
  'health', 'education', 'entertainment', 'travel', 'hotels', 'fuel',
  'bonus', 'wellness', 'custom',
];

const CATEGORY_LABELS: Record<string, string> = {
  food: 'Food', coffee: 'Coffee', transport: 'Transport', gift_cards: 'Gift Cards',
  shopping: 'Shopping', gym: 'Gym', health: 'Health', education: 'Education',
  entertainment: 'Entertainment', travel: 'Travel', hotels: 'Hotels', fuel: 'Fuel',
  bonus: 'Bonus', wellness: 'Wellness', custom: 'Custom',
};

export default function RewardsPage() {
  const { user, loading: authLoading } = useAuth();
  const { company } = useCompany();
  const router = useRouter();
  const [rewards, setRewards] = useState<RewardCatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<RewardCatalogItem | null>(null);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
  }, [authLoading, user, router]);

  const loadRewards = useCallback(async () => {
    if (!company) return;
    setLoading(true);
    const { data } = await supabase
      .from('rewards_catalog')
      .select('*')
      .eq('company_id', company.id)
      .order('created_at', { ascending: false });
    setRewards((data as RewardCatalogItem[]) ?? []);
    setLoading(false);
  }, [company]);

  useEffect(() => { loadRewards(); }, [loadRewards]);

  const filtered = rewards.filter((r) => {
    if (search) {
      const q = search.toLowerCase();
      if (!r.name.toLowerCase().includes(q) && !(r.description ?? '').toLowerCase().includes(q)) return false;
    }
    if (catFilter !== 'all' && r.category !== catFilter) return false;
    return true;
  });

  const handleSave = async (data: Partial<RewardCatalogItem>) => {
    if (!company) return;
    setSaving(true);
    setError(null);

    const valueCents = Math.round((data.value_cents ?? 0));

    if (editing) {
      const { error } = await supabase.from('rewards_catalog').update({
        name: data.name,
        description: data.description,
        image_url: data.image_url,
        category: data.category,
        value_cents: valueCents,
        expires_at: data.expires_at,
        conditions: data.conditions,
        stock: data.stock,
        status: data.status,
      }).eq('id', editing.id);
      if (error) setError(error.message);
    } else {
      const { error } = await supabase.from('rewards_catalog').insert({
        company_id: company.id,
        name: data.name,
        description: data.description,
        image_url: data.image_url,
        category: data.category ?? 'custom',
        value_cents: valueCents,
        currency_code: company.currency_code,
        expires_at: data.expires_at,
        conditions: data.conditions,
        stock: data.stock,
        status: data.status ?? 'active',
      });
      if (error) setError(error.message);
    }

    setSaving(false);
    if (!error) { setModalOpen(false); setEditing(null); loadRewards(); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this reward? Assigned rewards will also be removed.')) return;
    const { error } = await supabase.from('rewards_catalog').delete().eq('id', id);
    if (error) setError(error.message); else loadRewards();
    setMenuOpen(null);
  };

  if (authLoading) return <div className="grid min-h-screen place-items-center bg-background"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (!user) return null;
  if (!company) return null;

  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar />
      <div className="lg:pl-64">
        <div className="mx-auto max-w-7xl px-4 pt-20 pb-10 sm:px-6 lg:px-8 lg:pt-10">
          <DashboardTopBar
            title="Rewards Catalog"
            subtitle={`${rewards.length} ${rewards.length === 1 ? 'reward' : 'rewards'} in your library`}
            actions={
              <button
                onClick={() => { setEditing(null); setModalOpen(true); }}
                className="inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-glow transition-colors hover:bg-primary-hover"
              >
                <Plus className="h-4 w-4" /> Add Reward
              </button>
            }
          />

          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" /> {error}
              <button onClick={() => setError(null)} className="ml-auto"><X className="h-4 w-4" /></button>
            </div>
          )}

          <div className="mb-5 flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search rewards..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-10 w-full rounded-xl border border-input bg-card pl-11 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <select
              value={catFilter}
              onChange={(e) => setCatFilter(e.target.value)}
              className="h-10 rounded-xl border border-input bg-card px-3 text-sm focus:border-primary focus:outline-none"
            >
              <option value="all">All categories</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>)}
            </select>
          </div>

          {loading ? (
            <div className="grid place-items-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          ) : filtered.length === 0 ? (
            <div className="grid place-items-center rounded-2xl border border-border bg-card py-20 text-center">
              <Gift className="mb-3 h-12 w-12 text-muted-foreground/30" />
              <p className="font-semibold text-foreground">No rewards yet</p>
              <p className="text-sm text-muted-foreground">Create your first reward to start assigning to employees.</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filtered.map((reward, i) => (
                <motion.div
                  key={reward.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-premium transition-shadow hover:shadow-lg"
                >
                  <div className="relative aspect-video overflow-hidden bg-muted">
                    {reward.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={reward.image_url} alt={reward.name} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                    ) : (
                      <div className="grid h-full place-items-center">
                        <Gift className="h-10 w-10 text-muted-foreground/30" />
                      </div>
                    )}
                    <span className={`absolute right-2 top-2 rounded-full px-2.5 py-1 text-xs font-bold ${
                      reward.status === 'active' ? 'bg-success text-white' : 'bg-muted text-muted-foreground'
                    }`}>{reward.status}</span>
                  </div>

                  <div className="flex flex-1 flex-col p-4">
                    <div className="flex items-center justify-between">
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold capitalize text-primary">
                        {CATEGORY_LABELS[reward.category] ?? reward.category}
                      </span>
                      <span className="text-xs text-muted-foreground">{reward.stock !== null ? `${reward.stock} in stock` : 'Unlimited'}</span>
                    </div>
                    <h3 className="mt-2 font-display text-base font-bold text-foreground">{reward.name}</h3>
                    {reward.description && <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{reward.description}</p>}

                    <div className="mt-3 space-y-1.5 text-xs text-muted-foreground">
                      <p className="flex items-center gap-1.5"><Package className="h-3.5 w-3.5" /> Value: <span className="font-bold text-foreground">{formatCents(reward.value_cents, reward.currency_code)}</span></p>
                      {reward.expires_at && <p className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> Expires {formatDate(reward.expires_at)}</p>}
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <TrendingUp className="h-3.5 w-3.5" /> {reward.status === 'active' ? 'Available' : 'Inactive'}
                      </span>
                      <div className="relative">
                        <button
                          onClick={() => setMenuOpen(menuOpen === reward.id ? null : reward.id)}
                          className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground hover:bg-muted"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>
                        <AnimatePresence>
                          {menuOpen === reward.id && (
                            <>
                              <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(null)} />
                              <motion.div
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 8 }}
                                className="absolute right-0 top-full z-50 mt-1 w-40 rounded-xl border border-border bg-card p-1.5 shadow-xl"
                              >
                                <button onClick={() => { setEditing(reward); setModalOpen(true); setMenuOpen(null); }} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-foreground hover:bg-muted">
                                  <Edit2 className="h-4 w-4" /> Edit
                                </button>
                                <button onClick={() => handleDelete(reward.id)} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-destructive hover:bg-destructive/10">
                                  <Trash2 className="h-4 w-4" /> Delete
                                </button>
                              </motion.div>
                            </>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      <RewardModal
        open={modalOpen}
        editing={editing}
        currencyCode={company.currency_code}
        companyId={company.id}
        saving={saving}
        error={error}
        onClose={() => { setModalOpen(false); setEditing(null); setError(null); }}
        onSave={handleSave}
      />
    </div>
  );
}

function RewardModal({
  open, editing, currencyCode, companyId, saving, error, onClose, onSave,
}: {
  open: boolean;
  editing: RewardCatalogItem | null;
  currencyCode: string;
  companyId: string;
  saving: boolean;
  error: string | null;
  onClose: () => void;
  onSave: (data: Partial<RewardCatalogItem>) => void;
}) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imagePath, setImagePath] = useState('');
  const [category, setCategory] = useState('custom');
  const [valueUsd, setValueUsd] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [conditions, setConditions] = useState('');
  const [stock, setStock] = useState('');
  const [status, setStatus] = useState<RewardCatalogItem['status']>('active');

  useEffect(() => {
    if (editing) {
      setName(editing.name);
      setDescription(editing.description ?? '');
      setImageUrl(editing.image_url ?? '');
      setCategory(editing.category);
      setValueUsd(String(editing.value_cents / 100));
      setExpiresAt(editing.expires_at ? editing.expires_at.slice(0, 10) : '');
      setConditions(editing.conditions ?? '');
      setStock(editing.stock !== null ? String(editing.stock) : '');
      setStatus(editing.status);
    } else {
      setName(''); setDescription(''); setImageUrl(''); setCategory('custom');
      setValueUsd(''); setExpiresAt(''); setConditions(''); setStock(''); setStatus('active');
    }
  }, [editing, open]);

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-border bg-card p-6 shadow-xl"
        >
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-extrabold text-foreground">{editing ? 'Edit Reward' : 'Add Reward'}</h2>
            <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-lg hover:bg-muted"><X className="h-5 w-5" /></button>
          </div>

          {error && (
            <div className="mt-4 flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" /> {error}
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              onSave({
                name, description: description || null, image_url: imageUrl || null,
                category, value_cents: Math.round((parseFloat(valueUsd) || 0) * 100),
                expires_at: expiresAt ? new Date(expiresAt).toISOString() : null,
                conditions: conditions || null, stock: stock ? parseInt(stock) : null, status,
              });
            }}
            className="mt-5 space-y-4"
          >
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-foreground">Reward name <span className="text-primary">*</span></label>
              <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className={inputCls} placeholder="Coffee Voucher" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-foreground">Description</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className={inputCls} placeholder="A free coffee at any partner cafe" />
            </div>
            <FileUpload
              bucket="reward-images"
              folderId={companyId}
              value={imageUrl}
              onChange={(url) => setImageUrl(url)}
              path={imagePath}
              onPathChange={(p) => setImagePath(p)}
              label="Reward Image"
              hint="JPG, PNG, WebP up to 5MB"
              maxSizeMB={5}
            />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-foreground">Category</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)} className={inputCls}>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-foreground">Value ({currencyCode})</label>
                <input type="number" step="0.01" min="0" value={valueUsd} onChange={(e) => setValueUsd(e.target.value)} className={inputCls} placeholder="10.00" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-foreground">Stock (leave empty = unlimited)</label>
                <input type="number" min="0" value={stock} onChange={(e) => setStock(e.target.value)} className={inputCls} placeholder="100" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-foreground">Status</label>
                <select value={status} onChange={(e) => setStatus(e.target.value as RewardCatalogItem['status'])} className={inputCls}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-foreground">Expiry date</label>
              <input type="date" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-foreground">Conditions</label>
              <textarea value={conditions} onChange={(e) => setConditions(e.target.value)} rows={2} className={inputCls} placeholder="Valid weekdays only. One per visit." />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={onClose} className="h-11 rounded-xl border border-border px-5 font-semibold text-foreground hover:bg-muted">Cancel</button>
              <button type="submit" disabled={saving} className="inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-5 font-semibold text-primary-foreground shadow-glow hover:bg-primary-hover disabled:opacity-60">
                {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : editing ? 'Save changes' : 'Add reward'}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

const inputCls = 'h-11 w-full rounded-xl border border-input bg-card px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20';
