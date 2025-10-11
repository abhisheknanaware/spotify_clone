console.log('JS Music Player Loaded');

let currentSong = new Audio();
let songs = [];
let currFolder = "songs"; 
let playBtn; 

// Convert seconds to mm:ss
function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) return "00:00";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}

// Fetch songs from songs.json
async function getSongs() {
    try {
        const response = await fetch("songs.json");
        songs = await response.json();
        renderPlaylist();
        return songs;
    } catch (err) {
        console.error("Failed to load songs:", err);
        return [];
    }
}

// Render playlist
function renderPlaylist() {
    const songUL = document.querySelector(".songlist ul");
    songUL.innerHTML = "";
    for (const song of songs) {
        const li = document.createElement("li");
        li.innerHTML = `
            <img class="invert" width="34" src="logo/music.svg" alt="">
            <div class="info">
                <div class="track-name">${song}</div>
                <div>Unknown Artist</div>
            </div>
            <div class="playnow">
                <span>Play Now</span>
                <img class="invert" src="logo/play.svg" alt="">
            </div>`;
        li.addEventListener("click", () => playMusic(song));
        songUL.appendChild(li);
    }
}

// Play a song
function playMusic(track, pause = false) {
    if (!track) return;

    console.log("Playing:", track);
    currentSong.src = `${currFolder}/${track}`;
    document.querySelector(".songinfo").innerText = track;
    document.querySelector(".songtime").innerText = "00:00 / 00:00";

    if (!pause) {
        currentSong.play().catch(err => console.error("Playback failed:", err));
        playBtn.src = "logo/pause.svg";
    } else {
        playBtn.src = "logo/play.svg";
    }
}

// Main function
async function main() {
    playBtn = document.getElementById("play");
    const previousBtn = document.getElementById("previous");
    const nextBtn = document.getElementById("next");
    const seekbar = document.querySelector(".seekbar");
    const circle = document.querySelector(".circle");
    const volumeRange = document.getElementById("rangeinfo");

    // Load songs
    songs = await getSongs();
    if (songs.length > 0) playMusic(songs[0], true);

    // Play/Pause button
    playBtn.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play().catch(err => console.error(err));
            playBtn.src = "logo/pause.svg";
        } else {
            currentSong.pause();
            playBtn.src = "logo/play.svg";
        }
    });

    // Previous button
    previousBtn.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").pop());
        if (index > 0) playMusic(songs[index - 1]);
    });

    // Next button
    nextBtn.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").pop());
        if (index !== -1 && index < songs.length - 1) playMusic(songs[index + 1]);
    });

    // Update progress bar
    currentSong.addEventListener("timeupdate", () => {
        const currentTime = secondsToMinutesSeconds(currentSong.currentTime);
        const duration = secondsToMinutesSeconds(currentSong.duration);
        document.querySelector(".songtime").innerText = `${currentTime} / ${duration}`;
        if (currentSong.duration) circle.style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    });

    // Seekbar click
    seekbar.addEventListener("click", e => {
        let percent = e.offsetX / seekbar.getBoundingClientRect().width;
        currentSong.currentTime = currentSong.duration * percent;
    });

    // Autoplay next
    currentSong.addEventListener("ended", () => {
        let index = songs.indexOf(currentSong.src.split("/").pop());
        if (index !== -1 && index < songs.length - 1) playMusic(songs[index + 1]);
        else playBtn.src = "logo/play.svg";
    });

    // Volume control
    volumeRange.addEventListener("input", e => {
        currentSong.volume = parseInt(e.target.value) / 100;
        document.getElementById("volume").src = currentSong.volume === 0 ? "logo/mute.svg" : "logo/volume.svg";
    });

    // Hamburger menu
    document.querySelector(".humburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    });
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%";
    });
}

main();
