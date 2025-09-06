// src/webparts/carousel/components/IBanner.ts
export type BannerType = 'event' | 'custom';

export interface IBanner {
  type: BannerType;
  date?: string;
  time?: string;
  location?: string;
  title?: string;
  description?: string;
  ctaText?: string;
  ctaLink?: string;
  photoUrl?: string;
  headline?: string;
  subheadline?: string;
}