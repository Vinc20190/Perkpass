'use client';

import { useState } from 'react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, Check, MessageSquare } from 'lucide-react';
import { Spotlight } from '@/components/ui/spotlight';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => { setSent(true); setLoading(false); }, 800);
  };

  return (
    <>
      <Header />
      <main>
        <section className="spotlight-grid relative overflow-hidden bg-background bg-grid pt-28 pb-20 sm:pt-32">
          <Spotlight />
          <div className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-secondary/15 blur-3xl" />
          <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
            <motion.h1
              initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
              className="font-display text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl"
            >Get in touch</motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground"
            >Questions about membership, partnerships, or enterprise plans? We're here to help.</motion.p>
          </div>
        </section>

        <section className="py-20">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-8 lg:grid-cols-3">
              {/* Contact info */}
              <div className="space-y-4">
                {[
                  { icon: Mail, label: 'Email', value: 'hello@perkpass.africa' },
                  { icon: Phone, label: 'Phone', value: '+234 1 234 5678' },
                  { icon: MapPin, label: 'Office', value: 'Lagos, Nigeria · Nairobi, Kenya · Cape Town, SA' },
                ].map((item) => (
                  <div key={item.label} className="flex items-start gap-3 rounded-2xl border border-border bg-card p-5 shadow-premium">
                    <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary/10">
                      <item.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{item.label}</p>
                      <p className="text-sm text-muted-foreground">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Contact form */}
              <div className="lg:col-span-2">
                <div className="rounded-2xl border border-border bg-card p-6 shadow-premium">
                  {sent ? (
                    <div className="grid place-items-center py-12 text-center">
                      <div className="grid h-16 w-16 place-items-center rounded-full bg-success/15">
                        <Check className="h-8 w-8 text-success" />
                      </div>
                      <h3 className="mt-4 font-display text-xl font-bold text-foreground">Message sent!</h3>
                      <p className="mt-2 text-sm text-muted-foreground">We'll get back to you within 24 hours.</p>
                      <button onClick={() => setSent(false)} className="mt-6 rounded-xl border border-border px-5 py-2.5 font-semibold text-foreground hover:bg-muted">Send another</button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-5 w-5 text-primary" />
                        <h3 className="font-display text-lg font-bold text-foreground">Send us a message</h3>
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <input type="text" required placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} className="h-11 w-full rounded-xl border border-input bg-card px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />
                        <input type="email" required placeholder="Your email" value={email} onChange={(e) => setEmail(e.target.value)} className="h-11 w-full rounded-xl border border-input bg-card px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />
                      </div>
                      <input type="text" required placeholder="Subject" value={subject} onChange={(e) => setSubject(e.target.value)} className="h-11 w-full rounded-xl border border-input bg-card px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />
                      <textarea required rows={5} placeholder="Your message..." value={message} onChange={(e) => setMessage(e.target.value)} className="w-full rounded-xl border border-input bg-card px-3 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />
                      <button type="submit" disabled={loading} className="btn-shine inline-flex h-11 items-center gap-2 rounded-xl bg-secondary px-6 font-semibold text-secondary-foreground shadow-glow-gold transition-all hover:scale-[1.02] disabled:opacity-60">
                        {loading ? 'Sending...' : <><Send className="h-4 w-4" /> Send message</>}
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
