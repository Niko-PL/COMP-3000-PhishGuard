const Email_Warnings = [
    [1,"Potential Phishing language detected"],
    [2,"Potential Phishing link detected"],
    [3,"Potential Phishing email detected"],
    [4,"Potential Phishing phone number detected"],
    [5,"Potential Phishing code detected"],
    [6,"Potential Phishing attachment detected"]
]


if (typeof window !== "undefined") { //this globalises the BAD_WORDS variable to the window object (can access from anywhere) very cool
    window.Email_Warnings = Email_Warnings;   //access by typing  < typeof window !== "undefined" && window.BAD_WORDS >
} else if (typeof self !== "undefined") { 
    self.Email_Warnings = Email_Warnings;
};
