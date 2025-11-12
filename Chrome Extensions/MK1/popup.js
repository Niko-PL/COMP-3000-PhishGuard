
import Web_APP_URL from './SECRETS.js';

console.log("Popup script loaded");

document.addEventListener('DOMContentLoaded', () => { // Ensure the DOM is fully loaded
    console.log("DOM Content Loaded");
    
    const runButton = document.getElementById("run_btn");
    if (!runButton) {
        console.error("Run button not found!");    //sanity check
        return;
    }
    console.log("Run button loaded"); //sanity check

    runButton.addEventListener("click", async () => { //click event listener
        console.log("Run button clicked");
        
        const status_box = document.getElementById("status"); //status box element
        status_box.textContent = "Initiating...";

        let sheetId, sheet_name, clear_prev, webAppURL, time_range, emails_recorded; //initiate variables
        try {
            sheetId = document.getElementById("sheetId").value.trim(); //assign input values to variables
            sheet_name = document.getElementById("sheet_name").value.trim();
            time_range = document.getElementById("time_range").value.trim();
            clear_prev = document.getElementById("clear_sheet").checked; 
            emails_recorded = document.getElementById("emails_recorded").value.trim();
            time_range = document.getElementById("time_range").value.trim();
            
            if (emails_recorded < 1 || emails_recorded > 1000000) {
                status_box.textContent = "Invalid number of emails recorded";
                throw new Error("Invalid number of emails recorded");
            }

            webAppURL = Web_APP_URL; //get URL from SECRETS.js
            console.log("Got input values:", { sheetId, sheet_name, clear_prev, emails_recorded}); //log input values
        } catch (error) {
            console.error("Error retrieving input values.", error); //log error if input retrieval fails
            status_box.textContent = "Failed Input Call"; 
            return;     //stop execution if inputs can't be retrieved
        }

        status_box.textContent = "Running...";

        try {
            console.log("Making fetch request to:", webAppURL); 
            console.log("With parameters:", { sheetId, sheet_name, clear_prev, emails_recorded });
            

            const call = `${webAppURL}?sheetId=${encodeURIComponent(sheetId)}&sheet_name=${encodeURIComponent(sheet_name)}&clear_sheet=${(clear_prev.toString())}&emails_recorded=${encodeURIComponent(emails_recorded)}&time_range=${encodeURIComponent(time_range)}`;
            const response = await fetch(call, {redirect: 'follow'}); 
            console.log("Got response:", response);
            
            const text = await response.text();
            console.log("Response text:", text);

            if (text === "MAIN_YES") { 
                console.log("Response operation successful:", text);
                status_box.textContent = "Success!";
            } else {
                console.error("Error during response operation failed return:", text); 
                status_box.textContent = "Failed return.";
            }
        } catch (error) {
            console.error("Error during fetch operation:", error);
            status_box.textContent = "Fetch Error";
        }
    });
});