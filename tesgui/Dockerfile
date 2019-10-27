# First stage, building gui
FROM node:alpine AS node-env

ADD ./gui /src
WORKDIR /src
RUN npm install -g yarn
RUN yarn install && npm run build && npm run export

# First stage, building application
FROM golang:alpine AS builder

RUN apk update && apk add git
RUN go get -u github.com/GeertJohan/go.rice && go get -u github.com/GeertJohan/go.rice/rice && mv $GOPATH/bin/rice /usr/bin/
ADD . /app
COPY --from=node-env src/out /app/gui/out
WORKDIR /app/httpserver
RUN rice embed-go
WORKDIR /app
RUN go build .

# Last stage : Creating final container
FROM alpine
WORKDIR /
RUN apk update && apk add ca-certificates tzdata
COPY --from=builder /app/tesgui /tesgui
ENTRYPOINT /tesgui
