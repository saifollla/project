import { describe, it, expect } from 'vitest';
import { canBook, checkAvailability, hhmmToMin, minToHHMM } from '@/availabilityLogic';
import type { Booking, Room } from '@/types';

const fixture = {
  now: 540,
  blocked: false,
  bookings: [{ start: 600, end: 660 }],
};

const check = (
  start: number,
  end: number,
  overrides: Partial<typeof fixture> = {},
) => canBook({ start, end, ...fixture, ...overrides });

describe('canBook', () => {
  it('T01 accepts an interval touching the existing booking end', () => {
    expect(check(660, 720)).toBe(true);
  });

  it('T02 rejects an interval starting exactly at the current time', () => {
    expect(check(540, 600)).toBe(false);
  });

  it('T03 rejects an interval starting before the current time', () => {
    expect(check(530, 580)).toBe(false);
  });

  it('T04 rejects an interval ending before it starts', () => {
    expect(check(700, 650)).toBe(false);
  });

  it('T05 rejects an interval ending after minute 1440', () => {
    expect(check(1380, 1450)).toBe(false);
  });

  it('T06 accepts a 120-minute booking', () => {
    expect(check(700, 820)).toBe(true);
  });

  it('T07 rejects a 121-minute booking', () => {
    expect(check(700, 821)).toBe(false);
  });

  it('T08 accepts an interval touching the existing booking start', () => {
    expect(check(550, 600)).toBe(true);
  });

  it('T09 rejects an interval starting inside an existing booking', () => {
    expect(check(620, 680)).toBe(false);
  });

  it('T10 rejects an interval that spans an existing booking', () => {
    expect(check(590, 670)).toBe(false);
  });

  it('T11 rejects an interval fully inside an existing booking', () => {
    expect(check(610, 650)).toBe(false);
  });

  it('T12 rejects an interval ending inside an existing booking', () => {
    expect(check(650, 700)).toBe(false);
  });

  it('T13 rejects any booking when the room is blocked', () => {
    expect(check(700, 760, { blocked: true })).toBe(false);
  });

  it('T14 accepts any valid interval when there are no bookings', () => {
    expect(check(600, 660, { bookings: [] })).toBe(true);
  });

  it('T15 does not mutate the bookings array', () => {
    const bookings: Booking[] = [
      { id: 'x', roomId: 'r', start: 600, end: 660, title: 'Seminar' },
    ];
    const snapshot = structuredClone(bookings);
    const result = canBook({ start: 620, end: 680, now: 540, blocked: false, bookings });
    expect(result).toBe(false);
    expect(bookings).toEqual(snapshot);
    expect(bookings).toHaveLength(1);
  });

  it('T16 accepts an interval ending exactly at minute 1440', () => {
    expect(check(1380, 1440)).toBe(true);
  });

  it('T17 rejects a zero-length interval', () => {
    expect(check(700, 700)).toBe(false);
  });

  it('accepts a start at minute 0 when the current time is before it', () => {
    expect(check(0, 60, { now: -1, bookings: [] })).toBe(true);
  });

  it('rejects a negative start minute', () => {
    expect(check(-30, 60, { now: -60, bookings: [] })).toBe(false);
  });
});

describe('checkAvailability', () => {
  const rooms: Room[] = [
    { id: 'open', name: 'Open Room', blocked: false },
    { id: 'closed', name: 'Closed Room', blocked: true },
  ];
  const bookings: Booking[] = [
    { id: 'a', roomId: 'open', start: 600, end: 660, title: 'Seminar' },
    { id: 'b', roomId: 'closed', start: 700, end: 760, title: 'Other' },
  ];

  it('returns available for a free room with a valid interval', () => {
    expect(checkAvailability('open', 660, 720, 540, rooms, bookings).available).toBe(true);
  });

  it('only considers bookings for the selected room', () => {
    expect(checkAvailability('open', 700, 760, 540, rooms, bookings).available).toBe(true);
  });

  it('rejects a blocked room', () => {
    expect(checkAvailability('closed', 800, 860, 540, rooms, bookings).available).toBe(false);
  });

  it('rejects an unknown room', () => {
    expect(checkAvailability('missing', 800, 860, 540, rooms, bookings).available).toBe(false);
  });

  it('does not mutate rooms or bookings', () => {
    const roomsSnapshot = structuredClone(rooms);
    const bookingsSnapshot = structuredClone(bookings);
    checkAvailability('open', 620, 680, 540, rooms, bookings);
    expect(rooms).toEqual(roomsSnapshot);
    expect(bookings).toEqual(bookingsSnapshot);
  });
});

describe('time helpers', () => {
  it('converts HH:MM to minutes from midnight', () => {
    expect(hhmmToMin('00:00')).toBe(0);
    expect(hhmmToMin('09:00')).toBe(540);
    expect(hhmmToMin('23:59')).toBe(1439);
  });

  it('returns NaN for malformed or out-of-range times', () => {
    expect(hhmmToMin('')).toBeNaN();
    expect(hhmmToMin('9:00')).toBeNaN();
    expect(hhmmToMin('24:00')).toBeNaN();
    expect(hhmmToMin('10:60')).toBeNaN();
  });

  it('converts minutes back to HH:MM', () => {
    expect(minToHHMM(0)).toBe('00:00');
    expect(minToHHMM(660)).toBe('11:00');
    expect(minToHHMM(1439)).toBe('23:59');
  });

  it('clamps out-of-range minutes to a valid HH:MM', () => {
    expect(minToHHMM(-30)).toBe('00:00');
    expect(minToHHMM(1450)).toBe('23:59');
    expect(minToHHMM(Number.NaN)).toBe('--:--');
  });
});

describe('regression: AC-mapped acceptance cases', () => {
  const base = { now: 540, blocked: false, bookings: [{ start: 600, end: 660 }] };

  it('R1 rejects a start earlier than the current time (AC1)', () => {
    expect(canBook({ start: 530, end: 580, ...base })).toBe(false);
  });

  it('R2 rejects a reversed interval where start >= end (AC1)', () => {
    expect(canBook({ start: 670, end: 660, ...base })).toBe(false);
  });

  it('R3 rejects a 121-minute duration (AC2)', () => {
    expect(canBook({ start: 700, end: 821, ...base })).toBe(false);
  });

  it('R4 rejects a blocked room regardless of a valid slot (AC3)', () => {
    expect(canBook({ start: 700, end: 760, ...base, blocked: true })).toBe(false);
  });

  it('R5 rejects a slot overlapping an existing booking (AC4)', () => {
    expect(canBook({ start: 610, end: 650, ...base })).toBe(false);
  });

  it('R6 accepts a slot touching the existing booking end at minute 660 (AC4)', () => {
    expect(canBook({ start: 660, end: 720, ...base })).toBe(true);
  });

  it('R7 accepts a slot touching the existing booking start at minute 600 (AC4)', () => {
    expect(canBook({ start: 550, end: 600, ...base })).toBe(true);
  });

  it('R8 leaves the bookings array unchanged after a check (AC5)', () => {
    const bookings: Booking[] = [
      { id: 'x', roomId: 'r', start: 600, end: 660, title: 'Seminar' },
    ];
    const snapshot = structuredClone(bookings);
    canBook({ start: 610, end: 650, now: 540, blocked: false, bookings });
    expect(bookings).toEqual(snapshot);
    expect(bookings).toHaveLength(1);
  });
});
