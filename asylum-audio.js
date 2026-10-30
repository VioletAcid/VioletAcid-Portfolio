
/* The Forgotten Ward — shared ambient audio */

(() => {
    const AudioContextClass =
        window.AudioContext || window.webkitAudioContext;

    if (!AudioContextClass) return;

    const STORAGE_KEY = "violetacid-sound-muted";

    let audioContext = null;
    let masterVolume = null;
    let started = false;
    let muted = false;

    try {
        muted = localStorage.getItem(STORAGE_KEY) === "true";
    } catch (error) {
        muted = false;
    }

    function savePreference() {
        try {
            localStorage.setItem(STORAGE_KEY, String(muted));
        } catch (error) {
            // Continue if browser storage is unavailable.
        }
    }

    function createAmbience() {
        audioContext = new AudioContextClass();

        masterVolume = audioContext.createGain();
        masterVolume.gain.value = 0;
        masterVolume.connect(audioContext.destination);

        // Low, unsettling hospital drone
        [55, 55.4, 82.4].forEach((frequency, index) => {
            const oscillator = audioContext.createOscillator();
            const gain = audioContext.createGain();

            oscillator.type = index === 2 ? "sine" : "triangle";
            oscillator.frequency.value = frequency;
            gain.gain.value = index === 2 ? 0.025 : 0.045;

            oscillator.connect(gain);
            gain.connect(masterVolume);
            oscillator.start();
        });

        // Distant ventilation / wind
        const buffer = audioContext.createBuffer(
            1,
            audioContext.sampleRate * 2,
            audioContext.sampleRate
        );

        const data = buffer.getChannelData(0);

        for (let i = 0; i < data.length; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = audioContext.createBufferSource();
        noise.buffer = buffer;
        noise.loop = true;

        const filter = audioContext.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.value = 260;

        const windGain = audioContext.createGain();
        windGain.gain.value = 0.045;

        noise.connect(filter);
        filter.connect(windGain);
        windGain.connect(masterVolume);
        noise.start();

        started = true;
    }

    function updateButton() {
        const button = document.getElementById(
            "asylum-sound-toggle"
        );

        if (!button) return;

        button.textContent = muted
            ? "🔇 SOUND OFF"
            : "🔊 SOUND ON";

        button.setAttribute("aria-pressed", String(!muted));
        button.setAttribute(
            "aria-label",
            muted ? "Turn sound on" : "Turn sound off"
        );
    }

    function updateVolume() {
        if (!audioContext || !masterVolume) return;

        const now = audioContext.currentTime;

        masterVolume.gain.cancelScheduledValues(now);
        masterVolume.gain.setTargetAtTime(
            muted ? 0 : 0.65,
            now,
            0.3
        );
    }

    async function startAudio() {
        if (muted) return;

        try {
            if (!started) {
                createAmbience();
            }

            if (audioContext.state === "suspended") {
                await audioContext.resume();
            }

            updateVolume();
        } catch (error) {
            console.warn("Ambient audio could not start:", error);
        }
    }

    function toggleSound() {
        muted = !muted;
        savePreference();
        updateButton();

        if (muted) {
            updateVolume();
        } else {
            startAudio();
        }
    }

    document.addEventListener("DOMContentLoaded", () => {
        let button = document.getElementById(
            "asylum-sound-toggle"
        );

        // Create the same button on every portfolio page.
        if (!button) {
            button = document.createElement("button");
            button.id = "asylum-sound-toggle";
            button.type = "button";
            document.body.appendChild(button);
        }

        button.addEventListener("click", (event) => {
            event.stopPropagation();
            toggleSound();
        });

        updateButton();

        // Attempt playback when the page loads.
        if (!muted) {
            startAudio();
        }

        // Browser-safe start on the first user interaction.
        document.addEventListener("pointerdown", (event) => {
            if (event.target.closest("#asylum-sound-toggle")) {
                return;
            }

            startAudio();
        });

        document.addEventListener("keydown", (event) => {
            if (event.key === "Tab") return;
            startAudio();
        });
    });
})();
