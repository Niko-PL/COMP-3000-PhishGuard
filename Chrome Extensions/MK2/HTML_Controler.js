//here we will control the buttons and UI on the extention.html 
//it also controlls html on the gmail page
//changed to version 2.0

document.addEventListener('DOMContentLoaded', () => { // Ensure the external extension DOM is fully loaded
    console.log("DOM Content Loaded");
    console.log("Content script loaded on:", window.location.href);



        //load all the buttones for main ui
        const Button_HTML = document.getElementById("run_getHTML");
        const Button_Highlight = document.getElementById("run_highlighter");
        const Button_Scraper = document.getElementById("run_scraper");
        const Status = document.getElementById("status");
        let tabID = null;

        const Settings_Button = document.getElementById("settings_button");
        const Settings_Section = document.getElementById("settings_section");

        const Security_Button = document.getElementById("security_button");
        const Security_Section = document.getElementById("security_section");


        //inside settings section data laoded
        const Run_On_Open = document.getElementById("run_on_open");
        const Sheet_ID = document.getElementById("sheetId");
        const Sheet_Name = document.getElementById("sheet_name");
        const Emails_Recorded = document.getElementById("emails_recorded");
        const Clear_Sheet = document.getElementById("clear_sheet");
        const Time_Range = document.getElementById("time_range");





    //settings cookies  contorleer
    //------------------------------------------------------------------
    //settings cookies will be used to store the settings for the extension
    //------------------------------------------------------------------

    const Save_Settings = () => {
        const Settings_Cookie = {
            Run_On_Open: Run_On_Open.checked,
            Sheet_ID: Sheet_ID.value,
            Sheet_Name: Sheet_Name.value,
            Emails_Recorded: Emails_Recorded.value,
            Clear_Sheet: Clear_Sheet.checked,
            Time_Range: Time_Range.value,
        };
        try {
            chrome.storage.sync.set(Settings_Cookie);
            console.log("Settings saved");
        }
        catch (error) {
            console.error("Error saving settings:", error);
            return;
        }
    }

    const Load_Settings = () => {
        chrome.storage.sync.get((Cookie_Data) => {
            console.log("Settings loaded:", Cookie_Data);
            Run_On_Open.checked = Cookie_Data.Run_On_Open || false;
            Sheet_ID.value = Cookie_Data.Sheet_ID || "";
            Sheet_Name.value = Cookie_Data.Sheet_Name || "";
            Emails_Recorded.value = Cookie_Data.Emails_Recorded || 20;
            Clear_Sheet.checked = Cookie_Data.Clear_Sheet || false;
            Time_Range.value = Cookie_Data.Time_Range || "7";
        });
    }




    //run on start checkbox contorleer
    //------------------------------------------------------------------
    //run on open checkbox will run the extension open  of gmail email
    //------------------------------------------------------------------



   
    if (!Run_On_Open) {
        console.error("Run on open checkbox not found!");
        return;
    }
    else{
        console.log("Run on open checkbox found");
    }



    //settings UI contorleer
    //------------------------------------------------------------------
    //in the future simplify this section as you use the same code innit
    //------------------------------------------------------------------
    

    if (!Settings_Button || !Settings_Section) { //if settings button or section not found, exit
        console.error("Settings button or section not found!");
        return;
    }
    else{
        console.log("Settings button and section found");
    }
    const Settings_Expander = () => { //function to toggle the settings section visibility
        console.log("Settings button clicked");
        const SS_Hidden_Status = Settings_Section.classList.toggle("settings-section-hidden"); //get the state of the settings section
        const SS_Hidden_Status_Other = Security_Section.classList.contains("security-section-hidden");

        if (SS_Hidden_Status){ 
            console.log("Settings Closed");
            Settings_Section.setAttribute("aria-hidden", String(SS_Hidden_Status));  
            Settings_Button.setAttribute("aria-expanded", String(!SS_Hidden_Status));  
        }
        else{
            if (!SS_Hidden_Status_Other){  //other section currently visible
                console.log("Security section is showing now it will be hidden");
                Security_Section.classList.add("security-section-hidden");
                Security_Section.setAttribute("aria-hidden", "true");  
                Security_Button.setAttribute("aria-expanded", "false");  
            }
            console.log("Settings Opened");
            Settings_Section.setAttribute("aria-hidden", String(!SS_Hidden_Status));  
            Settings_Button.setAttribute("aria-expanded", String(SS_Hidden_Status));  
        }
        
           
    };
    
    //security UI contorleer
    
    if (!Security_Button || !Security_Section) { //if security button or section not found, exit
        console.error("Security button or section not found!");
        return;
    }
    else{
        console.log("Security button and section found");
    }
    
    const Security_Expander = () => { //function to toggle the security section visibility
        console.log("Security button clicked");
        const SS_Hidden_Status = Security_Section.classList.toggle("security-section-hidden"); //get the state of the security section
        const SS_Hidden_Status_Other = Settings_Section.classList.contains("settings-section-hidden");
       
        if (SS_Hidden_Status){ //if settings section is hidden, set it to visible
            console.log("Security Closed");
            Security_Section.setAttribute("aria-hidden", String(SS_Hidden_Status));  
            Security_Button.setAttribute("aria-expanded", String(!SS_Hidden_Status));  
        }
        else{
            if (!SS_Hidden_Status_Other){  //other section currently visible
                console.log("Settings section is showing now it will be hidden");
                Settings_Section.classList.add("settings-section-hidden");
                Settings_Section.setAttribute("aria-hidden", "true");  
                Settings_Button.setAttribute("aria-expanded", "false");  
            }
            console.log("Security Opened");
            Security_Section.setAttribute("aria-hidden", String(!SS_Hidden_Status));  
            Security_Button.setAttribute("aria-expanded", String(SS_Hidden_Status)); 

        }
       

    };
   




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

    
   
    const Inject_Script = (tabID) => { //function to inject the scripts into the tab
        return new Promise((resolve) => {
            chrome.scripting.executeScript({
                target: { tabId: tabID },
                files: ["Bad_Words_List.js","Warnings_List.js","highlight_words.js",]
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

    //all the evnet listeners for the buttons and settings
    //------------------------------------------------------------------
    //These guys do the listenting
    //------------------------------------------------------------------

    
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
    
    Settings_Button.addEventListener("click", Settings_Expander); //add event listener to the settings button (little cog)
    Security_Button.addEventListener("click", Security_Expander); //add event listener to the security button (little shield)

    Sheet_ID.addEventListener("input", Save_Settings);
    Sheet_Name.addEventListener("input", Save_Settings);
    Clear_Sheet.addEventListener("change", Save_Settings);
    Time_Range.addEventListener("change", Save_Settings);
    Run_On_Open.addEventListener("change", Save_Settings);

    console.log("Buttons and status loaded and event listeners added");
    Load_Settings();
    Update_Status("--READY FOR ACTION--");
});




