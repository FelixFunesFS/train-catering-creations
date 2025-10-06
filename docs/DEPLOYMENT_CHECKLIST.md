# 🚀 Production Deployment Checklist

## Pre-Deployment

### Database
- [ ] All migrations applied successfully
- [ ] Database triggers tested and verified
- [ ] RLS policies reviewed and tested
- [ ] Database backup created

### Edge Functions
- [ ] All functions deployed to production
- [ ] Secrets configured in Supabase dashboard
- [ ] Cron jobs scheduled (auto-workflow-manager every 15 min)
- [ ] Function logs reviewed for errors

### Email
- [ ] Gmail OAuth tokens configured
- [ ] Email templates tested in all clients
- [ ] Sender domain verified in Gmail
- [ ] Test emails sent successfully

### Payments
- [ ] Stripe test mode validated
- [ ] Switch to Stripe live mode
- [ ] Webhooks configured for production URL
- [ ] Test payment with real card (then refund)

### Security
- [ ] All RLS policies enabled
- [ ] Customer access tokens tested
- [ ] Admin authentication working
- [ ] SQL injection protection verified

### Testing
- [ ] All critical workflows tested end-to-end
- [ ] Change request flow validated
- [ ] Payment flow validated
- [ ] Email delivery confirmed

## Post-Deployment

### Monitoring
- [ ] Check edge function logs for errors
- [ ] Monitor database performance
- [ ] Verify automated workflows running
- [ ] Test customer portal access

### Documentation
- [ ] Admin user guide updated
- [ ] Customer FAQ created
- [ ] Support contact info verified
- [ ] Brand messaging reviewed

## Rollback Plan
If issues occur:
1. Revert to last known good commit
2. Restore database from backup
3. Disable problematic edge functions
4. Notify customers of temporary issues
