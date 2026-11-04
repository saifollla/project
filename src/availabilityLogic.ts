import type { Booking, CheckResult, Room } from '@/types';

export const MAX_BOOKING_MINUTES = 120;
export const MINUTES_PER_DAY = 1440;

export function hhmmToMin(hhmm: string): number {
  const match = /^(\d{2}):(\d{2})$/.exec(hhmm);
  if (!match) return NaN;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) return NaN;
  return hours * 60 + minutes;
}

export function minToHHMM(total: number): string {
  if (!Number.isFinite(total)) return '--:--';
  const clamped = Math.max(0, Math.min(total, MINUTES_PER_DAY - 1));
  const hours = Math.floor(clamped / 60);
  const minutes = Math.round(clamped % 60);
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

interface IntervalRequest {
  start: number;
  end: number;
  now: number;
  blocked: boolean;
  bookings: ReadonlyArray<Pick<Booking, 'start' | 'end'>>;
}

function evaluateInterval({ start, end, now, blocked, bookings }: IntervalRequest): CheckResult {
  if (![start, end, now].every(Number.isInteger)) {
    return { available: false, reason: 'Enter valid start, end, and current times.' };
  }
  if (start < 0 || end > MINUTES_PER_DAY || start >= end) {
    return { available: false, reason: 'The end time must be after the start time, within the same day.' };
  }
  if (start <= now) {
    return { available: false, reason: 'The start time must be after the current time.' };
  }
  if (end - start > MAX_BOOKING_MINUTES) {
    return { available: false, reason: `Bookings cannot be longer than ${MAX_BOOKING_MINUTES} minutes.` };
  }
  if (blocked) {
    return { available: false, reason: 'This room is blocked and cannot be booked.' };
  }
  const clash = bookings.find((b) => start < b.end && b.start < end);
  if (clash) {
    return {
      available: false,
      reason: `Overlaps an existing booking from ${minToHHMM(clash.start)} to ${minToHHMM(clash.end)}.`,
    };
  }
  return { available: true, reason: 'The room is free for the requested time.' };
}

export function checkAvailability(
  roomId: string,
  start: number,
  end: number,
  currentTime: number,
  rooms: ReadonlyArray<Room>,
  bookings: ReadonlyArray<Booking>,
): CheckResult {
  const room = rooms.find((r) => r.id === roomId);
  if (!room) {
    return { available: false, reason: 'Select a valid room.' };
  }
  return evaluateInterval({
    start,
    end,
    now: currentTime,
    blocked: room.blocked,
    bookings: bookings.filter((b) => b.roomId === roomId),
  });
}

export function canBook(request: IntervalRequest): boolean {
  return evaluateInterval(request).available;
}
