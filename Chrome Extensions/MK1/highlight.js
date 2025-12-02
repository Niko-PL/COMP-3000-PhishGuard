


//this highlights the bad words in the email body
//this gets injected into the gmail page

console.log("Highlight script loaded bad words:", BAD_WORDS);

document.addEventListener('DOMContentLoaded', () => { // Ensure the external extension DOM is fully loaded
    console.log("DOM Content Loaded");

    
    const runButton = document.getElementById("run_highlighter");
    if (!runButton) {
        console.error("Highlight button not found!");    //sanity check
        return;
    }
    console.log("Highlight button loaded"); //sanity check

    runButton.addEventListener("click", async () => { //click event listener
        console.log("Highlight button clicked");

        const status_box = document.getElementById("status"); //status box element
        status_box.textContent = "Initiating...";
        console.log("i think i am on " + window.location.hostname);
        /*await waitForGmailLoad();
        if (!gmailLoaded) {
            console.error("Gmail not loaded");
            status_box.textContent = "Gmail mail body not loaded correctly";
            return;
        }*/
        highlightBadWords();
        status_box.textContent = "Finished Highlighting...";
        console.log("Finished Highlighting...");
       
    });
});

function waitForGmailLoad() { //function to wait for gmail to load
    console.log("Waiting for Gmail to load");
    let body1 = document.querySelectorAll(".a3s"); //get all body elements from email
    if (body1.length > 0) {  //if not empty, gmail is loaded
        console.log("Gmail loaded");
        return true;
    }

    const observer = new MutationObserver(body1);{ //create observer to watch for changes in body elements (await something)
        let body2 = document.querySelectorAll(".a3s"); //get all body elements from email
        if (body2.length > 0) { //if not empty, gmail is loaded
            console.log("Gmail loaded");
            observer.disconnect(); //stop observer
            return true;
        }
    }   
}
function highlightBadWords() {
    console.log("Highlighting bad words");

    const email_body = document.querySelectorAll("span.a");
    console.log("Email body:", email_body);
    email_body.forEach(body => {
        console.log("Body:", body);
        const TreeWalker = document.createTreeWalker(body, NodeFilter.SHOW_TEXT); //create tree walker
        let node; //initialize node
        while((node = TreeWalker.nextNode())){
            let node_text = node.textContent; //initialize node text
            let changed = false;
            BAD_WORDS.forEach(word => {
                const regex = new RegExp(`\\b(${word})\\b`, 'gi'); //create regex for word global and case insensitive
                if (regex.test(node.textContent)) {
                    console.log("Word found:", word);
                    console.log("Node text:", node_text);
                    changed = true;
                    node_text = node_text.replace(word, `<span class="highlighted-word">${word}</span>`);
                }
            });
            if (changed) {
                console.log("Node text changed:", node_text);
                const span_new = document.createElement('span');
                span_new.innerHTML = node_text;
                node.replaceWith(span_new); //replace node with span
            }
            else {
                console.log("Node text not changed:", node_text);
            }
        }
    });
    console.log("Finished highlighting bad words exiting highlightBadWords function");
}