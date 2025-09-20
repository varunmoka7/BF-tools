# 🛡️ Security & Deployment Guide
## Waste Intelligence Platform - Production Security Implementation

This guide provides comprehensive instructions for securely deploying and maintaining the Waste Intelligence Platform authentication system.

## 📋 Table of Contents

1. [Quick Start](#quick-start)
2. [Security Configuration](#security-configuration)
3. [Environment Setup](#environment-setup)
4. [CI/CD Pipeline](#cicd-pipeline)
5. [Container Deployment](#container-deployment)
6. [Monitoring & Alerting](#monitoring--alerting)
7. [Security Best Practices](#security-best-practices)
8. [Incident Response](#incident-response)

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- GitHub repository access
- Supabase project setup

### 1. Initial Security Setup

```bash
# Clone repository
git clone https://github.com/varunmoka7/BF-tools.git
cd BF-tools

# Install dependencies
npm install

# Copy security environment template
cp .env.security.example .env.production

# Run security configuration check
npm run security:config-check
```

### 2. Environment Configuration

```bash
# Edit production environment file
nano .env.production

# Key variables to configure:
# - JWT_SECRET (generate strong 256-bit key)
# - SUPABASE_URL and keys
# - DATABASE_URL with SSL
# - CORS origins for production
# - Rate limiting settings
```

### 3. Run Security Validation

```bash
# Validate security configuration
npm run security:config-check

# Run security tests
npm run test:security

# Check application health
npm run health:check
```

---

## 🔐 Security Configuration

### Core Security Components

#### 1. Authentication Middleware (`backend/src/middleware/auth-middleware.ts`)
- JWT token validation
- Session management
- Role-based access control
- Account lockout mechanisms
- Audit logging

#### 2. Security Middleware (`backend/src/middleware/security-middleware.ts`)
- Rate limiting (general, auth, API)
- CORS protection
- Security headers (Helmet.js)
- Input sanitization
- Suspicious activity detection
- Request validation

#### 3. Environment Security (`.env.security.example`)
- Comprehensive security variables
- Production-ready defaults
- Feature flags for security controls

### Key Security Features

#### Rate Limiting
```javascript
// General requests: 100/15min
// Auth requests: 5/15min
// API requests: 1000/15min (5000 for premium)
```

#### Account Protection
```javascript
// Failed login attempts: 5 max
// Account lockout: 30 minutes
// Password policy: 12+ chars, complexity
```

#### Security Headers
```javascript
// CSP, HSTS, X-Frame-Options
// XSS Protection, Content-Type validation
// Referrer Policy, Download Options
```

---

## 🌍 Environment Setup

### Development Environment

```bash
# Start development stack
docker-compose up -d

# Start with hot reload
npm run dev

# Monitor security events
npm run security:monitoring
```

### Staging Environment

```bash
# Build production image
npm run docker:build

# Deploy to staging
npm run docker:prod

# Run security tests
npm run test:security:e2e
```

### Production Environment

```bash
# Production deployment
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Verify security configuration
npm run security:config-check

# Start monitoring
npm run security:monitoring
```

### Environment Variables Reference

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `JWT_SECRET` | 256-bit secret for JWT signing | ✅ | None |
| `SUPABASE_URL` | Supabase project URL | ✅ | None |
| `DATABASE_URL` | PostgreSQL connection string | ✅ | None |
| `ALLOWED_ORIGINS` | CORS allowed origins | ✅ | localhost:3000 |
| `RATE_LIMIT_MAX_REQUESTS` | General rate limit | ❌ | 100 |
| `AUTH_RATE_LIMIT_MAX_REQUESTS` | Auth rate limit | ❌ | 5 |
| `SESSION_SECRET` | Session encryption key | ✅ | None |
| `ENCRYPTION_KEY` | Data encryption key | ✅ | None |

---

## 🔄 CI/CD Pipeline

### GitHub Actions Workflow (`.github/workflows/ci-cd-security.yml`)

#### Pipeline Stages

1. **Security Scanning**
   - npm audit
   - Snyk vulnerability scanning
   - Dependency check
   - SAST with CodeQL

2. **Static Analysis**
   - ESLint security rules
   - TypeScript strict checking
   - SonarCloud analysis

3. **Authentication Tests**
   - Unit tests for auth components
   - Integration tests with test DB
   - Security-focused test scenarios

4. **End-to-End Security Tests**
   - Playwright security tests
   - Authentication flow validation
   - Authorization boundary testing

5. **Penetration Testing**
   - OWASP ZAP baseline scan
   - Nuclei security templates
   - Container security scanning

6. **Build & Deploy**
   - Security config validation
   - Docker image building
   - Container security scan
   - Deployment to staging/production

### Triggers
- Push to `main` branch
- Pull requests
- Daily security scans (scheduled)

### Required Secrets

```yaml
SNYK_TOKEN: # Snyk API token
SONAR_TOKEN: # SonarCloud token
VERCEL_TOKEN: # Vercel deployment token
SECURITY_WEBHOOK: # Security alert webhook
SENDGRID_API_KEY: # Email notifications
```

---

## 🐳 Container Deployment

### Docker Configuration

#### Multi-Stage Build (`Dockerfile`)
- Base: Node.js 18 Alpine with security updates
- Dependencies: Production-only installation
- Build: Application compilation
- Runtime: Minimal attack surface, non-root user

#### Security Features
- Non-root user execution
- Read-only filesystem
- No new privileges
- Health checks
- Resource limits

### Docker Compose Stack (`docker-compose.yml`)

#### Services
- **app**: Main Next.js application
- **postgres**: Database with SSL
- **redis**: Caching layer
- **nginx**: Reverse proxy with security
- **security-monitor**: Real-time monitoring
- **prometheus**: Metrics collection
- **grafana**: Security dashboard

#### Networks
- Isolated bridge network
- Inter-service communication only

#### Volumes
- Persistent data storage
- Log aggregation
- Backup storage

### Production Deployment

```bash
# Build all services
docker-compose build

# Start production stack
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Verify health
docker-compose ps
docker-compose logs -f app

# Run security validation
docker-compose exec app npm run security:config-check
```

---

## 📊 Monitoring & Alerting

### Security Monitoring (`scripts/security-monitoring.js`)

#### Real-time Monitoring
- Failed login attempts
- Brute force detection
- Suspicious IP activity
- Rate limit violations
- Account lockouts
- Privilege escalation attempts

#### Alert Thresholds
- Failed logins: 10/hour
- Rate limit hits: 100/15min
- Suspicious activity: 50/30min
- New suspicious IPs: 5/hour

#### Alert Channels
- Console logging
- Database storage
- Email notifications (critical)
- Webhook integration
- Security dashboard updates

### Health Monitoring (`scripts/health-check.js`)

#### Health Checks
- Application responsiveness
- Database connectivity
- Authentication service
- File system access
- Memory/CPU usage
- Network connectivity

#### Health Endpoints
- `/health` - Basic application health
- `/api/health` - API health with auth
- `/api/health/database` - Database connectivity

### Metrics & Dashboard

#### Prometheus Metrics
- Request rates and latencies
- Authentication success/failure rates
- Security event counts
- Resource utilization
- Error rates

#### Grafana Dashboard
- Security overview
- Authentication metrics
- Performance monitoring
- Alert visualization
- Real-time security events

---

## 🔒 Security Best Practices

### Authentication Security

1. **Strong Password Policy**
   - Minimum 12 characters
   - Complexity requirements
   - Regular password rotation
   - Password history prevention

2. **Session Management**
   - Secure session cookies
   - Session timeout (24 hours)
   - Session invalidation on security events
   - Multiple session detection

3. **Account Protection**
   - Progressive lockout delays
   - Suspicious activity detection
   - Location-based anomaly detection
   - Device fingerprinting

### API Security

1. **Rate Limiting**
   - Tiered rate limits by user type
   - Endpoint-specific limits
   - IP-based and user-based limiting
   - Graceful degradation

2. **Input Validation**
   - Comprehensive input sanitization
   - SQL injection prevention
   - XSS protection
   - File upload restrictions

3. **Authorization**
   - Role-based access control (RBAC)
   - Resource-level permissions
   - Company-scoped data access
   - Audit trail for all actions

### Infrastructure Security

1. **Network Security**
   - TLS 1.2+ encryption
   - HSTS headers
   - Secure headers suite
   - Network segmentation

2. **Container Security**
   - Non-root execution
   - Minimal base images
   - Regular security updates
   - Runtime protection

3. **Data Protection**
   - Encryption at rest
   - Encryption in transit
   - Key rotation
   - Secure backup procedures

---

## 🚨 Incident Response

### Security Incident Classification

#### Critical (P0)
- Data breach
- Authentication bypass
- System compromise
- Service unavailability

#### High (P1)
- Account compromise
- Privilege escalation
- DDoS attack
- Security control failure

#### Medium (P2)
- Suspicious activity patterns
- Configuration vulnerabilities
- Non-critical security violations

#### Low (P3)
- Policy violations
- Minor misconfigurations
- Security awareness issues

### Response Procedures

#### Immediate Response (0-15 minutes)
1. **Alert Assessment**
   - Verify alert legitimacy
   - Classify incident severity
   - Activate response team

2. **Containment**
   - Isolate affected systems
   - Block suspicious IP addresses
   - Lock compromised accounts
   - Preserve evidence

#### Investigation (15 minutes - 2 hours)
1. **Analysis**
   - Review audit logs
   - Analyze attack vectors
   - Assess data exposure
   - Document findings

2. **Communication**
   - Notify stakeholders
   - Prepare status updates
   - Coordinate with teams
   - Legal/compliance notification

#### Recovery (2-24 hours)
1. **Remediation**
   - Apply security patches
   - Update configurations
   - Restore from clean backups
   - Implement additional controls

2. **Verification**
   - Validate security posture
   - Confirm system integrity
   - Test critical functions
   - Monitor for reoccurrence

#### Post-Incident (24+ hours)
1. **Documentation**
   - Incident timeline
   - Root cause analysis
   - Lessons learned
   - Process improvements

2. **Follow-up**
   - Update security policies
   - Enhance monitoring
   - Staff training updates
   - Stakeholder communication

### Emergency Contacts

| Role | Contact Method | Escalation Time |
|------|---------------|-----------------|
| Security Team | security@yourdomain.com | Immediate |
| DevOps Team | devops@yourdomain.com | 15 minutes |
| Management | management@yourdomain.com | 30 minutes |
| Legal | legal@yourdomain.com | 1 hour |

---

## 📚 Additional Resources

### Security Tools & Scripts

| Script | Purpose | Usage |
|--------|---------|-------|
| `security-config-check.js` | Validate security configuration | `npm run security:config-check` |
| `security-monitoring.js` | Real-time security monitoring | `npm run security:monitoring` |
| `health-check.js` | Application health validation | `npm run health:check` |

### Configuration Files

| File | Purpose |
|------|---------|
| `.env.security.example` | Security environment template |
| `jest.config.security.js` | Security testing configuration |
| `playwright.config.security.ts` | E2E security test configuration |
| `docker-compose.yml` | Container orchestration |
| `nginx/nginx.conf` | Reverse proxy security |

### Documentation

- [Authentication Architecture](docs/authentication-architecture.md)
- [Epic 1: User Authentication](docs/PRD/epic-1-user-authentication.md)
- [Database Schema](backend/src/database/auth-migration.sql)
- [RLS Policies](backend/src/database/auth-rls-policies.sql)

---

## 🔄 Maintenance & Updates

### Regular Security Tasks

#### Daily
- Review security alerts
- Monitor authentication metrics
- Check system health
- Verify backup integrity

#### Weekly
- Security log analysis
- Vulnerability scanning
- Configuration review
- Incident response testing

#### Monthly
- Security policy updates
- Access review
- Penetration testing
- Staff security training

#### Quarterly
- Security architecture review
- Threat model updates
- Compliance audits
- Business continuity testing

### Update Procedures

1. **Security Updates**
   - Test in staging environment
   - Validate security configuration
   - Schedule maintenance window
   - Deploy with rollback plan

2. **Configuration Changes**
   - Document changes
   - Peer review process
   - Gradual rollout
   - Monitor for issues

3. **Emergency Patches**
   - Immediate assessment
   - Risk vs. impact analysis
   - Emergency deployment
   - Post-deployment validation

---

## 📞 Support & Contact

For security-related issues or questions:

- **Security Team**: security@yourdomain.com
- **DevOps Support**: devops@yourdomain.com
- **Emergency**: Use incident response procedures
- **Documentation**: [Security Wiki](link-to-internal-wiki)

---

*This document is maintained by the Security Team and updated regularly. Last updated: $(date)*