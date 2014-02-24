/*global require */
function CmdBar (root) {

  var gui = require('nw.gui')
    , win = gui.Window.get()
    , self = {}
  self.root = root


  function console (bool) {
    var linkConsole = root.querySelector("#js-cmd-bar-console")
    if (bool) {
      linkConsole.innerHTML = '<a href="#" class="cmd-bar-console">console</a>'
      var console = linkConsole.querySelector(".cmd-bar-console")
      console.addEventListener("click", function () {
        if (win.isDevToolsOpen()) win.closeDevTools()
        else win.showDevTools()
      })
    }
    else {
      linkConsole.innerHTML = ""
    }
  }

  self.console = console

  return self

}