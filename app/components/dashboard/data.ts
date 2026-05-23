import type { ReservationStage } from "@/app/types/booking";

export const metrics = [
  ["$2.8M", "Escrow Volume"],
  ["12.4K", "Reservations"],
  ["840+", "Active Properties"],
  ["99.98%", "Settlement Reliability"],
];

export const activity = [
  ["Reservation secured", "Ocean villa · 2 min ago", "+$1,240 locked"],
  ["Settlement released", "Kyoto loft · 8 min ago", "Check-in verified"],
  ["Guest wallet verified", "Lisbon townhouse · 14 min ago", "Freighter approved"],
  ["Property owner onboarded", "Alpine chalet · 22 min ago", "Ready for escrow"],
];

export const escrowSteps = [
  ["01", "Funds locked securely", "Your deposit is held in escrow the moment you reserve, creating confidence for both guest and owner."],
  ["02", "Verified check-in", "Release conditions are transparent, reducing disputes before the stay begins."],
  ["03", "Trustless settlement", "The reservation settles without middlemen, delays, or opaque back-office processes."],
];

export const lifecycleStages: Array<{
  stage: ReservationStage;
  title: string;
  description: string;
}> = [
  {
    stage: "Reserved",
    title: "Deposit protected",
    description: "The stay is reserved and escrow protection is active.",
  },
  {
    stage: "Checked In",
    title: "Stay verified",
    description: "Check-in confirms the guest has arrived and the trip is underway.",
  },
  {
    stage: "Completed",
    title: "Settlement released",
    description: "Checkout completes the stay and releases the protected settlement.",
  },
  {
    stage: "Cancelled",
    title: "Reservation closed",
    description: "Cancellation closes the stay path and prevents further progression.",
  },
];
