var config = {
  display:true,
  updateRate:10
}
chrome.storage.local.get(config, function (res) {
  config = Object.assign(res);
  chrome.storage.local.set(config);
  startup();
});

function startup() {
  chrome.contextMenus.update("toggle-display", { checked: config.display });

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

  chrome.contextMenus.create({
    id: "open-options",
    title: "Settings",
    contexts: ["all"]
  });
}

function toggleDisplay(state=undefined) {
  if (state === config.display) return;
  if (state === undefined)
    config.display = !config.display;
  else
    config.display = state;
  chrome.storage.local.set({ display:config.display });
  chrome.contextMenus.update("toggle-display", { checked: config.display });
}

function placeComment(tabId) {
  var port = chrome.tabs.connect(tabId, { name:"place-comment" });
  port.disconnect();
}

// keybind shortcut pressed -----------------------------------
chrome.commands.onCommand.addListener(function (name) {
  switch (name) {
    case "place-comment":
      toggleDisplay(true);
      chrome.tabs.query({ lastFocusedWindow:true, active:true }, function (tabs) {
        placeComment(tabs[0].id);
      });
      break;
    case "toggle-display":
      toggleDisplay();
      break;
  }
});

// Context Menu clicked ---------------------------------------
chrome.contextMenus.onClicked.addListener(function(info, tab) {
  switch (info.menuItemId) {
    case "place-comment":
      toggleDisplay(true);
      placeComment(tab.id);
      break;
    case "toggle-display":
      toggleDisplay();
      break;
    case "open-options":
      chrome.runtime.openOptionsPage();
      break;
  }
});
