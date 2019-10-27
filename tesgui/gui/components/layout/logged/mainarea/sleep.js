import React from 'react'
import Radium from 'radium';
import { connect } from 'react-redux'
import { setValue } from '../../../redux/store.js'

import mainStyle from '../../../../styles/global.js'

/* Devices */

const SleepStyle = {

    Sleep : {

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

class Sleep extends React.Component {
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
        const sleep = this.props.data

        const battery_start = sleep.data.battery_level_start / 2;
        const battery_end = sleep.data.battery_level_end / 2;

        return (
            <div style={SleepStyle.Sleep}>
                <img style={mainStyle.Logo} src="/static/icons/sleep.png" width="25" height="25" draggable="false"/>
                <div style={mainStyle.Time}>
                    {sleep.start}<br />
                    {sleep.end}
                </div>

                <img style={mainStyle.Map} src="/static/icons/deepsleep.png" draggable="false"/>
            </div>
        )
    }
}

/* Export */

Sleep = Radium(Sleep);
export default connect(mapStateToProps)(Sleep);
