import { DoorOpen } from 'lucide-react';
import RoomChecker from '@/components/RoomChecker';

function App() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-700 text-white shadow-sm">
            <DoorOpen className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-lg font-semibold leading-tight">Smart Campus</h1>
            <p className="text-sm text-slate-500">Room Availability Checker</p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <div className="mb-8 max-w-2xl">
          <h2 className="text-2xl font-semibold leading-tight sm:text-3xl">Find out if a room is free</h2>
          <p className="mt-2 text-base leading-relaxed text-slate-600">
            Check a proposed time window before you book. Results show whether the room is open and, if not, why.
          </p>
        </div>
        <RoomChecker />
      </main>
    </div>
  );
}

export default App;
