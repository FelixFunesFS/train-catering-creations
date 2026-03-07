import { SubmissionsCard } from './SubmissionsCard';
import { EventList } from './EventList';
import { ViewHelpCard } from '../help/ViewHelpCard';

export function EventsView() {
  return (
    <div className="space-y-6">
      <ViewHelpCard viewKey="events" />
      {/* New Submissions Section - pending & under_review */}
      <SubmissionsCard />
      
      {/* All Events Section - excludes pending & under_review */}
      <EventList excludeStatuses={['pending', 'under_review']} />
    </div>
  );
}
