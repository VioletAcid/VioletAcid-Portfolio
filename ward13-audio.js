
/* WARD 13 — Horror Audio System */

(() => {
    const AudioContextClass =
        window.AudioContext || window.webkitAudioContext;

    if (!AudioContextClass) return;

    let ctx;
    let master;
    let heartbeatInterval;
    let enabled = true;
    let initialized = false;

    function setup() {
        if (initialized) return;

        ctx = new AudioContextClass();
        master = ctx.createGain();
        master.gain.value = 0.5;
        master.connect(ctx.destination);

        // Deep background drone
        [48, 48.5, 72].forEach((frequency, index) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = "sine";
            osc.frequency.value = frequency;
            gain.gain.value = index === 2 ? 0.025 : 0.045;

            osc.connect(gain);
            gain.connect(master);
            osc.start();
        });

        initialized = true;
    }

    function beat(time, strength) {
        const oscillator = ctx.createOscillator();
        const gain = ctx.createGain();

        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(65, time);
        oscillator.frequency.exponentialRampToValueAtTime(38, time + 0.12);

        gain.gain.setValueAtTime(0.0001, time);
        gain.gain.exponentialRampToValueAtTime(strength, time + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.2);

        oscillator.connect(gain);
        gain.connect(master);

        oscillator.start(time);
        oscillator.stop(time + 0.21);
    }

    function heartbeat() {
        if (!enabled || !ctx || ctx.state !== "running") return;

        const now = ctx.currentTime;
        beat(now, 0.28);
        beat(now + 0.23, 0.18);
    }

    async function startAudio() {
        if (!enabled) return;

        setup();

        if (ctx.state === "suspended") {
            await ctx.resume();
        }

        if (!heartbeatInterval) {
            heartbeat();
            heartbeatInterval = setInterval(heartbeat, 1700);
        }
    }

    function toggleAudio() {
        enabled = !enabled;

        if (master) {
            master.gain.setTargetAtTime(
                enabled ? 0.5 : 0,
                ctx.currentTime,
                0.1
            );
        }

        if (enabled) startAudio();

        const button = document.getElementById("ward13-sound-toggle");

        if (button) {
            button.textContent = enabled
                ? "🔊 SOUND ON"
                : "🔇 SOUND OFF";
        }
    }

    // WARD 13 — Interactive sound effects

    function playTone(frequency, duration, volume = 0.15, type = "sine") {
        if (!enabled || !ctx || ctx.state !== "running") return;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const now = ctx.currentTime;

        osc.type = type;
        osc.frequency.setValueAtTime(frequency, now);

        gain.gain.setValueAtTime(volume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

        osc.connect(gain);
        gain.connect(master);

        osc.start(now);
        osc.stop(now + duration);
    }

    // 1. Footsteps — soft, heavy floor impacts
    function footstep() {
        playTone(85, 0.12, 0.22, "triangle");
        playTone(45, 0.16, 0.12, "sine");
    }

    // 2. Evidence — paper rustle / discovery cue
    function evidence() {
        playTone(620, 0.08, 0.09, "triangle");

        setTimeout(() => {
            playTone(430, 0.15, 0.07, "sine");
        }, 90);
    }

    // 3. Ghost — sharp, unsettling scare
   
function ghost() {
    if (!enabled || !ctx || ctx.state !== "running") return;

    const now = ctx.currentTime;

    // Sudden, distorted horror burst
    const buffer = ctx.createBuffer(
        1,
        Math.floor(ctx.sampleRate * 1.5),
        ctx.sampleRate
    );

    const data = buffer.getChannelData(0);

    for (let i = 0; i < data.length; i++) {
        data[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = 1200;

    const noiseGain = ctx.createGain();

    noiseGain.gain.setValueAtTime(0.0001, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.4, now + 0.03);
    noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.4);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(master);

    noise.start(now);
    noise.stop(now + 1.5);

    // Piercing, descending ghost shriek
    const scream = ctx.createOscillator();
    const screamGain = ctx.createGain();

    scream.type = "sawtooth";
    scream.frequency.setValueAtTime(1300, now);
    scream.frequency.exponentialRampToValueAtTime(180, now + 1.1);

    screamGain.gain.setValueAtTime(0.0001, now);
    screamGain.gain.exponentialRampToValueAtTime(0.18, now + 0.04);
    screamGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);

    scream.connect(screamGain);
    screamGain.connect(master);

    scream.start(now);
    scream.stop(now + 1.25);

    // Deep rumble beneath the scream
    playTone(55, 1.5, 0.3, "triangle");
}


    // 4. Escape — unlocking the exit
    function escapeSound() {
        playTone(220, 0.15, 0.15, "square");

        setTimeout(() => playTone(330, 0.2, 0.12), 170);
        setTimeout(() => playTone(440, 0.5, 0.16), 390);
    }

    // Expose sound triggers without changing the game logic
    window.Ward13Sounds = {
        footstep,
        evidence,
        ghost,
        escape: escapeSound
    };

    document.addEventListener("DOMContentLoaded", () => {
        const button = document.createElement("button");

        button.id = "ward13-sound-toggle";
        button.type = "button";
        button.textContent = "🔊 SOUND ON";

        document.body.appendChild(button);

        button.addEventListener("click", toggleAudio);

        // Start on first interaction (browser autoplay restriction).
        document.addEventListener("pointerdown", startAudio);
        document.addEventListener("keydown", startAudio);

        startAudio();
    });
})();
