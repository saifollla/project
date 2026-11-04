import { type ChangeEvent } from 'react';

interface TimeFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

const baseClass =
  'w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 shadow-sm transition-colors duration-200 placeholder:text-slate-400 hover:border-slate-400 focus:border-teal-600 focus:outline-none focus:ring-4 focus:ring-teal-600/15';

export default function TimeField({ id, label, value, onChange, className }: TimeFieldProps) {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => onChange(event.target.value);
  return (
    <div className={className}>
      <label htmlFor={id} className="block text-sm font-medium text-slate-700">
        {label}
      </label>
      <input id={id} type="time" value={value} onChange={handleChange} className={`mt-2 ${baseClass}`} />
    </div>
  );
}
