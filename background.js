// background.js

// Listen for messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "fetchData") {
    // Get today"s date and format it as "YYYY-MM-DD"
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    const formattedDate = `${year}-${month}-${day}`;

    // Make cross-origin request here
    fetch("http://contratti.ids.al/contratti/supervisori.php?ore_hyrje=1", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "cache-control": "no-store, no-cache, must-revalidate, post-check=0, pre-check=0",
        "Pragma": "no-cache",
        "accept": "*/*",
        "Host": "contratti.ids.al",
        "accept-encoding": "gzip, deflate",
        "content-type": "multipart/form-data;",
      },
      body: `ore_da=${formattedDate}&ore_a=${formattedDate}&team=vuoto&operatore=tuti&trova_hyrje=Lista`,
    })
    .then(response => response.text())
    .then(data => sendResponse({ success: true, data }))
    .catch(error => sendResponse({ success: false, error: error.message }));

    return true; // To indicate that sendResponse will be used asynchronously
  }
});
