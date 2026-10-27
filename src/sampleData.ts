import type { Booking, Room } from '@/types';

export const rooms: Room[] = [
  { id: 'whitman-101', name: 'Whitman Hall 101', blocked: false },
  { id: 'aurora-201', name: 'Aurora Center 201', blocked: true },
];

export const bookings: Booking[] = [
  { id: 'b-1', roomId: 'whitman-101', start: 540, end: 600, title: 'Intro to CS Lecture' },
  { id: 'b-2', roomId: 'whitman-101', start: 600, end: 660, title: 'Algorithms Seminar' },
  { id: 'b-3', roomId: 'whitman-101', start: 780, end: 840, title: 'Faculty Meeting' },
];
