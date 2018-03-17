var config = {
  defaultDisplay:true,
  display:{},
  updateRate:60
}
chrome.storage.local.get(config, function (res) {
  config = Object.assign(res);
  if (config.display === true || config.display === false) config.display = {};
  // console.log(JSON.stringify(config));
  chrome.storage.local.set(config);
  startup();
});

function startup() {
  chrome.contextMenus.create({
    id: "place-comment",
    title: "Place comment",
    contexts: ["all"]
  });

  chrome.contextMenus.create({
    id: "update-comments",
    title: "Update comments",
    contexts: ["all"]
  });

  chrome.contextMenus.create({
    id: "separator1",
    type:"separator",
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

  chrome.contextMenus.create({
    id: "report-bug",
    title: "Report a bug",
    contexts: ["all"]
  });
}

function toggleDisplay(state=undefined) {
  chrome.tabs.query({ lastFocusedWindow:true, active:true }, function (tabs) {
    if (state === undefined)
      config.display[tabs[0].url] = !config.display[tabs[0].url];
    else
      config.display[tabs[0].url] = state;
    chrome.storage.local.set({ display:config.display });
    chrome.contextMenus.update("toggle-display", { checked: config.display[tabs[0].url] });
  });
}

function placeComment(tabId) {
  chrome.tabs.sendMessage(tabId, { name:"place-comment" });
}

function updateComments(tabId) {
  chrome.tabs.sendMessage(tabId, { name:"update-comments" });
}

chrome.tabs.onActivated.addListener(function (data) {
  delete data.tabId;
  data.active = true;
  chrome.tabs.query(data, function (tabs) {
    chrome.contextMenus.update("toggle-display", { checked: config.display[tabs[0].url] });
  });
});

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
    case "update-comments":
      toggleDisplay(true);
      updateComments(tab.id);
      break;
    case "toggle-display":
      toggleDisplay();
      break;
    case "open-options":
    case "report-bug":
      chrome.runtime.openOptionsPage();
      break;
  }
});
