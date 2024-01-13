// Importing a utility function to get the URL of the active tab
import { getActiveTabURL } from "./utils.js";

// Function to add a new bookmark to the UI
const addNewBookmark = (bookmarks, bookmark) => {
  // Creating HTML elements for the bookmark
  const bookmarkTitleElement = document.createElement("div");
  const controlsElement = document.createElement("div");
  const newBookmarkElement = document.createElement("div");

  // Setting bookmark title and class
  bookmarkTitleElement.textContent = bookmark.desc;
  bookmarkTitleElement.className = "bookmark-title";
  controlsElement.className = "bookmark-controls";

  // Setting attributes for controls (play and delete buttons)
  setBookmarkAttributes("play", onPlay, controlsElement);
  setBookmarkAttributes("delete", onDelete, controlsElement);

  // Setting attributes for the new bookmark container
  newBookmarkElement.id = "bookmark-" + bookmark.time;
  newBookmarkElement.className = "bookmark";
  newBookmarkElement.setAttribute("timestamp", bookmark.time);

  // Appending elements to build the bookmark structure
  newBookmarkElement.appendChild(bookmarkTitleElement);
  newBookmarkElement.appendChild(controlsElement);
  bookmarks.appendChild(newBookmarkElement);
};

// Function to view and display bookmarks in the UI
const viewBookmarks = (currentBookmarks=[]) => {
  const bookmarksElement = document.getElementById("bookmarks");

  bookmarksElement.innerHTML = "";

  if (currentBookmarks.length > 0) {
    // Adding bookmarks to the UI
    for (let i = 0; i < currentBookmarks.length; i++) {
      const bookmark = currentBookmarks[i];
      addNewBookmark(bookmarksElement, bookmark);
    }
  } else {
    // Displaying a message when there are no bookmarks
    bookmarksElement.innerHTML = '<i class="row">No bookmarks to show</i>';
  }

  return;
};

// Event handler for the "Play" button on a bookmark
const onPlay = async e => {
  // Retrieving the timestamp of the bookmark
  const bookmarkTime = e.target.parentNode.parentNode.getAttribute("timestamp");
  // Getting the URL of the active tab
  const activeTab = await getActiveTabURL();

  // Sending a message to the content script to play the video at the bookmarked time
  chrome.tabs.sendMessage(activeTab.id, {
    type: "PLAY",
    value: bookmarkTime,
  });
};

// Event handler for the "Delete" button on a bookmark
const onDelete = async e => {
  // Getting the URL of the active tab
  const activeTab = await getActiveTabURL();
  // Retrieving the timestamp of the bookmark
  const bookmarkTime = e.target.parentNode.parentNode.getAttribute("timestamp");
  // Finding and deleting the bookmark element from the UI
  const bookmarkElementToDelete = document.getElementById("bookmark-" + bookmarkTime);
  bookmarkElementToDelete.parentNode.removeChild(bookmarkElementToDelete);

  // Sending a message to the content script to delete the bookmark
  chrome.tabs.sendMessage(activeTab.id, {
    type: "DELETE",
    value: bookmarkTime,
  }, viewBookmarks);
};

// Function to set attributes for a bookmark control (play or delete button)
const setBookmarkAttributes =  (src, eventListener, controlParentElement) => {
  const controlElement = document.createElement("img");

  // Setting attributes for the control element
  controlElement.src = "assets/" + src + ".png";
  controlElement.title = src;
  controlElement.addEventListener("click", eventListener);
  controlParentElement.appendChild(controlElement);
};

// Event listener for the DOMContentLoaded event
document.addEventListener("DOMContentLoaded", async () => {
  // Getting the URL of the active tab
  const activeTab = await getActiveTabURL();
  // Extracting query parameters from the URL
  const queryParameters = activeTab.url.split("?")[1];
  const urlParameters = new URLSearchParams(queryParameters);

  // Extracting the 'v' parameter from the query parameters
  const currentVideo = urlParameters.get("v");

  if (activeTab.url.includes("youtube.com/watch") && currentVideo) {
    // Checking if the page is a YouTube video page
    // Retrieving and displaying bookmarks for the current video from storage
    chrome.storage.sync.get([currentVideo], (data) => {
      const currentVideoBookmarks = data[currentVideo] ? JSON.parse(data[currentVideo]) : [];

      viewBookmarks(currentVideoBookmarks);
    });
  } else {
    // Handling the case when the page is not a YouTube video page
    const container = document.getElementsByClassName("container")[0];
    container.innerHTML = '<div class="title">This is not a youtube video page.</div>';
  }
});
