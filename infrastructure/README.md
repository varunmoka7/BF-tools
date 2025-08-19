# Infrastructure

Infrastructure as Code (IaC), deployment configurations, and DevOps automation for the BF-Tools platform.

## 📁 Directory Structure

```
infrastructure/
├── docker/            # Docker configurations
│   ├── frontend/     # Frontend container setup
│   ├── backend/      # Backend container setup
│   ├── database/     # Database container setup
│   └── compose/      # Docker Compose files
├── ci-cd/            # CI/CD pipeline configurations
│   ├── github/       # GitHub Actions workflows
│   ├── gitlab/       # GitLab CI/CD pipelines
│   ├── azure/        # Azure DevOps pipelines
│   └── jenkins/      # Jenkins pipeline scripts
├── scripts/          # Infrastructure automation scripts
│   ├── deployment/   # Deployment scripts
│   ├── monitoring/   # Monitoring setup
│   ├── backup/       # Backup automation
│   └── security/     # Security configurations
├── cloud/            # Cloud platform configurations
│   ├── aws/          # Amazon Web Services
│   ├── azure/        # Microsoft Azure
│   ├── gcp/          # Google Cloud Platform
│   └── supabase/     # Supabase configurations
├── kubernetes/       # Kubernetes manifests
│   ├── deployments/ # Application deployments
│   ├── services/     # Service definitions
│   ├── ingress/      # Ingress configurations
│   └── config/       # ConfigMaps and Secrets
└── terraform/        # Terraform infrastructure
    ├── modules/      # Reusable modules
    ├── environments/ # Environment-specific configs
    └── providers/    # Cloud provider configs
```

## 🐳 Docker Configuration (`docker/`)

### Frontend Container (`docker/frontend/`)

#### `Dockerfile`
```dockerfile
# Multi-stage build for React/Vite frontend
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY frontend/package*.json ./frontend/

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY frontend/ ./frontend/
COPY shared/ ./shared/

# Build application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built application
COPY --from=builder /app/frontend/dist /usr/share/nginx/html

# Copy nginx configuration
COPY infrastructure/docker/frontend/nginx.conf /etc/nginx/nginx.conf

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
```

#### `nginx.conf`
```nginx
events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/javascript
        application/xml+rss
        application/json;

    server {
        listen 80;
        server_name localhost;
        root /usr/share/nginx/html;
        index index.html;

        # Single Page Application routing
        location / {
            try_files $uri $uri/ /index.html;
        }

        # API proxy
        location /api/ {
            proxy_pass http://backend:3001;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Security headers
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header Referrer-Policy "no-referrer-when-downgrade" always;
        add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    }
}
```

### Backend Container (`docker/backend/`)

#### `Dockerfile`
```dockerfile
# Node.js backend container
FROM node:18-alpine

WORKDIR /app

# Install dependencies for native modules
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package*.json ./
COPY backend/package*.json ./backend/

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY backend/ ./backend/
COPY shared/ ./shared/

# Build TypeScript
RUN npm run backend:build

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Change ownership
RUN chown -R nodejs:nodejs /app
USER nodejs

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node backend/dist/health-check.js || exit 1

CMD ["node", "backend/dist/app.js"]
```

### Database Container (`docker/database/`)

#### `Dockerfile`
```dockerfile
# PostgreSQL with custom initialization
FROM postgres:15-alpine

# Copy initialization scripts
COPY infrastructure/docker/database/init/ /docker-entrypoint-initdb.d/

# Copy custom postgresql.conf
COPY infrastructure/docker/database/postgresql.conf /etc/postgresql/postgresql.conf

# Expose port
EXPOSE 5432

# Health check
HEALTHCHECK --interval=10s --timeout=3s --start-period=30s --retries=3 \
  CMD pg_isready -U $POSTGRES_USER -d $POSTGRES_DB || exit 1
```

### Docker Compose (`docker/compose/`)

#### `docker-compose.yml`
```yaml
version: '3.8'

services:
  frontend:
    build:
      context: ../../
      dockerfile: infrastructure/docker/frontend/Dockerfile
    ports:
      - "3000:80"
    depends_on:
      - backend
    environment:
      - NODE_ENV=production
    networks:
      - bf-tools-network

  backend:
    build:
      context: ../../
      dockerfile: infrastructure/docker/backend/Dockerfile
    ports:
      - "3001:3001"
    depends_on:
      - database
      - redis
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://postgres:password@database:5432/bf_tools
      - REDIS_URL=redis://redis:6379
    networks:
      - bf-tools-network
    volumes:
      - backend-logs:/app/logs

  database:
    build:
      context: ../../
      dockerfile: infrastructure/docker/database/Dockerfile
    environment:
      - POSTGRES_DB=bf_tools
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres-data:/var/lib/postgresql/data
    networks:
      - bf-tools-network
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes
    volumes:
      - redis-data:/data
    networks:
      - bf-tools-network
    ports:
      - "6379:6379"

volumes:
  postgres-data:
  redis-data:
  backend-logs:

networks:
  bf-tools-network:
    driver: bridge
```

#### `docker-compose.dev.yml`
```yaml
version: '3.8'

services:
  frontend:
    build:
      context: ../../
      dockerfile: infrastructure/docker/frontend/Dockerfile.dev
    ports:
      - "3000:3000"
    volumes:
      - ../../frontend:/app/frontend
      - ../../shared:/app/shared
      - /app/frontend/node_modules
    environment:
      - NODE_ENV=development
      - CHOKIDAR_USEPOLLING=true

  backend:
    build:
      context: ../../
      dockerfile: infrastructure/docker/backend/Dockerfile.dev
    ports:
      - "3001:3001"
      - "9229:9229"  # Debug port
    volumes:
      - ../../backend:/app/backend
      - ../../shared:/app/shared
      - /app/backend/node_modules
    environment:
      - NODE_ENV=development
      - DEBUG=bf-tools:*
```

## 🚀 CI/CD Pipelines (`ci-cd/`)

### GitHub Actions (`ci-cd/github/`)

#### `.github/workflows/main.yml`
```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

env:
  NODE_VERSION: '18'
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: bf_tools_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run type checking
        run: npm run type-check

      - name: Run linting
        run: npm run lint

      - name: Run frontend tests
        run: npm run test:frontend

      - name: Run backend tests
        run: npm run backend:test
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/bf_tools_test

      - name: Build applications
        run: |
          npm run build
          npm run backend:build

  security:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Run security audit
        run: npm audit --audit-level moderate

      - name: Run CodeQL analysis
        uses: github/codeql-action/analyze@v3
        with:
          languages: javascript

  build-and-push:
    needs: [test, security]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Log in to Container Registry
        uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Build and push frontend image
        uses: docker/build-push-action@v5
        with:
          context: .
          file: infrastructure/docker/frontend/Dockerfile
          push: true
          tags: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}/frontend:latest

      - name: Build and push backend image
        uses: docker/build-push-action@v5
        with:
          context: .
          file: infrastructure/docker/backend/Dockerfile
          push: true
          tags: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}/backend:latest

  deploy:
    needs: build-and-push
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - name: Deploy to staging
        run: |
          # Deploy to staging environment
          echo "Deploying to staging..."
          
      - name: Run health checks
        run: |
          # Verify deployment health
          echo "Running health checks..."
```

## ☁️ Cloud Configurations (`cloud/`)

### AWS Configuration (`cloud/aws/`)

#### `cloudformation.yml`
```yaml
AWSTemplateFormatVersion: '2010-09-09'
Description: 'BF-Tools Infrastructure on AWS'

Parameters:
  Environment:
    Type: String
    Default: staging
    AllowedValues: [staging, production]

Resources:
  # VPC Configuration
  VPC:
    Type: AWS::EC2::VPC
    Properties:
      CidrBlock: 10.0.0.0/16
      EnableDnsHostnames: true
      EnableDnsSupport: true
      Tags:
        - Key: Name
          Value: !Sub ${Environment}-bf-tools-vpc

  # ECS Cluster
  ECSCluster:
    Type: AWS::ECS::Cluster
    Properties:
      ClusterName: !Sub ${Environment}-bf-tools-cluster
      CapacityProviders:
        - FARGATE
        - FARGATE_SPOT

  # RDS Instance
  Database:
    Type: AWS::RDS::DBInstance
    Properties:
      DBInstanceIdentifier: !Sub ${Environment}-bf-tools-db
      DBInstanceClass: db.t3.micro
      Engine: postgres
      EngineVersion: '15.4'
      AllocatedStorage: 20
      DBName: bf_tools
      MasterUsername: postgres
      MasterUserPassword: !Ref DatabasePassword
      VPCSecurityGroups:
        - !Ref DatabaseSecurityGroup

  # Application Load Balancer
  LoadBalancer:
    Type: AWS::ElasticLoadBalancingV2::LoadBalancer
    Properties:
      Name: !Sub ${Environment}-bf-tools-alb
      Scheme: internet-facing
      Type: application
      Subnets:
        - !Ref PublicSubnet1
        - !Ref PublicSubnet2
      SecurityGroups:
        - !Ref LoadBalancerSecurityGroup
```

### Supabase Configuration (`cloud/supabase/`)

#### `supabase-config.sql`
```sql
-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Enable Row Level Security
ALTER TABLE waste_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their company's waste data" ON waste_data
  FOR SELECT USING (
    auth.uid() IN (
      SELECT user_id FROM user_companies 
      WHERE company_id = waste_data.company_id
    )
  );

CREATE POLICY "Users can insert waste data for their company" ON waste_data
  FOR INSERT WITH CHECK (
    auth.uid() IN (
      SELECT user_id FROM user_companies 
      WHERE company_id = waste_data.company_id
    )
  );

-- Create functions
CREATE OR REPLACE FUNCTION calculate_recycling_rate(company_uuid UUID)
RETURNS DECIMAL AS $$
DECLARE
  total_waste DECIMAL;
  recycled_waste DECIMAL;
BEGIN
  SELECT 
    SUM(quantity),
    SUM(CASE WHEN recycled = true THEN quantity ELSE 0 END)
  INTO total_waste, recycled_waste
  FROM waste_data
  WHERE company_id = company_uuid;
  
  IF total_waste = 0 THEN
    RETURN 0;
  END IF;
  
  RETURN recycled_waste / total_waste;
END;
$$ LANGUAGE plpgsql;
```

## ⚙️ Kubernetes Manifests (`kubernetes/`)

### Deployments (`kubernetes/deployments/`)

#### `frontend-deployment.yml`
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: bf-tools-frontend
  namespace: bf-tools
spec:
  replicas: 3
  selector:
    matchLabels:
      app: bf-tools-frontend
  template:
    metadata:
      labels:
        app: bf-tools-frontend
    spec:
      containers:
      - name: frontend
        image: ghcr.io/bf-tools/frontend:latest
        ports:
        - containerPort: 80
        resources:
          requests:
            memory: "128Mi"
            cpu: "100m"
          limits:
            memory: "256Mi"
            cpu: "200m"
        livenessProbe:
          httpGet:
            path: /
            port: 80
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /
            port: 80
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: bf-tools-frontend-service
  namespace: bf-tools
spec:
  selector:
    app: bf-tools-frontend
  ports:
    - protocol: TCP
      port: 80
      targetPort: 80
  type: ClusterIP
```

### Ingress (`kubernetes/ingress/`)

#### `ingress.yml`
```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: bf-tools-ingress
  namespace: bf-tools
  annotations:
    kubernetes.io/ingress.class: nginx
    cert-manager.io/cluster-issuer: letsencrypt-prod
    nginx.ingress.kubernetes.io/rewrite-target: /
spec:
  tls:
  - hosts:
    - bf-tools.com
    - api.bf-tools.com
    secretName: bf-tools-tls
  rules:
  - host: bf-tools.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: bf-tools-frontend-service
            port:
              number: 80
  - host: api.bf-tools.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: bf-tools-backend-service
            port:
              number: 3001
```

## 🏗️ Terraform Infrastructure (`terraform/`)

### Main Configuration (`terraform/main.tf`)
```hcl
terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    supabase = {
      source  = "supabase/supabase"
      version = "~> 1.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# Data sources
data "aws_availability_zones" "available" {
  state = "available"
}

# VPC Module
module "vpc" {
  source = "./modules/vpc"
  
  environment         = var.environment
  vpc_cidr           = var.vpc_cidr
  availability_zones = data.aws_availability_zones.available.names
  
  tags = local.common_tags
}

# ECS Module
module "ecs" {
  source = "./modules/ecs"
  
  environment = var.environment
  vpc_id      = module.vpc.vpc_id
  subnet_ids  = module.vpc.private_subnet_ids
  
  frontend_image = var.frontend_image
  backend_image  = var.backend_image
  
  tags = local.common_tags
}

# RDS Module
module "database" {
  source = "./modules/rds"
  
  environment        = var.environment
  vpc_id            = module.vpc.vpc_id
  subnet_ids        = module.vpc.database_subnet_ids
  allocated_storage = var.database_allocated_storage
  instance_class    = var.database_instance_class
  
  tags = local.common_tags
}
```

## 📊 Monitoring and Logging

### Prometheus Configuration
```yaml
# prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  - "alert_rules.yml"

scrape_configs:
  - job_name: 'bf-tools-backend'
    static_configs:
      - targets: ['backend:3001']
    metrics_path: '/metrics'
    scrape_interval: 30s

  - job_name: 'bf-tools-database'
    static_configs:
      - targets: ['postgres-exporter:9187']

alerting:
  alertmanagers:
    - static_configs:
        - targets:
          - alertmanager:9093
```

### Grafana Dashboard
```json
{
  "dashboard": {
    "title": "BF-Tools Platform Monitoring",
    "panels": [
      {
        "title": "API Response Time",
        "type": "graph",
        "targets": [
          {
            "expr": "http_request_duration_seconds{job=\"bf-tools-backend\"}",
            "legendFormat": "{{method}} {{route}}"
          }
        ]
      },
      {
        "title": "Database Connections",
        "type": "stat",
        "targets": [
          {
            "expr": "pg_stat_database_numbackends{datname=\"bf_tools\"}"
          }
        ]
      }
    ]
  }
}
```

## 🛡️ Security Configurations

### Security Scanning
```yaml
# security-scan.yml
name: Security Scan

on:
  schedule:
    - cron: '0 2 * * *'  # Daily at 2 AM
  push:
    branches: [main]

jobs:
  vulnerability-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Run Trivy vulnerability scanner
        uses: aquasecurity/trivy-action@master
        with:
          image-ref: 'ghcr.io/bf-tools/backend:latest'
          format: 'sarif'
          output: 'trivy-results.sarif'
      
      - name: Upload Trivy scan results
        uses: github/codeql-action/upload-sarif@v3
        with:
          sarif_file: 'trivy-results.sarif'
```

## 📋 Usage Examples

### Local Development
```bash
# Start development environment
docker-compose -f infrastructure/docker/compose/docker-compose.dev.yml up

# Build and start production environment
docker-compose -f infrastructure/docker/compose/docker-compose.yml up --build

# Scale services
docker-compose up --scale backend=3
```

### Cloud Deployment
```bash
# Deploy to AWS with Terraform
cd infrastructure/terraform
terraform init
terraform plan -var-file="environments/staging.tfvars"
terraform apply

# Deploy to Kubernetes
kubectl apply -f infrastructure/kubernetes/
```

---

Production-ready infrastructure for scalable waste intelligence platform