# Green CI Optimizer API Documentation

## Base URL
`https://green-ci.example.com/api/v1`

## Authentication
All API requests require an API key in the header:
X-API-Key: 6ce899bfc7884efd67ace1c50c03ee092d3a0be85705dcc8b7664cf7c22eedb4

## Endpoints

### GET /metrics
Get pipeline metrics for a project.

**Parameters:**
- `project_id` (required): GitLab project ID
- `days` (optional): Number of days to look back (default: 30)

**Response:**
```json
{
  "project_id": "123",
  "total_pipelines": 150,
  "total_co2": 12.5,
  "avg_score": 78,
  "trends": {
    "co2_trend": -15.2,
    "score_trend": 5,
    "direction": "improving"
  }
}