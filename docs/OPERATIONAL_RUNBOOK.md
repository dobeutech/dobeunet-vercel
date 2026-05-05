# Operational Runbook - Digital Wharf Dynamics (dobeu.net)

**Service:** Digital Wharf Dynamics Web Application  
**Stack:** React + Vite + Netlify + Supabase + Auth0  
**Production URL:** https://dobeu.net  
**Last Updated:** 2025-12-14

---

## Table of Contents

1. [Service Overview](#service-overview)
2. [Architecture](#architecture)
3. [Monitoring & Dashboards](#monitoring--dashboards)
4. [Common Failure Modes](#common-failure-modes)
5. [Incident Response Procedures](#incident-response-procedures)
6. [Diagnostic Commands](#diagnostic-commands)
7. [Rollback Procedures](#rollback-procedures)
8. [Escalation Paths](#escalation-paths)

---

## Service Overview

### Components

| Component      | Technology             | Purpose                                 |
| -------------- | ---------------------- | --------------------------------------- |
| Frontend       | React 18 + Vite 7      | SPA serving static assets               |
| CDN/Hosting    | Netlify                | Edge distribution, serverless functions |
| Database       | Supabase PostgreSQL    | Primary data store                      |
| Authentication | Auth0                  | User authentication/authorization       |
| Analytics      | PostHog, Mixpanel, GTM | User behavior tracking                  |
| Support        | Intercom               | Customer support widget                 |
| Forms          | Typeform               | Lead capture                            |

### Critical Dependencies

- **Netlify Functions:** 17 serverless functions
- **Edge Functions:** 4 edge functions (CSP, prerender, UA blocker)
- **External APIs:** Auth0, Supabase, Stripe, Intercom, PostHog

---

## Architecture

```
User → Vercel Edge Network → Static Assets (React SPA)
                              ↓
                      Vercel Serverless Functions (api/*) → Supabase
                              ↓
                          Auth0 (JWT)
```

### Network Flow

1. User requests → Vercel Edge (CDN, automatic global distribution)
2. Static assets served from Vercel's edge cache
3. API calls → Vercel Serverless Functions (`api/*.ts`, `@vercel/node` runtime)
4. Functions → Supabase Postgres `db-dobeutech-unified` (TLS, service-role key on the server, anon/publishable key in the browser; RLS enforces row-level access)
5. Auth → Auth0 (OAuth2/OIDC)

---

## Monitoring & Dashboards

### Primary Dashboards

**Netlify Dashboard**

- URL: https://app.netlify.com/projects/dobeutech
- Metrics: Deploy status, function invocations, bandwidth
- Access: Team login required

**Supabase Postgres (db-dobeutech-unified) Dashboard**

- URL: https://supabase.com/dashboard/
- Metrics: Connection count, query performance, storage
- Access: project member login (no client certs needed)

**PostHog Dashboard**

- URL: https://us.posthog.com/
- Metrics: User sessions, errors, page views
- Access: API key: `phc_Gaksl1OP0ZVYeErlumeRTuj5xJqPMQPe3H8UKxMpwAM`

### Key Metrics to Monitor

| Metric               | Normal  | Warning    | Critical |
| -------------------- | ------- | ---------- | -------- |
| Response Time (p95)  | < 500ms | 500-1000ms | > 1000ms |
| Error Rate           | < 0.1%  | 0.1-1%     | > 1%     |
| Function Duration    | < 2s    | 2-5s       | > 5s     |
| Supabase Connections | < 100   | 100-200    | > 200    |
| CDN Cache Hit Rate   | > 90%   | 80-90%     | < 80%    |

---

## Common Failure Modes

### 1. Site Down / 500 Errors

**Symptoms:**

- Users report "Site unavailable"
- Netlify shows failed deploy
- 500 errors in browser console

**Triage Steps:**

```bash
# Check Netlify deploy status
netlify status

# Check latest deploy logs
netlify logs:function --name=<function-name>

# Check if site is accessible
curl -I https://dobeu.net
```

**Root Causes:**

- Failed build/deploy
- Environment variable misconfiguration
- Function timeout
- Supabase connection failure

**Mitigation:**

```bash
# Rollback to last known good deploy
netlify rollback

# Or redeploy from main
git checkout main
netlify deploy --prod
```

---

### 2. Authentication Failures

**Symptoms:**

- Users cannot log in
- "Invalid token" errors
- Redirect loops on /auth

**Triage Steps:**

```bash
# Check Auth0 status
curl https://status.auth0.com/api/v2/status.json

# Verify Auth0 env vars in Netlify
netlify env:list | grep AUTH0

# Check function logs
netlify logs:function --name=_auth0
```

**Root Causes:**

- Auth0 service outage
- Expired/invalid credentials
- CORS misconfiguration
- Token expiration issues

**Mitigation:**

```bash
# Verify Auth0 configuration
# Check: https://manage.auth0.com/dashboard

# Update Auth0 env vars if needed
netlify env:set AUTH0_DOMAIN <value>
netlify env:set AUTH0_CLIENT_ID <value>
netlify env:set AUTH0_CLIENT_SECRET <value>

# Redeploy
netlify deploy --prod
```

---

### 3. Database Connection Failures

**Symptoms:**

- "Cannot connect to database" errors
- Timeout errors in function logs
- 503 errors on API endpoints

**Triage Steps:**

```bash
# Check Supabase Postgres (db-dobeutech-unified) status
# Visit: https://status.supabase.com/

# Test connection from local (use the Postgres DSN, NOT the HTTPS API URL)
# Get SUPABASE_DB_URL from Supabase Dashboard → Settings → Database → Connection string
psql "$SUPABASE_DB_URL" -c "SELECT 1;"

# Check connection pool metrics in Supabase Dashboard
# Navigate to: Metrics → Connections
```

**Root Causes:**

- Supabase Postgres (db-dobeutech-unified) outage
- Connection pool exhaustion
- TLS handshake / network egress issue
- Network/firewall issues
- IP whitelist misconfiguration

**Mitigation:**

```bash
# Check IP allowlist in Supabase Dashboard → Settings → Database
# Navigate to: Network Access → IP Access List

# Verify certificate validity
openssl x509 -in <cert.pem> -noout -dates

# Restart functions (redeploy)
netlify deploy --prod

# If TLS cert pinned by Supabase, no manual rotation needed:
# Database Access → Users → Download new certificate
```

---

### 4. Build Failures

**Symptoms:**

- Deploy fails in Netlify
- "Build failed" notification
- TypeScript/ESLint errors

**Triage Steps:**

```bash
# Check build logs in Netlify dashboard
# Or via CLI:
netlify logs:deploy

# Reproduce locally
npm run build

# Check for dependency issues
npm ls
```

**Root Causes:**

- Dependency conflicts
- TypeScript errors
- Missing environment variables
- Out of memory during build

**Mitigation:**

```bash
# Fix dependency issues
npm install --legacy-peer-deps

# Fix TypeScript errors
npm run lint
npx tsc --noEmit

# Clear cache and rebuild
rm -rf node_modules dist
npm install
npm run build

# If successful, commit and push
git add .
git commit -m "fix: resolve build errors"
git push origin main
```

---

### 5. Function Timeouts

**Symptoms:**

- 504 Gateway Timeout
- "Function execution timed out" in logs
- Slow API responses

**Triage Steps:**

```bash
# Check function duration in Netlify
netlify logs:function --name=<function-name>

# Check Supabase slow queries
# Supabase Dashboard → Performance Advisor

# Check function memory usage
# Netlify Dashboard → Functions → <function> → Metrics
```

**Root Causes:**

- Inefficient database queries
- Large payload processing
- External API timeouts
- Memory leaks

**Mitigation:**

```bash
# Increase function timeout (netlify.toml)
# Add to function config:
# [functions]
#   node_bundler = "esbuild"
#   [functions."function-name"]
#     timeout = 26

# Optimize queries (add indexes in Supabase)
# Review slow queries via Supabase Dashboard → Reports → Query Performance
# (or pg_stat_statements via the SQL editor)

# Add query timeouts
# In function code:
# const result = await collection.find().maxTimeMS(5000)

# Redeploy
netlify deploy --prod
```

---

### 6. High Error Rate

**Symptoms:**

- Spike in 4xx/5xx errors
- PostHog shows increased error events
- User reports of broken features

**Triage Steps:**

```bash
# Check error logs in PostHog
# Navigate to: Insights → Errors

# Check Netlify function logs
netlify logs:function --name=<function-name> | grep ERROR

# Check browser console errors
# Open: https://dobeu.net
# F12 → Console
```

**Root Causes:**

- Recent deploy introduced bugs
- API rate limiting
- CORS issues
- CSP blocking resources

**Mitigation:**

```bash
# Rollback to previous deploy
netlify rollback

# Check CSP violations
# Netlify Dashboard → Functions → __csp-violations

# Review recent changes
git log --oneline -10
git diff HEAD~1

# If CSP issue, update netlify.toml headers
# Redeploy after fix
```

---

### 7. Performance Degradation

**Symptoms:**

- Slow page loads (> 3s)
- Lighthouse score drop
- User complaints about speed

**Triage Steps:**

```bash
# Run Lighthouse audit
npx lighthouse https://dobeu.net --view

# Check CDN cache hit rate
# Netlify Dashboard → Analytics → Bandwidth

# Check bundle size
npm run build
ls -lh dist/assets/*.js

# Check Supabase query performance
# Supabase Dashboard → Performance Advisor
```

**Root Causes:**

- Large bundle size
- Unoptimized images
- Slow database queries
- CDN cache misses
- Too many external scripts

**Mitigation:**

```bash
# Analyze bundle
npx vite-bundle-visualizer

# Optimize images
# Use WebP format, lazy loading

# Add database indexes
# Review Performance Advisor recommendations

# Increase cache TTL in netlify.toml
# Update Cache-Control headers

# Lazy load components
# Use React.lazy() and Suspense
```

---

## Diagnostic Commands

### Netlify CLI

```bash
# Check deployment status
netlify status

# View recent deploys
netlify deploy:list

# View function logs (last 100 lines)
netlify logs:function --name=<function-name>

# View deploy logs
netlify logs:deploy

# List environment variables
netlify env:list

# Test function locally
netlify dev

# Deploy to production
export NETLIFY_AUTH_TOKEN="<token>"
netlify deploy --prod --dir=dist
```

### Supabase Postgres (db-dobeutech-unified)

```bash
# Connect via psql
psql "$SUPABASE_URL" \
  --tls \
  --tlsCAFile <cert.pem> \
  --tlsCertificateKeyFile <cert.pem>

# Check connection count
db.serverStatus().connections

# Check slow queries
db.system.profile.find().sort({ts:-1}).limit(10)

# Check database size
db.stats()

# Check collection stats
db.<collection>.stats()
```

### Git Operations

```bash
# Check current branch and status
git status
git branch -a

# View recent commits
git log --oneline -10

# View changes in last deploy
git diff HEAD~1

# Check remote status
git fetch origin
git log origin/main..HEAD
```

### Health Checks

```bash
# Check site availability
curl -I https://dobeu.net

# Check specific endpoint
curl https://dobeu.net/.netlify/functions/<function-name>

# Check response time
time curl -s https://dobeu.net > /dev/null

# Check SSL certificate
openssl s_client -connect dobeu.net:443 -servername dobeu.net < /dev/null

# Check DNS
dig dobeu.net
nslookup dobeu.net
```

### Performance Testing

```bash
# Run Lighthouse
npx lighthouse https://dobeu.net --output=json --output-path=./report.json

# Load test (use with caution)
ab -n 100 -c 10 https://dobeu.net/

# Check bundle size
npm run build
du -sh dist/
ls -lh dist/assets/*.js
```

---

## Rollback Procedures

### Immediate Rollback (< 5 minutes)

```bash
# Via Netlify CLI
netlify rollback

# Or via Netlify Dashboard
# 1. Go to: https://app.netlify.com/projects/dobeutech/deploys
# 2. Find last successful deploy
# 3. Click "Publish deploy"
```

### Git-based Rollback

```bash
# Identify last good commit
git log --oneline -10

# Revert to specific commit
git revert <commit-hash>
git push origin main

# Or hard reset (use with caution)
git reset --hard <commit-hash>
git push origin main --force

# Netlify will auto-deploy
```

### Database Rollback

```bash
# Supabase Postgres (db-dobeutech-unified) Point-in-Time Restore
# 1. Go to: Supabase Dashboard → Project db-dobeutech-unified → Database → Backups
# 2. Choose "Point in time recovery" (PITR)
# 3. Select target timestamp
# 4. Confirm restore (this writes over the current branch / project state)

# Note: This is destructive. Coordinate with team.
```

---

## Escalation Paths

### Severity Levels

**P0 - Critical (Site Down)**

- Response Time: Immediate
- Escalate To: Engineering Lead
- Actions: Page on-call, rollback immediately

**P1 - High (Degraded Service)**

- Response Time: < 15 minutes
- Escalate To: On-call Engineer
- Actions: Investigate, mitigate, communicate

**P2 - Medium (Non-critical Issues)**

- Response Time: < 1 hour
- Escalate To: Team Slack
- Actions: Create ticket, schedule fix

**P3 - Low (Minor Issues)**

- Response Time: Next business day
- Escalate To: Backlog
- Actions: Document, prioritize

### Contact Information

**On-Call Engineer**

- Slack: #engineering-oncall
- Email: oncall@dobeu.wtf

**Engineering Lead**

- Name: Jeremy Williams
- Email: jeremyw@dobeu.wtf
- Slack: @jeremy

**External Support**

- Netlify Support: https://www.netlify.com/support/
- Supabase Support: https://supabase.com/support
- Auth0 Support: https://support.auth0.com/

---

## Pre-Deployment Checklist

Run before every production deploy:

```bash
# 1. Run tests
npm run test:ci
npm run test:e2e

# 2. Lint code
npm run lint

# 3. Type check
npx tsc --noEmit

# 4. Build locally
npm run build

# 5. Verify environment variables
netlify env:list

# 6. Run deployment checklist
node scripts/deploy-checklist.js

# 7. Deploy to production
netlify deploy --prod --dir=dist
```

---

## Post-Incident Review

After resolving an incident:

1. **Document Timeline**
   - When detected
   - Actions taken
   - Resolution time

2. **Root Cause Analysis**
   - What failed
   - Why it failed
   - How it was fixed

3. **Prevention**
   - What monitoring would have caught it earlier
   - What automation could prevent recurrence
   - What documentation needs updating

4. **Action Items**
   - Create tickets for improvements
   - Update runbook
   - Share learnings with team

---

## Useful Links

- **Production Site:** https://dobeu.net
- **Netlify Dashboard:** https://app.netlify.com/projects/dobeutech
- **Supabase Postgres (db-dobeutech-unified):** https://supabase.com/dashboard/
- **Auth0 Dashboard:** https://manage.auth0.com/
- **PostHog:** https://us.posthog.com/
- **GitHub Repo:** https://github.com/dobeutech/digital-wharf-dynamics
- **Status Page:** (Create one if needed)

---

## Emergency Contacts

**Business Hours:** Mon-Fri 9am-5pm EST  
**After Hours:** Page on-call via PagerDuty (if configured)

**Emergency Procedures:**

1. Assess severity (P0-P3)
2. Follow mitigation steps above
3. Communicate in #incidents Slack channel
4. Escalate if needed
5. Document actions taken

---

**Document Version:** 1.0  
**Last Reviewed:** 2025-12-14  
**Next Review:** 2026-01-14
