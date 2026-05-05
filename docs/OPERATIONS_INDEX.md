# Operations Documentation Index

**Complete operational documentation for Digital Wharf Dynamics**

---

## 📚 Documentation Overview

This directory contains all operational runbooks, procedures, and guides for managing the production environment.

---

## 🚨 Emergency Response

### For Active Incidents

**Start here:** [Quick Incident Response Guide](./QUICK_INCIDENT_RESPONSE.md)

Quick reference for common failure modes with immediate mitigation steps.

**Use when:**

- Site is down
- Users reporting errors
- Performance degraded
- Any P0/P1 incident

---

## 📖 Detailed Runbooks

### [Operational Runbook](./OPERATIONAL_RUNBOOK.md)

Comprehensive runbook covering:

- Service architecture
- All failure modes
- Diagnostic procedures
- Rollback procedures
- Escalation paths

**Use when:**

- Investigating complex issues
- Need detailed diagnostic steps
- Planning incident response
- Training new on-call engineers

---

## 📊 Monitoring & Alerting

### [Monitoring Setup Guide](./MONITORING_SETUP.md)

Complete monitoring configuration:

- Dashboard setup
- Alert configuration
- Log aggregation
- Health checks
- Performance monitoring

**Use when:**

- Setting up new monitoring
- Configuring alerts
- Troubleshooting monitoring gaps
- Reviewing monitoring strategy

---

## 🎯 Quick Reference by Scenario

### Site Down (P0)

1. **Immediate:** [Quick Response → Site Down](./QUICK_INCIDENT_RESPONSE.md#-site-down-p0)
2. **Detailed:** [Runbook → Site Down](./OPERATIONAL_RUNBOOK.md#1-site-down--500-errors)
3. **Rollback:** [Runbook → Rollback Procedures](./OPERATIONAL_RUNBOOK.md#rollback-procedures)

### Authentication Issues (P1)

1. **Immediate:** [Quick Response → Auth Failures](./QUICK_INCIDENT_RESPONSE.md#-auth-failures-p1)
2. **Detailed:** [Runbook → Authentication Failures](./OPERATIONAL_RUNBOOK.md#2-authentication-failures)

### Database Problems (P1)

1. **Immediate:** [Quick Response → Database Issues](./QUICK_INCIDENT_RESPONSE.md#-database-connection-issues-p1)
2. **Detailed:** [Runbook → Database Connection Failures](./OPERATIONAL_RUNBOOK.md#3-database-connection-failures)

### Performance Issues (P2)

1. **Immediate:** [Quick Response → Performance](./QUICK_INCIDENT_RESPONSE.md#-performance-issues-p2)
2. **Detailed:** [Runbook → Performance Degradation](./OPERATIONAL_RUNBOOK.md#7-performance-degradation)
3. **Monitoring:** [Monitoring → RUM](./MONITORING_SETUP.md#5-real-user-monitoring-rum)

### Build/Deploy Failures (P2)

1. **Immediate:** [Quick Response → Build Failures](./QUICK_INCIDENT_RESPONSE.md#-build-failures-p2)
2. **Detailed:** [Runbook → Build Failures](./OPERATIONAL_RUNBOOK.md#4-build-failures)

---

## 🛠️ Common Tasks

### Deploying to Production

```bash
# Pre-deployment
npm run test:ci
npm run lint
npx tsc --noEmit
node scripts/deploy-checklist.js

# Deploy
export NETLIFY_AUTH_TOKEN="<token>"
netlify deploy --prod --dir=dist

# Verify
curl -I https://dobeu.net
```

**Reference:** [Runbook → Pre-Deployment Checklist](./OPERATIONAL_RUNBOOK.md#pre-deployment-checklist)

### Rolling Back

```bash
# Quick rollback
netlify rollback

# Or via dashboard
# https://app.netlify.com/projects/dobeutech/deploys
```

**Reference:** [Runbook → Rollback Procedures](./OPERATIONAL_RUNBOOK.md#rollback-procedures)

### Checking Logs

```bash
# Function logs
netlify logs:function --name=<function-name>

# Deploy logs
netlify logs:deploy

# Supabase logs
# Atlas Dashboard → Metrics → Logs
```

**Reference:** [Runbook → Diagnostic Commands](./OPERATIONAL_RUNBOOK.md#diagnostic-commands)

### Health Checks

```bash
# Site availability
curl -I https://dobeu.net

# API health
curl https://dobeu.net/.netlify/functions/health

# Database connection
mongosh "mongodb+srv://<cluster>.mongodb.net/" --eval "db.runCommand({ping:1})"
```

**Reference:** [Runbook → Diagnostic Commands](./OPERATIONAL_RUNBOOK.md#diagnostic-commands)

---

## 📞 Contacts & Escalation

### Severity Levels

| Level         | Response  | Contact                      |
| ------------- | --------- | ---------------------------- |
| P0 - Critical | Immediate | PagerDuty + Engineering Lead |
| P1 - High     | < 15 min  | On-call Engineer             |
| P2 - Medium   | < 1 hour  | Team Slack                   |
| P3 - Low      | Next day  | Backlog                      |

### Key Contacts

- **On-Call:** #engineering-oncall (Slack)
- **Engineering Lead:** jeremyw@dobeu.wtf
- **Team:** #engineering (Slack)

**Reference:** [Runbook → Escalation Paths](./OPERATIONAL_RUNBOOK.md#escalation-paths)

---

## 🔗 External Resources

### Dashboards

- **Netlify:** https://app.netlify.com/projects/dobeutech
- **Supabase Postgres (db-dobeutech-unified):** https://cloud.mongodb.com/
- **PostHog:** https://us.posthog.com/
- **Auth0:** https://manage.auth0.com/

### Status Pages

- **Netlify Status:** https://www.netlifystatus.com/
- **Supabase Status:** https://status.mongodb.com/
- **Auth0 Status:** https://status.auth0.com/

### Documentation

- **Netlify Docs:** https://docs.netlify.com/
- **Supabase Docs:** https://docs.mongodb.com/
- **Auth0 Docs:** https://auth0.com/docs/

---

## 📋 Checklists

### On-Call Handoff

- [ ] Review open incidents
- [ ] Check monitoring dashboards
- [ ] Review recent deploys
- [ ] Test alert channels
- [ ] Review escalation contacts
- [ ] Read recent postmortems

### Weekly Review

- [ ] Review error rates in PostHog
- [ ] Check Supabase performance metrics
- [ ] Review slow queries
- [ ] Check disk space
- [ ] Review function performance
- [ ] Update documentation if needed

### Monthly Review

- [ ] Review and update alert thresholds
- [ ] Check certificate expiration dates
- [ ] Review monitoring coverage
- [ ] Update runbooks with lessons learned
- [ ] Review and optimize costs
- [ ] Test disaster recovery procedures

---

## 🎓 Training Resources

### For New On-Call Engineers

**Week 1:**

1. Read [Operational Runbook](./OPERATIONAL_RUNBOOK.md)
2. Review [Quick Incident Response](./QUICK_INCIDENT_RESPONSE.md)
3. Get access to all dashboards
4. Test alert channels

**Week 2:**

1. Shadow current on-call engineer
2. Practice rollback procedures in staging
3. Review recent incidents
4. Conduct tabletop exercises

**Week 3:**

1. Take on-call with backup
2. Document any gaps in runbooks
3. Suggest improvements

### Tabletop Exercises

**Scenario 1: Site Down**

- Trigger: Uptime monitor alerts
- Practice: Rollback procedure
- Time limit: 5 minutes

**Scenario 2: Database Connection Failure**

- Trigger: Supabase connection errors
- Practice: Diagnostic steps, certificate renewal
- Time limit: 15 minutes

**Scenario 3: High Error Rate**

- Trigger: PostHog error spike
- Practice: Log analysis, root cause identification
- Time limit: 30 minutes

---

## 📝 Document Maintenance

### Update Frequency

- **Quick Response Guide:** After each incident
- **Operational Runbook:** Monthly or after major changes
- **Monitoring Setup:** Quarterly or when adding new monitoring

### Review Schedule

- **Weekly:** Check for outdated information
- **Monthly:** Full review of all documents
- **Quarterly:** Validate all commands and procedures
- **Annually:** Complete rewrite if needed

### Contributing

When updating documentation:

1. Test all commands before documenting
2. Include context and reasoning
3. Add examples where helpful
4. Update the index if adding new sections
5. Get peer review before merging

---

## 🔍 Finding Information

### Search Tips

**By Symptom:**

- "Site down" → [Quick Response](./QUICK_INCIDENT_RESPONSE.md#-site-down-p0)
- "Slow performance" → [Quick Response](./QUICK_INCIDENT_RESPONSE.md#-performance-issues-p2)
- "Auth errors" → [Quick Response](./QUICK_INCIDENT_RESPONSE.md#-auth-failures-p1)

**By Component:**

- Netlify → [Runbook → Architecture](./OPERATIONAL_RUNBOOK.md#architecture)
- Supabase → [Runbook → Database Failures](./OPERATIONAL_RUNBOOK.md#3-database-connection-failures)
- Auth0 → [Runbook → Authentication Failures](./OPERATIONAL_RUNBOOK.md#2-authentication-failures)

**By Task:**

- Deploy → [Runbook → Pre-Deployment](./OPERATIONAL_RUNBOOK.md#pre-deployment-checklist)
- Rollback → [Runbook → Rollback](./OPERATIONAL_RUNBOOK.md#rollback-procedures)
- Monitor → [Monitoring Setup](./MONITORING_SETUP.md)

---

## 📊 Metrics & SLOs

### Service Level Objectives

| Metric                | Target  | Measurement       |
| --------------------- | ------- | ----------------- |
| Availability          | 99.9%   | Uptime monitoring |
| Response Time (p95)   | < 500ms | PostHog RUM       |
| Error Rate            | < 0.1%  | PostHog events    |
| Function Success Rate | > 99%   | Netlify metrics   |

### Tracking

- **Daily:** Check in PostHog dashboard
- **Weekly:** Review trends in Netlify
- **Monthly:** Generate SLO report

**Reference:** [Monitoring → Metrics](./MONITORING_SETUP.md#overview)

---

## 🚀 Continuous Improvement

### After Each Incident

1. Document what happened
2. Update runbooks with new learnings
3. Add missing diagnostic steps
4. Improve monitoring/alerting
5. Share learnings with team

### Quarterly Goals

- Reduce MTTR (Mean Time To Recovery)
- Improve monitoring coverage
- Automate common tasks
- Update documentation
- Train team members

---

**Last Updated:** 2025-12-14  
**Next Review:** 2026-01-14  
**Maintained By:** Engineering Team
