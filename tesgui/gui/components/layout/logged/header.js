import React from 'react'
import Radium from 'radium';
import { connect } from 'react-redux'
import { setValue } from '../../redux/store.js'

import mainStyle from '../../../styles/global.js'

/* Devices */

const HeaderStyle = {

    Header : {
        height: mainStyle.headerHeight,
        width: '100%',
        display:'block',
        backgroundColor: mainStyle.headerBackgroundColor,
        color: mainStyle.textColor,
        padding: 5
    },

    // Left
    Logo : {
        margin: "auto",
        position: "absolute",
        top: 0,
        left: 10
    },
    Name : {
        fontSize: '1.2em',
        color: mainStyle.textItemColor,
        width: '82px',
        marginTop: 50,
        textAlign : 'center'
    },
    Odometer : {
        fontSize: '0.9em',
        color: mainStyle.textLighterColor,
        width: '82px',
        textAlign : 'center'
    },

    // Range info
    KMIcon : {
        margin: "auto",
        position: "absolute",
        top: 20,
        left: 100
    },

    KMInfo : {
        margin: "auto",
        position: "absolute",
        top: 22,
        left: 130
    },

    KMIcon100 : {
        margin: "auto",
        position: "absolute",
        top: 46,
        left: 100
    },

    KMInfo100 : {
        margin: "auto",
        position: "absolute",
        top: 47,
        left: 130
    },

    // Temperature
    TempIconOut : {
        margin: "auto",
        position: "absolute",
        top: 20,
        right: 135
    },
    TempInfoOut : {
        margin: "auto",
        position: "absolute",
        top: 22,
        right: 80
    },
    TempIconIn : {
        margin: "auto",
        position: "absolute",
        top: 45,
        right: 135
    },
    TempInfoIn : {
        margin: "auto",
        position: "absolute",
        top: 47,
        right: 80
    },
    SpeedIcon : {
        margin: "auto",
        position: "absolute",
        top: 70,
        right: 135
    },
    SpeedInfo : {
        margin: "auto",
        position: "absolute",
        top: 72,
        right: 80
    },

    // Battery
    Battery : {
        position: 'absolute',
        float: 'right',
        top: 10,
        right: 10
    },

    BatteryPercent : {
        position: 'absolute',
        float: 'right',
        top:75,
        right: 25,
        textAlign : 'center',
        fontSize: '1em',
        color: mainStyle.textLighterColor,
    },

    StatusBar : {
        position: 'absolute',
        top: 75,
        left: 100,
        fontSize: '15px',
        verticalAlign : 'middle'
    },

    MobileStyle : {

        '@media (-webkit-min-device-pixel-ratio: 2) and (orientation: portrait), (min-resolution: 192dpi) and (orientation: portrait)': {
            zoom : 1
        }
    }
}

const mapStateToProps = (state) => {
    return {
        
    }
}

class Header extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            apiData : {}
        };

        this.getData=this.getData.bind(this);
    }

    async componentDidMount() {

        this.getData();

        // Periodicaly refresh states
        this.interval = setInterval(() => {
            this.getData();
        }, 1000);
    }

    componentWillUnmount() {
        clearInterval(this.interval);
    }

    async getData(url){
        var url = "/api/data"

        fetch(url)
        .then(response => response.json())
        .then(data => this.setState({ apiData: data }))
    }

    // Render
    render() {

        const me = this;
        const bat = me.state.apiData.data != undefined ? (me.state.apiData.data.battery_level/1.5625) : 0;
        const charge = me.state.apiData.data != undefined ? (me.state.apiData.data.charge_limit_soc/1.5625) : 0; // 1.5625 = 100/64
        const odometer = me.state.apiData.data != undefined ? Math.round(me.state.apiData.data.odometer * 1.609344) + " km": "";
        const km = me.state.apiData.data != undefined ? Math.round(me.state.apiData.data.battery_range * 1.609344) + " (" + Math.round(me.state.apiData.data.est_battery_range * 1.609344) + ") km": ""
        const kmest = me.state.apiData.data != undefined ? Math.round(((me.state.apiData.data.battery_range * 1.609344) / me.state.apiData.data.battery_level) * 100) + " km" : ""
        const tempIn = me.state.apiData.data != undefined ? me.state.apiData.data.inside_temp + " ºC" : ""
        const tempOut = me.state.apiData.data != undefined ? me.state.apiData.data.outside_temp + " ºC" : ""

        var status = ""
        if (me.state.apiData.data != undefined) {
            if (me.state.apiData.data.shift_state == null || me.state.apiData.data.shift_state) {
                status = "/static/icons/park.png"
            } else {
                status = "/static/icons/drive.png"
            }
        }

        const speed = me.state.apiData.data != undefined ? Math.round(me.state.apiData.data.speed * 1.609344) + " km/h" : ""
        
        
        if (me.state.apiData.data != undefined){

            return (
                <div style={{...HeaderStyle.MobileStyle, ...HeaderStyle.Header}}>
                    <img style={HeaderStyle.Logo} src="/static/icons/tesla.png" width="70" height="70" draggable="false"/>
                    <div style={HeaderStyle.Name}>{me.state.apiData.data.vehicle_name}</div>
                    <div style={HeaderStyle.Odometer}>{odometer}</div>

                    <img style={HeaderStyle.KMIcon} src="/static/icons/location.png" width="20" height="20" draggable="false"/>
                    <div style={HeaderStyle.KMInfo}>{km}</div>
                    <img style={HeaderStyle.KMIcon100} src="/static/icons/full.png" width="20" height="20" draggable="false"/>
                    <div style={HeaderStyle.KMInfo100}>{kmest}</div>
                                       
                    
                    <img style={HeaderStyle.TempIconOut} src="/static/icons/thermometer.png" width="20" height="20" draggable="false"/>
                    <div style={HeaderStyle.TempInfoOut}>{tempOut}</div>
                    <img style={HeaderStyle.TempIconIn} src="/static/icons/car.png" width="20" height="20" draggable="false"/>
                    <div style={HeaderStyle.TempInfoIn}>{tempIn}</div>
                    <img style={HeaderStyle.SpeedIcon} src="/static/icons/speed.png" width="20" height="20" draggable="false"/>
                    <div style={HeaderStyle.SpeedInfo}>{speed}</div>
                   

                    <img style={HeaderStyle.Battery} src="/static/icons/battery.png" width="64" height="64" draggable="false"/>
                    <img style={{...HeaderStyle.Battery, ...{'top': (64 - charge) }}} src="/static/icons/battery-full.png" width="64" height={charge} draggable="false"/>
                    <img style={{...HeaderStyle.Battery, ...{'top': (64 - bat) }}} src="/static/icons/battery-current.png" width="64" height={bat} draggable="false"/>
                    <div style={HeaderStyle.BatteryPercent}>{me.state.apiData.data.battery_level} %</div>

                    <div style={HeaderStyle.StatusBar}>
                        <img src={status} width="15" height="15" draggable="false"/>
                        &nbsp;
                    </div>
                </div>
            )
        } else {

            return (
                <div style={HeaderStyle.Header}></div>
            )
        }
    }
}

/* Export */

Header = Radium(Header);
export default connect(mapStateToProps)(Header);
