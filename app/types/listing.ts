export type ListingAvailability = "Available" | "Reserved" | "Completed";

export type Listing = {
  id: string;
  roomId: string;
  ownerWallet: string;
  escrowAmount: string;
  nightlyPriceXlm: number;
  title: string;
  location: string;
  description: string;
  amenities: string[];
  hostName: string;
  hostSince: string;
  maxGuests: number;
  bedrooms: number;
  bathrooms: number;
  availability: ListingAvailability;
  activeBookingId?: string;
  gradientFrom: string;
  gradientTo: string;
};
