//here we will control the buttons on the popup.html page
//it also controlls html
// it is not injected so does not have access to the DOM
//changed 

document.addEventListener('DOMContentLoaded', () => { // Ensure the external extension DOM is fully loaded
    console.log("DOM Content Loaded");
    console.log("Content script loaded on:", window.location.href);

    const Button_HTML = document.getElementById("run_getHTML");
    const Button_Highlight = document.getElementById("run_highlighter");
    const Button_Scraper = document.getElementById("run_scraper");
    const Status = document.getElementById("status");
    let tabID = null;

    //settings UI contorleer
    const Settings_Button = document.getElementById("settings_button");
    const Settings_Section = document.getElementById("settings_section");

    if (!Settings_Button || !Settings_Section) { //if settings button or section not found, exit
        console.error("Settings button or section not found!");
        return;
    }
    else{
        console.log("Settings button and section found");
    }
    const Settings_Expander = () => { //function to toggle the settings section visibility
        console.log("Settings button clicked");
        const SS_Hidden = Settings_Section.classList.toggle("settings-section-hidden"); //get the state of the settings section
        console.log("Settings section hidden: ", SS_Hidden); 
        Settings_Section.setAttribute("aria-hidden", String(SS_Hidden));  //sets it to the current state
        Settings_Button.setAttribute("aria-expanded", String(!SS_Hidden));  //sets it to the opposite of the current state
    };
    Settings_Button.addEventListener("click", Settings_Expander); //add event listener to the settings button (little cog)


    //buttons contorleer
    if (!Button_HTML || !Button_Highlight || !Button_Scraper || !Status) {
        console.error("Button or Status not found!");
        return;  //if ui not loaded dont do anything
    };
    console.log("Buttons loaded and status Loaded");

    let intejected_tabs = [];

    //use consts function to update the status
    const Update_Status = (status_text, console_log = true,status_box = true) => {
       if(status_box){
        Status.textContent = status_text;
       }
        if (console_log) {
            console.log(status_text);
        }
    }

    Update_Status("--READY FOR ACTION--");
   
    const Inject_Script = (tabID) => { //function to inject the scripts into the tab
        return new Promise((resolve) => {
            chrome.scripting.executeScript({
                target: { tabId: tabID },
                files: ["Bad_Words_List.js","highlight_words.js","Warnings_List.js"]
            },
            ()=> {
                if (chrome.runtime.lastError) {  //arrow function to check for errors
                    console.error("Error injecting scripts:", chrome.runtime.lastError);
                    Update_Status("Error injecting scripts");
                    resolve(null);
                }
                else {
                    const injected_status=Track_Injected_Tabs(tabID); //track the injected tabs
                    Update_Status("Scripts injected successfully");
                    resolve(injected_status);
                }
            });
        });
    }

    const Track_Injected_Tabs = (tabID) => { //function to track the injected tabs and inject the script if not injected
        if (tabID !== null) {
            
            if(intejected_tabs.includes(tabID)){ //if the tab is already injected, exit
                Update_Status("Tab already injected, exiting", true);
                return 1;
            }
            else if(!intejected_tabs.includes(tabID)){ //if the tab is not injected, inject it
                intejected_tabs.push(tabID);
                Update_Status( "Tab injected successfully", true);
                return 2;
            }
            else{
                Update_Status("Error injecting scripts", true);
                return 3;
            }
        }
        else {
            Update_Status("No tab found", true);
            return null;
        }
    }

    

    const Get_Tab_ID = () => {
        return new Promise(resolve => {
            chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
                if (tabs.length > 0 && tabs[0].url.startsWith("https://mail.google.com/")) {
                    Update_Status("Google tab found", true);
                    resolve(tabs[0].id);
                } else {
                    Update_Status("No active Gmail tab found navigate to gmail and try again", true);
                    resolve(null);
                }
            });
        });
    }

    const Send_Message = async (message) => {
        const TAB_ID = tabID ?? await Get_Tab_ID();
        if(TAB_ID != null){
            chrome.tabs.sendMessage(TAB_ID, { action: message }, (response  ) => {
                console.log("Message sent to tab:", message);
                Update_Status(response);
                
                if (chrome.runtime.lastError) {
                    console.error("Error sending message:", chrome.runtime.lastError);
                    Update_Status("Error sending message: " + chrome.runtime.lastError.message, true, true);
                    return;
                }
                else {
                    Update_Status("Message sent successfully", true, false);
                    return;
                }
            });
        }
        else {
            Update_Status("No tab found navigate to gmail and try again", true);
            return;
        }
    }

    const MAIN = async () => {
        tabID = await Get_Tab_ID();
        if (tabID == null){
            Update_Status("No tab found navigate to gmail and try again", true,true);
            return null;
        }
        if (intejected_tabs.includes(tabID)) { //tab already injected no need to reinject
            Update_Status("Tab already injected, exiting", true, true);
            return tabID;
        }
        let attempts = 0;
        let injected = null;
        try {
            while (!injected && attempts < 10) {
                attempts++;
                Update_Status(`Injecting scripts... (attempt ${attempts})`, true, false);
                injected = await Inject_Script(tabID); //wait for chrome to finish injecting before next attempt
            }

            if (injected) {
                Update_Status("Tab injected successfully", true, true);
                return tabID;
            }

            Update_Status("Error injecting scripts 10 attempts", true, true);
            return null;
        } 
        catch (error) {
            console.error("MAIN injection error:", error);
            Update_Status("Error injecting scripts", true, true);
            return null;
        }
    }

    

    Button_HTML.addEventListener("click", () => {
        Update_Status("<MAIN> Initiating...", true,true);
        MAIN(); //inject the scripts into the tab
    });
    Button_Highlight.addEventListener("click", async () => {
        Update_Status("Highlight Initiating...",true,true);
        await MAIN(); //inject the scripts into the tab
        console.log("Tab ID: ", tabID);
        if(tabID != null){
            Send_Message("highlight");
        } else {
            Update_Status("Unable to send highlight command", true, true);
        }
        
    });
    Button_Scraper.addEventListener("click", () => {
        Update_Status("Scraper Initiating...",true,true);
        MAIN(); //inject the scripts into the tab
    });

    console.log("Buttons and status loaded and event listeners added");
});




