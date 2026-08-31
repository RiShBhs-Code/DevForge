# Multi-stage Dockerfile for DevForge Go Backend

# Stage 1: Builder
FROM golang:1.24-alpine AS builder

WORKDIR /app

# Copy dependency manifests
COPY go.mod go.sum ./
RUN go mod download

# Copy source code
COPY . .

# Build statically compiled binary
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-w -s" -o server ./cmd/server

# Stage 2: Minimal Production Runner
FROM alpine:latest

RUN apk --no-cache add ca-certificates tzdata

WORKDIR /app

# Copy compiled binary from builder
COPY --from=builder /app/server .

EXPOSE 8080

CMD ["./server"]
