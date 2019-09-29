package main

import (
	"flag"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"os/signal"
	"strings"
	"syscall"

	"github.com/jamiealquiza/envy"
	"github.com/surgemq/message"

	"github.com/think-free/mqttclient"
)

func main() {

	broker := flag.String("broker", "mosquitto", "The broker host")
	topic := flag.String("topic", "tesla", "The base topic")
	influxHost := flag.String("influx", "tesla", "The influxdb database")
	influxDatabase := flag.String("database", "tesla", "The influxdb database")

	envy.Parse("TESGO")
	flag.Parse()

	// Mqtt client
	cli := mqttclient.NewMqttClient("Device_Influxdb", *broker)
	//cli.SetUserPass("backend", "axihome5homeautomation")
	cli.Connect()
	cli.SendHB("influxdb/" + *topic + "/hb")

	cli.SubscribeTopic(*topic+"/#", func(msg *message.PublishMessage) error {

		receivedTopic := string(msg.Topic())

		receivedTopic = strings.TrimPrefix(receivedTopic, *topic+"/")
		receivedTopic = strings.Replace(receivedTopic, "/", ".", -1)

		log.Println("Received :", receivedTopic)

		go writeData(*influxHost, *influxDatabase, receivedTopic, msg.Payload())

		return nil
	})

	log.Println("Application started")

	// Handle ctrl+c and exit signals

	c := make(chan os.Signal, 1)
	signal.Notify(c, os.Interrupt, syscall.SIGHUP, syscall.SIGINT, syscall.SIGTERM, syscall.SIGQUIT, syscall.SIGKILL)

	for {
		select {
		case _ = <-c:
			fmt.Println("\nClosing application")
			os.Exit(0)
		}
	}
}

func writeData(ip, influxDatabase, key string, value interface{}) {

	body := strings.NewReader(key + " value=" + string(value.([]byte)))
	req, err := http.NewRequest("POST", "http://"+ip+":8086/write?db="+influxDatabase, body)
	if err != nil {
		log.Println(err)
		return
	}
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		log.Println(err)
		return
	} else {
		defer resp.Body.Close()
		log.Println("Written data to influx :", key, "->", string(value.([]byte)))
		body, _ := ioutil.ReadAll(resp.Body)
		log.Println(string(body))
	}
}
