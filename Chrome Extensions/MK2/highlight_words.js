if (!window.PhishHussar_Highlight_Words_Loaded) { //only run once to prevent errors on re-runs
window.PhishHussar_Highlight_Words_Loaded = true;
//this is the script that highlights the words in the email body



const Bad_Words = (typeof window !== "undefined" && window.BAD_WORDS) || [];
const Warnings = (typeof window !== "undefined" && window.Warnings_Mini_DB) || [];
const Warnings_BACKUP = "Potential Phishing please be careful and verify Sender and Contents (no reason identified)";
let Warnings_Current = Warnings_BACKUP; //global variable for current warning message
const BAD_WORDS_Class = "PhishHussar-highlighted-word";
const Style_Name = "PhishHussar-highlight-css-1"; //style name to inject (unique to avoid conflicts)
const WARNING_CLASS = "PhishHussar-warning-message";

let Warning_Message_Div = null; //global variable for warning message user is hovering over

console.log("Bad Words:", Bad_Words);
console.log("Warnings:", Warnings);

Identify_Hovering_Word = (message,event) => {
    if (!message || !event || !event.target) {
        return;
    }
    console.log("Identify_Hovering_Word", message, event);
    
}

Check_Warning_Message_Existance = (warning_message) => {
    if (Warning_Message_Div && document.body.contains(Warning_Message_Div)) {
        return Warning_Message_Div;
    }
    else {
        Warning_Message_Div = document.createElement("div");
        Warning_Message_Div.id = (WARNING_CLASS); //get the css related to the warning message
        Warning_Message_Div.className = WARNING_CLASS;
        Warning_Message_Div.textContent = warning_message;
        document.body.appendChild(Warning_Message_Div);
        return Warning_Message_Div;
    }

}

Get_Warning_Message = (id) => {
    console.log("Get_Warning_Message with id: ", id);
    console.log("Get_Warning_Message Warnings are : ", Warnings);
    if (Object.keys(Warnings).length > 0 && Warnings[id] != null) { //if warnings are found return the warning message
        console.log("Get_Warning_Message found warning: ", Warnings[id]);
        Warnings_Current = Warnings[id];
        return Warnings_Current;
    }
    else { //if no warnings are found return the backup message
        console.log("Get_Warning_Message no warnings found returning backup message");
        return Warnings_Current = Warnings_BACKUP;
    }
}

Show_Warning_Message = (message) => {
    console.log("Show_Warning_Message Target", message.currentTarget);
    console.log("Show_Warning_Message Location", message.screenX, message.screenY);
    console.log("Show_Warning_Message doing Identify_Hovering_Word :", Get_Warning_Message(message.currentTarget.getAttribute("warning_id")));
    let Warning_Message_Div = Check_Warning_Message_Existance(Get_Warning_Message(message.currentTarget.getAttribute("warning_id"))); //get the warning message div
    if (Warning_Message_Div != null && !Warning_Message_Div.classList.contains("visible")) { //if you can see it then remove it
        Warning_Message_Div.classList.add("visible");
    }
}


Hide_Warning_Message = () => {
    console.log("Hide_Warning_Message");
    if (Warning_Message_Div != null && Warning_Message_Div.classList.contains("visible")) { //if you can see it then remove it
        Warning_Message_Div.classList.remove("visible");
        Warning_Message_Div = null;
    }
}

Hover_Warning_Message = (event) => { //only update location of warning message
    console.log("Hover_Warning_Message Target", event.currentTarget);
    console.log("Hover_Warning_Message Location", event.screenX, event.screenY);
    const X_Location = event.screenX - 30 + "px";
    const Y_Location = event.screenY - 105 + "px";
    console.log("Hover_Warning_Message X_Location", X_Location);
    console.log("Hover_Warning_Message Y_Location", Y_Location);
    Warning_Message_Div.style.left = X_Location;
    Warning_Message_Div.style.top = Y_Location;
}

Attach_Warning_Message_Event_Listeners = (rootNode) => {
    if (!rootNode || rootNode.nodeType !== Node.ELEMENT_NODE) {
        console.log("Attach_Warning_Message_Event_Listeners: skipping non-element root", rootNode);
        return;
    }
    Highlighted_Words = rootNode.querySelectorAll(`.${BAD_WORDS_Class}`);
    Highlighted_Words.forEach(node => {
        if (node.dataset.Listner_Active == true) {
            return;
        }
        
        node.addEventListener("mouseenter",Show_Warning_Message);
        node.addEventListener("mousemove",Hover_Warning_Message);
        node.addEventListener("mouseleave",Hide_Warning_Message);
        node.dataset.Listner_Active = true;
    });
}


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
    if (!regex || !body || body.length === 0 || regex == null) {
        console.log("Lack of regex or body or body is empty or regex is null");
        return;
    }

    const roots = (body instanceof NodeList || Array.isArray(body))
        ? Array.from(body) //convert to array if it is a NodeList or Array
        : (body ? [body] : []); //convert to array if it is a single node

    if (roots.length === 0) { //if no roots are found return
        console.log("Highlight_Words: no body nodes supplied");
        return;
    }

    roots.forEach(rootNode => {
        if (!(rootNode instanceof Node)) {
            console.log("Highlight_Words: skipping non-node root", rootNode);
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

            const Orignial_Text = node.textContent;
            const New_Text = Orignial_Text.replace(regex, match => {
                COUNT_BAD_WORDS++;
                const id = 1
                return `<span class="${BAD_WORDS_Class}" warning_id="${id}">${match}</span>`;
            });

            if (New_Text !== Orignial_Text) { //make sure we modified the text html
                
                const Temp_Container = document.createElement("span");
                Temp_Container.innerHTML = New_Text;
                const Doc_Fragment = document.createDocumentFragment();
                while (Temp_Container.firstChild) {
                    Doc_Fragment.appendChild(Temp_Container.firstChild);
                }
                node.replaceWith(Doc_Fragment);

                
            }
        });
        Attach_Warning_Message_Event_Listeners(rootNode);
    });
}

Inject_CSS = () => { //inject the css into the head of the document
    
    if (document.getElementById(Style_Name)){
        console.log("CSS already injected/or exits with this name");
        return;
    }
    else {
    const css = document.createElement('style');
    css.id = Style_Name;
    css.textContent = `
    .${BAD_WORDS_Class} {
    background-color: darkred; 
    color: white;}

    .${WARNING_CLASS} {
    background-color: rgba(0, 0, 0, 0.64); 
    color: rgb(255, 0, 0) ; 
    padding: 2px; 
    border-radius: 2px; 
    margin-top: 2px; 
    margin-bottom: 2px; 
    text-size: 15px;
    text-align: center;
    opacity: 0;
    transition: opacity 0.3s ease;
    position: fixed;
    pointer-events: none;
    z-index: 9999;
    left: 0;
    top: 0; 
    } 

    .${WARNING_CLASS}.visible {
    opacity: 1;}`;
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
}