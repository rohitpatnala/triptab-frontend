import { demoTrip } from "../features/trips/tripMockData";
import { recalculateTrip } from "../utils/splitCalculator";
import type { TripDetails, TripExpense, TripMember } from "../types";

const STORAGE_KEY = "triptab.trips.v1";
const DATA_CHANGED_EVENT = "triptab:data-changed";

function createId(prefix: string): string {
  return typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function readTrips(): TripDetails[] {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (!saved) return [recalculateTrip(demoTrip)];
    const parsed = JSON.parse(saved) as TripDetails[];
    return Array.isArray(parsed) ? parsed.map(recalculateTrip) : [recalculateTrip(demoTrip)];
  } catch {
    return [recalculateTrip(demoTrip)];
  }
}

function writeTrips(trips: TripDetails[]): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(trips));
  window.dispatchEvent(new Event(DATA_CHANGED_EVENT));
}

export function loadTrips(): TripDetails[] {
  return readTrips();
}

export function saveTrips(trips: TripDetails[]): void {
  writeTrips(trips.map(recalculateTrip));
}

export function subscribeToTripChanges(listener: () => void): () => void {
  window.addEventListener(DATA_CHANGED_EVENT, listener);
  window.addEventListener("storage", listener);
  return () => {
    window.removeEventListener(DATA_CHANGED_EVENT, listener);
    window.removeEventListener("storage", listener);
  };
}

export function getTrip(tripId: string): TripDetails | undefined {
  return readTrips().find((trip) => trip.id === tripId);
}

export function createTrip(input: Pick<TripDetails, "name" | "destination" | "startDate" | "endDate"> & { members: TripMember[] }): TripDetails {
  const trip: TripDetails = {
    id: createId("trip"),
    ...input,
    expenses: [],
    members: input.members.map((member) => ({ ...member, paidPaise: 0, sharePaise: 0, netPaise: 0 })),
  };
  saveTrips([trip, ...readTrips()]);
  return trip;
}

export function updateTrip(updatedTrip: TripDetails): void {
  saveTrips(readTrips().map((trip) => (trip.id === updatedTrip.id ? updatedTrip : trip)));
}

export function deleteTrip(tripId: string): void {
  saveTrips(readTrips().filter((trip) => trip.id !== tripId));
}

export function addExpense(trip: TripDetails, expense: Omit<TripExpense, "id">): TripDetails {
  const updated = { ...trip, expenses: [{ ...expense, id: createId("expense") }, ...trip.expenses] };
  updateTrip(updated);
  return recalculateTrip(updated);
}

export function addMember(trip: TripDetails, name: string): TripDetails {
  const trimmed = name.trim();
  if (!trimmed) return trip;
  const member: TripMember = {
    id: createId("member"),
    name: trimmed,
    initials: trimmed.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase(),
    color: ["#0078D4", "#107C10", "#8764B8", "#D83B01", "#038387", "#5C2D91"][trip.members.length % 6],
    paidPaise: 0,
    sharePaise: 0,
    netPaise: 0,
  };
  const updated = { ...trip, members: [...trip.members, member] };
  updateTrip(updated);
  return recalculateTrip(updated);
}
