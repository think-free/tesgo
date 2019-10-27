import React from 'react'
import Radium from 'radium';
import { connect } from 'react-redux'
import { setValue } from '../../../redux/store.js'

import mainStyle from '../../../../styles/global.js'

/* Devices */

const DriveStyle = {

    Icon : {
        position : 'relative',
        top: 10,
        left: 10
    },

    Drive : {

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

class Drive extends React.Component {
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
        const drive = this.props.data

        const battery_start = drive.data.battery_level_start / 2;
        const battery_end = drive.data.battery_level_end / 2;

        const temp_In = drive.data.inside_temp_avg + " ºC"
        const temp_Out = drive.data.outside_temp_avg + " ºC"

        return (
            <div style={DriveStyle.Drive}>
                <img style={mainStyle.Logo} src="/static/icons/drive.png" width="25" height="25" draggable="false"/>
                <div style={mainStyle.Time}>
                    {drive.start}<br />
                    {drive.end}
                </div>

                <img style={mainStyle.TempIconOut} src="/static/icons/thermometer.png" width="20" height="20" draggable="false"/>
                <div style={mainStyle.TempInfoOut}>{temp_Out}</div>
                <img style={mainStyle.TempIconIn} src="/static/icons/car.png" width="20" height="20" draggable="false"/>
                <div style={mainStyle.TempInfoIn}>{temp_In}</div>

                <img style={mainStyle.BatteryIcon} src="/static/icons/battery.png" width="50" height="50" draggable="false"/>
                <img style={{...mainStyle.BatteryIcon, ...{'top': (50 - battery_start) }}} src="/static/icons/battery-full.png" width="50" height={battery_start} draggable="false"/>
                <img style={{...mainStyle.BatteryIcon, ...{'top': (50 - battery_end) }}} src="/static/icons/battery-current.png" width="50" height={battery_end} draggable="false"/>
                <div style={mainStyle.BatteryText}>{drive.data.battery_used} %</div>
            </div>
        )
    }
}

/* Export */

Drive = Radium(Drive);
export default connect(mapStateToProps)(Drive);
