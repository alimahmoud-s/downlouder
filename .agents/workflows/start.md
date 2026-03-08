---
description: Start all services for the Downlouder application
---

# Start All Services

Open **4 separate terminals** and run each command:

// turbo-all

## 1. Redis (Docker)

```
docker start downlouder-redis
```

> If first time: `docker run -d --name downlouder-redis -p 6379:6379 redis`

## 2. Worker API (FastAPI + Socket.IO)

```
cd c:\Users\user\Desktop\downlouder\worker
..\.venv\Scripts\python.exe -m uvicorn src.api.main:app --reload --port 8000
```

## 3. Celery Worker (processes downloads)

```
cd c:\Users\user\Desktop\downlouder\worker
..\.venv\Scripts\celery -A src.tasks.celery_config worker --loglevel=info --pool=solo
```

## 4. Frontend (Next.js)

```
cd c:\Users\user\Desktop\downlouder\frontend
npm run dev
```

Then open **http://localhost:3000**
