
/* =========================================
   ANUBHAVAM - DIWALI WISHES WEBSITE
   Complete script.js
========================================= */


/* =========================================
   1. HTML ELEMENTS
========================================= */

const nameForm = document.getElementById("nameForm");
const nameInput = document.getElementById("nameInput");
const errorMessage = document.getElementById("errorMessage");

const welcomeScreen = document.getElementById("welcomeScreen");
const birthdayScreen = document.getElementById("birthdayScreen");

const personName = document.getElementById("personName");
const mainPhoto = document.getElementById("mainPhoto");
const thumbnailGallery = document.getElementById("thumbnailGallery");
const photoCounter = document.getElementById("photoCounter");

const previousPhotoButton = document.getElementById("previousPhoto");
const nextPhotoButton = document.getElementById("nextPhoto");

const backButton = document.getElementById("backButton");
const musicButton = document.getElementById("musicButton");

const petalsContainer = document.getElementById("petals");
const confettiContainer = document.getElementById("confettiContainer");

const gameCardsContainer = document.getElementById("gameCards");
const gameScoreDisplay = document.getElementById("gameScore");
const gameProgressDisplay = document.getElementById("gameProgress");
const gameFeedback = document.getElementById("gameFeedback");
const gameFireworks = document.getElementById("gameFireworks");


/* =========================================
   2. GLOBAL VARIABLES
========================================= */

let currentPhotos = [];
let currentPhotoIndex = 0;

let slideshowTimer = null;

let musicPlaying = false;
let audioContext = null;
let melodyTimer = null;

// Game variables
let gamePhotos = [];
let discoveredPhotos = new Set();
let gameScore = 0;
let rocketClicked = false;


/* =========================================
   3. HIDDEN MESSAGES
========================================= */

// The first two photos contain hidden messages.
// The third photo contains the rocket surprise.

const hiddenMessages = [
    "✨ May your life always be filled with light, laughter and happiness!",

    "🌸 May every new beginning bring success, prosperity and beautiful memories!"
];


/* =========================================
   4. NAME NORMALIZATION
========================================= */

function normalizeName(name) {
    return name.trim().toLowerCase().replace(/\s+/g, " ");
}


/* =========================================
   5. NAME ENTRY
========================================= */

nameForm.addEventListener("submit", function(event) {

    event.preventDefault();

    const enteredName = nameInput.value.trim();

    if (!enteredName) {
        errorMessage.textContent = "Please enter your name!";
        return;
    }

    if (!Array.isArray(window.PEOPLE)) {
        errorMessage.textContent =
            "Unable to load the wishes list. Please refresh.";

        return;
    }

    const person = window.PEOPLE.find(function(item) {

        return normalizeName(item.name) === normalizeName(enteredName);

    });

    if (!person) {

        errorMessage.textContent =
            "Name not found. Please check the spelling!";

        return;
    }

    errorMessage.textContent = "";

    showBirthday(person);

});


/* =========================================
   6. SHOW DIWALI WISHES PAGE
========================================= */

function showBirthday(person) {

    stopSlideshow();
    stopMusic();

    welcomeScreen.classList.add("hidden");
    birthdayScreen.classList.remove("hidden");

    personName.textContent = person.name;

    currentPhotos = Array.isArray(person.photos)
        ? person.photos.filter(Boolean)
        : [];

    currentPhotoIndex = 0;

    thumbnailGallery.innerHTML = "";

    if (currentPhotos.length === 0) {

        mainPhoto.removeAttribute("src");
        mainPhoto.alt = "No photo available";

        photoCounter.textContent = "No photos";

        startHiddenPhotoGame([]);

        return;
    }

    displayPhoto(0);

    createThumbnails();

    startSlideshow();

    launchConfetti();

    // Start the hidden-photo challenge.
    startHiddenPhotoGame(currentPhotos);

    // Attempt to start music following the visitor's name submission.
    startMusic();

    birthdayScreen.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

}


/* =========================================
   7. DISPLAY MAIN PHOTO
========================================= */

function displayPhoto(index) {

    if (!currentPhotos.length) return;

    currentPhotoIndex =
        (index + currentPhotos.length) % currentPhotos.length;

    mainPhoto.classList.add("changing");

    const newImage = new Image();

    newImage.onload = function() {

        mainPhoto.src = newImage.src;

        mainPhoto.alt = "Diwali memories of " + personName.textContent;

        mainPhoto.classList.remove("changing");

        photoCounter.textContent =
            (currentPhotoIndex + 1) + " / " + currentPhotos.length;

        updateThumbnails();

    };

    newImage.onerror = function() {

        currentPhotos.splice(currentPhotoIndex, 1);

        if (currentPhotos.length === 0) {

            mainPhoto.removeAttribute("src");

            photoCounter.textContent = "No photos found";

            thumbnailGallery.innerHTML = "";

            stopSlideshow();

            return;
        }

        currentPhotoIndex =
            currentPhotoIndex % currentPhotos.length;

        displayPhoto(currentPhotoIndex);

    };

    newImage.src = currentPhotos[currentPhotoIndex];

}


/* =========================================
   8. CREATE PHOTO THUMBNAILS
========================================= */

function createThumbnails() {

    thumbnailGallery.innerHTML = "";

    currentPhotos.forEach(function(photo, index) {

        const thumbnail = document.createElement("img");

        thumbnail.src = photo;

        thumbnail.alt = "Photo " + (index + 1);

        thumbnail.className = "thumbnail";

        thumbnail.addEventListener("click", function() {

            displayPhoto(index);

            startSlideshow();

        });

        thumbnail.onerror = function() {

            thumbnail.remove();

        };

        thumbnailGallery.appendChild(thumbnail);

    });

    updateThumbnails();

}


/* =========================================
   9. UPDATE ACTIVE THUMBNAIL
========================================= */

function updateThumbnails() {

    const thumbnails =
        thumbnailGallery.querySelectorAll(".thumbnail");

    thumbnails.forEach(function(thumbnail, index) {

        thumbnail.classList.toggle(
            "active",
            index === currentPhotoIndex
        );

    });

}


/* =========================================
   10. PREVIOUS AND NEXT PHOTO
========================================= */

previousPhotoButton.addEventListener("click", function() {

    displayPhoto(currentPhotoIndex - 1);

    startSlideshow();

});


nextPhotoButton.addEventListener("click", function() {

    displayPhoto(currentPhotoIndex + 1);

    startSlideshow();

});


/* =========================================
   11. AUTOMATIC PHOTO SLIDESHOW
========================================= */

function startSlideshow() {

    stopSlideshow();

    if (currentPhotos.length < 2) return;

    slideshowTimer = setInterval(function() {

        displayPhoto(currentPhotoIndex + 1);

    }, 4000);

}


function stopSlideshow() {

    if (slideshowTimer) {

        clearInterval(slideshowTimer);

        slideshowTimer = null;

    }

}


/* =========================================
   12. BACK TO WELCOME SCREEN
========================================= */

backButton.addEventListener("click", function() {

    stopSlideshow();

    stopMusic();

    welcomeScreen.classList.remove("hidden");

    birthdayScreen.classList.add("hidden");

    nameInput.value = "";

    errorMessage.textContent = "";

    welcomeScreen.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

});


/* =========================================
   13. FALLING FLOWER PETALS
========================================= */

function createPetals() {

    const flowers = ["🌸", "🌼", "🌺"];

    for (let i = 0; i < 20; i++) {

        const petal = document.createElement("span");

        petal.className = "petal";

        petal.textContent =
            flowers[Math.floor(Math.random() * flowers.length)];

        petal.style.left = Math.random() * 100 + "%";

        petal.style.animationDuration =
            (6 + Math.random() * 8) + "s";

        petal.style.animationDelay =
            (Math.random() * 8) + "s";

        petal.style.fontSize =
            (12 + Math.random() * 13) + "px";

        petalsContainer.appendChild(petal);

    }

}

createPetals();


/* =========================================
   14. CONFETTI CELEBRATION
========================================= */

function launchConfetti() {

    confettiContainer.innerHTML = "";

    const pieces = 100;

    for (let i = 0; i < pieces; i++) {

        const piece = document.createElement("span");

        piece.className = "confetti";

        piece.style.left = Math.random() * 100 + "%";

        piece.style.animationDuration =
            (3 + Math.random() * 4) + "s";

        piece.style.animationDelay =
            Math.random() * 2 + "s";

        piece.style.backgroundColor = [
            "#ffdb72",
            "#f4a340",
            "#ff6d86",
            "#fff1c5",
            "#e8b4ff"
        ][Math.floor(Math.random() * 5)];

        piece.style.transform =
            "rotate(" + Math.random() * 360 + "deg)";

        confettiContainer.appendChild(piece);

        setTimeout(function() {

            piece.remove();

        }, 8000);

    }

}


/* =========================================
   15. DIWALI HIDDEN PHOTO GAME
========================================= */

function startHiddenPhotoGame(photos) {

    // Reset the game whenever a new person enters.

    gamePhotos = photos.slice(0, 3);

    discoveredPhotos = new Set();

    gameScore = 0;

    rocketClicked = false;

    gameCardsContainer.innerHTML = "";

    gameScoreDisplay.textContent = "0 / 100";

    gameProgressDisplay.textContent = "0 / 3";

    gameFeedback.textContent =
        "Tap a photo to uncover its secret!";

    // Remove old result screen.

    const oldResult = document.getElementById("gameResult");

    if (oldResult) {
        oldResult.remove();
    }

    // Three photos are required.

    if (gamePhotos.length < 3) {

        gameFeedback.textContent =
            "This challenge needs three photos. Please add three photos for this person.";

        return;
    }

    // Create the three game cards.

    gamePhotos.forEach(function(photo, index) {

        const card = document.createElement("button");

        card.type = "button";

        card.className = "game-card";

        const image = document.createElement("img");

        image.src = photo;

        image.alt = "Hidden Diwali surprise " + (index + 1);

        const label = document.createElement("span");

        label.className = "game-card-label";

        label.textContent = "MYSTERY PHOTO " + (index + 1);

        const status = document.createElement("span");

        status.className = "game-card-status";

        status.textContent = "Tap to reveal ✨";

        card.appendChild(image);

        card.appendChild(label);

        card.appendChild(status);

        card.addEventListener("click", function() {

            revealHiddenPhoto(index, card, status);

        });

        image.onerror = function() {

            card.disabled = true;

            status.textContent = "Image unavailable";

        };

        gameCardsContainer.appendChild(card);

    });

}


/* =========================================
   16. REVEAL HIDDEN PHOTO
========================================= */

function revealHiddenPhoto(index, card, status) {

    // Do not allow repeated scoring.

    if (discoveredPhotos.has(index)) return;

    discoveredPhotos.add(index);

    card.classList.add("discovered");

    card.disabled = true;

    if (index === 2) {

        // The third photo is the rocket.

        rocketClicked = true;

        // Rocket must be the final discovery for 60 bonus points.

        const clickedLast = discoveredPhotos.size === 3;

        if (clickedLast) {

            gameScore += 60;

            status.textContent = "🚀 PERFECT TIMING!";

            gameFeedback.textContent =
                "You saved the biggest surprise for last! Get ready for the grand Diwali blast!";

        } else {

            status.textContent = "🚀 ROCKET LAUNCHED!";

            gameFeedback.textContent =
                "BOOM! What a blast! But you opened the rocket before discovering all the hidden messages. The perfect-score bonus is gone!";

        }

        launchRocketFireworks();

    } else {

        // First and second photos each give 20 points.

        gameScore += 20;

        status.textContent = hiddenMessages[index];

        gameFeedback.textContent =
            "🎁 Surprise discovered! You earned 20 points. Find the remaining surprises!";

    }

    updateGameScore();

    if (discoveredPhotos.size === 3) {

        showGameResult();

    }

}


/* =========================================
   17. UPDATE GAME SCORE
========================================= */

function updateGameScore() {

    gameScoreDisplay.textContent =
        gameScore + " / 100";

    gameProgressDisplay.textContent =
        discoveredPhotos.size + " / 3";

}


/* =========================================
   18. ROCKET LAUNCH ANIMATION
========================================= */

function launchRocketFireworks() {

    const rocket = document.createElement("div");

    rocket.className = "rocket-flight";

    rocket.textContent = "🚀";

    gameFireworks.appendChild(rocket);

    // Rocket reaches the sky and explodes.

    setTimeout(function() {

        rocket.remove();

        createFireworkBurst();

    }, 1300);

}


/* =========================================
   19. FIREWORKS EXPLOSION
========================================= */

function createFireworkBurst() {

    const burst = document.createElement("div");

    burst.className = "firework-burst";

    const colours = [
        "#ffd166",
        "#ff6b6b",
        "#fff1a8",
        "#ff9f43",
        "#e8b4ff",
        "#ffffff",
        "#ff69b4",
        "#7df9ff"
    ];

    for (let i = 0; i < 42; i++) {

        const spark = document.createElement("span");

        spark.className = "firework-spark";

        const angle = (Math.PI * 2 * i) / 42;

        const distance = 90 + Math.random() * 120;

        const x = Math.cos(angle) * distance;

        const y = Math.sin(angle) * distance;

        spark.style.setProperty(
            "--spark-x",
            x + "px"
        );

        spark.style.setProperty(
            "--spark-y",
            y + "px"
        );

        spark.style.background =
            colours[Math.floor(Math.random() * colours.length)];

        burst.appendChild(spark);

    }

    gameFireworks.appendChild(burst);

    setTimeout(function() {

        burst.remove();

    }, 1600);

}


/* =========================================
   20. FINAL GAME RESULT
========================================= */

function showGameResult() {

    const result = document.createElement("div");

    result.id = "gameResult";

    result.className = "game-result show";

    const heading = document.createElement("h2");

    const message = document.createElement("p");

    if (gameScore === 100) {

        heading.textContent = "🏆 Diwali Champion!";

        message.textContent =
            "Amazing! You discovered both hidden messages and saved the rocket for last. You earned the perfect score of 100/100!";

    } else {

        heading.textContent = "✨ Great Diwali Explorer!";

        message.textContent =
            "You discovered all three surprises and scored " +
            gameScore +
            "/100. The fireworks were spectacular!";

    }

    result.appendChild(heading);

    result.appendChild(message);

    gameCardsContainer.after(result);

    gameFeedback.textContent =
        "All three surprises have been discovered. Happy Diwali! 🪔";

    result.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });

}


/* =========================================
   21. DIWALI MUSIC
========================================= */

// Original browser-generated festive melody.

function playMelody() {

    if (!audioContext || audioContext.state === "closed") {
        return;
    }

    const notes = [
        523.25, 659.25, 783.99, 659.25,
        587.33, 698.46, 880.00, 783.99,
        659.25, 783.99, 1046.50, 783.99
    ];

    let noteIndex = 0;

    melodyTimer = setInterval(function() {

        if (!musicPlaying) return;

        const oscillator = audioContext.createOscillator();

        const gain = audioContext.createGain();

        oscillator.type = "sine";

        oscillator.frequency.value = notes[noteIndex];

        gain.gain.setValueAtTime(
            0.0001,
            audioContext.currentTime
        );

        gain.gain.exponentialRampToValueAtTime(
            0.08,
            audioContext.currentTime + 0.03
        );

        gain.gain.exponentialRampToValueAtTime(
            0.0001,
            audioContext.currentTime + 0.7
        );

        oscillator.connect(gain);

        gain.connect(audioContext.destination);

        oscillator.start();

        oscillator.stop(audioContext.currentTime + 0.75);

        noteIndex = (noteIndex + 1) % notes.length;

    }, 450);

}


/* =========================================
   22. START MUSIC
========================================= */

async function startMusic() {

    try {

        const AudioContextClass =
            window.AudioContext || window.webkitAudioContext;

        if (!AudioContextClass) {

            musicButton.textContent = "♫ Music unavailable";

            return;

        }

        if (!audioContext || audioContext.state === "closed") {

            audioContext = new AudioContextClass();

        }

        await audioContext.resume();

        musicPlaying = true;

        musicButton.textContent =
            "♫ Music: ON — Turn OFF";

        if (melodyTimer) {

            clearInterval(melodyTimer);

            melodyTimer = null;

        }

        playMelody();

    } catch (error) {

        musicPlaying = false;

        musicButton.textContent =
            "♫ Tap to enable music";

    }

}


/* =========================================
   23. STOP MUSIC
========================================= */

function stopMusic() {

    musicPlaying = false;

    if (melodyTimer) {

        clearInterval(melodyTimer);

        melodyTimer = null;

    }

    if (audioContext && audioContext.state !== "closed") {

        audioContext.suspend();

    }

    musicButton.textContent =
        "♫ Music: OFF — Turn ON";

}


/* =========================================
   24. MUSIC ON/OFF BUTTON
========================================= */

musicButton.addEventListener("click", function() {

    if (musicPlaying) {

        stopMusic();

    } else {

        startMusic();

    }

});


/* =========================================
   END OF SCRIPT
========================================= */
