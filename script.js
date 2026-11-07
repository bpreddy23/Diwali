
/* ==========================================
   ANUBHAVAM - DIWALI WISHES
   Complete JavaScript
   Features:
   - Full name OR first-word name matching
   - Random rocket position in the game
   - Hidden messages and scoring
   - Photo gallery and slideshow
   - Diwali music and fireworks
   - Browser Back and Forward support
========================================== */


/* ==========================================
   1. HTML ELEMENTS
========================================== */

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
const gameCards = document.getElementById("gameCards");
const gameScore = document.getElementById("gameScore");
const gameProgress = document.getElementById("gameProgress");
const gameFeedback = document.getElementById("gameFeedback");
const gameFireworks = document.getElementById("gameFireworks");


/* ==========================================
   2. VARIABLES
========================================== */

let currentPhotos = [];
let currentPhotoIndex = 0;

let slideshowTimer = null;
let musicPlaying = false;
let audioContext = null;
let melodyTimer = null;

let discoveredPhotos = new Set();
let totalScore = 0;

// The game cards will have their own random roles.
let currentGameCards = [];

const MESSAGE_POINTS = 20;
const ROCKET_POINTS = 60;


/* ==========================================
   3. INITIALIZE BROWSER HISTORY
========================================== */

history.replaceState(
    { screen: "welcome" },
    "",
    window.location.pathname + window.location.search
);


/* ==========================================
   4. HIDDEN MESSAGES
========================================== */

const hiddenMessages = [
    {
        title: "A Little Diwali Magic ✨",
        message: "May your life always be filled with light, laughter and beautiful memories. Happy Diwali!"
    },
    {
        title: "A Wish Just for You 🪔",
        message: "May every diya bring new hope, every sparkle bring happiness and every moment bring a reason to smile. Happy Diwali!"
    }
];


/* ==========================================
   5. NORMALIZE AND MATCH NAMES
========================================== */

function normalizeName(name) {
    return String(name || "")
        .trim()
        .toLowerCase()
        .replace(/\s+/g, " ");
}

function getFirstWord(name) {
    const normalized = normalizeName(name);
    return normalized.split(" ")[0] || "";
}

function findPersonByName(enteredName) {
    const entered = normalizeName(enteredName);

    if (!entered || !Array.isArray(window.PEOPLE)) {
        return null;
    }

    // First preference: exact full-name match.
    let person = window.PEOPLE.find(function(item) {
        return normalizeName(item.name) === entered;
    });

    if (person) return person;

    // Second preference: first-word match.
    const enteredFirstWord = getFirstWord(entered);

    if (!enteredFirstWord) return null;

    const matches = window.PEOPLE.filter(function(item) {
        return getFirstWord(item.name) === enteredFirstWord;
    });

    // Only accept the first-word match if it identifies
    // exactly one person. This avoids opening the wrong profile.
    if (matches.length === 1) {
        return matches[0];
    }

    return null;
}


/* ==========================================
   6. NAME FORM SUBMISSION
========================================== */

nameForm.addEventListener("submit", function(event) {
    event.preventDefault();

    const enteredName = normalizeName(nameInput.value);

    if (!enteredName) {
        errorMessage.textContent = "Please enter your name!";
        return;
    }

    if (!Array.isArray(window.PEOPLE)) {
        errorMessage.textContent =
            "Unable to load the wishes list. Please refresh the page.";
        return;
    }

    const person = findPersonByName(enteredName);

    if (!person) {
        errorMessage.textContent =
            "Name not found. Please check the spelling!";
        return;
    }

    errorMessage.textContent = "";

    history.pushState(
        {
            screen: "celebration",
            personName: person.name
        },
        "",
        "#celebration"
    );

    showBirthday(person);
});


/* ==========================================
   7. SHOW DIWALI CELEBRATION
========================================== */

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
        photoCounter.textContent = "No photos available";

        startHiddenPhotoGame([]);

        birthdayScreen.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

        startMusic();
        return;
    }

    displayPhoto(0);
    createThumbnails();
    startSlideshow();

    launchConfetti();
    startHiddenPhotoGame(currentPhotos);

    startMusic();

    birthdayScreen.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}


/* ==========================================
   8. SHOW WELCOME SCREEN
========================================== */

function showWelcomeScreen() {
    stopSlideshow();
    stopMusic();

    birthdayScreen.classList.add("hidden");
    welcomeScreen.classList.remove("hidden");

    nameInput.value = "";
    errorMessage.textContent = "";

    welcomeScreen.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}


/* ==========================================
   9. DISPLAY MAIN PHOTO
========================================== */

function displayPhoto(index) {
    if (!currentPhotos.length) return;

    currentPhotoIndex =
        (index + currentPhotos.length) % currentPhotos.length;

    mainPhoto.classList.add("changing");

    const selectedPhoto = currentPhotos[currentPhotoIndex];
    const newImage = new Image();

    newImage.onload = function() {
        mainPhoto.src = newImage.src;
        mainPhoto.alt = "Photo of " + personName.textContent;

        mainPhoto.classList.remove("changing");

        photoCounter.textContent =
            (currentPhotoIndex + 1) + " / " + currentPhotos.length;

        updateThumbnails();
    };

    newImage.onerror = function() {
        console.error("Unable to load photo:", selectedPhoto);

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

        createThumbnails();
        displayPhoto(currentPhotoIndex);
    };

    newImage.src = selectedPhoto;
}


/* ==========================================
   10. CREATE PHOTO THUMBNAILS
========================================== */

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


/* ==========================================
   11. UPDATE ACTIVE THUMBNAIL
========================================== */

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


/* ==========================================
   12. PREVIOUS AND NEXT PHOTO
========================================== */

previousPhotoButton.addEventListener("click", function() {
    if (!currentPhotos.length) return;

    displayPhoto(currentPhotoIndex - 1);
    startSlideshow();
});

nextPhotoButton.addEventListener("click", function() {
    if (!currentPhotos.length) return;

    displayPhoto(currentPhotoIndex + 1);
    startSlideshow();
});


/* ==========================================
   13. AUTOMATIC SLIDESHOW
========================================== */

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


/* ==========================================
   14. BACK TO WELCOME BUTTON
========================================== */

backButton.addEventListener("click", function() {
    if (
        history.state &&
        history.state.screen === "celebration"
    ) {
        history.back();
    } else {
        showWelcomeScreen();
    }
});


/* ==========================================
   15. CHROME BACK AND FORWARD SUPPORT
========================================== */

window.addEventListener("popstate", function(event) {
    if (
        event.state &&
        event.state.screen === "celebration"
    ) {
        const person = window.PEOPLE.find(function(item) {
            return normalizeName(item.name) ===
                normalizeName(event.state.personName);
        });

        if (person) {
            showBirthday(person);
        } else {
            showWelcomeScreen();
        }
    } else {
        showWelcomeScreen();
    }
});


/* ==========================================
   16. FALLING FLOWER PETALS
========================================== */

function createPetals() {
    if (!petalsContainer) return;

    const flowers = ["🌸", "🌼", "🌺", "✨"];

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


/* ==========================================
   17. CONFETTI CELEBRATION
========================================== */

function launchConfetti() {
    if (!confettiContainer) return;

    confettiContainer.innerHTML = "";

    const pieces = 100;

    const colors = [
        "#ffdb72",
        "#f4a340",
        "#ff6d86",
        "#fff1c5",
        "#e8b4ff"
    ];

    for (let i = 0; i < pieces; i++) {
        const piece = document.createElement("span");

        piece.className = "confetti";

        piece.style.left = Math.random() * 100 + "%";

        piece.style.animationDuration =
            (3 + Math.random() * 4) + "s";

        piece.style.animationDelay =
            Math.random() * 2 + "s";

        piece.style.backgroundColor =
            colors[Math.floor(Math.random() * colors.length)];

        piece.style.transform =
            "rotate(" + Math.random() * 360 + "deg)";

        confettiContainer.appendChild(piece);

        setTimeout(function() {
            piece.remove();
        }, 8000);
    }
}


/* ==========================================
   18. RANDOMIZE GAME CARD POSITIONS
========================================== */

function shuffleArray(array) {
    const shuffled = array.slice();

    // Fisher-Yates shuffle.
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));

        [shuffled[i], shuffled[j]] =
            [shuffled[j], shuffled[i]];
    }

    return shuffled;
}


/* ==========================================
   19. START HIDDEN PHOTO GAME
========================================== */

function startHiddenPhotoGame(photos) {
    if (!gameCards) return;

    gameCards.innerHTML = "";

    discoveredPhotos = new Set();
    totalScore = 0;

    if (gameFeedback) {
        gameFeedback.textContent =
            "Tap a photo to uncover its secret!";
    }

    const result = document.querySelector(".game-result");

    if (result) {
        result.remove();
    }

    updateGameScore();

    if (!Array.isArray(photos) || photos.length < 3) {
        gameCards.innerHTML =
            "<p>Please add at least three working photos to play the Diwali surprise game.</p>";

        if (gameFeedback) {
            gameFeedback.textContent =
                "The surprise game needs three photos.";
        }

        return;
    }

    // Use the same three photos from the main gallery.
    const gamePhotos = photos.slice(0, 3);

    // Assign a role to each photo.
    const gameItems = [
        {
            photo: gamePhotos[0],
            role: "message",
            messageIndex: 0
        },
        {
            photo: gamePhotos[1],
            role: "message",
            messageIndex: 1
        },
        {
            photo: gamePhotos[2],
            role: "rocket"
        }
    ];

    // Shuffle the cards so the rocket is not always last.
    currentGameCards = shuffleArray(gameItems);

    currentGameCards.forEach(function(item, index) {
        const card = document.createElement("button");

        card.type = "button";
        card.className = "game-card";

        const image = document.createElement("img");

        image.src = item.photo;
        image.alt = "Hidden Diwali surprise " + (index + 1);

        const label = document.createElement("span");

        label.className = "game-card-label";
        label.textContent = "Tap to reveal ✨";

        const status = document.createElement("span");

        status.className = "game-card-status";
        status.textContent = "Hidden surprise";

        card.appendChild(image);
        card.appendChild(label);
        card.appendChild(status);

        card.addEventListener("click", function() {
            revealGameCard(index, card, label, status);
        });

        image.onerror = function() {
            card.disabled = true;
            label.textContent = "Photo unavailable";
            status.textContent = "Check image path";
        };

        gameCards.appendChild(card);
    });
}


/* ==========================================
   20. REVEAL HIDDEN PHOTO
========================================== */

function revealGameCard(index, card, label, status) {
    if (discoveredPhotos.has(index)) return;

    discoveredPhotos.add(index);

    card.classList.add("revealed");
    card.disabled = true;

    // Get the actual role of this shuffled card.
    const selectedItem = currentGameCards[index];

    if (selectedItem.role === "message") {
        const message = hiddenMessages[selectedItem.messageIndex];

        label.textContent = message.title;
        status.textContent = "+20 points";

        totalScore += MESSAGE_POINTS;

        if (gameFeedback) {
            gameFeedback.textContent = message.message;
        }
    }

    else if (selectedItem.role === "rocket") {
        label.textContent = "🚀 THE ROCKET SURPRISE!";

        // Rocket launches fireworks whenever clicked.
        launchRocketFireworks();

        // Full rocket points only when it is clicked last.
        const bothMessagesFound = currentGameCards
            .filter(function(item) {
                return item.role === "message";
            })
            .every(function(item) {
                const cardIndex = currentGameCards.indexOf(item);
                return discoveredPhotos.has(cardIndex);
            });

        if (bothMessagesFound) {
            totalScore += ROCKET_POINTS;

            status.textContent =
                "+60 points — Perfect order!";

            if (gameFeedback) {
                gameFeedback.textContent =
                    "Amazing! You saved the rocket for last. What a spectacular Diwali blast!";
            }
        } else {
            status.textContent =
                "Rocket launched! No bonus points.";

            if (gameFeedback) {
                gameFeedback.textContent =
                    "BOOM! The rocket blasted! But you clicked it before discovering both hidden messages. You can still collect the remaining points!";
            }
        }
    }

    updateGameScore();

    if (discoveredPhotos.size === 3) {
        setTimeout(function() {
            showGameResult();
        }, 1800);
    }
}


/* ==========================================
   21. UPDATE GAME SCORE
========================================== */

function updateGameScore() {
    if (gameScore) {
        gameScore.textContent = totalScore + " / 100";
    }

    if (gameProgress) {
        gameProgress.textContent =
            discoveredPhotos.size + " / 3";
    }
}


/* ==========================================
   22. ROCKET LAUNCH AND FIREWORKS
========================================== */

function launchRocketFireworks() {
    if (!gameFireworks) return;

    const rocket = document.createElement("div");

    rocket.className = "rocket-flight";
    rocket.textContent = "🚀";

    gameFireworks.appendChild(rocket);

    setTimeout(function() {
        rocket.remove();
        createFireworkBurst();
    }, 1300);
}


/* ==========================================
   23. CREATE FIREWORK BURST
========================================== */

function createFireworkBurst() {
    if (!gameFireworks) return;

    const burst = document.createElement("div");

    burst.className = "firework-burst";

    const colors = [
        "#ffd700",
        "#ff4d6d",
        "#ffffff",
        "#ff9f1c",
        "#e0aaff",
        "#00f5d4"
    ];

    for (let i = 0; i < 42; i++) {
        const spark = document.createElement("span");

        spark.className = "firework-spark";

        const angle = (Math.PI * 2 * i) / 42;

        const distance = 60 + Math.random() * 120;

        const x = Math.cos(angle) * distance;
        const y = Math.sin(angle) * distance;

        spark.style.setProperty("--x", x + "px");
        spark.style.setProperty("--y", y + "px");

        spark.style.backgroundColor =
            colors[Math.floor(Math.random() * colors.length)];

        burst.appendChild(spark);
    }

    gameFireworks.appendChild(burst);

    setTimeout(function() {
        burst.remove();
    }, 1800);
}


/* ==========================================
   24. FINAL GAME RESULT
========================================== */

function showGameResult() {
    if (!gameCards) return;

    const oldResult = document.querySelector(".game-result");

    if (oldResult) {
        oldResult.remove();
    }

    const result = document.createElement("div");

    result.className = "game-result";

    const heading = document.createElement("h2");
    const message = document.createElement("p");
    const score = document.createElement("strong");

    if (totalScore === 100) {
        heading.textContent = "🏆 Diwali Champion!";

        message.textContent =
            "Perfect! You discovered both hidden messages and saved the rocket for the grand finale!";
    } else {
        heading.textContent = "✨ Great Diwali Explorer!";

        message.textContent =
            "You discovered all three surprises! Next time, save the rocket for the very last to earn the perfect score!";
    }

    score.textContent =
        "Your Final Score: " + totalScore + " / 100";

    result.appendChild(heading);
    result.appendChild(message);
    result.appendChild(score);

    gameCards.parentNode.appendChild(result);
}


/* ==========================================
   25. DIWALI-INSPIRED MUSIC
========================================== */

// Original browser-generated melody.

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


/* ==========================================
   26. START MUSIC
========================================== */

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
    }

    catch (error) {
        musicPlaying = false;

        musicButton.textContent =
            "♫ Tap to enable music";

        console.error("Music could not start:", error);
    }
}


/* ==========================================
   27. STOP MUSIC
========================================== */

function stopMusic() {
    musicPlaying = false;

    if (melodyTimer) {
        clearInterval(melodyTimer);
        melodyTimer = null;
    }

    if (audioContext && audioContext.state !== "closed") {
        audioContext.suspend();
    }

    if (musicButton) {
        musicButton.textContent =
            "♫ Music: OFF — Turn ON";
    }
}


/* ==========================================
   28. MUSIC ON / OFF BUTTON
========================================== */

musicButton.addEventListener("click", function() {
    if (musicPlaying) {
        stopMusic();
    } else {
        startMusic();
    }
});


/* ==========================================
   END OF SCRIPT
========================================== */
