
//  1. Promise: A Promise is a JavaScript object representing the eventual completion or failure of an asynchronous operation. 
//      In this case, the Promise is used in the fetchBookmarks function to handle the asynchronous retrieval of bookmarks from Chrome storage. 
//      The resolve function is called when the operation is successful, providing the fetched bookmarks.

//  2. JSON.stringify: The JSON.stringify method is used to convert a JavaScript object (in this case, an array of bookmarks) 
//      into a JSON-formatted string. This string can be stored in Chrome storage. Later, when retrieving the data, 
//      JSON.parse is used to convert the JSON string back into a JavaScript object.

//  3. async/await: The async and await keywords are used in functions that perform asynchronous operations.
//      For example, async/await is used in the addNewBookmarkEventHandler and newVideoLoaded functions to make asynchronous calls to 
//      fetchBookmarks, allowing the code to wait for the asynchronous operation to complete before proceeding.

//  4. chrome.runtime.onMessage: This is an event listener provided by the Chrome extension API. 
//      It listens for messages from the background script. In this code, it is used to handle messages related to new videos, 
//      playing bookmarks, and deleting bookmarks.

//  5. chrome.storage.sync: This is the Chrome extension storage API. It allows the extension to store and retrieve data persistently. 
//      The chrome.storage.sync.get and chrome.storage.sync.set methods are used to retrieve and store bookmarks for the current video.

(() => {
    // Variables to store YouTube player controls and current video information
    let youtubeLeftControls, youtubePlayer;
    let currentVideo = "";
    let currentVideoBookmarks = [];

    // Function to fetch bookmarks for the current video from Chrome storage
    const fetchBookmarks = () => {
        return new Promise((resolve) => {
            chrome.storage.sync.get([currentVideo], (obj) => {
                resolve(obj[currentVideo] ? JSON.parse(obj[currentVideo]) : []);
            });
        });
    };

    // Event handler to add a new bookmark
    const addNewBookmarkEventHandler = async () => {
        // Get the current timestamp from the YouTube player
        const currentTime = youtubePlayer.currentTime;
        const newBookmark = {
            time: currentTime,
            desc: "Bookmark at " + getTime(currentTime),
        };

        // Fetch current bookmarks, update with the new bookmark, and store them in Chrome storage
        currentVideoBookmarks = await fetchBookmarks();
        chrome.storage.sync.set({
            [currentVideo]: JSON.stringify([...currentVideoBookmarks, newBookmark].sort((a, b) => a.time - b.time))
        });
    };

    // Function to handle a new video being loaded
    const newVideoLoaded = async () => {
        const bookmarkBtnExists = document.getElementsByClassName("bookmark-btn")[0];

        // Fetch current bookmarks for the video
        currentVideoBookmarks = await fetchBookmarks();

        // Add bookmark button if it doesn't already exist
        if (!bookmarkBtnExists) {
            const bookmarkBtn = document.createElement("img");

            // Set properties for the bookmark button
            bookmarkBtn.src = chrome.runtime.getURL("assets/bookmark.png");
            bookmarkBtn.className = "ytp-button " + "bookmark-btn";
            bookmarkBtn.title = "Click to bookmark current timestamp";

            // Get YouTube player controls and append the bookmark button
            youtubeLeftControls = document.getElementsByClassName("ytp-left-controls")[0];
            youtubePlayer = document.getElementsByClassName('video-stream')[0];
            youtubeLeftControls.appendChild(bookmarkBtn);

            // Attach the event listener for adding a new bookmark
            bookmarkBtn.addEventListener("click", addNewBookmarkEventHandler);
        }
    };

    // Listener for messages from the background script
    chrome.runtime.onMessage.addListener((obj, sender, response) => {
        const { type, value, videoId } = obj;

        if (type === "NEW") {
            // Set the current video and handle the new video loaded event
            currentVideo = videoId;
            newVideoLoaded();
        } else if (type === "PLAY") {
            // Set the YouTube player's current time to the specified value
            youtubePlayer.currentTime = value;
        } else if (type === "DELETE") {
            // Delete a bookmark, update storage, and send the updated bookmarks as a response
            currentVideoBookmarks = currentVideoBookmarks.filter((b) => b.time != value);
            chrome.storage.sync.set({ [currentVideo]: JSON.stringify(currentVideoBookmarks) });
            response(currentVideoBookmarks);
        }
    });

    // Initial loading of the video and bookmarks
    newVideoLoaded();
})();

// Function to convert a timestamp to a formatted time string
const getTime = t => {
    var date = new Date(0);
    date.setSeconds(t);

    return date.toISOString().substr(11, 8);
};
