'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { useI18n } from '@/lib/i18n/context';
import { FAQ_ITEMS } from '@/lib/data/home';

function FAQRow({ item, index }: { item: typeof FAQ_ITEMS[number]; index: number }) {
  const [open, setOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
      className="overflow-hidden rounded-2xl border border-border bg-card shadow-premium"
    >
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-4 p-5 text-left"
        aria-expanded={open}
      >
        <span className="font-display text-base font-bold text-foreground">{item.q}</span>
        <ChevronDown className={`h-5 w-5 shrink-0 text-primary transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <p className="px-5 pb-5 text-sm leading-relaxed text-muted-foreground">{item.a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function FAQSection() {
  const { t } = useI18n();

  return (
    <section className="py-20 sm:py-24">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h2 className="font-display text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            {t('section.faq.title')}
          </h2>
          <p className="mt-3 text-lg text-muted-foreground">{t('section.faq.subtitle')}</p>
        </motion.div>

        <div className="mt-10 space-y-3">
          {FAQ_ITEMS.map((item, i) => (
            <FAQRow key={i} item={item} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
