import { CalendarClock } from 'lucide-react';
import { minToHHMM } from '@/availabilityLogic';
import type { Booking } from '@/types';

interface BookingsPanelProps {
  roomName: string;
  bookings: ReadonlyArray<Booking>;
}

export default function BookingsPanel({ roomName, bookings }: BookingsPanelProps) {
  const sorted = [...bookings].sort((a, b) => a.start - b.start);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
          <CalendarClock className="h-5 w-5" aria-hidden="true" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Existing bookings</h2>
          <p className="text-sm text-slate-500">{roomName}</p>
        </div>
      </div>

      {sorted.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-300 px-4 py-8 text-center text-sm text-slate-500">
          No bookings for this room yet.
        </p>
      ) : (
        <ul className="divide-y divide-slate-100">
          {sorted.map((booking) => (
            <li
              key={booking.id}
              className="flex flex-col gap-1 py-4 transition-colors duration-200 first:pt-0 last:pb-0 hover:bg-slate-50/60 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
            >
              <span className="font-medium text-slate-900">{booking.title}</span>
              <span className="font-mono text-sm tabular-nums text-slate-600">
                {minToHHMM(booking.start)} to {minToHHMM(booking.end)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
