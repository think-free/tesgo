package httpserver

import (
	"encoding/json"
	"log"
	"net/http"
	"net/http/httputil"
	"net/url"

	"github.com/think-free/tesgo/tesgui/influxquery"
)

// HTTPServer handle web requests for vmd
type HTTPServer struct {
	influx    *influxquery.InfluxQuery
	tesgoHost string
}

// Answer is a HTTP Answer
type Answer struct {
	Type string      `json:"type"`
	Data interface{} `json:"data"`
}

/* Create and run the server */

// New create an httpserver
func New(influx *influxquery.InfluxQuery, tesgoHost string) *HTTPServer {

	return &HTTPServer{
		influx:    influx,
		tesgoHost: tesgoHost,
	}
}

// Run start the httpserver
func (server *HTTPServer) Run() {

	log.Println("Starting webserver")

	// Server version installation
	http.HandleFunc("/daysummary", server.daysummary)
	u, _ := url.Parse(server.tesgoHost)
	http.Handle("/", httputil.NewSingleHostReverseProxy(u))

	// Client app managment

	http.ListenAndServe("0.0.0.0:8080", nil)
}

/* Server version installation */

func (server *HTTPServer) daysummary(w http.ResponseWriter, r *http.Request) {

	dateParam, ok := r.URL.Query()["date"]
	if !ok || len(dateParam[0]) < 1 {
		log.Println("Url parameter missing: date")
		w.WriteHeader(http.StatusNotFound)
		js, _ := json.Marshal(Answer{Type: "error", Data: "Url parameter missing: date"})
		w.Write(js)
		return
	}
	date := dateParam[0]

	log.Printf("Request total sessions for %s\n", date)
	totalSession := server.influx.GetAll(date)

	js, _ := json.Marshal(Answer{Type: "ok", Data: totalSession})
	w.Write(js)
}
