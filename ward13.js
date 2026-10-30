
const evidence = {
    file: {
        title: 'PATIENT RECORD 013',
        text: 'The admission date has been scratched out. One entry survives: "The code begins with 1 9."',
        label: 'FILE 19'
    },
    bed: {
        title: 'BENEATH THE MATTRESS',
        text: 'A message is stitched into the lining: "The final two digits are 8 7."',
        label: 'NOTE 87'
    },
    cabinet: {
        title: 'MEDICINE CABINET',
        text: 'A rusted prescription tray contains a torn warning: "Put the file first, then the mattress. The exit remembers."',
        label: 'ORDER'
    }
};

const totalSeconds = 180;

let remaining = totalSeconds;
let found = new Set();
let finished = false;
let tick = null;
let active = null;

const $ = id => document.getElementById(id);
const modal = $('modal');

function renderTimer() {
    const minutes = Math.floor(remaining / 60);
    const seconds = remaining % 60;

    $('timer').textContent =
        `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function renderInventory() {
    $('count').textContent = `${found.size} / 3`;

    const slots = $('inventory').children;

    Object.keys(evidence).forEach((key, index) => {
        slots[index].textContent = found.has(key)
            ? evidence[key].label
            : '?';

        slots[index].classList.toggle('filled', found.has(key));
    });
}

function showModal(which) {
    if (finished) return;

    active = which;

    if (which === 'door') {
        $('modal-title').textContent = 'THE CHAINED EXIT';

        $('modal-text').textContent = found.size === 3
            ? 'You have everything you need. Enter the four digits in the correct order.'
            : 'The keypad is damaged. Three pieces of evidence may reveal the code.';

        $('code-entry').hidden = found.size !== 3;
        $('collect').hidden = true;
        $('code').value = '';
    } else {
        const item = evidence[which];

        $('modal-title').textContent = item.title;
        $('modal-text').textContent = item.text;

        $('code-entry').hidden = true;
        $('collect').hidden = found.has(which);
        $('collect').textContent = 'TAKE EVIDENCE';
    }

    modal.hidden = false;

    if (which === 'door' && found.size === 3) {
        $('code').focus();
    } else {
        $('close').focus();
    }
}

function closeModal() {
    modal.hidden = true;
    active = null;
}

function endGame(won) {
    finished = true;
    clearInterval(tick);
    closeModal();

    $('ending-title').textContent = won
        ? 'YOU ESCAPED'
        : 'TIME EXPIRED';

    $('ending-text').textContent = won
        ? 'The chains fall away. Patient 013 has left the ward. But something followed.'
        : 'The lights go out. Your name appears on the next patient file.';

    $('ending').hidden = false;
}

function start() {
    clearInterval(tick);

    remaining = totalSeconds;
    found = new Set();
    finished = false;

    closeModal();
    $('ending').hidden = true;

    $('status').textContent =
        'The exit is chained. Search the room for the code.';

    renderInventory();
    renderTimer();

    tick = setInterval(() => {
        if (finished) return;

        remaining = Math.max(0, remaining - 1);
        renderTimer();

        if (remaining === 0) {
            endGame(false);
        }
    }, 1000);
}

document.querySelectorAll('[data-inspect]').forEach(button => {
    button.addEventListener('click', () => {
        showModal(button.dataset.inspect);
    });
});


$('collect').addEventListener('click', () => {
    if (!active || active === 'door') return;

    const collectedItem = active;

  
found.add(collectedItem);
renderInventory();

window.Ward13Sounds?.evidence();


    $('status').textContent =
        `${evidence[collectedItem].title} recorded. ` +
        (found.size === 3
            ? 'All clues found. Try the exit.'
            : 'Keep searching.');

    closeModal();

    // The scare only happens AFTER the patient file is collected.
    if (collectedItem === 'file' && !ghostHasAppeared) {
        setTimeout(() => {
            if (!finished && modal.hidden) {
                triggerWindowGhost();
            }
        }, 2000);
    }
});



$('unlock').addEventListener('click', () => {
    if ($('code').value.trim() === '1987') {
        beginEscape();
    } else {
        $('modal-text').textContent =
            'ACCESS DENIED. Check the order of the clues.';

        $('code').value = '';
        $('code').focus();
    }
});

function beginEscape() {
    if (finished) return;
window.Ward13Sounds?.escape();
    finished = true;
    clearInterval(tick);
    clearInterval(ghostTimeout);
    closeModal();

    movementKeys.clear();

    const room = document.querySelector('.scene-frame');

    room.classList.add('escape-sequence');

    $('status').textContent =
        'The chains fall away. The door is opening...';

    saySomething("I'm getting out of here.");

   

setTimeout(() => {
    
    subject.classList.remove('facing-left');
    subject.style.transition = 'none';
    subject.style.opacity = '1';


    subject.offsetHeight;

    
    subject.style.transition =
        'left 2.5s ease-in-out, opacity 0.6s ease-in 2.1s';

    subject.classList.add('escaping');
    subject.style.left = '94%';
    subject.style.opacity = '0';
}, 1000);



    setTimeout(() => {
        endGame(true);
    }, 4500);
}


$('close').addEventListener('click', closeModal);

modal.addEventListener('click', event => {
    if (event.target === modal) {
        closeModal();
    }
});

document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !modal.hidden) {
        closeModal();
    }
});

$('restart').addEventListener('click', start);
$('play-again').addEventListener('click', () => {
    // Restart the timer, evidence and game
    start();

    // Restore Subject 013
    subject.classList.remove('escaping', 'walking', 'facing-left');
    subject.style.transition = 'none';
    subject.style.left = '48%';
    subject.style.opacity = '1';

    subjectPosition = 48;
    subjectDirection = 1;

    // Restore the room
    document.querySelector('.scene-frame')
        .classList.remove('escape-sequence', 'scare-active');

    // Reset the ghost
    windowGhost.classList.remove('visible');
    ghostHasAppeared = false;

    // Allow normal movement again
    requestAnimationFrame(() => {
        subject.style.transition = '';
    });
});


const subject = document.getElementById('subject013');
const dialogue = document.getElementById('subject-dialogue');

let subjectPosition = 48;
let subjectDirection = 1;
let movementKeys = new Set();
let movementFrame = null;
let lastMovementTime = 0;
let dialogueTimeout;


const investigationPoints = [
    { id: 'file', x: 16, range: 12 },
    { id: 'bed', x: 31, range: 22 },
    { id: 'cabinet', x: 80, range: 12 }
];

function updateSubject() {
    subject.style.left = subjectPosition + '%';
    subject.classList.toggle(
        'facing-left',
        subjectDirection < 0
    );
}

function saySomething(text) {
    clearTimeout(dialogueTimeout);

    dialogue.textContent = text;
    dialogue.hidden = false;
    dialogue.style.left = subjectPosition + '%';

    dialogueTimeout = setTimeout(() => {
        dialogue.hidden = true;
    }, 3000);
}

function moveSubject(direction, distance = 2) {
    if (finished || !modal.hidden || !$('ending').hidden) return;

    subjectDirection = direction;
    subjectPosition = Math.max(
        5,
        Math.min(95, subjectPosition + direction * distance)
    );

    updateSubject();
}

function investigateNearby() {
    if (finished || !modal.hidden || !$('ending').hidden) return;

    let nearest = null;
    let nearestDistance = Infinity;

    investigationPoints.forEach(point => {
        const distance = Math.abs(subjectPosition - point.x);

        if (distance <= point.range && distance < nearestDistance) {
            nearest = point;
            nearestDistance = distance;
        }
    });

    if (nearest) {
        showModal(nearest.id);
    } else {
        saySomething("There's nothing here... I think.");
    }
}
let lastFootstepTime = 0;
function movementLoop(timestamp) {
    if (!lastMovementTime) lastMovementTime = timestamp;

    const delta = Math.min(
        (timestamp - lastMovementTime) / 1000,
        0.05
    );

    lastMovementTime = timestamp;

    let direction = 0;

    if (movementKeys.has('a') || movementKeys.has('arrowleft')) {
        direction -= 1;
    }

    if (movementKeys.has('d') || movementKeys.has('arrowright')) {
        direction += 1;
    }


if (direction !== 0) {
    moveSubject(direction, 22 * delta);

    if (!finished && modal.hidden &&
        timestamp - lastFootstepTime > 420) {

        window.Ward13Sounds?.footstep();
        lastFootstepTime = timestamp;
    }
}

    subject.classList.toggle(
        'walking',
        direction !== 0 && !finished && modal.hidden
    );

    movementFrame = requestAnimationFrame(movementLoop);
}

document.addEventListener('keydown', event => {
    const key = event.key.toLowerCase();

    if (document.activeElement === $('code')) return;

    if (['a', 'd', 'arrowleft', 'arrowright'].includes(key)) {
        event.preventDefault();
        movementKeys.add(key);
    }

    if (key === 'e' && !event.repeat) {
        investigateNearby();
    }
});

document.addEventListener('keyup', event => {
    movementKeys.delete(event.key.toLowerCase());
});

window.addEventListener('blur', () => {
    movementKeys.clear();
});

function bindMovementButton(id, direction) {
    const button = document.getElementById(id);
    let interval;

    const stop = () => {
        clearInterval(interval);
        interval = null;
        subject.classList.remove('walking');
    };

    button.addEventListener('pointerdown', event => {
        event.preventDefault();
        stop();

        moveSubject(direction);
        subject.classList.add('walking');

        interval = setInterval(() => {
            moveSubject(direction, 1.5);
        }, 60);
    });

    button.addEventListener('pointerup', stop);
    button.addEventListener('pointercancel', stop);
    button.addEventListener('pointerleave', stop);
    window.addEventListener('blur', stop);
}

bindMovementButton('move-left', -1);
bindMovementButton('move-right', 1);

document.getElementById('interact')
    .addEventListener('click', investigateNearby);

const originalStart = start;


start = function () {
    originalStart();

    // Reset the room and door
    document.querySelector('.scene-frame')
        .classList.remove('escape-sequence', 'scare-active');

    // Bring Subject 013 back
    subject.classList.remove('escaping', 'walking', 'facing-left');

    subject.style.transition = 'none';
    subject.style.opacity = '1';

    subjectPosition = 48;
    subjectDirection = 1;
    movementKeys.clear();

    updateSubject();

    // Restore normal character movement
    subject.offsetHeight;
    subject.style.transition = '';

    // Reset dialogue
    clearTimeout(dialogueTimeout);
    dialogue.hidden = true;

    // Reset the window ghost
    clearTimeout(ghostTimeout);
    windowGhost.classList.remove('visible');
    ghostHasAppeared = false;

    $('status').textContent =
        'The exit is chained. Search the room for the code.';
};


updateSubject();
saySomething("Where am I...?");

movementFrame = requestAnimationFrame(movementLoop);

const windowGhost = document.getElementById('window-ghost');

let ghostHasAppeared = false;
let ghostTimeout;



function triggerWindowGhost() {
    if (ghostHasAppeared || finished) return;

    ghostHasAppeared = true;

    const room = document.querySelector('.scene-frame');

    // First, the lights flicker.
    room.classList.add('scare-active');

    setTimeout(() => {
        room.classList.remove('scare-active');

        // Then the figure appears.
        windowGhost.classList.add('visible');
window.Ward13Sounds?.ghost();
        saySomething("Wait... who's standing at the window?");
    }, 1200);

    // The figure watches the player before disappearing.
    clearTimeout(ghostTimeout);

    ghostTimeout = setTimeout(() => {
        windowGhost.classList.remove('visible');

        saySomething("That thing wasn't there before...");
    }, 5500);
}
start();