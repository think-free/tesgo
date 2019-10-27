import React from 'react'
import Radium from 'radium';
import { connect } from 'react-redux'
import { setValue } from '../../../redux/store.js'

import mainStyle from '../../../../styles/global.js'

/* Devices */

const IdleStyle = {

    Idle : {

    },

    MobileStyle : {

        '@media (-webkit-min-device-pixel-ratio: 2) and (orientation: portrait), (min-resolution: 192dpi) and (orientation: portrait)': {
            zoom : 2
        }
    }
}

const mapStateToProps = (state) => {
    return {
        
    }
}

class Idle extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            loc : {}
        };

    }

    async componentDidMount() {


        const lat = this.props.data.data.latitude
        const long = this.props.data.data.longitude

        const url = "http://www.mapquestapi.com/geocoding/v1/reverse?key=r9224scfzXKNDsu8vbE2wTsjSVJuryFK&location=" + lat + "," + long

        fetch(url)
        .then(response => response.json())
        .then(data => this.setState({ loc: data }))        
    }

    componentWillUnmount() {
    }


    // Render
    render() {

        const me = this;
        const idle = this.props.data

        const battery_start = idle.data.battery_level_start / 2;
        const battery_end = idle.data.battery_level_end / 2;

        const temp_In = idle.data.inside_temp_avg + " ºC"
        const temp_Out = idle.data.outside_temp_avg + " ºC"

        const lat = idle.data.latitude
        const long = idle.data.longitude
        const mapUrl = "http://open.mapquestapi.com/staticmap/v4/getmap?key=r9224scfzXKNDsu8vbE2wTsjSVJuryFK&type=sat&size=400,400&zoom=17&center="+lat+","+long+"&pois=marker,"+lat+","+long+",0,0"


        if (this.state.loc.results != undefined) {
            if (this.state.loc.results[0].locations[0] != undefined){
                console.log(this.state.loc.results[0].locations[0].street + " (" + this.state.loc.results[0].locations[0].postalCode + " - " + this.state.loc.results[0].locations[0].adminArea5 + ")") 
            }
        }

        return (
            <div style={IdleStyle.Idle}>
                <img style={mainStyle.Logo} src="/static/icons/park.png" width="25" height="25" draggable="false"/>
                <div style={mainStyle.Time}>
                    {idle.start}<br />
                    {idle.end}
                </div>

                <img style={mainStyle.TempIconOut} src="/static/icons/thermometer.png" width="20" height="20" draggable="false"/>
                <div style={mainStyle.TempInfoOut}>{temp_Out}</div>
                <img style={mainStyle.TempIconIn} src="/static/icons/car.png" width="20" height="20" draggable="false"/>
                <div style={mainStyle.TempInfoIn}>{temp_In}</div>

                <img style={mainStyle.BatteryIcon} src="/static/icons/battery.png" width="50" height="50" draggable="false"/>
                <img style={{...mainStyle.BatteryIcon, ...{'top': (50 - battery_start) }}} src="/static/icons/battery-full.png" width="50" height={battery_start} draggable="false"/>
                <img style={{...mainStyle.BatteryIcon, ...{'top': (50 - battery_end) }}} src="/static/icons/battery-current.png" width="50" height={battery_end} draggable="false"/>
                <div style={mainStyle.BatteryText}>{idle.data.battery_used} %</div>

                <img style={mainStyle.Map} src={mapUrl} draggable="false"/>
            </div>
        )
    }
}

/* Export */

Idle = Radium(Idle);
export default connect(mapStateToProps)(Idle);
