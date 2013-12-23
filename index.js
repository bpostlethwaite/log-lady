/*global LogPanel LogControl */
var multilevel = require('multilevel')
var net = require('net')
var LiveStream = require('level-live-stream')
var db = multilevel.client()
var con = net.connect(9999)
LiveStream.install(db)
con.pipe(db.createRpcStream()).pipe(con)




var gui = require('nw.gui'); //or global.window.nwDispatcher.requireNwGui() (see https://github.com/rogerwang/node-webkit/issues/707)

// Get the current window
var win = gui.Window.get();


/*
 * Initialize Command Bar
 */
var cmdbar = document.querySelector("#cmd-bar")
var linkConsole = cmdbar.querySelector(".cmd-bar-console")
linkConsole.addEventListener("click", function () {
    if (win.isDevToolsOpen()) win.closeDevTools()
    else win.showDevTools()
})

/*
 * Initialize LogPanels
 */
var logpanels = document.querySelectorAll(".log-panel-container")
  , L1 = LogPanel(logpanels[0], db)
         .addFilter("service", "SOURCE")
         .connect()
  , L2 = LogPanel(logpanels[1], db)
         .addFilter("service", "WEBSOCKET")
         .connect()
  , L3 = LogPanel(logpanels[2], db)
         .addFilter("service", "^(?!(WEBSOCKET|SOURCE)$).*")
         .connect()
  , L4 = LogPanel(logpanels[3], db)
         .addFilter("service", "false")
         .connect()


//stream.on("data", function (data) {console.log(typeof(data.value))})

// lpanel.addFilter({
//     "type": function (type) {return type == "process:info"}
// })

// lpanel.addFilter({
//     "service": function (service) {return service === "WEBSOCKET"}
//   , "type": function (type) {return type === "process:error"}
// })



//pm1.on('rpc_sock:ready', function () {console.log("ready")})

//PMI.on("data", function (data) {console.log(data)})


//require("../lib