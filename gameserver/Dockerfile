FROM golang:1.25-alpine AS build

WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 go build -trimpath -ldflags="-s -w" -o /gameserver ./cmd

FROM alpine:3.22

RUN apk add --no-cache ca-certificates
COPY --from=build /gameserver /usr/local/bin/gameserver
USER 65532:65532

EXPOSE 8082
ENTRYPOINT ["/usr/local/bin/gameserver"]
