
let mainStyle = {

    Icon : {
        position : 'absolute',
        top: 10,
        left: 10
    },

    Time : {
        position : 'absolute',
        top: 15,
        left: 60
    },

    Map : {
        position: 'absolute',
        top: 100,
        left: 75,
        right: 75,
        width: 'calc(100% - 150px)',
        height: 'auto'
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

    // Battery
    BatteryIcon : {
        position : 'absolute',
        top: 10,
        right: 10
    },
    BatteryText : {
        position : 'absolute',
        top: 60,
        right: 17
    },

    // Main style
    mainBackgroundColor : "#1F1F27",
    panelBackgroundColor : "#292933",
    menuBackgroundColor : "#40414F",
    headerBackgroundColor : "#111111",

    border : "2px solid #383846",
    borderAlternative : "1px solid #22ADF6",

    textColor : "#A4A8B6",
    textDarkerColor : "#757888",
    textLighterColor : "#BEC2CC",
    textItemColor : "#22ADF6",

    interactable: "#FE6951",

    menuWidth: 50,
    headerHeight: 90,

    icon: "#999DAB",

    menuIcon : {
        paddingTop: 10,
        paddingRight: 20,
        paddingBottom: 10,
        paddingLeft: 20,
        color: "#FE6951",
        cursor: "pointer",
        ':hover': {
          backgroundColor: "#40414F"
        }
    },
    inputStyle : {
        borderRadius: 15,
        backgroundColor: "#40414F",
        border: "2px solid #383846",
        outline: "none",
        padding: 3,
        color : "#A4A8B6",
        ':focus' : {
            outline: "none",
            backgroundColor: "#383846",
            color : "#A4A8B6"
        }
    },
}

export default mainStyle
