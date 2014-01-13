/*global require */
function CmdBar (root) {

  var gui = require('nw.gui')
    , win = gui.Window.get()
    , self = {}
  self.root = root


  function console (bool) {
    var linkConsole = root.querySelector(".js-cmd-bar-console")
    if (bool) {
      linkConsole.innerHTML = '<a href="#" class="cmd-bar-console">console</a>'
      var console = linkConsole.querySelectory(".cmd-bar-console")
      console.addEventListener("click", function () {
        if (win.isDevToolsOpen()) win.closeDevTools()
        else win.showDevTools()
      })
    }
    else {
      linkConsole.innerHTML = ""
    }
  }


  function addHost (host) {
    var hosts = root.querySelector(".js-cmd-bar-hosts")
    var host = document.createElement("a")
    host.className = "cmd-bar-host"
    host.addEventListener("click", function () {

    }
    hosts.innerHTML += '<a href="#" class="host"></a>'
  }

  fun

  self.console = console

  return self

}