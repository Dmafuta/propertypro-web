import starterDark from 'assets/images/illustrations/22-dark.webp';
import starter from 'assets/images/illustrations/22.webp';
import proDark from 'assets/images/illustrations/23-dark.webp';
import pro from 'assets/images/illustrations/23.webp';
import saverDark from 'assets/images/illustrations/24-dark.webp';
import saver from 'assets/images/illustrations/24.webp';
import industryDark from 'assets/images/illustrations/25-dark.webp';
import industry from 'assets/images/illustrations/25.webp';

export interface Pricing {
  id: number;
  label?: string;
  image: {
    light: string;
    dark: string;
  };
  columnTitle: string;
  tableTitle: string;
  price: { monthly: number; yearly: number } | null;
  recommended?: boolean;
  features: {
    title: string;
    active: boolean;
  }[];
  tableFeatures?: {
    category: string;
    features: {
      id: number;
      title: string;
      active: boolean;
    }[];
  }[];
}

export const pricing: Pricing[] = [
  {
    id: 1,
    image: {
      light: starter.src,
      dark: starterDark.src,
    },
    columnTitle: "Pricing Starter",
    tableTitle: "Starter",
    price: null,
    features: [
      { title: "Visitor check-in & check-out", active: true },
      { title: "Resident portal", active: true },
      { title: "Maintenance requests", active: true },
      { title: "Parcel tracking", active: false },
      { title: "Custom domain", active: false },
      { title: "Advanced reports & CSV export", active: false },
      { title: "Priority support", active: false },
    ],
    tableFeatures: [
      {
        category: "Core Features",
        features: [
          { id: 1, title: "Visitor check-in & check-out", active: true },
          { id: 2, title: "Resident portal", active: true },
          { id: 3, title: "Maintenance requests", active: true },
        ],
      },
      {
        category: "Advanced Features",
        features: [
          { id: 1, title: "Parcel & delivery tracking", active: false },
          { id: 2, title: "Parking & vehicle tags", active: false },
          { id: 3, title: "Incident reports", active: false },
          { id: 4, title: "Advanced reports & CSV export", active: false },
        ],
      },
      {
        category: "Platform Features",
        features: [
          { id: 1, title: "Custom domain", active: false },
          { id: 2, title: "Priority support", active: false },
          { id: 3, title: "White-label branding", active: false },
          { id: 4, title: "Dedicated account manager", active: false },
        ],
      },
    ],
  },
  {
    id: 2,
    label: "Most popular",
    image: {
      light: pro.src,
      dark: proDark.src,
    },
    columnTitle: "Pricing Professional",
    tableTitle: "Professional",
    price: {
      monthly: 79,
      yearly: 790,
    },
    recommended: true,
    features: [
      { title: "Visitor check-in & check-out", active: true },
      { title: "Resident portal", active: true },
      { title: "Maintenance requests", active: true },
      { title: "Parcel tracking", active: true },
      { title: "Custom domain", active: true },
      { title: "Advanced reports & CSV export", active: true },
      { title: "Priority support", active: false },
    ],
    tableFeatures: [
      {
        category: "Core Features",
        features: [
          { id: 1, title: "Visitor check-in & check-out", active: true },
          { id: 2, title: "Resident portal", active: true },
          { id: 3, title: "Maintenance requests", active: true },
        ],
      },
      {
        category: "Advanced Features",
        features: [
          { id: 1, title: "Parcel & delivery tracking", active: true },
          { id: 2, title: "Parking & vehicle tags", active: true },
          { id: 3, title: "Incident reports", active: true },
          { id: 4, title: "Advanced reports & CSV export", active: true },
        ],
      },
      {
        category: "Platform Features",
        features: [
          { id: 1, title: "Custom domain", active: true },
          { id: 2, title: "Priority support", active: false },
          { id: 3, title: "White-label branding", active: false },
          { id: 4, title: "Dedicated account manager", active: false },
        ],
      },
    ],
  },
  {
    id: 3,
    image: {
      light: saver.src,
      dark: saverDark.src,
    },
    columnTitle: "Pricing Enterprise",
    tableTitle: "Enterprise",
    price: null,
    features: [
      { title: "Visitor check-in & check-out", active: true },
      { title: "Resident portal", active: true },
      { title: "Maintenance requests", active: true },
      { title: "Parcel tracking", active: true },
      { title: "Custom domain", active: true },
      { title: "Advanced reports & CSV export", active: true },
      { title: "Priority support", active: true },
    ],
    tableFeatures: [
      {
        category: "Core Features",
        features: [
          { id: 1, title: "Visitor check-in & check-out", active: true },
          { id: 2, title: "Resident portal", active: true },
          { id: 3, title: "Maintenance requests", active: true },
        ],
      },
      {
        category: "Advanced Features",
        features: [
          { id: 1, title: "Parcel & delivery tracking", active: true },
          { id: 2, title: "Parking & vehicle tags", active: true },
          { id: 3, title: "Incident reports", active: true },
          { id: 4, title: "Advanced reports & CSV export", active: true },
        ],
      },
      {
        category: "Platform Features",
        features: [
          { id: 1, title: "Custom domain", active: true },
          { id: 2, title: "Priority support", active: true },
          { id: 3, title: "White-label branding", active: true },
          { id: 4, title: "Dedicated account manager", active: true },
        ],
      },
    ],
  },
  {
    id: 4,
    image: {
      light: industry.src,
      dark: industryDark.src,
    },
    columnTitle: "Pricing Enterprise Plus",
    tableTitle: "Enterprise Plus",
    price: null,
    features: [
      { title: "Visitor check-in & check-out", active: true },
      { title: "Resident portal", active: true },
      { title: "Maintenance requests", active: true },
      { title: "Parcel tracking", active: true },
      { title: "Custom domain", active: true },
      { title: "Advanced reports & CSV export", active: true },
      { title: "Priority support", active: true },
    ],
    tableFeatures: [
      {
        category: "Core Features",
        features: [
          { id: 1, title: "Visitor check-in & check-out", active: true },
          { id: 2, title: "Resident portal", active: true },
          { id: 3, title: "Maintenance requests", active: true },
        ],
      },
      {
        category: "Advanced Features",
        features: [
          { id: 1, title: "Parcel & delivery tracking", active: true },
          { id: 2, title: "Parking & vehicle tags", active: true },
          { id: 3, title: "Incident reports", active: true },
          { id: 4, title: "Advanced reports & CSV export", active: true },
        ],
      },
      {
        category: "Platform Features",
        features: [
          { id: 1, title: "Custom domain", active: true },
          { id: 2, title: "Priority support", active: true },
          { id: 3, title: "White-label branding", active: true },
          { id: 4, title: "Dedicated account manager", active: true },
        ],
      },
    ],
  },
];
