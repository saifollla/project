import { useState, type ChangeEvent, type FormEvent } from 'react';
import { CheckCircle2, Clock, Search, XCircle } from 'lucide-react';
import { checkAvailability, hhmmToMin, minToHHMM } from '@/availabilityLogic';
import BookingsPanel from '@/components/BookingsPanel';
import TimeField from '@/components/TimeField';
import { bookings, rooms } from '@/sampleData';
import type { CheckResult } from '@/types';

const selectClass =
  'mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 shadow-sm transition-colors duration-200 hover:border-slate-400 focus:border-teal-600 focus:outline-none focus:ring-4 focus:ring-teal-600/15';

const labelClass = 'block text-sm font-medium text-slate-700';

export default function RoomChecker() {
  const [roomId, setRoomId] = useState(rooms[0].id);
  const [start, setStart] = useState('11:00');
  const [end, setEnd] = useState('12:00');
  const [now, setNow] = useState('09:00');
  const [result, setResult] = useState<CheckResult | null>(null);

  const selectedRoom = rooms.find((room) => room.id === roomId);
  const roomBookings = bookings.filter((booking) => booking.roomId === roomId);

  const setField = (setter: (value: string) => void) => (value: string) => {
    setter(value);
    setResult(null);
  };

  const edit = (setter: (value: string) => void) => (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setField(setter)(event.target.value);
  };

  const handleCheck = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setResult(
      checkAvailability(roomId, hhmmToMin(start), hhmmToMin(end), hhmmToMin(now), rooms, bookings),
    );
  };

  const handleRealClock = () => {
    const current = new Date();
    setNow(minToHHMM(current.getHours() * 60 + current.getMinutes()));
    setResult(null);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8 lg:col-span-3">
        <h2 className="text-lg font-semibold text-slate-900">Check a time slot</h2>
        <p className="mt-1 text-sm text-slate-500">
          Choose a room and a time window. Bookings must be 120 minutes or less.
        </p>

        <form onSubmit={handleCheck} className="mt-6 space-y-6">
          <div>
            <label htmlFor="room" className={labelClass}>
              Room
            </label>
            <select id="room" value={roomId} onChange={edit(setRoomId)} className={selectClass}>
              {rooms.map((room) => (
                <option key={room.id} value={room.id}>
                  {room.name}
                </option>
              ))}
            </select>
            {selectedRoom?.blocked && (
              <p className="mt-2 text-sm text-rose-700">This room is currently blocked for bookings.</p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <TimeField id="start" label="Start time" value={start} onChange={setField(setStart)} />
            <TimeField id="end" label="End time" value={end} onChange={setField(setEnd)} />
          </div>

          <div>
            <label htmlFor="now" className={labelClass}>
              Current time
            </label>
            <div className="mt-2 flex flex-col gap-3 sm:flex-row">
              <input
                id="now"
                type="time"
                value={now}
                onChange={edit(setNow)}
                className="mt-0 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 shadow-sm transition-colors duration-200 hover:border-slate-400 focus:border-teal-600 focus:outline-none focus:ring-4 focus:ring-teal-600/15 sm:flex-1"
              />
              <button
                type="button"
                onClick={handleRealClock}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-400 hover:bg-slate-50 active:translate-y-0 focus:outline-none focus-visible:ring-4 focus-visible:ring-teal-600/15"
              >
                <Clock className="h-4 w-4" aria-hidden="true" />
                Use real clock
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-teal-700 px-6 py-3 font-medium text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-teal-800 hover:shadow-md active:translate-y-0 focus:outline-none focus-visible:ring-4 focus-visible:ring-teal-600/30"
          >
            <Search className="h-4 w-4" aria-hidden="true" />
            Check Availability
          </button>
        </form>

        {result && (
          <div
            role="status"
            className={`animate-fade-in-up mt-6 flex items-start gap-4 rounded-xl border p-4 ${
              result.available
                ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
                : 'border-rose-200 bg-rose-50 text-rose-900'
            }`}
          >
            {result.available ? (
              <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-emerald-700" aria-hidden="true" />
            ) : (
              <XCircle className="mt-0.5 h-6 w-6 shrink-0 text-rose-700" aria-hidden="true" />
            )}
            <div>
              <p className="font-semibold">{result.available ? 'Available' : 'Unavailable'}</p>
              <p className="mt-1 text-sm leading-relaxed">{result.reason}</p>
            </div>
          </div>
        )}
      </section>

      <div className="lg:col-span-2">
        <BookingsPanel roomName={selectedRoom?.name ?? ''} bookings={roomBookings} />
      </div>
    </div>
  );
}
