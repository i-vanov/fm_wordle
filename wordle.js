const letters = document.querySelectorAll(".scoreboard-letter");
const infoBar = document.querySelector(".info-bar");
let word = "";
let currentGuess = "";
let currentRow = 0;
let isLoading;
const ANSWER_LENGTH = 5;
const ROUNDS = 6;
let done = false;
let isValid = false;

function isLetter(letter) {
    return /^[a-zA-Z]$/.test(letter);
}

function setLoading(isLoading) {
    isLoading = isLoading;
    infoBar.classList.toggle("hidden", !isLoading);
}

function markInvalidWord() {
    for (let i = 0; i < ANSWER_LENGTH; i++) {
        letters[currentRow * ANSWER_LENGTH + i].classList.add("invalid");
        setTimeout(function() {
            letters[currentRow * ANSWER_LENGTH + i].classList.remove("invalid");
        }, 500);
    }
}

function handleBackspace() {
    currentGuess = currentGuess.substring(0, currentGuess.length - 1);
    letters[currentRow * ANSWER_LENGTH + currentGuess.length].innerText = "";
}

function handleLetter(letter) {
    console.log(currentGuess, currentGuess.length);
    if (currentGuess.length < ANSWER_LENGTH) {
        currentGuess += letter;
    } else {
        // Replace the last letter
        currentGuess = currentGuess.substring(0, currentGuess.length - 1) + letter;
    }
    // Display the letter at the corresponding place
    letters[currentRow * ANSWER_LENGTH + currentGuess.length - 1].innerText = letter;
}

async function handleEnter() {
    if (currentGuess.length !== ANSWER_LENGTH) {
        // do nothing
        return;
    } else {
        // TODO validate the word
        await validate();
        if (!isValid) {
            markInvalidWord();
            return;
        }

        // Split the currentGuess into letters
        const guessParts = currentGuess.split("");
        const wordParts = word.split("");
        const map =  makeMap(wordParts);

        for (let i = 0; i < ANSWER_LENGTH; i++) {
            // mark as correct
            if (guessParts[i] === wordParts[i]) {
                letters[currentRow * ANSWER_LENGTH + i].classList.add("correct");
                // Mark the letter as already processed to prevent conflicts with "close"
                map[guessParts[i]]--;
            }
        }

        for (let i = 0; i < ANSWER_LENGTH; i++) {
            // mark as close or wrong
            if (guessParts[i] === wordParts[i]) {
                // do nothing
            } else if (wordParts.includes(guessParts[i]) && map[guessParts[i]] > 0) {
                letters[currentRow * ANSWER_LENGTH + i].classList.add("close");
            } else {
                letters[currentRow * ANSWER_LENGTH + i].classList.add("wrong");
            }
        }
        currentRow++;
        if (currentGuess === word) {
            alert("You win!");
            done = true;
            return;
        } else if (currentRow === ROUNDS) {
            alert(`You lose, the word was ${word}`, word);
            done = true;
        }
        currentGuess = "";
        
    }
}

async function validate() {
    setLoading(true);
    const res = await fetch("https://words.dev-apis.com/validate-word", {
        method: "POST",
        body: JSON.stringify({word: currentGuess})
    });
    const resObj = await res.json();
    console.log(resObj);
    isValid = resObj.validWord;
    setLoading(false);
}

async function init() {
    await fetchWord();
    document.addEventListener("keydown", function handleKeyPress(event) {
        if (done || isLoading) {
            // do nothing
            return;
        }
        const action = event.key;
        if (action === "Enter") {
            handleEnter();
        } else if (action === "Backspace") {
            handleBackspace();
        } else if (isLetter(action)) {
            handleLetter(action.toUpperCase());
        } else {
            // do nothing
        }
    });
}

async function fetchWord() {
    setLoading(true);
    const res = await fetch("https://words.dev-apis.com/word-of-the-day");
    // Convert JSON to a JS object
    const resObj = await res.json();
    word = resObj.word.toUpperCase();
    setLoading(false);
}

function makeMap(array) {
    const obj = {};
    for (let i = 0; i < array.length; i ++) {
        const letter = array[i];
        if (obj[letter]) {
            obj[letter]++;
        } else {
            obj[letter] = 1;
        }
    }
    return obj;
}

init();