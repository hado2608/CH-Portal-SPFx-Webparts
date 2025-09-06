export interface ICarouselItem {
    title: string;
    description: string;
    imageUrl: string;
    linkUrl?: string;
    date?: string;      // e.g., "May 8"
    day?: string;       // e.g., "Today"
    time?: string;      // e.g., "3:00 PM – 4:30 PM"
    location?: string;  // e.g., "Grand Concourse"
  }
  