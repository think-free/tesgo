package influxquery

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"math"
	"net/http"
	"net/url"
	"sort"
	"strings"
	"time"
)

// InfluxQuery is the object responsible to query the influxdb api
type InfluxQuery struct {
	InfluxHost     string
	Database       string
	TimeZone       string
	TimeZoneOffset string
}

// InfluxResponse represent a query response form influx
type InfluxResponse struct {
	Results []struct {
		StatementID int `json:"statement_id"`
		Series      []struct {
			Name    string          `json:"name"`
			Columns []string        `json:"columns"`
			Values  [][]interface{} `json:"values"`
		} `json:"series"`
	} `json:"results"`
}

// Session represent a drive session
type Session struct {
	Start string                 `json:"start"`
	End   string                 `json:"end"`
	Type  string                 `json:"type"`
	Data  map[string]interface{} `json:"data"`
}

/* Public functions */
/* ******************************************************* */

// GetAll return all sessions
// GetAll return all sessions
func (q *InfluxQuery) GetAll(dateStart string) []Session {

	// Getting all activities
	driveSessions := q.GetDrives(dateStart)
	chargeSessions := q.GetCharges(dateStart)
	sleepSessions := q.GetSleeps(dateStart)

	totalSession := driveSessions
	totalSession = append(totalSession, chargeSessions...)
	totalSession = append(totalSession, sleepSessions...)
	sort.Slice(totalSession, func(i, j int) bool { return totalSession[i].Start < totalSession[j].Start })

	// Getting idle sessions
	var lastEnd time.Time
	var returnSession []Session
	for i, v := range totalSession {

		start, _ := time.Parse(time.RFC3339, v.Start)
		end, _ := time.Parse(time.RFC3339, v.End)

		v.Start = start.Format("15:04:05")
		v.End = end.Format("15:04:05")

		if len(totalSession) > i+1 {

			nextStart, _ := time.Parse(time.RFC3339, totalSession[i+1].Start)

			if nextStart.After(end.Add(time.Minute * 2)) {

				returnSession = append(returnSession, Session{

					Type:  "idle",
					Start: end.Format("15:04:05"),
					End:   nextStart.Format("15:04:05"),
					Data:  q.getIdleData(end.Format(time.RFC3339), nextStart.Format(time.RFC3339)),
				})
			}
		}

		returnSession = append(returnSession, v)
		lastEnd = end
	}

	if dateStart == time.Now().Format("2006-01-02") {

		if lastEnd.Add(time.Minute).Before(time.Now()) {

			returnSession = append(returnSession, Session{
				Type:  "idle",
				Start: lastEnd.Format("15:04:05"),
				End:   time.Now().Format("15:04:05"),
				Data:  q.getIdleData(lastEnd.Format(time.RFC3339), time.Now().Format(time.RFC3339)),
			})
		}
	}

	// Ordering and returning data
	sort.Slice(returnSession, func(i, j int) bool { return returnSession[i].Start < returnSession[j].Start })
	return returnSession
}

// GetSleeps : Get all the sleep session for the specified day
func (q *InfluxQuery) GetSleeps(dateStart string) []Session {

	ir := q.queryInflux("car_state", dateStart)

	// Parsing response and searching for drive session
	sleep := false
	sleepSession := Session{Type: "sleep"}
	var sleepSessions []Session

	for _, v := range ir.Results[0].Series[0].Values {

		if v[1].(float64) == 0 {

			if !sleep {
				sleep = true
				sleepSession.Start = v[0].(string)
			}

			sleepSession.End = v[0].(string)
		}

		if v[1].(float64) > 0 && sleep {
			sleep = false
			sleepSession.Data = q.getSleepData(sleepSession.Start, sleepSession.End)
			sleepSessions = append(sleepSessions, sleepSession)
		}
	}

	if sleep {
		sleep = false
		sleepSession.Data = q.getSleepData(sleepSession.Start, sleepSession.End)
		sleepSessions = append(sleepSessions, sleepSession)
	}

	return sleepSessions
}

// GetCharges : Get all the charge session for the specified day
func (q *InfluxQuery) GetCharges(dateStart string) []Session {

	ir := q.queryInflux("charge_rate", dateStart)

	// Parsing response and searching for drive session
	charge := false
	chargeSession := Session{Type: "charge"}
	var chargeSessions []Session

	for _, v := range ir.Results[0].Series[0].Values {

		if v[1].(float64) > 0 {

			if !charge {
				charge = true
				chargeSession.Start = v[0].(string)
			}

			chargeSession.End = v[0].(string)
		}

		if v[1].(float64) == 0 && charge {
			charge = false
			chargeSession.Data = q.getChargeData(chargeSession.Start, chargeSession.End)
			chargeSessions = append(chargeSessions, chargeSession)
		}
	}

	if charge {
		charge = false
		chargeSession.Data = q.getChargeData(chargeSession.Start, chargeSession.End)
		chargeSessions = append(chargeSessions, chargeSession)
	}

	return chargeSessions
}

// GetDrives : Get all the drive session for the specified day
func (q *InfluxQuery) GetDrives(dateStart string) []Session {

	ir := q.queryInflux("shift_state", dateStart)

	// Parsing response and searching for drive session
	drive := false
	driveSession := Session{Type: "drive"}
	var driveSessions []Session

	for _, v := range ir.Results[0].Series[0].Values {

		if v[1].(float64) == 1 {

			if !drive {
				drive = true
				driveSession.Start = v[0].(string)
			}

			driveSession.End = v[0].(string)
		}

		if v[1].(float64) == 0 && drive {
			drive = false
			driveSession.Data = q.getDriveData(driveSession.Start, driveSession.End)
			driveSessions = append(driveSessions, driveSession)
		}
	}

	if drive {
		drive = false
		driveSession.Data = q.getDriveData(driveSession.Start, driveSession.End)
		driveSessions = append(driveSessions, driveSession)
	}

	return driveSessions
}

// GetTimeOffset return the hour offset for the specified timezone
func GetTimeOffset(TimeZone string) string {

	loc, err := time.LoadLocation(TimeZone)
	if err != nil {
		log.Println(err)
	}
	t := time.Now().In(loc)
	_, offset := t.Zone()
	minutes := offset / 3600
	seconds := offset % 3600
	str := fmt.Sprintf("%02d:%02d", minutes, seconds)
	return str
}

/* Query influxdb */
/* ******************************************************* */

// queryInflux make a query to the database
func (q *InfluxQuery) queryInflux(variable, dateStart string) *InfluxResponse {

	// Preparing query
	layout := "2006-01-02"
	t, _ := time.Parse(layout, dateStart)
	t = t.Add(time.Hour * 24)
	dateEnd := strings.Split(t.String(), " ")[0]

	// Query influx
	queryString := fmt.Sprintf("SELECT * FROM %s WHERE time >= '%sT00:00:00+%s' AND time < '%sT00:00:00+%s' tz('%s')", variable, dateStart, q.TimeZoneOffset, dateEnd, q.TimeZoneOffset, q.TimeZone)
	query := url.QueryEscape(queryString)
	url := fmt.Sprintf("http://%s:8086/query?pretty=true&db=%s&q=%s", q.InfluxHost, q.Database, query)

	// Querying influx
	r, err := http.Get(url)
	if err != nil {
		log.Fatal(err)
	}
	defer r.Body.Close()

	body, err := ioutil.ReadAll(r.Body)

	if err != nil {
		panic(err.Error())
	}

	var ir InfluxResponse
	json.Unmarshal(body, &ir)
	return &ir
}

func (q *InfluxQuery) querySpecificInflux(queryStr, variable, dateStart, dateEnd string) (*InfluxResponse, string) {

	// Query influx
	queryString := fmt.Sprintf("SELECT %s FROM %s WHERE time >= '%s' AND time <= '%s' tz('%s')", queryStr, variable, dateStart, dateEnd, q.TimeZone)
	query := url.QueryEscape(queryString)
	url := fmt.Sprintf("http://%s:8086/query?pretty=true&db=%s&q=%s", q.InfluxHost, q.Database, query)

	// Querying influx
	r, err := http.Get(url)
	if err != nil {
		log.Fatal(err)
	}
	defer r.Body.Close()

	body, err := ioutil.ReadAll(r.Body)

	if err != nil {
		panic(err.Error())
	}

	var ir InfluxResponse
	json.Unmarshal(body, &ir)
	return &ir, queryString
}

func (q *InfluxQuery) getSingleValue(r *InfluxResponse, query string) interface{} {

	if len(r.Results) > 0 {
		if len(r.Results[0].Series) > 0 {
			if len(r.Results[0].Series[0].Values) > 0 {
				if len(r.Results[0].Series[0].Values[0]) > 1 {
					return r.Results[0].Series[0].Values[0][1]
				}
			}
		}
	}

	fmt.Println("Error : ", query)

	return nil
}

/* Get session data */
/* ******************************************************* */

func (q *InfluxQuery) getSleepData(start, end string) map[string]interface{} {

	ret := make(map[string]interface{})

	return ret
}

func (q *InfluxQuery) getChargeData(start, end string) map[string]interface{} {

	ret := make(map[string]interface{})

	// Battery
	ret["battery_level_start"] = q.getSingleValue(q.querySpecificInflux("first(*)", "battery_level", start, end))
	ret["battery_level_end"] = q.getSingleValue(q.querySpecificInflux("last(*)", "battery_level", start, end))
	if ret["battery_level_end"] != nil && ret["battery_level_start"] != nil {
		ret["battery_added"] = ret["battery_level_end"].(float64) - ret["battery_level_start"].(float64)
	}

	return ret
}

func (q *InfluxQuery) getDriveData(start, end string) map[string]interface{} {

	ret := make(map[string]interface{})

	// Battery
	ret["battery_level_start"] = q.getSingleValue(q.querySpecificInflux("first(*)", "battery_level", start, end))
	ret["battery_level_end"] = q.getSingleValue(q.querySpecificInflux("last(*)", "battery_level", start, end))
	if ret["battery_level_end"] != nil && ret["battery_level_start"] != nil {
		ret["battery_used"] = ret["battery_level_start"].(float64) - ret["battery_level_end"].(float64)
	}

	// Odometer
	ret["odometer_start"] = q.getSingleValue(q.querySpecificInflux("first(*)", "odometer", start, end))
	ret["odometer_end"] = q.getSingleValue(q.querySpecificInflux("last(*)", "odometer", start, end))
	if ret["odometer_end"] != nil && ret["odometer_start"] != nil {
		ret["odometer_start"] = math.Floor(ret["odometer_start"].(float64)*160.934) / 100
		ret["odometer_end"] = math.Floor(ret["odometer_end"].(float64)*160.934) / 100
		ret["km_driven"] = math.Floor((ret["odometer_end"].(float64)-ret["odometer_start"].(float64))*100) / 100
	}

	// Speed
	ret["speed_max"] = q.getSingleValue(q.querySpecificInflux("max(*)", "speed", start, end))
	ret["speed_avg"] = q.getSingleValue(q.querySpecificInflux("mean(*)", "speed", start, end))
	if ret["speed_max"] != nil && ret["speed_avg"] != nil {
		ret["speed_max"] = math.Floor(ret["speed_max"].(float64) * 1.60934)
		ret["speed_avg"] = math.Floor(ret["speed_avg"].(float64) * 1.60934)
	}

	// Wh/km : 520 = 52 Kw/h -> SR+
	ret["kwh_km"] = math.Floor((520 * ret["battery_used"].(float64)) / ret["km_driven"].(float64))

	return ret
}

func (q *InfluxQuery) getIdleData(start, end string) map[string]interface{} {

	ret := make(map[string]interface{})

	// Battery
	ret["battery_level_start"] = q.getSingleValue(q.querySpecificInflux("first(*)", "battery_level", start, end))
	ret["battery_level_end"] = q.getSingleValue(q.querySpecificInflux("last(*)", "battery_level", start, end))
	if ret["battery_level_end"] != nil && ret["battery_level_start"] != nil {
		ret["battery_used"] = ret["battery_level_start"].(float64) - ret["battery_level_end"].(float64)
	}

	return ret
}
