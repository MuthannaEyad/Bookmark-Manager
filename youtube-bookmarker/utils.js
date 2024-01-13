//getActiveTabURL function retrieves information about the currently active tab in the current window 
//  and returns an object representing that tab. The specific information includes the URL of the active tab, 
//      which can be accessed using tab.url once the function is called.

export async function getActiveTabURL() {
    const tabs = await chrome.tabs.query({
        currentWindow: true,
        active: true
    });
  
    return tabs[0];
}