

// do not remove any warnings or change the id as it will break the UI
//you can add more warnings by adding a new [id, warning] to the array
const Email_Warnings = [
    [1,"Potential Phishing language detected"],
    [2,"Potential Phishing link detected"],
    [3,"Potential Phishing email detected"],
    [4,"Potential Phishing phone number detected"],
    [5,"Potential Phishing code detected"],
    [6,"Potential Phishing attachment detected"]
]
// 

const Warnings_Mini_DB = Email_Warnings.reduce((acc, [id, warning]) => { //this is means its easier to access the warnings by id (basically a small db)
    acc[id] = warning; //add the warning to the accumulator
    return acc;
}, {});



if (typeof window !== "undefined") { //this globalises the BAD_WORDS variable to the window object (can access from anywhere) very cool
    window.Warnings_Mini_DB = Warnings_Mini_DB;   //access by typing  < typeof window !== "undefined" && window.BAD_WORDS >
} else if (typeof self !== "undefined") { 
    self.Warnings_Mini_DB = Warnings_Mini_DB;
};



// to call this you are able to just use the ID and get the warning
// 