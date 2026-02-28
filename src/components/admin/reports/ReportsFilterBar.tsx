import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Filter } from 'lucide-react';
import { type ReportsFilters, type DatePreset, applyPreset } from './useReportsData';

const DATE_PRESETS: { value: DatePreset; label: string }[] = [
  { value: 'this_month', label: 'This Month' },
  { value: 'last_30', label: 'Last 30 Days' },
  { value: 'this_quarter', label: 'This Quarter' },
  { value: 'ytd', label: 'Year to Date' },
  { value: 'custom', label: 'Custom' },
];

const EVENT_TYPES = [
  'wedding', 'corporate', 'birthday', 'graduation', 'military_function',
  'social_gathering', 'holiday_party', 'memorial', 'reunion', 'fundraiser',
  'religious', 'baby_shower', 'other',
];

const SERVICE_TYPES = [
  { value: 'all', label: 'All Services' },
  { value: 'full-service', label: 'Full Service' },
  { value: 'delivery-only', label: 'Delivery Only' },
  { value: 'delivery-setup', label: 'Delivery & Setup' },
  { value: 'drop-off', label: 'Drop Off' },
];

interface Props {
  filters: ReportsFilters;
  onChange: (f: ReportsFilters) => void;
}

export function ReportsFilterBar({ filters, onChange }: Props) {
  const setPreset = (preset: DatePreset) => {
    if (preset === 'custom') {
      onChange({ ...filters, datePreset: 'custom' });
    } else {
      const { startDate, endDate } = applyPreset(preset);
      onChange({ ...filters, datePreset: preset, startDate, endDate });
    }
  };

  const toggleEventType = (type: string) => {
    const types = filters.eventTypes.includes(type)
      ? filters.eventTypes.filter(t => t !== type)
      : [...filters.eventTypes, type];
    onChange({ ...filters, eventTypes: types });
  };

  return (
    <div className="space-y-3">
      {/* Date presets */}
      <div className="flex flex-wrap gap-2">
        {DATE_PRESETS.map(p => (
          <Button
            key={p.value}
            size="sm"
            variant={filters.datePreset === p.value ? 'default' : 'outline'}
            onClick={() => setPreset(p.value)}
            className="text-xs"
          >
            {p.label}
          </Button>
        ))}
      </div>

      {/* Custom date range */}
      {filters.datePreset === 'custom' && (
        <div className="flex flex-col sm:flex-row gap-2">
          <DatePicker
            value={filters.startDate}
            onChange={d => d && onChange({ ...filters, startDate: d })}
            placeholder="Start date"
            className="h-9 text-sm"
          />
          <DatePicker
            value={filters.endDate}
            onChange={d => d && onChange({ ...filters, endDate: d })}
            placeholder="End date"
            className="h-9 text-sm"
          />
        </div>
      )}

      {/* Service type + Event type filters */}
      <div className="flex flex-col sm:flex-row gap-2">
        <Select value={filters.serviceType} onValueChange={v => onChange({ ...filters, serviceType: v })}>
          <SelectTrigger className="h-9 w-full sm:w-[180px] text-sm">
            <SelectValue placeholder="Service Type" />
          </SelectTrigger>
          <SelectContent>
            {SERVICE_TYPES.map(s => (
              <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1.5 h-9 text-sm">
              <Filter className="h-3.5 w-3.5" />
              Event Types {filters.eventTypes.length > 0 && `(${filters.eventTypes.length})`}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56 p-3" align="start">
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {EVENT_TYPES.map(type => (
                <label key={type} className="flex items-center gap-2 text-sm cursor-pointer">
                  <Checkbox
                    checked={filters.eventTypes.includes(type)}
                    onCheckedChange={() => toggleEventType(type)}
                  />
                  <span className="capitalize">{type.replace(/_/g, ' ')}</span>
                </label>
              ))}
            </div>
            {filters.eventTypes.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="w-full mt-2 text-xs"
                onClick={() => onChange({ ...filters, eventTypes: [] })}
              >
                Clear all
              </Button>
            )}
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
