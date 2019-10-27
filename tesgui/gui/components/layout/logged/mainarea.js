import React from 'react'
import Radium from 'radium';
import { connect } from 'react-redux'
import { setValue } from '../../redux/store.js'

import mainStyle from '../../../styles/global.js'

import Charge from './mainarea/charge.js'
import Idle from './mainarea/idle.js'
import Drive from './mainarea/drive.js'
import Sleep from './mainarea/sleep.js'

/* Devices */

const MainAreaStyle = {

    P100 : {
        height: '100%',
        display:'block',
    },

    MainArea : {
        height: mainStyle.MainAreaHeight,
        width: '100%',
        height: 'calc(100% - 120px)',
        fallbacks: [
            { height: '-moz-calc(100% - 120px)' },
            { height: '-webkit-calc(100% - 120px)' },
            { height: '-o-calc(100% - 120px)' }
        ],
        display:'block',
        backgroundColor: mainStyle.MainAreaBackgroundColor,
        color: mainStyle.textColor,
        padding: 5,
        overflowY: 'auto'
    },

    CellStyle : {
        display: 'block',
        float: 'left',
        width: '400px',
        height: '500px',
        userSelect:'none',

        '@media (-webkit-min-device-pixel-ratio: 2) and (orientation: portrait), (min-resolution: 192dpi) and (orientation: portrait)': {

            width : 'calc(100% - 20px)',
            height : 'calc(100% - 20px)'
        }
    },
    CellContent : {
        position: 'relative',
        display: 'block',
        height: 'calc(100% - 50px)',
        width: 'calc(100% - 50px)',
        bottom:5,
        top:5,
        left:5,
        right:5,
        margin: 10,
        padding: 20,
        backgroundColor: mainStyle.panelBackgroundColor,
        //textAlign: 'center',
        //fontVariant: 'small-caps',
        //textTransform: 'uppercase',
        //fontSize: '0.8em',
        cursor: 'pointer',
        userSelect:'none',
        ':hover': {
          backgroundColor: mainStyle.menuBackgroundColor
        }
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

class MainArea extends React.Component {
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
        var date = new Date()
        var url = "/daysummary?date=" + date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate()

        fetch(url)
        .then(response => response.json())
        .then(data => this.setState({ apiData: data }))
    }

    // Render
    render() {

        const me = this;
        const data = me.state.apiData.data;

        if (me.state.apiData.data != undefined){

            return (
                <div style={{...MainAreaStyle.MobileStyle, ...MainAreaStyle.P100}}>
                    <div style={MainAreaStyle.MainArea}>
                    {data && data.map(function(activity){

                        if (activity.type == "sleep") {

                            return (
                                <div style={MainAreaStyle.CellStyle}>
                                    <div style={MainAreaStyle.CellContent} key={activity.start + Math.random()}>
                                        <Sleep data={activity}/>
                                    </div>
                                </div>
                            )

                        } else if (activity.type == "charge") {

                            return (
                                <div style={MainAreaStyle.CellStyle}>
                                    <div style={MainAreaStyle.CellContent} key={activity.start + Math.random()}>
                                        <Charge data={activity}/>
                                    </div>
                                </div>
                            )

                        } else if (activity.type == "idle") {

                            return (
                                <div style={MainAreaStyle.CellStyle}>
                                    <div style={MainAreaStyle.CellContent} key={activity.start + Math.random()}>
                                        <Idle data={activity}/>
                                    </div>
                                </div>
                            )

                        } else if (activity.type == "drive") {

                            return (
                                <div style={MainAreaStyle.CellStyle}>
                                    <div style={MainAreaStyle.CellContent} key={activity.start + Math.random()}>
                                        <Drive data={activity}/>
                                    </div>
                                </div>
                            )

                        } else {

                            return (
                                <div style={MainAreaStyle.CellStyle}>
                                    <div style={MainAreaStyle.CellContent} key={activity.start + Math.random()}>
                                        
                                    </div>
                                </div>
                            )
                        }
                    })}
                    </div>
                </div>
            )
        } else {

            return (
                <div style={MainAreaStyle.MainArea}></div>
            )
        }
    }
}

/* Export */

MainArea = Radium(MainArea);
export default connect(mapStateToProps)(MainArea);
