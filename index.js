/*global LogPanel LogControl require */
var multilevel = require('multilevel')
  , reconnect = require('reconnect')
  , LiveStream = require('level-live-stream')
  , manifest = require("./manifest.json")
  , db = multilevel.client(manifest)

reconnect( function (stream) {
    var dbstream = db.createRpcStream()
    stream.pipe(dbstream).pipe(stream)

    dbstream.on("error", function () {
        stream.destroy()
    })

    stream.on("error", function () {
        dbstream.destroy()
    })


}).connect(9999, "ec2-174-129-51-152.compute-1.amazonaws.com")



var gui = require('nw.gui');

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
