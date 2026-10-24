import { ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { positiveMonths } from '@/lib/membership-dates';

export function MonthDurationInput({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const months = Number(value);
  return <div className="flex min-w-0 items-center gap-1">
    <Input aria-label="Duration in months" type="number" min={1} step={1} required value={value}
      onChange={e => { if (/^\d*$/.test(e.target.value) && e.target.value !== '0') onChange(e.target.value); }}
      onKeyDown={e => { if (['.', ',', '-', '+', 'e', 'E'].includes(e.key)) e.preventDefault(); }} className="min-w-0" />
    <span className="text-xs text-muted-foreground">months</span>
    <div className="flex shrink-0 flex-col">
      <Button type="button" size="icon" variant="ghost" className="h-6 w-6" aria-label="Increase duration by one month" title="Increase by one month" onClick={() => onChange(String(positiveMonths(months) ? months + 1 : 1))}><ChevronUp className="h-4 w-4" /></Button>
      <Button type="button" size="icon" variant="ghost" className="h-6 w-6" aria-label="Decrease duration by one month" title="Decrease by one month" disabled={!positiveMonths(months) || months <= 1} onClick={() => onChange(String(months - 1))}><ChevronDown className="h-4 w-4" /></Button>
    </div>
  </div>;
}