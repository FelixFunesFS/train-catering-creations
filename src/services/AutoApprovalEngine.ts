/**
 * AutoApprovalEngine - Determines if change requests can be auto-approved
 * Implements business rules for automatic approvals
 */

export interface AutoApprovalResult {
  canAutoApprove: boolean;
  reason: string;
  suggestedResponse?: string;
  costImpact?: number;
}

export class AutoApprovalEngine {
  /**
   * Evaluate if a change request qualifies for auto-approval
   */
  static evaluate(
    requestedChanges: any,
    originalQuote: any,
    requestType: string
  ): AutoApprovalResult {
    // Menu swaps - same category, no pricing change
    if (requestedChanges.menu_changes) {
      return this.evaluateMenuChanges(requestedChanges.menu_changes, originalQuote);
    }

    // Guest count changes within 10%
    if (requestedChanges.guest_count) {
      return this.evaluateGuestCountChange(
        requestedChanges.guest_count,
        originalQuote.guest_count
      );
    }

    // Date changes more than 48 hours in advance
    if (requestedChanges.event_date) {
      return this.evaluateDateChange(
        requestedChanges.event_date,
        originalQuote.event_date
      );
    }

    // Time changes (no pricing impact)
    if (requestedChanges.start_time && !requestedChanges.guest_count && !requestedChanges.menu_changes) {
      return {
        canAutoApprove: true,
        reason: 'Time change with no other modifications',
        suggestedResponse: 'We\'ve updated your event start time. All other details remain the same.',
        costImpact: 0
      };
    }

    // Location changes within same service area (no pricing impact)
    if (requestedChanges.location && !requestedChanges.guest_count && !requestedChanges.menu_changes) {
      return {
        canAutoApprove: false,
        reason: 'Location changes require manual review for travel fees',
        suggestedResponse: 'We\'re reviewing your location change to confirm any travel fee adjustments.'
      };
    }

    return {
      canAutoApprove: false,
      reason: 'Complex changes require manual review'
    };
  }

  private static evaluateMenuChanges(menuChanges: any, quote: any): AutoApprovalResult {
    // Simple substitutions within same category
    const hasRemovals = menuChanges.proteins?.remove?.length > 0 ||
                        menuChanges.appetizers?.remove?.length > 0 ||
                        menuChanges.sides?.remove?.length > 0;
    
    const hasAdditions = menuChanges.proteins?.add?.length > 0 ||
                        menuChanges.appetizers?.add?.length > 0 ||
                        menuChanges.sides?.add?.length > 0;

    // Only substitutions (remove + add same count) = auto-approve
    if (hasRemovals && hasAdditions) {
      const removeCount = (menuChanges.proteins?.remove?.length || 0) +
                         (menuChanges.appetizers?.remove?.length || 0) +
                         (menuChanges.sides?.remove?.length || 0);
      
      const addCount = (menuChanges.proteins?.add?.length || 0) +
                      (menuChanges.appetizers?.add?.length || 0) +
                      (menuChanges.sides?.add?.length || 0);

      if (removeCount === addCount && removeCount <= 3) {
        return {
          canAutoApprove: true,
          reason: 'Simple menu substitutions (same quantity)',
          suggestedResponse: 'We\'ve updated your menu selections. No price change for these substitutions.',
          costImpact: 0
        };
      }
    }

    return {
      canAutoApprove: false,
      reason: 'Menu changes require pricing review'
    };
  }

  private static evaluateGuestCountChange(newCount: number, originalCount: number): AutoApprovalResult {
    const percentChange = Math.abs((newCount - originalCount) / originalCount);
    const difference = newCount - originalCount;

    // Within 10% and less than 15 guests
    if (percentChange <= 0.1 && Math.abs(difference) <= 15) {
      const pricePerGuest = 35; // Base price per guest in dollars
      const costImpactCents = difference * pricePerGuest * 100;

      return {
        canAutoApprove: true,
        reason: 'Guest count change within acceptable range (±10%)',
        suggestedResponse: `We've updated your guest count to ${newCount}. ${
          difference > 0 ? 'Additional' : 'Reduced'
        } pricing has been applied automatically.`,
        costImpact: costImpactCents
      };
    }

    return {
      canAutoApprove: false,
      reason: `Guest count change exceeds 10% threshold (${Math.round(percentChange * 100)}%)`
    };
  }

  private static evaluateDateChange(newDate: string, originalDate: string): AutoApprovalResult {
    const now = new Date();
    const originalEventDate = new Date(originalDate);
    const newEventDate = new Date(newDate);
    
    const hoursUntilOriginal = (originalEventDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    const hoursUntilNew = (newEventDate.getTime() - now.getTime()) / (1000 * 60 * 60);

    // Both dates more than 48 hours away
    if (hoursUntilOriginal > 48 && hoursUntilNew > 48) {
      return {
        canAutoApprove: true,
        reason: 'Date change more than 48 hours in advance',
        suggestedResponse: 'We\'ve confirmed your new event date. No additional fees apply.',
        costImpact: 0
      };
    }

    return {
      canAutoApprove: false,
      reason: 'Date changes within 48 hours require manual approval'
    };
  }
}
