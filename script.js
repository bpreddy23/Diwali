// GET HTML ELEMENTS

const nameForm = document.getElementById("nameForm");
const nameInput = document.getElementById("nameInput");

const welcomeScreen = document.getElementById("welcomeScreen");
const birthdayScreen = document.getElementById("birthdayScreen");

const personName = document.getElementById("personName");
const personImage = document.getElementById("personImage");

const photoFrame = document.getElementById("photoFrame");
const photoFallback = document.getElementById("photoFallback");

const errorMessage = document.getElementById("errorMessage");


// NAME NORMALIZATION

function normalizeName(name) {
    return name.trim().toLowerCase().replace(/\s+/g, " ");
}


// GET INITIALS

function getInitials(name) {

    return name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map(word => word.charAt(0))
        .join("")
        .toUpperCase();

}


// NAME SUBMISSION

nameForm.addEventListener("submit", function(event) {

    event.preventDefault();

    const enteredName = nameInput.value.trim();

    if (!enteredName) {
        errorMessage.textContent = "Please enter your name!";
        return;
    }

    // FIND PERSON

    const person = PEOPLE.find(function(item) {

        return normalizeName(item.name) ===
               normalizeName(enteredName);

    });

    errorMessage.textContent = "";

    showBirthday(person, enteredName);

});


// DISPLAY BIRTHDAY WISH

function showBirthday(person, enteredName) {

    const displayName = person ? person.name : enteredName;

    personName.textContent = displayName;

    // INITIALS FALLBACK

    document.getElementById("photoFallback")
        .querySelector("span").textContent = getInitials(displayName);

    // RESET PHOTO

    personImage.onload = null;
    personImage.onerror = null;

    personImage.classList.remove("loaded");
    photoFrame.classList.remove("has-photo");
    photoFrame.classList.remove("reveal");

    personImage.removeAttribute("src");

    photoFallback.style.display = "flex";

    // LOAD PERSON'S PHOTO

    if (person && person.photo) {

        personImage.onload = function() {

            personImage.classList.add("loaded");
            photoFrame.classList.add("has-photo");

            photoFallback.style.display = "none";

        };

        personImage.onerror = function() {

            personImage.classList.remove("loaded");
            photoFrame.classList.remove("has-photo");

            photoFallback.style.display = "flex";

        };

        personImage.src = person.photo;

    }

    // CHANGE SCREEN

    welcomeScreen.classList.add("hidden");
    birthdayScreen.classList.remove("hidden");

    // MAGICAL PHOTO REVEAL

    requestAnimationFrame(function() {

        requestAnimationFrame(function() {

            photoFrame.classList.add("reveal");

        });

    });

    // CONFETTI EFFECT

    createConfetti();

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


// CONFETTI GENERATOR

function createConfetti() {

    const container = document.getElementById("confetti");

    container.innerHTML = "";

    for (let i = 0; i < 90; i++) {

        const piece = document.createElement("div");

        piece.className = "confetti-piece";

        piece.style.left = Math.random() * 100 + "%";

        piece.style.animationDuration =
            (3 + Math.random() * 3) + "s";

        piece.style.animationDelay =
            Math.random() * 1.5 + "s";

        if (i % 3 === 0) {
            piece.style.borderRadius = "50%";
        }

        container.appendChild(piece);

    }

    setTimeout(function() {

        container.innerHTML = "";

    }, 7500);

}


// GO BACK TO NAME ENTRY

function goBack() {

    birthdayScreen.classList.add("hidden");
    welcomeScreen.classList.remove("hidden");

    nameInput.value = "";

    errorMessage.textContent = "";

    nameInput.focus();

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}

document.getElementById("backButton")
    .addEventListener("click", goBack);

document.getElementById("againButton")
    .addEventListener("click", goBack);


// FESTIVE MUSIC

// Original Diwali-inspired bell melody.
// No external music file required.

let audioContext = null;
let musicPlaying = false;
let musicTimer = null;
let noteIndex = 0;

const melody = [
    392, 440, 523, 587,
    523, 440, 392, 330,
    392, 523, 587, 659,
    587, 523, 440, 392
];

function playNote(frequency, time, duration) {

    const oscillator = audioContext.createOscillator();

    const gain = audioContext.createGain();

    oscillator.type = "sine";

    oscillator.frequency.setValueAtTime(
        frequency,
        time
    );

    gain.gain.setValueAtTime(0.0001, time);

    gain.gain.exponentialRampToValueAtTime(
        0.035,
        time + 0.03
    );

    gain.gain.exponentialRampToValueAtTime(
        0.0001,
        time + duration
    );

    oscillator.connect(gain);
    gain.connect(audioContext.destination);

    oscillator.start(time);
    oscillator.stop(time + duration + 0.05);

}

function playMelody() {

    if (!musicPlaying) return;

    const currentTime = audioContext.currentTime + 0.04;

    const frequency = melody[noteIndex % melody.length];

    playNote(frequency, currentTime, 0.7);

    if (noteIndex % 4 === 0) {

        playNote(196, currentTime, 1.2);

    }

    noteIndex++;

}

async function toggleMusic() {

    const button = document.getElementById("musicButton");

    if (!musicPlaying) {

        const AudioContext =
            window.AudioContext || window.webkitAudioContext;

        if (!AudioContext) {
            button.textContent = "Music unavailable";
            return;
        }

        audioContext = audioContext || new AudioContext();

        if (audioContext.state === "suspended") {
            await audioContext.resume();
        }

        musicPlaying = true;

        playMelody();

        musicTimer = setInterval(playMelody, 430);

        button.textContent = "♫ Pause Music";

    } else {

        musicPlaying = false;

        clearInterval(musicTimer);

        await audioContext.suspend();

        button.textContent = "♫ Play Festive Music";

    }

}

document.getElementById("musicButton")
    .addEventListener("click", toggleMusic);
