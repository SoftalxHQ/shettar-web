import { type IconType } from 'react-icons';
import { BsBuildingCheck, BsWallet2, BsShieldLock, BsLightningCharge, BsStars, BsHeadset } from 'react-icons/bs';

export type OurStoryType = {
  title: string;
  description: string;
  icon: IconType;
  variant: string;
};

export type WhyShettarType = {
  title: string;
  description: string;
  icon: IconType;
  variant: string;
};

export const ourStories: OurStoryType[] = [
  {
    title: 'Verified Hotels & Stays',
    description: 'Browse hotels, apartments and short-stays across Nigeria — every listing is reviewed and verified before it goes live.',
    icon: BsBuildingCheck,
    variant: 'bg-primary text-primary',
  },
  {
    title: 'The Shettar Wallet',
    description: 'Fund your wallet by card or your own dedicated bank account, then book in seconds without re-entering payment details.',
    icon: BsWallet2,
    variant: 'bg-success text-success',
  },
  {
    title: 'Secure Payments',
    description: 'Payments are processed through Paystack with bank-grade security. Pay online, or settle with cash or POS at the property.',
    icon: BsShieldLock,
    variant: 'bg-orange text-orange',
  },
  {
    title: 'Instant Confirmation',
    description: 'Get real-time availability and immediate booking confirmation, with reminders and updates sent straight to your device.',
    icon: BsLightningCharge,
    variant: 'bg-info text-info',
  },
];

export const whyShettar: WhyShettarType[] = [
  {
    title: 'Built for Nigeria',
    description: 'Prices in Naira, local payment methods, and a support team that understands how you travel and stay.',
    icon: BsStars,
    variant: 'bg-primary text-primary',
  },
  {
    title: 'Trusted by Hotels',
    description: 'Hundreds of hotels manage rooms, bookings and payouts on Shettar — so you book directly from the people who host you.',
    icon: BsBuildingCheck,
    variant: 'bg-success text-success',
  },
  {
    title: 'Your Money, Protected',
    description: 'Wallet balances, refunds on eligible cancellations, and transparent pricing with no hidden charges.',
    icon: BsWallet2,
    variant: 'bg-orange text-orange',
  },
  {
    title: 'Real Help, Fast',
    description: 'Live chat support and verified guest reviews help you book with confidence and get answers when you need them.',
    icon: BsHeadset,
    variant: 'bg-info text-info',
  },
];
