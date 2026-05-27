import { initialConfig } from 'config';

const testimonial = (index: number) =>
  `${initialConfig.assetsDir}/images/landing/testimonial/${index}.webp`;

export type PropertyProFeature = {
  title: string;
  description: string;
};

export const propertyProFeaturesData: PropertyProFeature[] = [
  {
    title: 'Visitor Management.',
    description:
      'Log, track, and manage every visitor with digital check-in/out, photo capture, and real-time gate activity.',
  },
  {
    title: 'Resident Portal.',
    description:
      'Give residents a self-service portal to pre-register guests, track deliveries, submit maintenance requests, and more.',
  },
  {
    title: 'Maintenance Requests.',
    description:
      'Residents submit issues online; staff triages, assigns, and resolves — all with a full status trail visible to both sides.',
  },
  {
    title: 'Parking & Vehicles.',
    description:
      'Issue vehicle access tags, log entries and exits by plate or tag scan, and maintain a complete parking history.',
  },
  {
    title: 'Parcel Tracking.',
    description:
      'Receive, notify, and manage deliveries for every unit. Residents are alerted when parcels arrive and can track collection.',
  },
  {
    title: 'Incident Reports.',
    description:
      'Security and management staff log incidents with severity, location, and parties involved — managers resolve and audit.',
  },
];

export type PropertyProTestimonial = {
  id: number;
  rating: number;
  review: string;
  name: string;
  company: string;
  img: string;
};

export const propertyProTestimonialData: PropertyProTestimonial[] = [
  {
    id: 0,
    rating: 5,
    review:
      'PropertyPro transformed how we manage our 300-unit complex. Visitor logs are instant, residents love the portal, and our team saves hours every week.',
    name: 'Sarah Okonkwo',
    company: 'Estate Manager, Highridge Gardens',
    img: testimonial(1),
  },
  {
    id: 1,
    rating: 5,
    review:
      'The maintenance request module alone was worth the switch. Residents submit, staff resolves, and everyone can see progress — no more lost WhatsApp messages.',
    name: 'David Mensah',
    company: 'Facilities Director, Zenith Towers',
    img: testimonial(2),
  },
  {
    id: 2,
    rating: 5,
    review:
      'Parcel tracking has completely eliminated the front-desk chaos. The system notifies residents automatically and keeps a clean log for disputes.',
    name: 'Amina Yusuf',
    company: 'Property Manager, Palm Court Estate',
    img: testimonial(3),
  },
  {
    id: 3,
    rating: 4,
    review:
      'Setting up took less than a day. The custom domain made it feel like our own product — residents think we built it in-house.',
    name: 'James Kariuki',
    company: 'COO, Greenfield Residences',
    img: testimonial(1),
  },
  {
    id: 4,
    rating: 5,
    review:
      'Real-time visitor logs and gate notifications have made our security team significantly more effective. Highly recommended for gated communities.',
    name: 'Fatima Al-Hassan',
    company: 'Security Lead, Coral Bay Estate',
    img: testimonial(2),
  },
];

export type PropertyProFAQ = {
  summary: string;
  details: string;
};

export const propertyProFaqData: PropertyProFAQ[] = [
  {
    summary: 'What is an organization code?',
    details:
      'Your organization code (also called a slug) is a short unique identifier for your property, e.g. "greenfield". It is used to access your tenant portal at propertypro.com/greenfield. SuperAdmins assign organization codes when setting up a new facility.',
  },
  {
    summary: 'How do I get my property set up?',
    details:
      'Contact us to create your account. We will provision your tenant, assign an organization code, and walk you through the setup wizard. Your portal is live within minutes — no technical work required.',
  },
  {
    summary: 'Can residents and staff access on mobile?',
    details:
      'Yes. PropertyPro is fully responsive and works on any device and browser. Staff can check in visitors from a phone at the gate; residents can pre-register guests or submit maintenance requests from the resident portal.',
  },
  {
    summary: 'What is included in the Professional plan?',
    details:
      'The Professional plan includes everything in Starter plus custom domain support (use your own branded URL), priority support, and advanced reporting. Existing customers are automatically grandfathered.',
  },
  {
    summary: 'Is visitor data secure?',
    details:
      'All data is isolated per tenant with multi-tenant database partitioning. Visitor photos and documents are stored in tenant-scoped directories. We apply security headers, rate limiting, and encryption at rest and in transit.',
  },
];
