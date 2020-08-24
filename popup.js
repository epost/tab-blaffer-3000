function dump(statusText) {
  const elem = document.getElementById('status')
  elem.textContent = elem.textContent + "\n" + statusText
}

function debug(str) {
  dump(str)
}

var state = {
  dumpTabsFromAllWindows: false
}

function main() {
  // console.log('hoi poes')
  // var bkg = chrome.extension.getBackgroundPage()
  // bkg.console.log('foo foo')
  // dump('tab dump')

  var checkbox1 = document.getElementById('checkbox-1')
  var button1 = document.getElementById('button-1')

  // update UI from (initial) state
  checkbox1.checked = state.dumpTabsFromAllWindows

  function onCheckChange(e) {
    // debug('e = '+ JSON.stringify(e))
    debug('state pre  = '+ JSON.stringify(state))
    var checkboxState = checkbox1.checked
    debug('cb state   = '+ JSON.stringify(checkboxState))
    state.dumpTabsFromAllWindows = checkboxState
    debug('state post = '+ JSON.stringify(state))
  }

  function _formatDictAsOrgSections(formatTab) {
    return function (dict) {

      function formatTabs(tabs) {
        return R.compose(
          R.join('\n'),
          R.map(formatTab)
        )(tabs)
      }

      return "" +
        '* bookmarks dumped\n' +
        '\n' +
        R.compose(
          R.join('\n'),
          R.values,
          R.mapObjIndexed((i, k, obj) => '** window ' + k + '\n' + formatTabs(obj[k]) + '\n')
        )(dict) +
        '';
    }
  }

  var formatDictAsOrgSections = _formatDictAsOrgSections(tab => '*** [[' + tab.url + '][' + tab.title + ']]')

  function formatDictAsJson(dict) {
    return "" +
      '{\n' +
      R.compose(
        R.join(',\n'),
        R.values,
        R.mapObjIndexed((i, k, obj) => '  "' + k + '":' + JSON.stringify(obj[k]))
      )(dict) +
      '\n}';
  }

  function dumpTabs() {
    debug('state = '+ JSON.stringify(state))
    // https://developer.chrome.com/extensions/tabs#method-query
    chrome.tabs.query(
      {
        // active: true, // show only active tab
        currentWindow: !state.dumpTabsFromAllWindows
      },
      function(tabs) {
        // when the popup is opened, there is certainly a window and at least
        // one tab (and at most one active tab), so tabs is a non-empty array

        // R.map(t => dump(JSON.stringify(t)), tabs)
        // var tabsDump = R.groupBy(t => t.windowId)(tabs)
        // var tabsDump = R.compose(R.groupBy(t => t.windowId))(tabs)

        // var tabs = R.compose(formatDictAsJson, R.groupBy(t => t.windowId))(tabs)
        var tabsDump = R.compose(formatDictAsOrgSections, R.groupBy(t => t.windowId))(tabs)

        // var tabsDump = R.compose(R.map(tabs => JSON.stringify(tabs)), R.groupBy(t => t.windowId))(tabs)
        // dump(JSON.stringify(tabs, null, 2))
        dump(tabsDump)
      }
    )
  }

  // something like this can be used to restore tabs
  function openWindowWithTabs() {
    debug('boop!');
    chrome.windows.create({
      url: 'http://www.shinsetsu.nl'
    }, function(win) {
      // win : Window, see API: https://developer.chrome.com/extensions/windows#type-Window
      var windowId = win.id;
      chrome.tabs.create({
        url: 'http://www.statebox.io',
        windowId: windowId
      }, function(tab) {
      });
    });
  }

  checkbox1.addEventListener('change', onCheckChange, false);
  button1.addEventListener('click', dumpTabs, false);
}
document.addEventListener('DOMContentLoaded', main)
