FROM golang:1.24-alpine AS builder
WORKDIR /build
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 go build -ldflags="-s -w" -o license-server ./cmd/server/

FROM alpine:3.21
RUN apk add --no-cache ca-certificates tzdata
WORKDIR /app
COPY --from=builder /build/license-server .
RUN mkdir -p /data/keys /data/files
EXPOSE 8090
CMD ["./license-server", "--addr", ":8090", "--db", "/data/licenses.db", "--keys", "/data/keys"]
