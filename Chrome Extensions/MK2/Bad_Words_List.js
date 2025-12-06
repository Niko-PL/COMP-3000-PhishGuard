
let BAD_WORDS = ["the", "cat", "sat", "on", "the", "mat","this","that","bat","you","few","long"]

if (typeof window !== "undefined") { //this globalises the BAD_WORDS variable to the window object (can access from anywhere) very cool
    window.BAD_WORDS = BAD_WORDS;   //access by typing  < typeof window !== "undefined" && window.BAD_WORDS >
} else if (typeof self !== "undefined") { 
    self.BAD_WORDS = BAD_WORDS;
};



