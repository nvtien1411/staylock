export type ReservationStage = "Reserved" | "Checked In" | "Completed" | "Cancelled";
export type LifecycleAction = "" | "checkin" | "checkout" | "cancel";
export type BookingRecord = Record<string, unknown>;

const statusFields = ["status", "state", "stage", "booking_status", "reservation_status"];

export type BookingInput = {
  traveler: string;
  host: string;
  roomId: string;
  amount: string;
  dayCheckin: string;
  dayCheckout: string;
};

export function asBookingRecord(value: unknown): BookingRecord {
  return value && typeof value === "object" && !Array.isArray(value) ? value as BookingRecord : {};
}

export function pickBookingField(record: BookingRecord, names: string[]) {
  for (const name of names) {
    if (record[name] !== undefined && record[name] !== null) {
      return record[name];
    }
  }

  return undefined;
}

export function getBookingStatusValue(record: BookingRecord) {
  return pickBookingField(record, statusFields);
}

export function reservationStageFromStatus(value: unknown): ReservationStage {
  const normalized = String(value || "").toLowerCase().replaceAll("_", " ");

  if (normalized.includes("cancel")) {
    return "Cancelled";
  }

  if (normalized.includes("complete") || normalized.includes("checkout")) {
    return "Completed";
  }

  if (normalized.includes("check")) {
    return "Checked In";
  }

  return "Reserved";
}

export function formatReservationStage(value: unknown) {
  return reservationStageFromStatus(value);
}
