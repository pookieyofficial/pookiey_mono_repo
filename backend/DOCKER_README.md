# Docker Setup for Backend

## Environment Variables

The `.env` file is excluded from the Docker image for security reasons. Environment variables are loaded at runtime using one of the methods below.

## Required Environment Variables

Make sure your `.env` file in the `backend/` directory contains:

- `MONGO_URI` - MongoDB connection string
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
- `AWS_REGION` - AWS region
- `AWS_ACCESS_KEY_ID` - AWS access key
- `AWS_SECRET_ACCESS_KEY` - AWS secret key
- `RAZORPAY_KEY_ID` - Razorpay key ID
- `RAZORPAY_KEY_SECRET` - Razorpay key secret
- `PORT` - Server port (defaults to 6969)

## Running with Docker Compose (Recommended)

This is the easiest way - it automatically loads your `.env` file:

```bash
cd backend
docker-compose up --build
```

To run in detached mode:
```bash
docker-compose up -d --build
```

## Running with Docker directly

### Option 1: Using --env-file flag
```bash
cd backend
docker build -t backend-app .
docker run -p 6969:6969 --env-file .env backend-app
```

### Option 2: Passing individual environment variables
```bash
docker run -p 6969:6969 \
  -e MONGO_URI=your_mongo_uri \
  -e SUPABASE_URL=your_supabase_url \
  -e SUPABASE_SERVICE_ROLE_KEY=your_key \
  -e AWS_REGION=your_region \
  -e AWS_ACCESS_KEY_ID=your_key \
  -e AWS_SECRET_ACCESS_KEY=your_secret \
  -e RAZORPAY_KEY_ID=your_razorpay_id \
  -e RAZORPAY_KEY_SECRET=your_razorpay_secret \
  backend-app
```

## Why .env is ignored

The `.env` file contains sensitive credentials and should never be included in Docker images. By keeping it in `.dockerignore`, we ensure:
- Credentials aren't baked into the image
- The same image can be used with different environments (dev/staging/prod)
- Better security practices

The environment variables are injected at runtime, keeping your secrets safe.

