# Resume Leak Scanner

Lightweight service to scan uploaded resumes for potential public leaks and suspicious exposures.

---

## Table of Contents
- [Quick API](#quick-api)
- [Requirements](#requirements)
- [Local setup](#local-setup)
- [Environment variables](#environment-variables)
- [Directory structure](#directory-structure)
- [Testing](#testing)
- [Contributing](#contributing)
- [License](#license)

---

## Quick API

> Base path: `/api`

### POST `/api/scan`
Upload a resume for scanning.

- **Request**
  - `multipart/form-data`
  - field: `resume` (file)
- **Response**
  ```json
  { "jobId": "abc123", "status": "queued" }
