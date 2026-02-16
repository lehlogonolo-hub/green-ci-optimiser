# Green CI Optimizer Architecture

## System Overview

The Green CI Optimizer is an AI-powered platform that automatically analyzes GitLab CI/CD pipelines to reduce carbon emissions and improve sustainability.

## Architecture Diagram
┌─────────────────┐ ┌──────────────────┐ ┌─────────────────┐
│ GitLab │────▶│ Green CI Agent │────▶│ Dashboard API │
│ Webhooks │ │ Platform │ │ Server │
└─────────────────┘ └──────────────────┘ └─────────────────┘
│ │
▼ ▼
┌──────────────────┐ ┌─────────────────┐
│ Pipeline │ │ React │
│ Analyzer │ │ Dashboard │
└──────────────────┘ └─────────────────┘
│ │
▼ ▼
┌──────────────────┐ ┌─────────────────┐
│ Google Cloud │ │ WebSocket │
│ BigQuery │ │ Real-time │
└──────────────────┘ └─────────────────┘


## Components

### 1. GitLab Duo Agents
- **green_ci_agent.yaml**: Main analysis agent
- **green_ci_sentinel.yaml**: Monitoring agent  
- **green_ci_advisor.yaml**: Recommendation agent

### 2. Core Modules
- **Carbon Calculator**: Estimates energy consumption and CO2 emissions
- **Pipeline Analyzer**: Deep analysis of pipeline patterns
- **Optimization Engine**: Generates and applies optimizations
- **MR Generator**: Creates merge requests with fixes

### 3. Data Pipeline
- GitLab API → Agent Platform → BigQuery → Dashboard

### 4. Frontend Dashboard
- Real-time metrics visualization
- Team benchmarking
- AI-powered impact predictor
- Optimization management

## Data Flow

1. **Pipeline Completion** triggers Green CI Agent
2. **Agent fetches** pipeline data from GitLab API
3. **Analysis engine** calculates carbon footprint and detects patterns
4. **Optimizations** are generated and prioritized
5. **If optimizations exist**, an MR is automatically created
6. **Metrics** are stored in BigQuery for historical analysis
7. **Dashboard** displays real-time updates via WebSocket

## Security

- All secrets stored in GitLab CI variables
- API authentication via JWT tokens
- Rate limiting on all endpoints
- Input validation and sanitization
- Encrypted data at rest (BigQuery)

## Scalability

- Horizontally scalable agents
- BigQuery for large-scale data storage
- Redis caching for frequent queries
- WebSocket for efficient real-time updates

## Monitoring

- Prometheus metrics endpoint
- Structured logging with Winston
- Health checks on all services
- Error tracking with Sentry integration