package main

import (
	"flag"

	"github.com/jamiealquiza/envy"

	"github.com/think-free/tesgo/tesgui/httpserver"
	"github.com/think-free/tesgo/tesgui/influxquery"
)

func main() {

	// Read comfiguration
	influxHost := flag.String("influx", "localhost", "Where is influxdb running ?")
	database := flag.String("database", "tesla", "The database in use")
	timeZone := flag.String("timezone", "Europe/Madrid", "Timezone for queries")
	tesgoHost := flag.String("tesgoHost", "http://tesgo/", "Where is tesgo service running ?")

	envy.Parse("TESGO")
	flag.Parse()

	// Influx query
	q := &influxquery.InfluxQuery{
		InfluxHost:     *influxHost,
		Database:       *database,
		TimeZone:       *timeZone,
		TimeZoneOffset: influxquery.GetTimeOffset(*timeZone),
	}

	server := httpserver.New(q, *tesgoHost)
	server.Run()
}
