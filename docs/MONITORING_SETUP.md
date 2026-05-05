# Monitoring & Alerting Setup Guide

**Comprehensive monitoring configuration for Digital Wharf Dynamics**

---

## Overview

This guide covers setting up monitoring, alerting, and observability for the production environment.

---

## 1. Netlify Monitoring

### Deploy Notifications

**Setup Slack Integration:**

```bash
# Via Netlify Dashboard
# 1. Go to: Site Settings → Build & Deploy → Deploy notifications
# 2. Click "Add notification"
# 3. Select "Slack"
# 4. Choose events:
#    - Deploy started
#    - Deploy failed
#    - Deploy succeeded
# 5. Select Slack channel: #deployments
```

**Email Notifications:**

```bash
# Via Netlify Dashboard
# 1. Site Settings → Build & Deploy → Deploy notifications
# 2. Add notification → Email
# 3. Add emails: oncall@dobeu.wtf, engineering@dobeu.wtf
# 4. Select events: Deploy failed, Deploy succeeded
```

### Function Monitoring

**Enable Function Logs:**

```bash
# In netlify.toml
[functions]
  node_bundler = "esbuild"

[functions.settings]
  # Log all function invocations
  log_level = "info"
```

**Set Up Alerts:**

```bash
# Via Netlify Dashboard
# 1. Functions → Select function
# 2. Metrics → Set up alerts
# 3. Configure:
#    - Error rate > 5% for 5 minutes
#    - Duration > 10s for 5 minutes
#    - Invocations > 1000/minute
```

---

## 2. Supabase Postgres (db-dobeutech-unified) Monitoring

### Performance Alerts

**Setup in Supabase Dashboard:**

```bash
# 1. Go to: Alerts → Create Alert
# 2. Configure alerts:

# Alert 1: High Connection Count
Metric: Connections
Condition: > 150
Duration: 5 minutes
Action: Email + Slack

# Alert 2: Slow Queries
Metric: Query Execution Time
Condition: > 1000ms
Duration: 5 minutes
Action: Email

# Alert 3: High CPU
Metric: CPU Usage
Condition: > 80%
Duration: 10 minutes
Action: Email + PagerDuty

# Alert 4: Low Disk Space
Metric: Disk Space
Condition: < 20% free
Duration: 5 minutes
Action: Email + Slack

# Alert 5: Replication Lag
Metric: Replication Lag
Condition: > 10 seconds
Duration: 5 minutes
Action: Email + PagerDuty
```

### Query Performance

**Enable slow-query logging (Postgres `pg_stat_statements`):**

```sql
-- Run once via Supabase SQL editor
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- Top 10 slowest queries
SELECT query, calls, mean_exec_time, total_exec_time
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;
```

**Performance tooling:**

```text
# In the Supabase Dashboard for project `db-dobeutech-unified`:
# 1. Reports → Query Performance — slow queries, top calls
# 2. Database → Indexes — review index hit rate
# 3. Advisors → Performance Advisor — automatic suggestions
```

---

## 3. PostHog Analytics & Error Tracking

### Error Tracking Setup

**Configure in src/integrations/posthog.ts:**

```typescript
posthog.init("phc_Gaksl1OP0ZVYeErlumeRTuj5xJqPMQPe3H8UKxMpwAM", {
  api_host: "https://us.i.posthog.com",
  person_profiles: "identified_only",
  capture_pageview: true,
  capture_pageleave: true,

  // Error tracking
  autocapture: true,
  capture_performance: true,

  // Session recording
  session_recording: {
    recordCrossOriginIframes: true,
    maskAllInputs: true,
    maskTextSelector: ".sensitive",
  },
});
```

### Custom Error Tracking

**Add to src/lib/error-handler.ts:**

```typescript
import posthog from "posthog-js";

export function trackError(error: Error, context?: Record<string, any>) {
  posthog.capture("error", {
    error_message: error.message,
    error_stack: error.stack,
    ...context,
  });

  console.error("Error tracked:", error, context);
}
```

### Alerts in PostHog

```bash
# 1. Go to: PostHog Dashboard → Insights
# 2. Create insight: "Error Rate"
#    - Event: error
#    - Aggregation: Count
#    - Interval: 5 minutes
# 3. Set alert:
#    - Threshold: > 10 errors in 5 minutes
#    - Action: Webhook to Slack
```

---

## 4. Uptime Monitoring

### UptimeRobot Setup

**Create Monitors:**

```bash
# Monitor 1: Main Site
URL: https://dobeu.net
Type: HTTP(s)
Interval: 5 minutes
Alert Contacts: Email, Slack

# Monitor 2: API Health
URL: https://dobeu.net/.netlify/functions/health
Type: HTTP(s)
Interval: 5 minutes
Expected Status: 200
Alert Contacts: Email, PagerDuty

# Monitor 3: Auth Endpoint
URL: https://dobeu.net/.netlify/functions/_auth0
Type: HTTP(s)
Interval: 10 minutes
Alert Contacts: Email
```

**Alternative: Pingdom**

```bash
# Similar setup with more detailed checks
# 1. Create account at pingdom.com
# 2. Add checks for:
#    - Homepage (https://dobeu.net)
#    - API endpoints
#    - Auth flow
# 3. Configure alerts to Slack/PagerDuty
```

---

## 5. Real User Monitoring (RUM)

### Lighthouse CI

**Setup in GitHub Actions:**

```yaml
# .github/workflows/lighthouse.yml
name: Lighthouse CI
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: "20"

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Run Lighthouse
        run: |
          npm install -g @lhci/cli
          lhci autorun --config=.lighthouserc.json

      - name: Upload results
        uses: actions/upload-artifact@v3
        with:
          name: lighthouse-results
          path: .lighthouseci
```

**Configuration (.lighthouserc.json):**

```json
{
  "ci": {
    "collect": {
      "url": ["https://dobeu.net"],
      "numberOfRuns": 3
    },
    "assert": {
      "preset": "lighthouse:recommended",
      "assertions": {
        "categories:performance": ["error", { "minScore": 0.8 }],
        "categories:accessibility": ["error", { "minScore": 0.9 }],
        "categories:seo": ["error", { "minScore": 0.9 }]
      }
    },
    "upload": {
      "target": "temporary-public-storage"
    }
  }
}
```

---

## 6. Log Aggregation

### Netlify Log Drains

**Setup Log Forwarding:**

```bash
# Via Netlify CLI
netlify logs:drain create \
  --type=datadog \
  --token=<datadog-api-key>

# Or to S3
netlify logs:drain create \
  --type=s3 \
  --bucket=dobeu-logs \
  --region=us-east-1
```

### CloudWatch Logs (if using AWS)

```bash
# Forward Netlify logs to CloudWatch
# 1. Create CloudWatch log group
aws logs create-log-group --log-group-name /netlify/dobeu

# 2. Set up log stream
aws logs create-log-stream \
  --log-group-name /netlify/dobeu \
  --log-stream-name functions

# 3. Configure Netlify to forward logs
# (Use Netlify log drains or Lambda forwarder)
```

---

## 7. Custom Health Checks

### Create Health Check Endpoint

**api/health.ts (Vercel function):**

```typescript
import { createClient } from "@supabase/supabase-js";

export default async function handler(_req: Request) {
  const checks = {
    timestamp: new Date().toISOString(),
    status: "healthy",
    checks: {} as Record<string, any>,
  };

  // Check Supabase
  try {
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY!,
    );
    const { error } = await supabase.from("services").select("id").limit(1);
    if (error) throw error;
    checks.checks.supabase = { status: "ok" };
  } catch (error) {
    checks.status = "unhealthy";
    checks.checks.supabase = {
      status: "error",
      message: (error as Error).message,
    };
  }

  // Check Auth0
  try {
    const response = await fetch(
      `https://${process.env.AUTH0_DOMAIN}/.well-known/openid-configuration`,
    );
    if (response.ok) {
      checks.checks.auth0 = { status: "ok" };
    } else {
      throw new Error(`Auth0 returned ${response.status}`);
    }
  } catch (error) {
    checks.status = "unhealthy";
    checks.checks.auth0 = {
      status: "error",
      message: (error as Error).message,
    };
  }

  const statusCode = checks.status === "healthy" ? 200 : 503;

  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-cache",
    },
    body: JSON.stringify(checks, null, 2),
  };
};
```

---

## 8. Alerting Rules

### Severity Levels

| Severity      | Response Time | Notification              |
| ------------- | ------------- | ------------------------- |
| P0 - Critical | Immediate     | PagerDuty + Slack + Email |
| P1 - High     | < 15 min      | Slack + Email             |
| P2 - Medium   | < 1 hour      | Slack                     |
| P3 - Low      | Next day      | Email                     |

### Alert Conditions

**P0 Alerts:**

- Site down (uptime check fails)
- Error rate > 10% for 5 minutes
- All functions failing
- Database unreachable

**P1 Alerts:**

- Error rate > 5% for 10 minutes
- Function timeout rate > 20%
- Response time > 5s (p95)
- Supabase connections > 200

**P2 Alerts:**

- Error rate > 1% for 30 minutes
- Response time > 2s (p95)
- Build failures
- Lighthouse score drop > 10 points

**P3 Alerts:**

- Slow queries detected
- High memory usage
- Disk space < 30%
- Certificate expiring in 30 days

---

## 9. Dashboard Setup

### Grafana Dashboard (Optional)

**Metrics to Track:**

```yaml
# Panel 1: Request Rate
Query: sum(rate(http_requests_total[5m]))
Type: Graph
Alert: > 1000 req/s

# Panel 2: Error Rate
Query: sum(rate(http_requests_total{status=~"5.."}[5m]))
Type: Graph
Alert: > 5%

# Panel 3: Response Time
Query: histogram_quantile(0.95, http_request_duration_seconds)
Type: Graph
Alert: > 2s

# Panel 4: Function Duration
Query: avg(netlify_function_duration_seconds)
Type: Graph
Alert: > 5s

# Panel 5: Database Connections
Query: pg_stat_database.numbackends
Type: Gauge
Alert: > 150
```

### Simple Status Page

**Create status.html:**

```html
<!DOCTYPE html>
<html>
  <head>
    <title>Dobeu Status</title>
    <meta http-equiv="refresh" content="60" />
  </head>
  <body>
    <h1>System Status</h1>
    <div id="status"></div>

    <script>
      async function checkStatus() {
        const checks = [
          { name: "Website", url: "https://dobeu.net" },
          { name: "API", url: "https://dobeu.net/.netlify/functions/health" },
        ];

        const results = await Promise.all(
          checks.map(async (check) => {
            try {
              const response = await fetch(check.url);
              return {
                name: check.name,
                status: response.ok ? "✅ OK" : "❌ Down",
              };
            } catch {
              return { name: check.name, status: "❌ Down" };
            }
          }),
        );

        document.getElementById("status").innerHTML = results
          .map((r) => `<p>${r.name}: ${r.status}</p>`)
          .join("");
      }

      checkStatus();
      setInterval(checkStatus, 60000);
    </script>
  </body>
</html>
```

---

## 10. Monitoring Checklist

**Daily:**

- [ ] Check Netlify deploy status
- [ ] Review error logs in PostHog
- [ ] Check Supabase connection count
- [ ] Review slow queries in Supabase Reports

**Weekly:**

- [ ] Review Lighthouse scores
- [ ] Check disk space in Supabase
- [ ] Review function performance metrics
- [ ] Update monitoring dashboards

**Monthly:**

- [ ] Review and update alert thresholds
- [ ] Check certificate expiration dates
- [ ] Review and optimize slow queries
- [ ] Update monitoring documentation

---

## 11. Testing Alerts

**Test each alert channel:**

```bash
# Test Slack webhook
curl -X POST <slack-webhook-url> \
  -H 'Content-Type: application/json' \
  -d '{"text":"Test alert from monitoring system"}'

# Test email alerts
# Trigger a test alert in Vercel/Supabase dashboards

# Test PagerDuty
# Use PagerDuty test incident feature

# Test uptime monitor
# Temporarily break health check endpoint
# Verify alert is received
# Fix endpoint
```

---

## 12. Useful Queries

### PostHog Queries

```sql
-- Error rate by page
SELECT
  properties.$current_url as page,
  COUNT(*) as error_count
FROM events
WHERE event = 'error'
  AND timestamp > now() - interval '1 hour'
GROUP BY page
ORDER BY error_count DESC

-- User sessions with errors
SELECT
  distinct_id,
  COUNT(*) as error_count
FROM events
WHERE event = 'error'
  AND timestamp > now() - interval '24 hours'
GROUP BY distinct_id
HAVING error_count > 5
```

### Supabase Queries

```javascript
// Find slow queries
db.system.profile
  .find({
    millis: { $gt: 100 },
  })
  .sort({ ts: -1 })
  .limit(10);

// Connection stats
db.serverStatus().connections;

// Current operations
db.currentOp();

// Database size
db.stats();
```

---

**Keep this guide updated as monitoring evolves!**
