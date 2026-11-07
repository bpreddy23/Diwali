
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

let currentPhotos = [];
let currentPhotoIndex = 0;
let slideshowTimer = null;
let musicPlaying = false;
let audioContext = null;
let melodyTimer = null;

// Normalize names so that capitalization and extra spaces do not matter.
function normalizeName(name) {
    return name.trim().toLowerCase().replace(/\s+/g, " ");
}

// Name form
nameForm.addEventListener("submit", function(event) {
    event.preventDefault();

    const enteredName = nameInput.value.trim();

    if (!enteredName) {
        errorMessage.textContent = "Please enter your name!";
        return;
    }

    if (!Array.isArray(window.PEOPLE)) {
        errorMessage.textContent = "Unable to load the birthday list. Please refresh.";
        return;
    }

    const person = window.PEOPLE.find(function(item) {
    return item.name.trim().toLowerCase() ===
           enteredName.trim().toLowerCase();
});

    if (!person) {
        errorMessage.textContent = "Name not found. Please check the spelling!";
        return;
    }

    errorMessage.textContent = "";
    showBirthday(person);
});

// Show the birthday page
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
        mainPhoto.src = "";
        mainPhoto.alt = "No photo available";
        photoCounter.textContent = "No photos";
        return;
    }

    displayPhoto(0);
createThumbnails();
startSlideshow();
launchConfetti();

// Start music when the visitor reveals their birthday page.
startMusic();

    birthdayScreen.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}

// Display selected photo
function displayPhoto(index) {
    if (!currentPhotos.length) return;

    currentPhotoIndex = (index + currentPhotos.length) % currentPhotos.length;

    mainPhoto.classList.add("changing");

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
        currentPhotos.splice(currentPhotoIndex, 1);

        if (currentPhotos.length === 0) {
            mainPhoto.removeAttribute("src");
            photoCounter.textContent = "No photos found";
            thumbnailGallery.innerHTML = "";
            stopSlideshow();
            return;
        }

        currentPhotoIndex = currentPhotoIndex % currentPhotos.length;
        displayPhoto(currentPhotoIndex);
    };

    newImage.src = currentPhotos[currentPhotoIndex];
}

// Create thumbnail images
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

// Highlight active thumbnail
function updateThumbnails() {
    const thumbnails = thumbnailGallery.querySelectorAll(".thumbnail");

    thumbnails.forEach(function(thumbnail, index) {
        thumbnail.classList.toggle(
            "active",
            index === currentPhotoIndex
        );
    });
}

// Previous and next photo buttons
previousPhotoButton.addEventListener("click", function() {
    displayPhoto(currentPhotoIndex - 1);
    startSlideshow();
});

nextPhotoButton.addEventListener("click", function() {
    displayPhoto(currentPhotoIndex + 1);
    startSlideshow();
});

// Automatic slideshow
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

// Return to welcome screen
backButton.addEventListener("click", function() {
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
});

// Falling flower petals
function createPetals() {
    const flowers = ["🌸", "🌼", "🌺"];

    for (let i = 0; i < 20; i++) {
        const petal = document.createElement("span");

        petal.className = "petal";
        petal.textContent = flowers[
            Math.floor(Math.random() * flowers.length)
        ];

        petal.style.left = Math.random() * 100 + "%";
        petal.style.animationDuration = (6 + Math.random() * 8) + "s";
        petal.style.animationDelay = (Math.random() * 8) + "s";
        petal.style.fontSize = (12 + Math.random() * 13) + "px";

        petalsContainer.appendChild(petal);
    }
}

createPetals();

// Confetti celebration
function launchConfetti() {
    confettiContainer.innerHTML = "";

    const pieces = 100;

    for (let i = 0; i < pieces; i++) {
        const piece = document.createElement("span");

        piece.className = "confetti";
        piece.style.left = Math.random() * 100 + "%";
        piece.style.animationDuration = (3 + Math.random() * 4) + "s";
        piece.style.animationDelay = Math.random() * 2 + "s";

        piece.style.backgroundColor = [
            "#ffdb72",
            "#f4a340",
            "#ff6d86",
            "#fff1c5",
            "#e8b4ff"
        ][Math.floor(Math.random() * 5)];

        piece.style.transform = "rotate(" + Math.random() * 360 + "deg)";

        confettiContainer.appendChild(piece);

        setTimeout(function() {
            piece.remove();
        }, 8000);
    }
}

// Original Diwali-inspired bell melody using Web Audio.
// This is synthesized in the browser, not a recorded song.
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

        gain.gain.setValueAtTime(0.0001, audioContext.currentTime);
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

// Music button

// Automatic celebration music and ON/OFF switch

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
        musicButton.textContent = "♫ Music: ON — Turn OFF";

        if (melodyTimer) {
            clearInterval(melodyTimer);
            melodyTimer = null;
        }

        playMelody();

    } catch (error) {
        musicPlaying = false;
        musicButton.textContent = "♫ Tap to enable music";
    }
}

function stopMusic() {
    musicPlaying = false;

    if (melodyTimer) {
        clearInterval(melodyTimer);
        melodyTimer = null;
    }

    if (audioContext && audioContext.state !== "closed") {
        audioContext.suspend();
    }

    musicButton.textContent = "♫ Music: OFF — Turn ON";
}

// Button toggles music
musicButton.addEventListener("click", function() {
    if (musicPlaying) {
        stopMusic();
    } else {
        startMusic();
    }
});
