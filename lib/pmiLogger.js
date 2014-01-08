/*global   console setInterval require */
var ipm2 = require("pm2-interface")
var level = require('level')
var Sublevel = require('level-sublevel')
var dbopts = {
    createIfMissing: true
  , valueEncoding: 'json'
}
var subdb = Sublevel(level('/var/log/streamhead/logdb', dbopts))


/*
 * Hook into pm2 for cluster logging
 * service types: SOURCE CLIENT REDIS MASTER PROXY
 */


module.exports = function () {

    var self = {}

    var dbs = {
        test : subdb.sublevel("test")
      , dev : subdb.sublevel("dev")
      , prod : subdb.sublevel("prod")
    }

    function connectToPM2 (opts) {

        if (!opts) opts = {}

        var clusterName = opts.clusterName || "PM2"

        var bus = ipm2(opts).bus

        bus.on("*", function (event, msg) {
            msg.clusterName = clusterName
            if (!("time" in msg))
                msg.time = Date.now()

            dbs["test"].put(msg.time, msg)

        })


        return bus
    }


    self.connectToPM2 = connectToPM2
    self.dbs = dbs

    return self
}
