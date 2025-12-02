//this is the script that highlights the words in the email body


const Bad_Words =  (typeof window !== "undefined" && window.BAD_WORDS) || [];

const BAD_WORDS_Class = "phishGuard-highlighted-word";
console.log("Bad Words:", Bad_Words);


Word_Regex = () => {
    let Bad_Words_Regex = [];
    try {
        Bad_Words_Regex = [...new Set(window.BAD_WORDS)].filter(Boolean);
    }
    catch (error) {
        console.error("Error creating word regex:", error);
        return null;
    }
    if (Bad_Words_Regex.length < 0 || Bad_Words_Regex == null) {
        console.error("No bad words found");
        return null;
    }

    const ESCAPED_REGEX = Bad_Words_Regex.map(w => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|"); // Escaped REGEX chars

    New_Regex = new RegExp(`\\b(${ESCAPED_REGEX})\\b`, "gi");
    console.log("New Regex:", New_Regex);  //TEST remove this (boi gonna be long)
    return New_Regex;

};

Highlight_Words = (body,regex) => { //body == Email_Body <.a3s> 
    if (!regex) {
        console.warn("No regex provided for highlighting");
        return;
    }

    const roots = (body instanceof NodeList || Array.isArray(body))
        ? Array.from(body)
        : (body ? [body] : []);

    if (roots.length === 0) {
        console.warn("Highlight_Words: no body nodes supplied");
        return;
    }

    roots.forEach(rootNode => {
        if (!(rootNode instanceof Node)) {
            console.warn("Highlight_Words: skipping non-node root", rootNode);
            return;
        }

        const Tree_Walker = document.createTreeWalker(rootNode, NodeFilter.SHOW_TEXT, { acceptNode: (node) => {
            
            if (!node.parentNode || !node.textContent?.trim()){  //if no parent or empty reject
                return NodeFilter.FILTER_REJECT; //returns to Tree_Walker
            }
            else if (node.parentNode.closest(`.${BAD_WORDS_Class}`)){ //if the parent node is a child of the BAD_WORDS_Class, reject the node
                return NodeFilter.FILTER_REJECT;
            }
            else {
                return NodeFilter.FILTER_ACCEPT;
            }
            
        }});
        
        let Tree_Temp_Nodes = [];  //temporary array to store the nodes mid traversal
        let COUNT_BAD_WORDS = 0;

        while (Tree_Walker.nextNode()){  // traverse the tree if next carry on 
            Tree_Temp_Nodes.push(Tree_Walker.currentNode);
        }
        //now we inject our css over the bad words identified
        Tree_Temp_Nodes.forEach(node => {
            if (!node || !node.textContent) {
                return;
            }

            const original_text = node.textContent;
            const replaced = original_text.replace(regex, match => {
                COUNT_BAD_WORDS++;
                return `<span class="${BAD_WORDS_Class}">${match}</span>`;
            });

            if (replaced !== original_text) {
                // Convert the HTML string into DOM nodes without leaving wrapper spans behind
                const temp_container = document.createElement("span");
                temp_container.innerHTML = replaced;
                const doc_fragment = document.createDocumentFragment();
                while (temp_container.firstChild) {
                    doc_fragment.appendChild(temp_container.firstChild);
                }
                node.replaceWith(doc_fragment);
            }
        });
    });
}

Inject_CSS = () => { //inject the css into the head of the document
    const style_name = "phishGuard-highlight-css-1"; //style name to inject (unique to avoid conflicts)
    if (document.getElementById(style_name)){
        console.log("CSS already injected/or exits with this name");
        return;
    }
    else {
    const css = document.createElement('style');
    css.id = style_name;
    css.textContent = `.${BAD_WORDS_Class} {background-color: darkred; ,color: white;}`; //background vs text color
    (document.head || document.documentElement).appendChild(css); //append to head or document element (wichever is present)
    console.log("CSS injected");
    }
}

Scan_Email = () => {
    console.log("Highlighting words");

    const Email_Body = document.querySelectorAll(".a3s"); //hmtl <.a3s> for gmail email body
    
    if (Email_Body.length > 0) {
        console.log("Email Body found");
        Highlight_Words(Email_Body,Word_Regex());
    }
    else {
        console.log("Email Body not found");
        return "No Email found - Open an Email and try again";
    }

}

const MAIN = () => {
    Inject_CSS(); //we inject the css for highlt
    Scan_Email();

    /*if (window.gmail_loaded){ //if its true then gmail is loaded and highlighted and highlighted words
        return;
    }
    else {
        window.gmail_loaded = true; //set gmail to highlighted and highlighted words
    }*/
};



chrome.runtime.onMessage.addListener((Message, sender, sendResponse) => {
    console.log("Message received:", Message);
    console.log("Sender:", sender);
    if (Message && Message.action === "highlight") {
        console.log("Highlighting words");
        try {
            const status = MAIN();
            sendResponse({ status: status || "Highlighting completed" });
        }
        catch (error) {
            console.error("Highlight error:", error);
            sendResponse({ status: "Highlighting failed - see console" });
        }
    } else {
        sendResponse({ status: "No action executed" });
    }
    return false; //we respond synchronously so no need to keep the port open
});