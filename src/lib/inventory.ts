import {
  doIntervalsOverlap as _doIntervalsOverlap,
  cleanupExpiredHolds as _cleanupExpiredHolds,
  checkRoomAvailability as _checkRoomAvailability,
  createTemporaryHold as _createTemporaryHold,
} from "./inventory-core.mjs";

export interface AvailabilityResult {
  categoryId: string;
  categoryName: string;
  basePrice: number;
  totalRooms: number;
  availableRoomsCount: number;
  availableRoomIds: string[];
  isAvailable: boolean;
  maxAdults: number;
}

export const doIntervalsOverlap = _doIntervalsOverlap as (
  startA: string,
  endA: string,
  startB: string,
  endB: string
) => boolean;

export const cleanupExpiredHolds = _cleanupExpiredHolds as () => Promise<number>;

export const checkRoomAvailability = _checkRoomAvailability as (
  checkInDate: string,
  checkOutDate: string,
  requestedAdults?: number
) => Promise<AvailabilityResult[]>;

export const createTemporaryHold = _createTemporaryHold as (
  categoryId: string,
  checkInDate: string,
  checkOutDate: string,
  roomId?: string
) => Promise<{ success: boolean; holdToken?: string; error?: string }>;
