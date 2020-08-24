function dump(statusText) {
  const elem = document.getElementById('status')
  elem.textContent = elem.textContent + "\n" + statusText
}

function debug(str) {
  dump(str)
}

////////////////////////////////////////////////////////////////////////////////

function _formatDictAsOrgSections(formatTab) {
  return function(dict) {

    let formatTabs = R.compose(
        R.join('\n'),
        R.map(formatTab)
      )

    return "" +
      R.compose(
        R.join('\n'),
        R.values,
        R.mapObjIndexed((i, k, obj) => '** window ' + k + '\n' + formatTabs(obj[k]) + '\n')
      )(dict) +
      '';
  }
}

let formatDictAsOrgSections = _formatDictAsOrgSections(tab => '*** [[' + tab.url + '][' + tab.title + ']]')
let formatDictAsOrgList     = _formatDictAsOrgSections(tab => '- [[' + tab.url + '][' + tab.title + ']]')

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

function dumpDict(formatDict) {
  return function (tabs) {
    // when the popup is opened, there is certainly a window and at least
    // one tab (and at most one active tab), so tabs is a non-empty array

    // R.map(t => dump(JSON.stringify(t)), tabs)
    // let tabsDump = R.groupBy(t => t.windowId)(tabs)
    // let tabsDump = R.compose(R.groupBy(t => t.windowId))(tabs)

    // let tabs = R.compose(formatDictAsJson, R.groupBy(t => t.windowId))(tabs)
    let tabsDump = R.compose(formatDict, R.groupBy(t => t.windowId))(tabs)

    // let tabsDump = R.compose(R.map(tabs => JSON.stringify(tabs)), R.groupBy(t => t.windowId))(tabs)
    // dump(JSON.stringify(tabs, null, 2))
    dump(tabsDump)
  }
}

////////////////////////////////////////////////////////////////////////////////

let state = {
  dumpTabsFromAllWindows: false
}

function main() {
  // console.log('hoi poes')
  // let bkg = chrome.extension.getBackgroundPage()
  // bkg.console.log('foo foo')
  // dump('tab dump')

  let checkbox1 = document.getElementById('checkbox-1')
  let buttonDumpTabsAsOrgSections = document.getElementById('button-dump-tabs-as-org-sections')
  let buttonDumpTabsAsOrgLists = document.getElementById('button-dump-tabs-as-org-lists')

  // update UI from (initial) state
  checkbox1.checked = state.dumpTabsFromAllWindows

  function onCheckbox1Change(e) {
    // debug('e = '+ JSON.stringify(e))
    // debug('state pre  = '+ JSON.stringify(state))
    let checkboxState = checkbox1.checked
    // debug('cb state   = '+ JSON.stringify(checkboxState))
    state.dumpTabsFromAllWindows = checkboxState
    // debug('state post = '+ JSON.stringify(state))
  }

  function dumpTabs(formatDict) {
    return function () {
      // debug('state = '+ JSON.stringify(state))
      // https://developer.chrome.com/extensions/tabs#method-query
      chrome.tabs.query(
        {
          // active: true, // show only active tab
          currentWindow: !state.dumpTabsFromAllWindows
        }, dumpDict(formatDict)
      )
    }
  }

  // something like this can be used to restore tabs
  function openWindowWithTabs() {
    debug('boop!');
    chrome.windows.create({
      url: 'http://www.shinsetsu.nl'
    }, function(win) {
      // win : Window, see API: https://developer.chrome.com/extensions/windows#type-Window
      let windowId = win.id;
      chrome.tabs.create({
        url: 'http://www.statebox.io',
        windowId: windowId
      }, function(tab) {
      })
    })
  }

  checkbox1.addEventListener('change', onCheckbox1Change, false);
  buttonDumpTabsAsOrgSections.addEventListener('click', dumpTabs(formatDictAsOrgSections), false);
  buttonDumpTabsAsOrgLists.addEventListener('click', dumpTabs(formatDictAsOrgList), false);
}
document.addEventListener('DOMContentLoaded', main)
