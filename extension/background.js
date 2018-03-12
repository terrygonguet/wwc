chrome.contextMenus.create({
  id: "place-comment",
  title: "Place comment",
  contexts: ["all"]
});

chrome.contextMenus.create({
  id: "toggle-display",
  title: "Display comments",
  type: "checkbox",
  checked: true,
  contexts: ["all"]
});

chrome.contextMenus.onClicked.addListener(function(info, tab) {
  switch (info.menuItemId) {
    case "place-comment":
      toggleDisplay(true);
      placeComment(tab.id);
      break;
    case "toggle-display":
      toggleDisplay();
      break;
  }
});

var display = true;
chrome.storage.local.get("display", function (res) {
  if (res.display === undefined) {
    chrome.storage.local.set({ display });
  } else {
    display = res.display;
  }
  chrome.contextMenus.update("toggle-display", { checked: display });
});

function toggleDisplay(state) {
  if (state === display) return;
  if (state === undefined)
    display = !display;
  else
    display = state;
  chrome.storage.local.set({ display });
  chrome.contextMenus.update("toggle-display", { checked: display });
}

function placeComment(tabId) {
  var port = chrome.tabs.connect(tabId, { name:"place-comment" });
  port.disconnect();
}

chrome.commands.onCommand.addListener(function (name) {
  switch (name) {
    case "place-comment":
      toggleDisplay(true);
      var id = chrome.tabs.query({ lastFocusedWindow:true, active:true }, function (tabs) {
        placeComment(tabs[0].id);
      });
      break;
    case "toggle-display":
      toggleDisplay();
      break;
  }
});
