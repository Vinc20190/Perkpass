'use client';

import { Twitter, Linkedin, Instagram, Facebook, Send } from 'lucide-react';
import Link from 'next/link';
import { useI18n } from '@/lib/i18n/context';
import { Logo } from '@/components/brand/logo';

const FOOTER_LINKS: { titleKey: string; links: { labelKey: string; href: string }[] }[] = [
  {
    titleKey: 'footer.product',
    links: [
      { labelKey: 'nav.pricing', href: '/pricing' },
      { labelKey: 'nav.partners', href: '/partners' },
      { labelKey: 'nav.cities', href: '/cities' },
      { labelKey: 'nav.categories', href: '/categories' },
      { labelKey: 'nav.business', href: '/business' },
    ],
  },
  {
    titleKey: 'footer.company',
    links: [
      { labelKey: 'nav.about', href: '/about' },
      { labelKey: 'footer.careers', href: '/careers' },
      { labelKey: 'footer.blog', href: '/blog' },
      { labelKey: 'footer.contact', href: '/contact' },
      { labelKey: 'footer.affiliate', href: '/affiliate' },
    ],
  },
  {
    titleKey: 'footer.resources',
    links: [
      { labelKey: 'footer.help', href: '/help' },
      { labelKey: 'footer.faq', href: '/faq' },
      { labelKey: 'footer.referral', href: '/referral' },
      { labelKey: 'nav.countries', href: '/countries' },
    ],
  },
  {
    titleKey: 'footer.legal',
    links: [
      { labelKey: 'footer.terms', href: '/terms' },
      { labelKey: 'footer.privacy', href: '/privacy' },
      { labelKey: 'footer.cookies', href: '/cookies' },
    ],
  },
];

const SOCIAL = [
  { icon: Twitter, href: '#', label: 'Twitter' },
  { icon: Linkedin, href: '#', label: 'LinkedIn' },
  { icon: Instagram, href: '#', label: 'Instagram' },
  { icon: Facebook, href: '#', label: 'Facebook' },
];

export function Footer() {
  const { t } = useI18n();

  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        {/* Newsletter */}
        <div className="rounded-2xl bg-gradient-to-br from-primary to-primary-hover p-8 text-white shadow-glow sm:p-10">
          <div className="grid items-center gap-6 lg:grid-cols-2">
            <div>
              <h3 className="font-display text-2xl font-extrabold">Get exclusive offers first</h3>
              <p className="mt-2 text-white/80">Join our newsletter for early access to premium deals and new city launches.</p>
            </div>
            <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="your@email.com"
                className="h-12 flex-1 rounded-xl border-0 bg-white/15 px-4 text-white placeholder:text-white/60 backdrop-blur focus:outline-none focus:ring-2 focus:ring-white/40"
              />
              <button type="submit" className="inline-flex h-12 items-center gap-2 rounded-xl bg-foreground px-5 font-semibold text-white transition-transform hover:scale-105">
                <Send className="h-4 w-4" /> Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Links */}
        <div className="mt-12 grid grid-cols-2 gap-8 md:grid-cols-3 lg:grid-cols-6">
          <div className="col-span-2">
            <Logo size="sm" />
            <p className="mt-4 max-w-xs text-sm text-muted-foreground">
              Africa's lifestyle membership. One pass, unlimited benefits across 54 countries.
            </p>
            <div className="mt-5 flex gap-2">
              {SOCIAL.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  className="grid h-9 w-9 place-items-center rounded-lg border border-border text-muted-foreground transition-colors hover:border-secondary hover:text-secondary"
                >
                  <s.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {FOOTER_LINKS.map((col) => (
            <div key={col.titleKey}>
              <p className="text-sm font-bold text-foreground">{t(col.titleKey as never)}</p>
              <ul className="mt-3 space-y-2">
                {col.links.map((l) => (
                  <li key={l.labelKey}>
                    <Link href={l.href} className="text-sm text-muted-foreground transition-colors hover:text-primary">
                      {t(l.labelKey as never)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-6 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} PerkPass. {t('footer.rights')}
          </p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-success" /> All systems operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
