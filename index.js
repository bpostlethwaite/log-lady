/*global LogPanel LogControl require CmdBar */
var gui = require('nw.gui');

(function () {
  var multilevel = require('multilevel')
    , reconnect = require('reconnect')
    , config = require("./config.json")
    , manifest = require("./manifest.json")
    , db = multilevel.client(manifest)


  var mode = gui.App.argv[0]
  if (mode !== "dev" && mode !== "prod")
    throw new Error("manditory argument dev | prod not supplied")

/*
 * Initialize Command Bar
 */
var cmdbar = CmdBar(document.querySelector("#cmd-bar"))
cmdbar.console(true)



reconnect( function (stream) {

  var dbstream = db.createRpcStream()
  stream.pipe(dbstream).pipe(stream)

  dbstream.on("error", function () {
    stream.destroy()
  })

  stream.on("error", function () {
    dbstream.destroy()
  })


})
.connect(9999, config[mode].dbhost)
.on("connect", function () {
  if (LPanels && LPanels.length) {
    LPanels.forEach( function (logpanel) {
      logpanel.connect()
    })
  }
})



/*
 * Initialize LogPanels
 */
var logpanels = document.querySelectorAll(".log-panel-container")
  ,  LPanels = []

    LPanels.push( LogPanel(logpanels[0], db)
                  .addFilter("service", "source"))
    LPanels.push( LogPanel(logpanels[1], db)
                  .addFilter("service", "websocket"))
    LPanels.push( LogPanel(logpanels[2], db)
                  .addFilter("service", "restful"))
    LPanels.push( LogPanel(logpanels[3], db)
                  .addFilter("service", "master")
                  .addFilter("event", "websocketCount"))
})()