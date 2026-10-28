import { format } from 'date-fns';
import type { StaffEvent } from '@/hooks/useStaffEvents';
import { parseDateFromLocalString } from '@/utils/dateHelpers';
import { convertMenuIdToReadableText } from '@/utils/menuNLP';
import { formatEventType, formatServiceType } from '@/utils/eventTypeLabels';
import { formatStaffTime } from './staffUrgency';

/** Hidden on screen; the only visible element when printing (see styles/print.css). */
export function StaffBeoPrintView({ event }: { event: StaffEvent }) {
  const date = parseDateFromLocalString(event.event_date);
  const menuGroups: [string, string[]][] = [
    ['Proteins', event.proteins],
    ['Vegetarian', event.vegetarian_entrees],
    ['Sides', event.sides],
    ['Appetizers', event.appetizers],
    ['Desserts', event.desserts],
    ['Drinks', event.drinks],
  ];
  const lineItems = event.has_approved_line_items ? [...event.line_items].sort((a, b) => a.sort_order - b.sort_order) : [];

  const row = (label: string, value?: string | number | null) =>
    value || value === 0 ? (
      <tr><td style={{ fontWeight: 600, padding: '3px 8px 3px 0', width: '30%', verticalAlign: 'top' }}>{label}</td><td style={{ padding: '3px 0' }}>{value}</td></tr>
    ) : null;

  return (
    <div className="print-only print-only-view" style={{ color: '#000', fontSize: '11pt', fontFamily: 'Georgia, serif' }}>
      <div style={{ borderBottom: '2px solid #000', paddingBottom: 8, marginBottom: 12 }}>
        <div style={{ fontSize: '18pt', fontWeight: 700 }}>Soul Train's Eatery</div>
        <div style={{ fontSize: '9pt' }}>Banquet Event Order · (843) 970-0265 · soultrainseatery@gmail.com</div>
      </div>
      <h1 style={{ fontSize: '16pt', fontWeight: 700, margin: '0 0 8px' }}>{event.event_name}</h1>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 12 }}>
        <tbody>
          {row('Date', date ? format(date, 'EEEE, MMMM d, yyyy') : event.event_date)}
          {row('Event start', formatStaffTime(event.start_time))}
          {row('Serving', formatStaffTime(event.serving_start_time || event.start_time))}
          {row('Guests', event.guest_count)}
          {row('Venue', event.location)}
          {row('Service', formatServiceType(event.service_type))}
          {row('Event type', formatEventType(event.event_type))}
          {row('On-site contact', [event.contact_name, event.phone].filter(Boolean).join(' · '))}
          {row('Organization', event.military_organization)}
          {row('Theme', event.theme_colors)}
        </tbody>
      </table>

      {event.dietary_restrictions.length > 0 && (
        <div style={{ border: '2px solid #000', padding: 8, marginBottom: 12 }}>
          <strong>DIETARY / ALLERGY ALERT{Number(event.guest_count_with_restrictions) > 0 ? ` (${event.guest_count_with_restrictions} guests)` : ''}:</strong>{' '}
          {event.dietary_restrictions.map(convertMenuIdToReadableText).join(', ')}
        </div>
      )}

      <h2 style={{ fontSize: '13pt', fontWeight: 700, borderBottom: '1px solid #000', margin: '8px 0 6px' }}>Menu & Items</h2>
      {lineItems.length > 0 ? (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <tbody>
            {lineItems.map((li) => (
              <tr key={li.id} style={{ borderBottom: '1px solid #ccc' }}>
                <td style={{ padding: '3px 0', width: 40 }}>{li.quantity}×</td>
                <td style={{ padding: '3px 0' }}><strong>{li.title}</strong>{li.description ? ` — ${li.description}` : ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        menuGroups.filter(([, items]) => items.length).map(([label, items]) => (
          <p key={label} style={{ margin: '2px 0' }}><strong>{label}:</strong> {items.map(convertMenuIdToReadableText).join(', ')}</p>
        ))
      )}
      {event.both_proteins_available && event.proteins.length >= 2 && (
        <p style={{ marginTop: 6 }}><strong>Dual Entrée:</strong> both proteins served to each guest (2 servings per guest)</p>
      )}

      {event.special_requests && (
        <>
          <h2 style={{ fontSize: '13pt', fontWeight: 700, borderBottom: '1px solid #000', margin: '12px 0 6px' }}>Special Requests</h2>
          <p style={{ whiteSpace: 'pre-wrap' }}>{event.special_requests}</p>
        </>
      )}

      {event.staff_assignments.length > 0 && (
        <>
          <h2 style={{ fontSize: '13pt', fontWeight: 700, borderBottom: '1px solid #000', margin: '12px 0 6px' }}>Crew</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tbody>
              {event.staff_assignments.map((a) => (
                <tr key={a.id} style={{ borderBottom: '1px solid #ccc' }}>
                  <td style={{ padding: '3px 0' }}>{a.staff_name}</td>
                  <td>{a.role}</td>
                  <td>{a.arrival_time ? `Arrive ${formatStaffTime(a.arrival_time)}` : ''}</td>
                  <td>{a.confirmed ? 'Confirmed' : ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
      <p style={{ marginTop: 16, fontSize: '8pt' }}>Printed {format(new Date(), 'MMM d, yyyy h:mm a')}</p>
    </div>
  );
}
