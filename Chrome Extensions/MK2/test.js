console.log("Content script loaded on:", window.location.href);

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    
    console.log("Message received:", request);  
    
    if (request.action === "getHTML") {
        console.log("HTML get button clicked");
        const status_box = document.getElementById("status"); //status box element
        status_box.textContent = "executing...";

        console.log("Content script loaded on:", window.location.href);
        const runButton = document.getElementById("run_getHTML");
        if (!runButton) {
            console.error("HTML get button not found!");    //sanity check
            return;
        }
        console.log("HTML get button loaded"); //sanity check
    
        runButton.addEventListener("click", async () => { //click event listener
            console.log("HTML get button clicked");
            const status_box = document.getElementById("status"); //status box element
            status_box.textContent = "Initiating...";
            const tabs_last_focused = await chrome.tabs.query({
                active: true,
                lastFocusedWindow: true
            });
            const tabs_current_window = await chrome.tabs.query({
                active: true,
                currentWindow: true
            });
    
            console.log("Tabs: ", tabs_last_focused);
            console.log("Tabs current window: ", tabs_current_window);
        });
    }
   
});
