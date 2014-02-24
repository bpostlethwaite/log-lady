/*global LogPanel LogControl require CmdBar */

(function () {
var multilevel = require('multilevel')
  , reconnect = require('reconnect')
   // , config = require("./config.json")
  , manifest = require("./manifest.json")
  , db = multilevel.client(manifest)

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
.connect(9999, "ec2-174-129-51-152.compute-1.amazonaws.com") //)
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
                .addFilter("service", "SOURCE"))
    LPanels.push( LogPanel(logpanels[1], db))
  //               .addFilter("service", "WEBSOCKET"))
    LPanels.push( LogPanel(logpanels[2], db))
  //               .addFilter("service", "RESTFUL"))
    LPanels.push( LogPanel(logpanels[3], db))
  //               .addFilter("service", "false"))
})()