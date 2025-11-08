
import Web_APP_URL from './SECRETS.js';

document.getElementById("run_btn").addEventListener("click", async () => {
    
    const status_box = document.getElementById("status");
    status_box.textContent = "Initiating...";

    
    let sheetId, sheet_name, clear_prev, webAppURL; //initiate variables
    try {
        sheetId = document.getElementById("sheetId").value.trim(); //assign input values to variables
        sheet_name = document.getElementById("sheet_name").value.trim();
        clear_prev = document.getElementById("clear_sheet").checked; 
        webAppURL = Web_APP_URL; //get URL from SECRETS.js
    } catch (error) {
        console.error("Error retrieving input values.", error); //log error if input retrieval fails
        status_box.textContent = "Failed Input Call";
        return;
    }

    status_box.textContent = "Running...";

    try{
   const response = await fetch(`${webAppURL}?sheetId=${encodeURIComponent(sheetId)}&sheetName=${encodeURIComponent(sheet_name)}&clearPrevious=${clear_prev}`); 
   //make fetch call with parameters
   const text = await response.text();

   if (response=="MAIN_YES"){ //check for success response
        console.log("Response operation successful: ", text);
         status_box.textContent = " Success!";
    } 
    else { //check for failure response
        console.error("Error during response operation failed return: ", text); 
        status_box.textContent = " Failed return.";
    }
    } catch (error) { //catch fetch errors
        console.error("Error during fetch operation: ", error);
        status_box.textContent = "Fetch Error";
    }
    

});


console.log("Web App URL:", Web_APP_URL);