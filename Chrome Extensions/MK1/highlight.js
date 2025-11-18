import Web_APP_URL from './SECRETS.js';

import BAD_WORDS from './Words_Response.js';


console.log("Highlight script loaded bad words:", BAD_WORDS);

document.addEventListener('DOMContentLoaded', () => { // Ensure the DOM is fully loaded
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
        
        highlightBadWords();
        status_box.textContent = "Finished Highlighting...";

    });
});


function highlightBadWords() {
    console.log("Highlighting bad words");

    const email_body = document.querySelectorAll(".a3s");

    email_body.forEach(body => {
        const TreeWalker = document.createTreeWalker(body, NodeFilter.SHOW_TEXT); //create tree walker
        let node; //initialize node
        let nodeText = node.textContent; //initialize node text
        
        while((node = TreeWalker.nextNode())){
            let replaced = false;
            BAD_WORDS.forEach(word => {
                const regex = new RegExp(`\\b(${word})\\b`, 'gi'); //create regex for word global and case insensitive
                if (regex.test(node.textContent)) {
                    replaced = true;
                    nodeText = nodeText.replace(word, `<span class="highlighted-word">${word}</span>`);
                }
            });
            if (replaced) {
                node.repalceWith(document.createElement('span')); //replace node with span
            }
        }
    });
}