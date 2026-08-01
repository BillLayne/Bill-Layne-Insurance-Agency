// BLI Mail Gateway - toolbar icon click = open the side panel AND capture
// the active tab in one step.
//
// Why not openPanelOnActionClick: when Chrome opens the panel on the action
// click, it consumes the click without firing action.onClicked and without
// granting activeTab - so the panel's own Capture button gets "Cannot access
// contents of the page". Handling onClicked ourselves means the click grants
// activeTab, we capture right here in the background, and the panel reads
// the result from chrome.storage.session.

// Explicitly false: earlier versions set true and Chrome remembers it.
chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: false })
  .catch((error) => console.error('BLI Mail Gateway: panel behavior setup failed.', error));

// Injected into the active tab. Must be fully self-contained.
function capturePageHtml() {
  const doctype = document.doctype ? '<!doctype html>\n' : '';
  return {
    html: doctype + document.documentElement.outerHTML,
    title: document.title || '',
    url: location.href,
    text: ((document.body && document.body.innerText) || '').slice(0, 60000)
  };
}

chrome.action.onClicked.addListener((tab) => {
  // Must run inside the user gesture - no awaits before this call.
  if (tab && tab.id) {
    chrome.sidePanel.open({ tabId: tab.id }).catch((e) =>
      console.error('BLI Mail Gateway: side panel open failed.', e));
  }
  captureInto(tab);
});

async function captureInto(tab) {
  const put = (obj) => chrome.storage.session.set({
    pendingCapture: Object.assign({ ts: Date.now(), url: (tab && tab.url) || '' }, obj)
  });
  try {
    if (!tab || !tab.id) throw new Error('No active tab found.');
    const url = tab.url || '';
    if (/^(chrome|edge|about|devtools|chrome-extension):/.test(url)) {
      throw new Error('Chrome does not allow capturing this type of page. Open the email template in a normal tab, then click the BLI icon again.');
    }
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: capturePageHtml
    });
    const r = results && results[0] && results[0].result;
    if (!r || !r.html) throw new Error('Nothing captured - reload the template tab and click the BLI icon again.');
    await put({ html: r.html, title: r.title, url: r.url, text: r.text || '' });
  } catch (e) {
    const msg = String((e && e.message) || e);
    const friendly = /Cannot access|cannot be scripted|permission|file scheme|file:/i.test(msg)
      ? 'Chrome blocked the capture on this page. For local files (file://), enable "Allow access to file URLs" for this extension (chrome://extensions → BLI Mail Gateway → Details). Otherwise reload the template tab and click the BLI icon again.'
      : msg;
    await put({ error: friendly });
  }
}
