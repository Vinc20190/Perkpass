'use client';

import { motion } from 'framer-motion';
import { Star, MapPin, Clock, Heart, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { useI18n } from '@/lib/i18n/context';
import { FEATURED_OFFERS } from '@/lib/data/home';

function OfferCard({ offer, index }: { offer: typeof FEATURED_OFFERS[number]; index: number }) {
  const [liked, setLiked] = useState(false);

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      whileHover={{ y: -8 }}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-premium transition-shadow hover:shadow-xl"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={offer.image}
          alt={offer.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        <span className={`absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-bold text-white shadow-md ${offer.type === 'bogo' ? 'bg-primary' : 'bg-secondary'}`}>
          {offer.discount}
        </span>
        <button
          onClick={() => setLiked((v) => !v)}
          aria-label="Save offer"
          className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-black/30 text-white backdrop-blur transition-colors hover:bg-black/50"
        >
          <Heart className={`h-4 w-4 ${liked ? 'fill-primary text-primary' : ''}`} />
        </button>
        <div className="absolute bottom-3 left-3 flex items-center gap-2 text-xs text-white">
          <span className="rounded-full bg-white/20 px-2 py-0.5 backdrop-blur">{offer.flag}</span>
          <span className="font-medium">{offer.city}</span>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wide text-secondary">{offer.category}</span>
          <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
            <Star className="h-3.5 w-3.5 fill-accent text-accent" />
            {offer.rating}
            <span className="text-muted-foreground/70">({offer.reviews})</span>
          </div>
        </div>

        <h3 className="mt-2 line-clamp-2 font-display text-base font-bold leading-snug text-foreground">
          {offer.title}
        </h3>

        <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{offer.distance}</span>
          <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{offer.expiry}</span>
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
          <div>
            <p className="text-xs text-muted-foreground">{offer.partner}</p>
            <p className="text-sm font-bold text-primary">Save up to {offer.discount}</p>
          </div>
          <button className="grid h-9 w-9 place-items-center rounded-full bg-primary text-primary-foreground transition-all hover:bg-primary-hover hover:shadow-glow">
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </motion.article>
  );
}

export function FeaturedOffers() {
  const { t } = useI18n();

  return (
    <section className="bg-muted/40 py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="font-display text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
              {t('section.featured.title')}
            </h2>
            <p className="mt-3 text-lg text-muted-foreground">{t('section.featured.subtitle')}</p>
          </motion.div>
          <button className="inline-flex items-center gap-1.5 font-semibold text-primary hover:text-primary-hover">
            {t('common.viewAll')}
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURED_OFFERS.map((offer, i) => (
            <OfferCard key={offer.id} offer={offer} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
