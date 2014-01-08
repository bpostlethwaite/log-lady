var through = require('through')

function LogPanel (root, db, opts) {


  if (!opts) opts = {}

  var self = {}
  self.opts = opts
  self.maxlogs = 100
  self.filters = []


  root.innerHTML = '<div class="log-panel-control">'
                 +   '<div class="log-panel-control-widget">'
                 +      '<div class="log-panel-control-text">max displayed:</div>'
                 +      '<input type="text" class="log-panel-control-input js-input-maxlogs">'
                 +   '</div>'
                 +   '<a href="#" class="log-panel-control-filter">filter</a>'
                 +   '<a href="#" class="log-panel-control-replay">replay</a>'
                 +   '<a href="#" class="log-panel-control-clear">clear</a>'
                 +   '<div class="log-panel-control-filter"></div>'
                 + '</div>'
                 + '<div class="log-panel">'


  var controlpanel = root.querySelector(".log-panel-control")
  var logpanel = root.querySelector(".log-panel")

  /*
   * Log Template
   */
  var loghtml = document.createElement("div")
  loghtml.className = "log-container"
  loghtml.innerHTML = '<div class="log-header-container">'
                    +   '<div class="log-header log-pm2name"></div>'
                    +   '<div class="log-header log-pm_id"></div>'
                    +   '<div class="log-header log-err"></div>'
                    +   '<div class="log-header log-event"></div>'
                    +   '<div class="log-header log-service"></div>'
                    +   '<div class="log-header log-ts"></div>'
                    + '</div>'
                    + '<pre class="log-data"></pre>'


  /*
   * Build Filter Popover
   *
   */
  var filterpop = document.createElement("div")
  filterpop.className = "log-panel-filter-pop"

  filterpop.innerHTML = '<div class="log-panel-control-filter-box">'
                      +   '<div class="log-panel-control-text-key item">key:</div>'
                      +   '<input type="text" class="log-panel-control-input js-input-key">'
                      +   '<div class="log-panel-control-text-value item">value:</div>'
                      +   '<input type="text" class="log-panel-control-input js-input-value">'
                      +   '<a href="#" class="log-panel-control-add-filter js-add-filter">add filter</a>'
                      + '</div>'


  controlpanel.appendChild(filterpop)



  /*
   * Filter Template
   */
  var filterBox = document.createElement('div')
  filterBox.className = "log-panel-control-filter-box"
  filterBox.innerHTML = '<div class="js-filter-key item"></div>'
                      + '<div class="js-filter-value item"></div>'
                      + '<a href="#" class="js-clear-filter">clear</a>'



  /*
   * Control panel maxlog handling
   */
  var inputMaxlogs = controlpanel.querySelector('.js-input-maxlogs');
  inputMaxlogs.value = self.maxlogs
  inputMaxlogs.onkeypress = function(e){
    if (!e) e = window.event;
    var keyCode = e.keyCode || e.which;
    if (keyCode == '13'){

      var val = inputMaxlogs.value

      if (isNaN(val)) return false

      val = Math.round(Number(val))

      self.maxlogs = val

      while (logpanel.children.length > self.maxlogs) {
        logpanel.removeChild(logpanel.children[logpanel.children.length - 1])
      }
      return false
    }
    return true
  }

  /*
   * Control panel filter handling
   */
  controlpanel
  .querySelector('.log-panel-control-filter')
  .addEventListener("click", function () {
    if (filterpop.style.display === "none")
      filterpop.style.display = "block"
    else filterpop.style.display = "none"
  })


  controlpanel
  .querySelector('.log-panel-control-replay')
  .addEventListener("click", function () {
    while (logpanel.children.length > 0) {
      logpanel.removeChild(logpanel.children[logpanel.children.length - 1])
    }
    connectToDB(self.opts)
  })


  controlpanel
  .querySelector('.log-panel-control-clear')
  .addEventListener("click", function () {
    while (logpanel.children.length > 0) {
      logpanel.removeChild(logpanel.children[logpanel.children.length - 1])
    }
  })

  /*
   * Filter popover - addfilter handling
   */
  filterpop
  .querySelector(".js-add-filter")
  .addEventListener("click", function () {

    var key = filterpop
              .querySelector(".js-input-key")
              .value

    var value = filterpop
                .querySelector(".js-input-value")
                .value

    self.addFilter(key, value)
  })



  /*
   * Connect Stream
   *
   *
   */
  function connectToDB (opts) {
    var liveStream
    if (self.stream) {
      self.stream.end()
      self.stream.destroy()
    }

    self.stream = liveStream = db.liveStream()

    liveStream.on("data", function (data) {
      var key, value
      if ("key" in data)
        key = data.key
      if ("value" in data) {
        value = data.value
      }
      if(!applyFilters(value)) return

      var log = applyLogHTML(key, value)
      logpanel.insertBefore(log, logpanel.childNodes[0])

      var children = logpanel.children
      while (children.length > self.maxlogs) {
        logpanel.removeChild(children[children.length - 1])
      }
    })

    return self
  }


  function applyLogHTML (key, value) {
      /*
       * Incoming value will look like:
       * {event: event, ts: unixtime, pm2name: pm2name
       * , service: servicename, pm_id: pm_id, err: err
       * , data: data}  --- where properties may or may
       */


    var log = loghtml.cloneNode()
      , ename = log.querySelector(".log-pm2name")
      , eid = log.querySelector(".log-pm_id")
      , eerr = log.querySelector(".log-err")
      , eevent = log.querySelector(".log-event")
      , eservice = log.querySelector(".log-service")
      , ets = log.querySelector(".log-ts")
      , edata = log.querySelector(".log-data")


      ename.textContent = value.pm2name || "unknown"
      eid.textContent = value.pm_id || "unknown"
      eerr.textContent = value.err || ""
      eevent.textContent = value.event || "unknown"
      eservice.textContent = value.service || "unknown"
      ets.textContent =  new Date(value.ts).toLocaleString("en-US", {hour12: false})
      edata.innerHTML = JSON.stringify(value.data, undefined, 2)

    return log
  }


  function applyFilters (msg) {
    var pass = true

    self.filters.forEach( function (filter) {
      pass = pass && applyFilter(pass, msg, filter)
    })
    return pass
  }


  function applyFilter (pass, msg, filter) {
    pass = false

    if (msg === null || msg === undefined) return pass

    Object.keys(msg).forEach( function (key) {

      if (typeof(msg[key]) === "object" && msg[key] !== null) {
        pass = pass || applyFilter(pass, msg[key], filter)
      }

      if (key in filter && (typeof(msg[key]) === "string")) {
        var re = new RegExp(filter[key])
        pass = re.test(msg[key])
      }
    })

    return pass
  }



  function applyFilter (pass, msg, filter) {
    pass = false

    var found = false

    if (msg === null || msg === undefined) return pass

    Object.keys(filter).forEach( function (fkey) {

      if (filter[fkey] === "true")
        filter[fkey] = true

      if (filter[fkey] === "false")
        filter[fkey] = false

      Object.keys(msg).forEach( function (mkey) {

        if (typeof(msg[mkey]) === "object" && msg[mkey] !== null) {
          pass = pass || applyFilter(pass, msg[mkey], filter)
        }

        if (fkey === mkey) {
          found = true
          if (typeof(filter[fkey]) === "string" && typeof(msg[mkey]) === "string") {
            var re = new RegExp(filter[fkey])
            pass = re.test(msg[mkey])
          }
        }
      })

      if (typeof(filter[fkey]) === "boolean") {
        pass = filter[fkey] === found
      }

    })

    return pass
  }




  function addFilter (key, value) {

    var filterElem = filterBox.cloneNode()

    var filter = {}
    filter[key] = value

    self.filters.push(filter)

    filterpop.appendChild(filterElem)

    filterElem
    .querySelector(".js-filter-key")
    .textContent = "key: " + key
    filterElem
    .querySelector(".js-filter-value")
    .textContent = "match: " + value
    filterElem
    .querySelector(".js-clear-filter")
    .addEventListener("click", function () {
      filterElem.parentNode.removeChild(filterElem)
      var ix = self.filters.indexOf(filter)
      self.filters.splice(ix,1)
    })

    return self
  }



  self.addFilter = addFilter
  self.connect = connectToDB

  return self
}



// Sorting the queue
// var maxSpeed = {car:300, bike:60, motorbike:200, airplane:1000,
//     helicopter:400, rocket:8*60*60}
// var sortable = [];
// for (var vehicle in maxSpeed)
//       sortable.push([vehicle, maxSpeed[vehicle]])
// sortable.sort(function(a, b) {return a[1] - b[1]})