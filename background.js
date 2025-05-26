chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "openTab") {
    chrome.storage.local.get("reservedURL", ({ reservedURL }) => {
      if (reservedURL) {
        chrome.tabs.create({ url: reservedURL });
      }
    });
  }
});

