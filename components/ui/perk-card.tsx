'use client';

import { motion } from 'framer-motion';
import { Star, MapPin, Clock, Heart, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface PerkOffer {
  id: string;
  title: string;
  partner: string;
  city: string;
  country?: string;
  flag?: string;
  category: string;
  discount: string;
  type: 'discount' | 'bogo' | 'free';
  rating: number;
  reviews: number;
  image: string;
  expiry: string;
  distance?: string;
  priceUsd?: number;
  redeemed?: boolean;
}

interface PerkCardProps {
  offer: PerkOffer;
  variant?: 'compact' | 'detailed';
  index?: number;
  onRedeem?: (offer: PerkOffer) => void;
}

const typeStyles: Record<PerkOffer['type'], string> = {
  discount: 'bg-accent-gradient',
  bogo: 'bg-primary-gradient',
  free: 'bg-gradient-to-br from-emerald-400 to-teal-500',
};

export function PerkCard({ offer, variant = 'compact', index = 0, onRedeem }: PerkCardProps) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ delay: index * 0.06, duration: 0.5, type: 'spring', stiffness: 100, damping: 14 }}
      className={cn(
        'card-lift group relative overflow-hidden rounded-2xl border border-border bg-card shadow-card',
        variant === 'detailed' && 'sm:flex sm:flex-row'
      )}
    >
      {/* Image */}
      <div className={cn('relative overflow-hidden', variant === 'detailed' ? 'sm:w-72 sm:shrink-0' : '')}>
        <div className={cn('relative', variant === 'detailed' ? 'h-56 sm:h-full' : 'h-52')}>
          <img
            src={offer.image}
            alt={offer.title}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          {/* Discount badge */}
          <div className={cn(
            'absolute left-3 top-3 rounded-xl px-3 py-1.5 text-sm font-extrabold text-white shadow-lg',
            typeStyles[offer.type]
          )}>
            {offer.discount}
          </div>

          {/* Heart */}
          <button
            className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-xl bg-black/30 text-white backdrop-blur transition-all hover:scale-110 hover:bg-black/50"
            aria-label="Save offer"
          >
            <Heart className="h-5 w-5" />
          </button>

          {/* Category */}
          <span className="absolute bottom-3 left-3 rounded-lg bg-black/40 px-2.5 py-1 text-xs font-bold text-white backdrop-blur">
            {offer.category}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className={cn('flex flex-col p-5', variant === 'detailed' && 'sm:flex-1')}>
        <div className="mb-2 flex items-start justify-between gap-3">
          <div className="flex-1">
            <h3 className="font-display text-lg font-bold leading-tight transition-colors group-hover:text-primary">
              {offer.title}
            </h3>
            <p className="mt-0.5 text-sm font-medium text-muted-foreground">{offer.partner}</p>
          </div>
          <div className="flex shrink-0 items-center gap-1 rounded-lg bg-primary/10 px-2 py-1">
            <Star className="h-3.5 w-3.5 fill-primary text-primary" />
            <span className="text-sm font-bold text-primary">{offer.rating}</span>
            <span className="text-xs text-muted-foreground">({offer.reviews})</span>
          </div>
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            {offer.city}{offer.flag ? `, ${offer.flag}` : ''}
          </span>
          {offer.distance && (
            <span className="flex items-center gap-1">
              <TrendingUp className="h-4 w-4" />
              {offer.distance}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {offer.expiry}
          </span>
        </div>

        {variant === 'detailed' && (
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Enjoy an exclusive {offer.discount} experience at {offer.partner}. Valid for PerkPass members only.
            Present your QR code at the venue to redeem this offer.
          </p>
        )}

        <div className="mt-auto pt-4">
          {offer.redeemed ? (
            <div className="flex items-center justify-center gap-2 rounded-xl bg-success/10 px-4 py-2.5 text-sm font-bold text-success">
              <Star className="h-4 w-4 fill-success text-success" />
              Redeemed
            </div>
          ) : (
            <button
              onClick={() => onRedeem?.(offer)}
              className="btn-shine flex w-full items-center justify-center gap-2 rounded-xl bg-primary-gradient px-4 py-2.5 font-bold text-white shadow-glow transition-transform hover:scale-[1.02]"
            >
              {offer.type === 'bogo' ? 'Redeem BOGO' : offer.type === 'free' ? 'Claim Free' : 'Redeem Offer'}
            </button>
          )}
        </div>
      </div>
    </motion.article>
  );
}

export function PerkCardGrid({
  offers,
  variant = 'compact',
  onRedeem,
}: {
  offers: PerkOffer[];
  variant?: 'compact' | 'detailed';
  onRedeem?: (offer: PerkOffer) => void;
}) {
  return (
    <div className={cn(
      'grid gap-6',
      variant === 'compact'
        ? 'sm:grid-cols-2 lg:grid-cols-3'
        : 'gap-6'
    )}>
      {offers.map((offer, i) => (
        <PerkCard key={offer.id} offer={offer} variant={variant} index={i} onRedeem={onRedeem} />
      ))}
    </div>
  );
}
