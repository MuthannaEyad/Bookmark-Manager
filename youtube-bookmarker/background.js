

//URLSearchParams is used to parse the query parameters of a YouTube video URL. Specifically, 
//  it retrieves the value associated with the "v" parameter, which represents the unique identifier
//      of the video. This value is then used to uniquely identify and handle the video within the extension.


chrome.tabs.onUpdated.addListener((tabId, tab) => {
    if (tab.url && tab.url.includes("youtube.com/watch")) {
        const queryParameters = tab.url.split("?")[1];  //takes the cgi string to sotre it, which represents a video unqiuley
        const urlParamters = new URLSearchParams(queryParameters);

        chrome.tabs.sendMessage(tabId, {      //send a message to contentScript with the video id (the cgi string)
            type: "NEW",                   //new video event
            videoId: urlParamters.get("v"),  //gets the whatever is after the v= in the cgi string
        });
    }
});