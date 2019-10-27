import React from 'react'
import Radium from 'radium';
import { connect } from 'react-redux'
import { setValue } from '../../../redux/store.js'

import mainStyle from '../../../../styles/global.js'

/* Devices */

const ChargeStyle = {

    Charge : {

    },

    TensionIcon : {
        margin: "auto",
        position: "absolute",
        bottom: 80,
        left: 30
    },
    TensionText : {
        margin: "auto",
        position: "absolute",
        bottom: 78,
        left: 55
    },

    IntensityIcon : {
        margin: "auto",
        position: "absolute",
        bottom: 50,
        left: 30
    },
    IntensityText : {
        margin: "auto",
        position: "absolute",
        bottom: 48,
        left: 55
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

class Charge extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
        };

    }

    async componentDidMount() {

    }

    componentWillUnmount() {
    }


    // Render
    render() {

        const me = this;
        const charge = this.props.data

        const battery_start = charge.data.battery_level_start / 2;
        const battery_end = charge.data.battery_level_end / 2;

        const temp_In = charge.data.inside_temp_avg + " ºC"
        const temp_Out = charge.data.outside_temp_avg + " ºC"

        const lat = charge.data.latitude
        const long = charge.data.longitude
        const mapUrl = "http://open.mapquestapi.com/staticmap/v4/getmap?key=r9224scfzXKNDsu8vbE2wTsjSVJuryFK&type=sat&size=400,400&zoom=17&center="+lat+","+long+"&pois=marker,"+lat+","+long+",0,0"

        return (
            <div style={ChargeStyle.Charge}>
                <img style={mainStyle.Logo} src="/static/icons/charge.png" width="25" height="25" draggable="false"/>
                <div style={mainStyle.Time}>
                    {charge.start}<br />
                    {charge.end}
                </div>

                <img style={mainStyle.TempIconOut} src="/static/icons/thermometer.png" width="20" height="20" draggable="false"/>
                <div style={mainStyle.TempInfoOut}>{temp_Out}</div>
                <img style={mainStyle.TempIconIn} src="/static/icons/car.png" width="20" height="20" draggable="false"/>
                <div style={mainStyle.TempInfoIn}>{temp_In}</div>

                <img style={mainStyle.BatteryIcon} src="/static/icons/battery.png" width="50" height="50" draggable="false"/>
                <img style={{...mainStyle.BatteryIcon, ...{'top': (50 - battery_end) }}} src="/static/icons/battery-full.png" width="50" height={battery_end} draggable="false"/>
                <img style={{...mainStyle.BatteryIcon, ...{'top': (50 - battery_start) }}} src="/static/icons/battery-current.png" width="50" height={battery_start} draggable="false"/>
                <div style={mainStyle.BatteryText}>{charge.data.battery_added} %</div>

                <img style={mainStyle.Map} src={mapUrl} draggable="false"/>

                <img style={ChargeStyle.TensionIcon} src="/static/icons/t.png" width="20" height="20" draggable="false"/>
                <div style={ChargeStyle.TensionText}>{Math.floor(charge.data.charger_voltage_avg)} V</div>
                <img style={ChargeStyle.IntensityIcon} src="/static/icons/i.png" width="20" height="20" draggable="false"/>
                <div style={ChargeStyle.IntensityText}>{Math.floor(charge.data.charger_current_avg)}  A</div>
            </div>
        )
    }
}

/* Export */

Charge = Radium(Charge);
export default connect(mapStateToProps)(Charge);
