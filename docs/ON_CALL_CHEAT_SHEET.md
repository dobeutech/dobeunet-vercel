# On-Call Cheat Sheet - Digital Wharf Dynamics

**Print this and keep it handy during on-call shifts**

---

## 🚨 EMERGENCY CONTACTS

| Role             | Contact             |
| ---------------- | ------------------- |
| Engineering Lead | jeremyw@dobeu.wtf   |
| On-Call Slack    | #engineering-oncall |
| Team Slack       | #engineering        |
| Incidents        | #incidents          |

---

## 🔥 IMMEDIATE RESPONSE (< 2 MIN)

### Site Down

```bash
curl -I https://dobeu.net
vercel rollback
```

### Auth Broken

```bash
curl https://status.auth0.com/api/v2/status.json
vercel logs --since 15m
```

### Database Down

```bash
# Check Supabase status: https://status.supabase.com/
vercel logs --follow | grep -i supabase
```

---

## 📊 DASHBOARDS (Check in Order)

1. **Vercel:** https://vercel.com/dobeutechnology/dobeunet-vercel
2. **PostHog:** https://us.posthog.com/
3. **Supabase:** https://supabase.com/dashboard/
4. **Auth0:** https://manage.auth0.com/

---

## 🔍 DIAGNOSTIC COMMANDS

### Quick Health Check

```bash
# All-in-one health check
curl -I https://dobeu.net && \
vercel inspect && \
echo "✅ Basic health OK"
```

### Check Logs

```bash
# Function logs (last 50 lines)
vercel logs --since 30m

# Deploy logs
vercel logs

# Filter for errors
vercel logs --follow | grep -i error
```

### Check Recent Deploys

```bash
# List last 5 deploys
vercel ls | head -5

# Check current status
vercel inspect
```

---

## 🔄 ROLLBACK PROCEDURES

### Method 1: CLI (Fastest)

```bash
vercel rollback
```

### Method 2: Dashboard

1. Go to: https://vercel.com/dobeutechnology/dobeunet-vercel/deploys
2. Find last successful deploy
3. Click "Publish deploy"

### Method 3: Git Revert

```bash
git revert HEAD
git push origin main
# Wait for auto-deploy (~2 min)
```

---

## 🎯 SEVERITY LEVELS

| Level  | Response  | Action               |
| ------ | --------- | -------------------- |
| **P0** | Immediate | Rollback + Page lead |
| **P1** | < 15 min  | Investigate + Slack  |
| **P2** | < 1 hour  | Create ticket        |
| **P3** | Next day  | Backlog              |

---

## 📞 ESCALATION

### When to Escalate

- P0: Immediately
- P1: After 15 minutes if not resolved
- P2: After 1 hour if not resolved

### How to Escalate

1. Post in #incidents with details
2. @ mention engineering lead
3. If after hours: Use PagerDuty (if configured)

---

## 💬 COMMUNICATION TEMPLATES

### Initial Alert

```
🚨 INCIDENT: [Brief description]
Severity: P[0-3]
Impact: [What's affected]
Status: Investigating
ETA: [Unknown/15min/30min]
```

### Update (Every 15 min)

```
📊 UPDATE: [What we found]
Actions: [What we did]
Status: [Better/Same/Worse]
Next: [What we're doing]
ETA: [Updated]
```

### Resolution

```
✅ RESOLVED: [Brief description]
Cause: [What caused it]
Fix: [What we did]
Duration: [How long]
Follow-up: [Ticket link]
```

---

## 🛠️ COMMON FIXES

### Site Down

```bash
vercel rollback
```

### Auth Errors

```bash
# Check Auth0 status first
# If Auth0 is up, check env vars:
vercel env ls | grep AUTH0
```

### Database Errors

```bash
# Restart functions (redeploy)
vercel deploy --prod
```

### Build Failures

```bash
# Check build logs
vercel logs

# Reproduce locally
npm run build
```

### High Error Rate

```bash
# Check PostHog: https://us.posthog.com/
# If recent deploy, rollback:
vercel rollback
```

---

## 📈 KEY METRICS

| Metric            | Normal  | Warning    | Critical |
| ----------------- | ------- | ---------- | -------- |
| Response Time     | < 500ms | 500-1000ms | > 1000ms |
| Error Rate        | < 0.1%  | 0.1-1%     | > 1%     |
| Function Duration | < 2s    | 2-5s       | > 5s     |
| DB Connections    | < 100   | 100-200    | > 200    |

---

## 🔗 QUICK LINKS

### Production

- Site: https://dobeu.net
- Health: https://dobeu.net/.netlify/functions/health

### Dashboards

- Netlify: https://vercel.com/dobeutechnology/dobeunet-vercel
- Supabase: https://supabase.com/dashboard/
- PostHog: https://us.posthog.com/

### Status Pages

- Netlify: https://www.vercel-status.com/
- Supabase: https://status.supabase.com/
- Auth0: https://status.auth0.com/

### Documentation

- Full Runbook: docs/OPERATIONAL_RUNBOOK.md
- Quick Guide: docs/QUICK_INCIDENT_RESPONSE.md
- Monitoring: docs/MONITORING_SETUP.md

---

## 🎓 DECISION TREE

```
Is site accessible?
├─ NO → P0: Rollback immediately
└─ YES
   ├─ Users reporting errors?
   │  ├─ YES → P1: Check logs
   │  └─ NO → Monitor
   │
   ├─ Performance degraded?
   │  ├─ YES → P2: Check metrics
   │  └─ NO → Monitor
   │
   └─ Feature broken?
      ├─ YES → P1/P2: Check function logs
      └─ NO → P3: Document
```

---

## 🔐 CREDENTIALS

### Netlify

```bash
export VERCEL_TOKEN="<token>"
# Token stored in: 1Password / Secrets Manager
```

### Supabase

```bash
# Connection string lives in Vercel Project Settings → Environment Variables
# (SUPABASE_DB_URL).  No client certs needed; TLS is automatic.
# Test it: psql "$SUPABASE_DB_URL" -c "SELECT 1;"
```

### Auth0

```bash
# Dashboard: https://manage.auth0.com/
# Credentials in: 1Password / Secrets Manager
```

---

## ⚡ ONE-LINERS

```bash
# Quick site check
curl -I https://dobeu.net

# Rollback
vercel rollback

# Check errors
vercel logs --follow | grep ERROR

# Deploy status
vercel inspect

# Recent deploys
vercel ls | head -5

# Test database
psql "$SUPABASE_DB_URL" -c "SELECT 1;"

# Response time
time curl -s https://dobeu.net > /dev/null
```

---

## 📝 INCIDENT CHECKLIST

During an incident:

- [ ] Identify severity (P0-P3)
- [ ] Post initial alert in #incidents
- [ ] Check relevant dashboards
- [ ] Run diagnostic commands
- [ ] Apply mitigation
- [ ] Post updates every 15 minutes
- [ ] Escalate if needed
- [ ] Document actions taken
- [ ] Post resolution message
- [ ] Create follow-up ticket

After resolution:

- [ ] Update runbook if needed
- [ ] Share learnings with team
- [ ] Schedule postmortem (P0/P1)

---

## 🚀 PRE-DEPLOYMENT

Before deploying:

```bash
# Run tests
npm run test:ci

# Lint
npm run lint

# Type check
npx tsc --noEmit

# Build
npm run build

# Deploy
vercel deploy --prod --dir=dist
```

---

## 📞 EXTERNAL SUPPORT

| Service  | Support                      |
| -------- | ---------------------------- |
| Vercel   | https://vercel.com/help      |
| Supabase | https://supabase.com/support |
| Auth0    | https://support.auth0.com/   |

---

## 💡 TIPS

1. **Always check status pages first** - Don't waste time debugging external outages
2. **Rollback first, investigate later** - For P0, restore service immediately
3. **Communicate early and often** - Keep stakeholders informed
4. **Document everything** - Future you will thank you
5. **Don't panic** - Follow the runbook, escalate if needed

---

## 🎯 REMEMBER

- **P0 = Rollback immediately** (< 2 minutes)
- **Check status pages** before debugging
- **Update #incidents** every 15 minutes
- **Escalate early** if stuck
- **Document actions** for postmortem

---

**Print Date:** **\*\***\_\_**\*\***  
**On-Call Period:** **\*\***\_\_**\*\***  
**Backup Contact:** **\*\***\_\_**\*\***

---

**Keep this sheet accessible during your on-call shift!**
