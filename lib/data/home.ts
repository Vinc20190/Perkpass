export interface Category {
  id: string;
  name: string;
  icon: string;
  count: number;
  gradient: string;
  image: string;
}

export const CATEGORIES: Category[] = [
  { id: 'dining', name: 'Dining', icon: 'UtensilsCrossed', count: 1240, gradient: 'from-orange-400 to-red-500', image: 'https://images.pexels.com/photos/958545/pexels-photo-958545.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { id: 'hotels', name: 'Hotels', icon: 'Hotel', count: 680, gradient: 'from-teal-400 to-cyan-500', image: 'https://images.pexels.com/photos/2029722/pexels-photo-2029722.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { id: 'travel', name: 'Travel', icon: 'Plane', count: 420, gradient: 'from-blue-400 to-indigo-500', image: 'https://images.pexels.com/photos/3601425/pexels-photo-3601425.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { id: 'spa', name: 'Spa', icon: 'Flower2', count: 340, gradient: 'from-pink-400 to-rose-500', image: 'https://images.pexels.com/photos/3997989/pexels-photo-3997989.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { id: 'beauty', name: 'Beauty', icon: 'Sparkles', count: 510, gradient: 'from-fuchsia-400 to-pink-500', image: 'https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { id: 'fitness', name: 'Fitness', icon: 'Dumbbell', count: 290, gradient: 'from-emerald-400 to-teal-500', image: 'https://images.pexels.com/photos/1954524/pexels-photo-1954524.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { id: 'healthcare', name: 'Healthcare', icon: 'HeartPulse', count: 180, gradient: 'from-red-400 to-rose-500', image: 'https://images.pexels.com/photos/3938022/pexels-photo-3938022.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { id: 'retail', name: 'Retail', icon: 'ShoppingBag', count: 980, gradient: 'from-amber-400 to-orange-500', image: 'https://images.pexels.com/photos/5650026/pexels-photo-5650026.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { id: 'entertainment', name: 'Entertainment', icon: 'Clapperboard', count: 360, gradient: 'from-violet-400 to-purple-500', image: 'https://images.pexels.com/photos/1190297/pexels-photo-1190297.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { id: 'family', name: 'Family', icon: 'Baby', count: 240, gradient: 'from-sky-400 to-blue-500', image: 'https://images.pexels.com/photos/8108045/pexels-photo-8108045.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { id: 'education', name: 'Education', icon: 'GraduationCap', count: 150, gradient: 'from-indigo-400 to-violet-500', image: 'https://images.pexels.com/photos/207692/pexels-photo-207692.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { id: 'transport', name: 'Transport', icon: 'Car', count: 210, gradient: 'from-slate-400 to-gray-500', image: 'https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { id: 'financial', name: 'Financial Services', icon: 'Landmark', count: 130, gradient: 'from-green-400 to-emerald-500', image: 'https://images.pexels.com/photos/356056/pexels-photo-356056.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { id: 'professional', name: 'Professional Services', icon: 'Briefcase', count: 170, gradient: 'from-cyan-400 to-teal-500', image: 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=600' },
];

export interface FeaturedOffer {
  id: string;
  title: string;
  partner: string;
  city: string;
  country: string;
  flag: string;
  category: string;
  discount: string;
  type: 'discount' | 'bogo';
  rating: number;
  reviews: number;
  image: string;
  expiry: string;
  distance: string;
  priceUsd: number;
}

export const FEATURED_OFFERS: FeaturedOffer[] = [
  {
    id: '1',
    title: 'Buy One Get One — Fine Dining at Sky Restaurant',
    partner: 'Sky Restaurant',
    city: 'Lagos',
    country: 'Nigeria',
    flag: 'NG',
    category: 'Dining',
    discount: 'BOGO',
    type: 'bogo',
    rating: 4.9,
    reviews: 1280,
    image: 'https://images.pexels.com/photos/2611817/pexels-photo-2611817.jpeg?auto=compress&cs=tinysrgb&w=800',
    expiry: 'Dec 31, 2026',
    distance: '2.3 km',
    priceUsd: 45,
  },
  {
    id: '2',
    title: '40% Off Luxury Spa Day with Massage',
    partner: 'Serenity Spa & Wellness',
    city: 'Nairobi',
    country: 'Kenya',
    flag: 'KE',
    category: 'Spa',
    discount: '40% OFF',
    type: 'discount',
    rating: 4.8,
    reviews: 860,
    image: 'https://images.pexels.com/photos/3997989/pexels-photo-3997989.jpeg?auto=compress&cs=tinysrgb&w=800',
    expiry: 'Nov 30, 2026',
    distance: '5.1 km',
    priceUsd: 80,
  },
  {
    id: '3',
    title: '30% Off Weekend at 5-Star Beach Resort',
    partner: 'Palm Beach Resort',
    city: 'Cape Town',
    country: 'South Africa',
    flag: 'ZA',
    category: 'Hotels',
    discount: '30% OFF',
    type: 'discount',
    rating: 4.9,
    reviews: 2100,
    image: 'https://images.pexels.com/photos/1450363/pexels-photo-1450363.jpeg?auto=compress&cs=tinysrgb&w=800',
    expiry: 'Jan 15, 2027',
    distance: '12 km',
    priceUsd: 180,
  },
  {
    id: '4',
    title: '50% Off Safari Adventure for Two',
    partner: 'Wild Horizons Safaris',
    city: 'Kigali',
    country: 'Rwanda',
    flag: 'RW',
    category: 'Travel',
    discount: '50% OFF',
    type: 'discount',
    rating: 5.0,
    reviews: 540,
    image: 'https://images.pexels.com/photos/247502/pexels-photo-247502.jpeg?auto=compress&cs=tinysrgb&w=800',
    expiry: 'Mar 1, 2027',
    distance: '45 km',
    priceUsd: 120,
  },
  {
    id: '5',
    title: 'Free Coffee Every Morning — Monthly Pass',
    partner: 'Addis Brew House',
    city: 'Addis Ababa',
    country: 'Ethiopia',
    flag: 'ET',
    category: 'Dining',
    discount: 'FREE',
    type: 'bogo',
    rating: 4.7,
    reviews: 720,
    image: 'https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg?auto=compress&cs=tinysrgb&w=800',
    expiry: 'Dec 15, 2026',
    distance: '0.8 km',
    priceUsd: 25,
  },
  {
    id: '6',
    title: '25% Off Premium Fitness Membership',
    partner: 'Atlas Fitness Club',
    city: 'Cairo',
    country: 'Egypt',
    flag: 'EG',
    category: 'Fitness',
    discount: '25% OFF',
    type: 'discount',
    rating: 4.6,
    reviews: 980,
    image: 'https://images.pexels.com/photos/1954524/pexels-photo-1954524.jpeg?auto=compress&cs=tinysrgb&w=800',
    expiry: 'Feb 28, 2027',
    distance: '3.4 km',
    priceUsd: 60,
  },
];

export interface CityData {
  id: string;
  name: string;
  country: string;
  flag: string;
  offers: number;
  image: string;
}

export const CITIES: CityData[] = [
  { id: 'lagos', name: 'Lagos', country: 'Nigeria', flag: 'NG', offers: 845, image: 'https://images.pexels.com/photos/2827231/pexels-photo-2827231.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { id: 'nairobi', name: 'Nairobi', country: 'Kenya', flag: 'KE', offers: 612, image: 'https://images.pexels.com/photos/2096093/pexels-photo-2096093.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { id: 'capetown', name: 'Cape Town', country: 'South Africa', flag: 'ZA', offers: 730, image: 'https://images.pexels.com/photos/2387873/pexels-photo-2387873.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { id: 'cairo', name: 'Cairo', country: 'Egypt', flag: 'EG', offers: 540, image: 'https://images.pexels.com/photos/2092068/pexels-photo-2092068.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { id: 'accra', name: 'Accra', country: 'Ghana', flag: 'GH', offers: 420, image: 'https://images.pexels.com/photos/3889704/pexels-photo-3889704.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { id: 'kigali', name: 'Kigali', country: 'Rwanda', flag: 'RW', offers: 280, image: 'https://images.pexels.com/photos/1019577/pexels-photo-1019577.jpeg?auto=compress&cs=tinysrgb&w=600' },
];

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  city: string;
  country: string;
  flag: string;
  avatar: string;
  quote: string;
  rating: number;
}

export const TESTIMONIALS: Testimonial[] = [
  {
    id: '1',
    name: 'Amara Okafor',
    role: 'Product Manager',
    city: 'Lagos',
    country: 'Nigeria',
    flag: 'NG',
    avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=200',
    quote: "PerkPass completely changed how I experience my city. I've saved more in three months than I ever thought possible on dining and wellness.",
    rating: 5,
  },
  {
    id: '2',
    name: 'Kwame Mensah',
    role: 'Software Engineer',
    city: 'Accra',
    country: 'Ghana',
    flag: 'GH',
    avatar: 'https://images.pexels.com/photos/3777943/pexels-photo-3777943.jpeg?auto=compress&cs=tinysrgb&w=200',
    quote: 'The exclusivity of the offers is unreal. Premium experiences I never thought I could access are now part of my regular life.',
    rating: 5,
  },
  {
    id: '3',
    name: 'Fatima Zahra',
    role: 'Marketing Director',
    city: 'Cairo',
    country: 'Egypt',
    flag: 'EG',
    avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=200',
    quote: 'As a business owner, the corporate benefits platform has transformed how we reward our team. The analytics dashboard is brilliant.',
    rating: 5,
  },
  {
    id: '4',
    name: 'Thabo Nkosi',
    role: 'Operations Lead',
    city: 'Cape Town',
    country: 'South Africa',
    flag: 'ZA',
    avatar: 'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=200',
    quote: 'Travel and hotel deals across Southern Africa are unmatched. PerkPass pays for itself with a single weekend getaway.',
    rating: 5,
  },
];

export interface PartnerLogo {
  name: string;
  icon: string;
}

export const PARTNER_LOGOS: PartnerLogo[] = [
  { name: 'SkyRestaurant', icon: 'UtensilsCrossed' },
  { name: 'PalmResorts', icon: 'Palmtree' },
  { name: 'AtlasFitness', icon: 'Dumbbell' },
  { name: 'SerenitySpa', icon: 'Flower2' },
  { name: 'AddisBrew', icon: 'Coffee' },
  { name: 'WildHorizons', icon: 'Mountain' },
  { name: 'CapeRetail', icon: 'ShoppingBag' },
  { name: 'NileBank', icon: 'Landmark' },
];

export interface PricingPlan {
  id: string;
  name: string;
  monthlyUsd: number;
  yearlyUsd: number;
  popular?: boolean;
  tagline: string;
  features: string[];
  ctaKey: 'pricing.cta.free' | 'pricing.cta.premium' | 'pricing.cta.family' | 'pricing.cta.enterprise';
}

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'free',
    name: 'Starter',
    monthlyUsd: 0,
    yearlyUsd: 0,
    tagline: 'Try PerkPass risk-free',
    features: [
      '10 offers per month',
      '1 city location',
      'Standard partner access',
      'Mobile app access',
      'Community support',
    ],
    ctaKey: 'pricing.cta.free',
  },
  {
    id: 'premium',
    name: 'Premium',
    monthlyUsd: 14,
    yearlyUsd: 134,
    popular: true,
    tagline: 'For individuals who want more',
    features: [
      'Unlimited offers',
      'All 54 countries',
      'Premium partner access',
      'Priority booking',
      'Exclusive experiences',
      'Travel deals & concierge',
      'Cancel anytime',
    ],
    ctaKey: 'pricing.cta.premium',
  },
  {
    id: 'family',
    name: 'Family',
    monthlyUsd: 24,
    yearlyUsd: 230,
    tagline: 'Share the benefits with loved ones',
    features: [
      'Everything in Premium',
      'Up to 5 family members',
      'Family-friendly experiences',
      'Shared wallet & favorites',
      'Kid-safe content filter',
    ],
    ctaKey: 'pricing.cta.family',
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    monthlyUsd: 0,
    yearlyUsd: 0,
    tagline: 'Custom rewards for your team',
    features: [
      'Employee benefits platform',
      'Unlimited employees',
      'Custom reward catalog',
      'Real-time analytics',
      'Multi-country budgets',
      'Dedicated account manager',
      'API & integrations',
    ],
    ctaKey: 'pricing.cta.enterprise',
  },
];

export interface FAQItem {
  q: string;
  a: string;
}

export const FAQ_ITEMS: FAQItem[] = [
  {
    q: 'What is PerkPass?',
    a: "PerkPass is Africa's largest lifestyle membership platform. One membership gives you access to exclusive offers on dining, hotels, travel, fitness, beauty, and unique experiences across all 54 African countries.",
  },
  {
    q: 'How does the membership work?',
    a: 'Choose a plan, download the app, and browse thousands of premium offers. Redeem instantly with a tap or QR code at partner locations. Cancel anytime — no long-term contracts.',
  },
  {
    q: 'Which countries are supported?',
    a: 'We cover all 54 African countries, with the deepest partner networks in major cities like Lagos, Nairobi, Cape Town, Cairo, Accra, and Kigali. New cities are added every week.',
  },
  {
    q: 'Can I use PerkPass for my company?',
    a: 'Absolutely. Our Enterprise plan includes a full employee benefits platform with custom reward catalogs, real-time analytics, multi-country budgets, and dedicated support.',
  },
  {
    q: 'What payment methods do you accept?',
    a: 'We accept major credit cards, mobile money (M-Pesa, MTN MoMo, Airtel Money), and bank transfers. Pricing is displayed in USD with automatic conversion to your local currency.',
  },
  {
    q: 'How do I cancel my membership?',
    a: 'You can cancel anytime from your account settings. Your membership remains active until the end of your billing period. No fees, no questions asked.',
  },
];

export interface CountryHighlight {
  iso: string;
  name: string;
  region: string;
  flag: string;
  offers: number;
  priceUsd: number;
}

export const COUNTRY_HIGHLIGHTS: CountryHighlight[] = [
  { iso: 'NG', name: 'Nigeria', region: 'West Africa', flag: 'NG', offers: 845, priceUsd: 14 },
  { iso: 'KE', name: 'Kenya', region: 'East Africa', flag: 'KE', offers: 612, priceUsd: 14 },
  { iso: 'ZA', name: 'South Africa', region: 'Southern Africa', flag: 'ZA', offers: 730, priceUsd: 14 },
  { iso: 'EG', name: 'Egypt', region: 'North Africa', flag: 'EG', offers: 540, priceUsd: 14 },
  { iso: 'GH', name: 'Ghana', region: 'West Africa', flag: 'GH', offers: 420, priceUsd: 14 },
  { iso: 'MA', name: 'Morocco', region: 'North Africa', flag: 'MA', offers: 380, priceUsd: 14 },
  { iso: 'RW', name: 'Rwanda', region: 'East Africa', flag: 'RW', offers: 280, priceUsd: 14 },
  { iso: 'CI', name: "Côte d'Ivoire", region: 'West Africa', flag: 'CI', offers: 310, priceUsd: 14 },
];
