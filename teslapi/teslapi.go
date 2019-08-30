package teslapi

import (
	"log"
	"time"
	"sync"

	"github.com/think-free/tesla"
)

// Teslapi is an object that pull for data the tesla api
type Teslapi struct {
	Enabled     bool
	State       string
	ShouldSleep bool

	Data *tesla.StateRequest

	interval     int64
	vehicleIndex int64
	ve           *tesla.Client

	sync.Mutex
}

// New create a new object
func New(clientID, clientSecret, email, password string, vehicleIndex, interval int64) *Teslapi {

	client, err := tesla.NewClient(
		&tesla.Auth{
			ClientID:     clientID,
			ClientSecret: clientSecret,
			Email:        email,
			Password:     password,
		})
	if err != nil {
		log.Println("Can't connect to tesla")
		panic(err)
	}

	ves, err := client.Vehicles()
	if err != nil {
		panic(err)
	}

	ve := ves[vehicleIndex]

	status, err := ve.MobileEnabled()
	if err != nil {
		panic(err)
	}

	return &Teslapi{
		ve:           client,
		Enabled:      status,
		State:        ve.State,
		interval:     interval,
		vehicleIndex: vehicleIndex,
	}
}

// Run start the polling
func (api *Teslapi) Run() {

	for {

		// Getting vehicle state
		vehicles, err := api.ve.Vehicles()
		if err != nil {
			panic(err)
		}

		ve := vehicles[api.vehicleIndex]
		api.Lock()
		api.State = ve.State
		api.Unlock()

		// Getting vehicle data if not sleeping and not attempting to sleep
		if ve.State == "online" && !api.ShouldSleep {

			// Getting Vehicle data
			data, err := ve.Data(api.vehicleIndex)

			if err == nil {
				
				api.Lock()
				api.Data = data
				api.Unlock()

			} else {

				log.Println(err)
			}
		}

		time.Sleep(time.Second * time.Duration(api.interval))
	}
}

// Data : Get data of the vehicle (calling this will not permit the car to sleep)
/*func (v Vehicle) Data(vid int64) (*StateRequest, error) {

	stateRequest := &StateRequest{}
	body, err := ActiveClient.get(BaseURL + "/vehicles/" + strconv.FormatInt(vid, 10) + "/data")
	if err != nil {
		return nil, err
	}
	err = json.Unmarshal(body, stateRequest)
	if err != nil {
		return nil, err
	}
	return stateRequest, nil
} */