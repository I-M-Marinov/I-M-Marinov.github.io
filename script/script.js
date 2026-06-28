document.addEventListener("DOMContentLoaded", function () {
  var elements = document.querySelectorAll('.letter-by-letter');

  function animate(index) {
    if (index < elements.length) {
      elements[index].style.visibility = 'visible'; // Reveal the content
      elements[index].style.animation = 'none'; // Reset animation
      void elements[index].offsetWidth; // Trigger reflow
      elements[index].style.animation = null; // Clear inline style
      elements[index].style.animationDelay = 'calc(0.85s * var(--index))'; // Reset animation delay
      elements[index].addEventListener('animationend', function () {
        // Freeze the typed text so minimize/maximize can't re-trigger the animation
        elements[index].classList.add('typing-done');
        animate(index + 1);
      }, { once: true });
    }
  }

  animate(0);
});

function scrollToSection(sectionId) {
  const section = document.getElementById(sectionId);
  if (section) {
    section.classList.add('flash'); // Add the flashing effect
    setTimeout(() => {
      section.classList.remove('flash'); // Remove the flashing effect after 2 seconds
    }, 2000);
    section.scrollIntoView({ behavior: 'smooth' }); // Scroll to the section smoothly
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const maximizeButton = document.querySelector('.maximize');
  const consoleHeader = document.querySelector('.console-window-header');
  const consoleWindow = document.querySelector('.console-window');
  const h1Elements = document.querySelectorAll('.console-window h1');
  const h2Elements = document.querySelectorAll('.console-window h2');
  const picture = document.querySelector('.picture'); // only present on About Me page

  const hasH1 = h1Elements.length > 0;
  const hasH2 = h2Elements.length > 0;

  let isMaximized = false;
  let isFontSizeChanged = false;

  function changeFontSize() {
    if (hasH1) {
      h1Elements.forEach((h1, index) => {
        if (!h1.dataset.originalFontSize) {
          h1.dataset.originalFontSize = window.getComputedStyle(h1).fontSize;
        }
        h1.style.fontSize = '3em';
        h1.style.paddingTop = index === 0 ? '2em' : '';
      });
    }
    if (hasH2) {
      h2Elements.forEach((h2, index) => {
        if (!h2.dataset.originalFontSize) {
          h2.dataset.originalFontSize = window.getComputedStyle(h2).fontSize;
        }
        h2.style.fontSize = '2em';
        h2.style.paddingTop = index === 0 ? '1em' : '';
      });
      if (picture) picture.style.display = 'none';
    }
  }

  function revertFontSize() {
    if (hasH1) {
      h1Elements.forEach((h1) => {
        h1.style.fontSize = h1.dataset.originalFontSize;
        h1.style.paddingTop = '';
      });
    }
    if (hasH2) {
      h2Elements.forEach((h2) => {
        h2.style.fontSize = h2.dataset.originalFontSize;
        h2.style.paddingTop = '';
      });
      if (picture) picture.style.display = 'flex';
    }
  }

  maximizeButton.addEventListener('click', () => {
    const screenWidth = window.innerWidth;
    if (screenWidth >= 1500 && screenWidth <= 2560) {
      const expandedHeight = hasH1 ? '30em' : '35em';
      if (!isMaximized) {
        consoleHeader.style.width = '85%';
        consoleWindow.style.width = '85%';
        consoleWindow.style.height = expandedHeight;
        isMaximized = true;
      } else {
        consoleHeader.style.width = '';
        consoleHeader.style.height = '';
        consoleWindow.style.width = '';
        consoleWindow.style.height = '';
        isMaximized = false;
      }

      if (!isFontSizeChanged) {
        changeFontSize();
        isFontSizeChanged = true;
      } else {
        revertFontSize();
        isFontSizeChanged = false;
      }
    } else {
      showAlert('Screen width should be at least 1500px to maximize this window !');
    }
  });
});

function showAlert(message) {
  const customAlert = document.getElementById('customAlert');
  const alertMessage = document.getElementById('alertMessage');
  const closeAlert = document.getElementById('closeAlertButton');
  const customAlertPicture = document.getElementById('customAlertPicture');

  alertMessage.textContent = message;
  customAlert.style.display = 'block';
  customAlertPicture.style.display = 'none'; // hide the picture in the original construction

  closeAlert.addEventListener('click', () => {
    customAlert.style.display = 'none';
  });
}
// Exit messages 
const exitMessages = [
  "Don't fail me again, Admiral.",
  "I find your lack of faith disturbing.",
  "There is no escape! Don't make me destroy you!",
];

// Object mapping Exit messages  to their corresponding audio files
const exitSounds = {
  "Don't fail me again, Admiral.": "./audio/Don't fail me again.mp3",
  "I find your lack of faith disturbing.": "./audio/I find your lack of faith disturbing.mp3",
  "There is no escape! Don't make me destroy you!": "./audio/There is no escape.mp3",
};

// Flag to track whether an audio is currently playing
let isAudioPlaying = false;

document.addEventListener('DOMContentLoaded', () => {
  const closeIcon = document.querySelector('.close');
  if (!closeIcon) return; // no console window on this page — skip close handler
  const closeAlertButton = document.getElementById('closeAlertButton');
  const customAlert = document.getElementById('customAlert');
  const alertMessage = document.getElementById('alertMessage');
  const customAlertPicture = document.getElementById('customAlertPicture');

  // Function to show the exit alert
  const showExitAlert = (message) => {
    alertMessage.textContent = message;
    // Flex row in Matrix mode (picture left, text right); block otherwise
    customAlert.style.display = matrixModeActive ? 'flex' : 'block';
    customAlertPicture.style.display = matrixModeActive ? 'block' : 'inline';
    // Swap alert picture: character portrait in Matrix mode, Vader otherwise
    customAlertPicture.src = matrixModeActive
        ? (matrixCharacter === 'morpheus'
            ? './images/alert-picture/morpheus.jpg'
            : './images/alert-picture/agent-smith.jpg')
        : './images/alert-picture/alert-picture.jpg';

    // Route sounds to active character (Smith or Morpheus) in Matrix mode
    const activeSounds = matrixModeActive
        ? (matrixCharacter === 'smith' ? smithSounds : morpheusSounds)
        : exitSounds;
    const audioFile = activeSounds[message];
    const exitSound = new Audio(audioFile);

    if (audioFile) {
      isAudioPlaying = true;
      closeIcon.disabled = true; // Disable close button while sound is playing
      exitSound.volume = 0.8;
      exitSound.play();

      exitSound.addEventListener('ended', () => {
        isAudioPlaying = false;
        closeIcon.disabled = false; // Enable close button after sound ends
        customAlert.style.display = 'none'; // Close alert window after sound ends
        closeIcon.addEventListener('click', handleIconClick); // Reapply event listener to closeIcon
      });
    }
  };

  // Function to handle clicking the closeIcon
  const handleIconClick = () => {
    if (!isAudioPlaying) {
      // Alternate Smith ↔ Morpheus each alert click in Matrix mode
      if (matrixModeActive) matrixCharacter = (matrixCharacter === 'smith') ? 'morpheus' : 'smith';
      const activeMessages = matrixModeActive
          ? (matrixCharacter === 'smith' ? smithMessages : morpheusMessages)
          : exitMessages;
      const randomIndex = Math.floor(Math.random() * activeMessages.length);
      const randomMessage = activeMessages[randomIndex];
      showExitAlert(randomMessage);
      closeIcon.removeEventListener('click', handleIconClick); // Remove event listener from closeIcon
    }
  };

  // Function to handle clicking the closeAlertButton
  const handleCloseAlert = () => {
      customAlert.style.display = 'none';

  };

  // Initial event listener for closeIcon
  closeIcon.addEventListener('click', handleIconClick);

  // Event listener for closeAlertButton
  closeAlertButton.addEventListener('click', handleCloseAlert);
});

document.addEventListener('DOMContentLoaded', () => {
  const minimizedWindow = document.getElementById('minimized-window');
  const consoleContainer = document.querySelector('.console-container');
  const minimizeIcon = document.querySelector('.minimize');
  const pictureElement = document.querySelector('.picture');
  const footerElement = document.querySelector('footer');

  minimizeIcon.addEventListener('click', () => {
    consoleContainer.classList.add('minimized');
    if (pictureElement) { // check if there is a picture element present on the page
      pictureElement.style.order = '2';
    }
    footerElement.style.order = '3';
    minimizedWindow.style.order = '1';
    minimizedWindow.classList.add('visible');
  });

  minimizedWindow.addEventListener('click', () => {
    consoleContainer.classList.remove('minimized');
    if (pictureElement) { // check if there is a picture element present on the page
      pictureElement.style.order = '';
    }
    footerElement.style.order = '';
    minimizedWindow.style.order = '';
    minimizedWindow.classList.remove('visible');
  });
});

/*********************************************
    SNOWING EFFECT CSS
*********************************************/

let _snowRafId  = null; // cancelable handle for snow loop
let _bgRainRafId = null; // cancelable handle for background Matrix rain

function stopSnowAnimation() {
    if (_snowRafId !== null) {
        cancelAnimationFrame(_snowRafId);
        _snowRafId = null;
    }
    const canvas = document.getElementById('snow-canvas');
    if (canvas) canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
}

function startSnowAnimation() {
  const today = new Date();
  const currentYear = today.getFullYear();

  if (today.getMonth() === 11) { // December
    startDate = new Date(currentYear, 11, 1); // December 1st of current year
    endDate = new Date(currentYear + 1, 0, 31, 23, 59, 59); // January 31st of next year
  } else if (today.getMonth() === 0) { // January
      startDate = new Date(currentYear - 1, 11, 1); // December 1st of last year
      endDate = new Date(currentYear, 0, 31, 23, 59, 59); // January 31st of current year
  } else {
      return; // Stop execution
  }

  if (today < startDate || today > endDate) {

      return; // Stop execution
  }

  console.log("Starting snow animation...");

  const canvas = document.getElementById("snow-canvas");
  const ctx = canvas.getContext("2d");

  const snowflakes = [];
  const numSnowflakes = 200;

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  function createSnowflake() {
      return {
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: Math.random() * 3 + 1,
          speed: Math.random() * 1 + 0.55,
          wind: Math.random() * 5 - 5,
      };
  }

  for (let i = 0; i < numSnowflakes; i++) {
      snowflakes.push(createSnowflake());
  }

  function randomizeWind() {
      snowflakes.forEach(snowflake => {
          snowflake.wind = Math.random() * 5 - 5;
      });
  }

  setInterval(randomizeWind, 6000);

  function animateSnowflakes() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      snowflakes.forEach(snowflake => {
          snowflake.x += snowflake.wind * 0.1;
          snowflake.y += snowflake.speed;

          if (snowflake.y > canvas.height) snowflake.y = 0;
          if (snowflake.x > canvas.width) snowflake.x = 0;
          if (snowflake.x < 0) snowflake.x = canvas.width;

          ctx.beginPath();
          ctx.arc(snowflake.x, snowflake.y, snowflake.radius, 0, Math.PI * 2);
          ctx.fillStyle = "white";
          ctx.fill();
      });

      _snowRafId = requestAnimationFrame(animateSnowflakes);
  }

  animateSnowflakes();
}

startSnowAnimation();

// ── Background Matrix rain (replaces snow when Matrix mode is active) ──────
// Runs on the same #snow-canvas. Uses clearRect each frame — canvas stays
// fully transparent so page content is always visible. Trail opacity is
// computed explicitly per character instead of relying on black fill buildup.
function startBgMatrixRain() {
    // Same seasonal window as the snow effect: December 1 – January 31
    const today = new Date();
    const m = today.getMonth();
    if (m !== 11 && m !== 0) return;

    const canvas = document.getElementById('snow-canvas');
    if (!canvas) return;
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    const ctx = canvas.getContext('2d');

    const CSIZ      = 16;
    const TRAIL_LEN = 14;
    const CHARS     = 'ｦｧｨｩｪｫｬｭｮｯｰｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ0123456789';
    const cols      = Math.ceil(canvas.width / CSIZ);

    // Each column: head position + trail of characters
    const columns = Array.from({ length: cols }, () => ({
        y:     -(Math.random() * (canvas.height / CSIZ) * 1.5),
        speed: 0.3 + Math.random() * 0.35,
        chars: Array.from({ length: TRAIL_LEN }, () =>
            CHARS[Math.floor(Math.random() * CHARS.length)]),
    }));

    function frame() {
        _bgRainRafId = requestAnimationFrame(frame);

        // Clear every frame — canvas stays transparent, page content visible
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.font = `${CSIZ}px monospace`;

        for (let i = 0; i < cols; i++) {
            const col = columns[i];

            for (let j = 0; j < TRAIL_LEN; j++) {
                const charY = (col.y - j) * CSIZ;
                if (charY < -CSIZ || charY > canvas.height) continue;

                // Randomise trail chars occasionally
                if (Math.random() > 0.96) {
                    col.chars[j] = CHARS[Math.floor(Math.random() * CHARS.length)];
                }

                // Head: near-white; trail fades linearly to transparent green
                const alpha = j === 0
                    ? 0.85
                    : Math.max(0, (1 - j / TRAIL_LEN) * 0.38);
                ctx.fillStyle = j === 0
                    ? `rgba(200,255,200,${alpha})`
                    : `rgba(0,255,65,${alpha.toFixed(2)})`;
                ctx.fillText(col.chars[j], i * CSIZ, charY);
            }

            col.y += col.speed;

            if (col.y * CSIZ > canvas.height + TRAIL_LEN * CSIZ && Math.random() > 0.97) {
                col.y = -(Math.random() * 12 + TRAIL_LEN);
            }
        }
    }

    _bgRainRafId = requestAnimationFrame(frame);
}

function stopBgMatrixRain() {
    if (_bgRainRafId !== null) {
        cancelAnimationFrame(_bgRainRafId);
        _bgRainRafId = null;
    }
    const canvas = document.getElementById('snow-canvas');
    if (canvas) canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
}

document.addEventListener("DOMContentLoaded", () => {
    const img = document.querySelector(".profile-picture");
    if (!img) return; 

    const christmasImg = "./resume/images/imarinov_christmas.png";

    const today = new Date();
    const month = today.getMonth() + 1; 
    const day = today.getDate();

    const isChristmas = (month === 12 && (day === 24 || day === 25 || day === 26));

    if (isChristmas) {
        img.src = christmasImg;
    }
});

document.addEventListener("DOMContentLoaded", () => {
    const year = new Date().getFullYear();
    document.getElementById("year").textContent = `2024-${year}`;
});

/*********************************************
    MATRIX THEME SYSTEM
    - Floating toggle button (fixed, bottom-right)
    - Matrix rain canvas animation (~5s on activation)
    - body.matrix-mode class swap for full color override
    - ItWorksOnMyMachineException alert after rain
    - Agent Smith quotes replace Vader when active
*********************************************/

// Agent Smith quotes — active when Matrix mode is on
const smithMessages = [
    "Mr. Anderson...",
    "You hear that, Mr. Anderson? That is the sound of inevitability.",
    "Never send a human to do a machine's job.",
];

// Audio paths stubbed — guarded in showExitAlert, safe if files are missing
const smithSounds = {
    "Mr. Anderson...":
        "./audio/smith-mr-anderson.mp3",
    "You hear that, Mr. Anderson? That is the sound of inevitability.":
        "./audio/smith-inevitability.mp3",
    "Never send a human to do a machine's job.":
        "./audio/smith-never-send-human.mp3",
};

// Morpheus quotes — active on Morpheus turns in Matrix mode
const morpheusMessages = [
    "The Matrix is everywhere.",
    "I told you I can only show you the door, you have to walk through it.",
    "You have to let it all go, Neo.",
];
const morpheusSounds = {
    "The Matrix is everywhere.":
        "./audio/the-matrix-is-everywhere.mp3",
    "I told you I can only show you the door, you have to walk through it.":
        "./audio/i-told-you-i-can-only-show-you-the-door-you-have-to-walk-through-it.mp3",
    "You have to let it all go, Neo.":
        "./audio/morpheus-you-have-to-let-it-all-go-neo.mp3",
};

// Shared state flags
let matrixModeActive   = false;
let matrixRainRunning  = false;
// Tracks which character spoke last — flips on every new activation.
// Default 'morpheus' so the very first activation uses Smith (original feel).
let matrixCharacter = localStorage.getItem('matrixCharacter') || 'morpheus';

// Restore Matrix mode from a previous page navigation (no rain on restore)
if (localStorage.getItem('matrixMode') === 'true') {
    document.body.classList.add('matrix-mode');
    matrixModeActive = true;
}

// ── Console + code text swaps ─────────────────────────────────
// When Matrix mode is active, replace the home-page console lines
// and their matching code-mockup string literals with Matrix quotes.
// Originals are stashed on the element and restored on deactivate.

const MATRIX_CONSOLE_SWAPS = {
    'Hello':                            'Wake up, Neo.',
    'Welcome to my Portfolio Website!': 'Welcome to the Matrix.',
};
const MATRIX_CODE_SWAPS = {
    '"> Hello"':                             '"> Wake up, Neo."',
    '"> Welcome to my Portfolio Website!"':  '"> Welcome to the Matrix."',
};

function applyMatrixText() {
    // Console: CSS renders text via content: attr(data-text) — just update the attribute
    document.querySelectorAll('.letter-by-letter').forEach(el => {
        const orig = el.getAttribute('data-text');
        if (orig && MATRIX_CONSOLE_SWAPS[orig]) {
            el._matrixOrigText = orig;
            el.setAttribute('data-text', MATRIX_CONSOLE_SWAPS[orig]);
        }
    });
    // Code mockup: plain text nodes inside .text spans (no child elements)
    document.querySelectorAll('.text').forEach(el => {
        if (el.children.length === 0) {
            const orig = el.textContent;
            if (MATRIX_CODE_SWAPS[orig]) {
                el._matrixOrigText = orig;
                el.textContent = MATRIX_CODE_SWAPS[orig];
            }
        }
    });
}

function restoreMatrixText() {
    document.querySelectorAll('.letter-by-letter').forEach(el => {
        if (el._matrixOrigText !== undefined) {
            el.setAttribute('data-text', el._matrixOrigText);
            delete el._matrixOrigText;
        }
    });
    document.querySelectorAll('.text').forEach(el => {
        if (el._matrixOrigText !== undefined) {
            el.textContent = el._matrixOrigText;
            delete el._matrixOrigText;
        }
    });
}

// Inject the floating button and the Matrix exception alert element
document.addEventListener('DOMContentLoaded', () => {
    // If Matrix mode was restored from localStorage, apply all effects now that DOM is ready
    if (matrixModeActive) { applyCodeMasks(); applyMatrixText(); applyMatrixPhoto(); setMatrixFavicon(); stopSnowAnimation(); startBgMatrixRain(); }

    // ── Floating toggle button — rain canvas background + icon span ──
    const btn = document.createElement('button');
    btn.id    = 'matrix-toggle-btn';
    btn.title = matrixModeActive ? 'Exit the Matrix' : 'Enter the Matrix';

    const btnCanvas = document.createElement('canvas');
    btnCanvas.id = 'matrix-btn-canvas';

    const btnIcon = document.createElement('span');
    btnIcon.id          = 'matrix-btn-icon';
    btnIcon.textContent = matrixModeActive ? '×' : '⬡';

    btn.appendChild(btnCanvas);
    btn.appendChild(btnIcon);
    document.body.appendChild(btn);
    startBtnRain();

    btn.addEventListener('click', () => {
        if (matrixRainRunning) return;
        if (!matrixModeActive) {
            startMatrixRain(() => activateMatrixTheme());
        } else {
            matrixRainRunning = true; // block re-clicks during wipe
            matrixExitWipe(() => deactivateMatrixTheme());
        }
    });

    initConsoleTooltips();
    initConsoleNudge();

    // ── Matrix exception alert (separate from the Vader/Smith alert) ──
    const alertEl = document.createElement('div');
    alertEl.id = 'matrix-alert';
    alertEl.innerHTML =
        '<pre id="matrix-alert-message"></pre>' +
        '<button id="matrix-alert-close">[ OK ]</button>';
    document.body.appendChild(alertEl);

    document.getElementById('matrix-alert-close').addEventListener('click', () => {
        alertEl.style.display = 'none';
    });
});

function activateMatrixTheme() {
    document.body.classList.add('matrix-mode');
    matrixModeActive = true;
    localStorage.setItem('matrixMode', 'true');
    const btn = document.getElementById('matrix-toggle-btn');
    document.getElementById('matrix-btn-icon').textContent = '×';
    btn.title = 'Exit the Matrix';
    applyCodeMasks();
    applyMatrixText();
    applyMatrixPhoto();
    setMatrixFavicon();
    stopSnowAnimation();
    startBgMatrixRain();
    showMatrixException();
}

function deactivateMatrixTheme() {
    document.body.classList.remove('matrix-mode');
    matrixModeActive = false;
    localStorage.removeItem('matrixMode');
    removeCodeMasks();
    restoreMatrixText();
    removeMatrixPhoto();
    restoreOriginalFavicon();
    stopBgMatrixRain();
    startSnowAnimation(); // resumes only if December/January
    const btn = document.getElementById('matrix-toggle-btn');
    document.getElementById('matrix-btn-icon').textContent = '⬡';
    btn.title = 'Enter the Matrix';
}

// ── Favicon swap ──────────────────────────────────────────────────────────
// Generates a 32×32 Matrix favicon on a canvas (no extra file needed) and
// swaps the <link rel="icon"> href. Restores the original on deactivate.
function setMatrixFavicon() {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');

    // Black background
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, 32, 32);

    // Outer green glow ring
    ctx.strokeStyle = 'rgba(0,255,65,0.45)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(16, 16, 14, 0, Math.PI * 2);
    ctx.stroke();

    // Green katakana character centred
    ctx.fillStyle = '#00FF41';
    ctx.font = 'bold 22px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = '#00FF41';
    ctx.shadowBlur = 6;
    ctx.fillText('ﾊ', 16, 17);

    const link = document.querySelector("link[rel='icon']");
    if (link) {
        link._originalHref = link.href;
        link.type = 'image/png';
        link.href = canvas.toDataURL('image/png');
    }
}

function restoreOriginalFavicon() {
    const link = document.querySelector("link[rel='icon']");
    if (link && link._originalHref) {
        link.type = 'image/x-icon';
        link.href = link._originalHref;
        delete link._originalHref;
    }
}

// ── Matrix exit wipe ──────────────────────────────────────────────────────
// Each rain column is its own wiper. The canvas starts solid black (hiding
// the instant class removal). As each column's drop falls, it clears its
// own vertical strip from the top down — the rain IS the cleaning agent.
// The cleaning front is organic/ragged (each column at its own speed).
// When every column reaches the bottom the canvas removes itself.
function matrixExitWipe(onComplete) {
    if (document.getElementById('matrix-exit-canvas')) return;

    const W = window.innerWidth;
    const H = window.innerHeight;

    const canvas = document.createElement('canvas');
    canvas.id = 'matrix-exit-canvas';
    canvas.width  = W;
    canvas.height = H;
    Object.assign(canvas.style, {
        position: 'fixed', top: '0', left: '0',
        width: '100vw', height: '100vh',
        zIndex: '99995', pointerEvents: 'none', opacity: '1'
    });
    document.body.appendChild(canvas);
    const ctx = canvas.getContext('2d');

    // Solid black immediately — hides the instant class removal
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, W, H);

    // Remove Matrix mode now (hidden under the black canvas)
    onComplete();

    const CSIZ  = 14;
    const cols  = Math.ceil(W / CSIZ);
    const CHARS = 'ｦｧｨｩｪｫｬｭｮｯｰｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ0123456789';

    // Stagger column starts so the front is ragged, not a flat horizontal line
    const drops  = Array.from({ length: cols }, () => -(Math.random() * 12 + 2));
    const speeds = Array.from({ length: cols }, () => 0.9 + Math.random() * 0.9);

    function frame() {
        // Reset to black each frame — cleared columns will punch through it
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, W, H);

        ctx.font = `bold ${CSIZ}px monospace`;
        let finished = 0;

        for (let i = 0; i < cols; i++) {
            const dropY = drops[i] * CSIZ; // pixel tip of this column's drop

            // Clear from top to drop tip — reveals the clean original site
            if (dropY > 0) {
                ctx.clearRect(i * CSIZ, 0, CSIZ, Math.min(dropY, H));
            }

            // Draw rain chars at and just below the drop tip (on the black zone)
            for (let j = 0; j < 5; j++) {
                const charY = dropY + j * CSIZ;
                if (charY < 0 || charY >= H) continue;
                const ch = CHARS[Math.floor(Math.random() * CHARS.length)];
                if (j === 0) {
                    // Leading character: bright near-white
                    ctx.fillStyle = 'rgba(220,255,220,0.97)';
                } else {
                    ctx.fillStyle = `rgba(0,255,65,${(0.7 - j * 0.14).toFixed(2)})`;
                }
                ctx.fillText(ch, i * CSIZ, charY);
            }

            drops[i] += speeds[i];
            if (drops[i] * CSIZ >= H) finished++;
        }

        if (finished < cols) {
            requestAnimationFrame(frame);
        } else {
            // All columns done — canvas is now fully transparent, remove it
            canvas.remove();
            matrixRainRunning = false;
        }
    }

    requestAnimationFrame(frame);
}

// ── Console button tooltips ───────────────────────────────────────────
// Single tooltip div repositioned on each button's mouseenter.
// Matrix-mode CSS override handles the green styling automatically.

function initConsoleTooltips() {
    const tooltip = document.createElement('div');
    tooltip.className = 'console-btn-tooltip';
    document.body.appendChild(tooltip);

    const labels = {
        minimize: 'Minimize',
        maximize: 'Maximize / Restore',
        close:    'Close'
    };

    document.querySelectorAll('.console-window-header .minimize, .console-window-header .maximize, .console-window-header .close')
        .forEach(btn => {
            const cls = Object.keys(labels).find(c => btn.classList.contains(c));
            if (!cls) return;
            btn.addEventListener('mouseenter', () => {
                const r = btn.getBoundingClientRect();
                tooltip.textContent  = labels[cls];
                tooltip.style.left   = (r.left + r.width / 2) + 'px';
                tooltip.style.top    = (r.bottom + 6) + 'px';
                tooltip.classList.add('visible');
            });
            btn.addEventListener('mouseleave', () => tooltip.classList.remove('visible'));
        });
}

// ── One-time nudge ────────────────────────────────────────────────────
// Appears 2 s after first visit, pulses for ~3 s, fades out.
// localStorage flag prevents it from ever showing again.

function initConsoleNudge() {
    if (localStorage.getItem('consoleNudgeSeen')) return;
    const closeBtn = document.querySelector('.console-window-header .close');
    if (!closeBtn) return;

    const nudge = document.createElement('div');
    nudge.className  = 'console-nudge';
    nudge.textContent = '// try the buttons ↑';
    document.body.appendChild(nudge);

    // Position below the close button, right-edge aligned with it
    function position() {
        const r = closeBtn.getBoundingClientRect();
        nudge.style.top   = (r.bottom + 8) + 'px';
        nudge.style.right = (window.innerWidth - r.right) + 'px';
    }

    setTimeout(() => {
        position();
        nudge.classList.add('visible');

        // Pulse after fade-in settles
        setTimeout(() => nudge.classList.add('pulsing'), 450);

        // Fade out after pulse completes (~3 s of pulsing = 4 × 0.75 s)
        setTimeout(() => {
            nudge.classList.remove('pulsing');
            nudge.classList.add('fading');
            setTimeout(() => {
                nudge.remove();
                localStorage.setItem('consoleNudgeSeen', 'true');
            }, 400);
        }, 3600);
    }, 2000);
}

// ── Button rain — mini Matrix rain that lives inside the toggle button ──
// Runs permanently (both modes) so the button always feels alive.
// The canvas is sized to the button's actual pixel dimensions on first call.

let _btnRainId = null;

function startBtnRain() {
    const canvas = document.getElementById('matrix-btn-canvas');
    if (!canvas) return;
    const btn  = document.getElementById('matrix-toggle-btn');
    const size = btn ? (btn.offsetWidth || 45) : 45;
    canvas.width  = size;
    canvas.height = size;

    const ctx      = canvas.getContext('2d');
    const CSIZ     = 7;
    const cols     = Math.floor(size / CSIZ);
    const CHARS    = 'ｦｧｨｩｪｫｬｭｮｯｰｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ0123456789';
    // Start drops at random positions so columns don't all begin together
    const drops = Array.from({ length: cols }, () => Math.random() * -(size / CSIZ));

    let last = 0;
    const TICK = 1000 / 16; // ~16 fps — enough for the small canvas

    function frame(ts) {
        _btnRainId = requestAnimationFrame(frame);
        if (ts - last < TICK) return;
        last = ts;

        // Fade trail
        ctx.fillStyle = 'rgba(0,0,0,0.25)';
        ctx.fillRect(0, 0, size, size);

        ctx.font = `bold ${CSIZ}px monospace`;
        for (let i = 0; i < cols; i++) {
            const ch = CHARS[Math.floor(Math.random() * CHARS.length)];
            const x  = i * CSIZ;
            const y  = Math.floor(drops[i]) * CSIZ;
            // Leading character is bright white, trail is green
            ctx.fillStyle = (Math.floor(drops[i]) === Math.floor(drops[i])) ? '#afffaf' : '#00FF41';
            ctx.fillStyle = '#00FF41';
            ctx.fillText(ch, x, y);
            // Bright head
            if (drops[i] > 0) {
                ctx.fillStyle = '#ffffff';
                ctx.fillText(ch, x, y);
            }
            if (y > size && Math.random() > 0.975) drops[i] = 0;
            drops[i] += 0.6;
        }
    }
    _btnRainId = requestAnimationFrame(frame);
}

// ── Matrix photo — character mosaic of the profile portrait ───────────
// Half-width katakana + digits (same charset as the rain).
// Each grid cell maps one sampled pixel's luminance → green brightness.
// A shimmer interval flips ~6 % of cells every 80 ms so the portrait
// feels alive without repainting the entire canvas each tick.

const PHOTO_CHARS = 'ｦｧｨｩｪｫｬｭｮｯｰｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ0123456789';
let _matrixPhotoInterval = null;

function _randPhotoChar() {
    return PHOTO_CHARS[Math.floor(Math.random() * PHOTO_CHARS.length)];
}

function applyMatrixPhoto() {
    const img = document.querySelector('.picture img');
    if (!img) return;

    function render() {
        const displayW = img.offsetWidth  || img.naturalWidth  || 320;
        const displayH = img.offsetHeight || img.naturalHeight || 320;

        // Read source pixels from an offscreen canvas
        const off  = document.createElement('canvas');
        off.width  = displayW;
        off.height = displayH;
        const octx = off.getContext('2d');
        octx.drawImage(img, 0, 0, displayW, displayH);
        const px = octx.getImageData(0, 0, displayW, displayH).data;

        // Responsive cell size: ~40 columns at any screen width, min 5 px
        const CELL = Math.max(5, Math.floor(displayW / 40));
        const FONT = CELL - 1;
        const cols = Math.ceil(displayW / CELL);
        const rows = Math.ceil(displayH / CELL);

        // S-curve contrast boost: crushes shadows, blows highlights
        // so facial features (dark glasses/hair vs. bright skin) separate clearly.
        function contrastLum(raw) {
            const t = raw / 255;
            const boosted = Math.max(0, Math.min(1, (t - 0.5) * 3.2 + 0.5));
            return boosted * 255;
        }

        // Build cell list with pre-computed colour so shimmer is fast
        const cells = [];
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const cx = Math.min(c * CELL + 4, displayW  - 1);
                const cy = Math.min(r * CELL + 4, displayH - 1);
                const i  = (cy * displayW + cx) * 4;
                const rawLum = 0.299 * px[i] + 0.587 * px[i + 1] + 0.114 * px[i + 2];
                const lum   = contrastLum(rawLum);
                const green = Math.round(30 + lum * (225 / 255));
                const alpha = +(Math.min(1, lum / 255 * 0.85 + 0.15)).toFixed(3);
                cells.push({ x: c * CELL, y: r * CELL, lum, green, alpha, ch: _randPhotoChar() });
            }
        }

        // Create the display canvas
        const canvas    = document.createElement('canvas');
        canvas.id       = 'matrix-photo-canvas';
        canvas.width    = displayW;
        canvas.height   = displayH;
        const cs        = getComputedStyle(img);
        canvas.style.borderRadius = cs.borderRadius;
        canvas.style.width        = cs.width;
        canvas.style.height       = cs.height;
        canvas.style.display      = 'block';

        const ctx = canvas.getContext('2d');
        ctx.font         = `bold ${FONT}px monospace`;
        ctx.textBaseline = 'top';

        // Full first draw
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, displayW, displayH);
        for (const c of cells) {
            if (c.lum < 8) continue;  // true black → invisible (keep dark areas dark)
            ctx.fillStyle = `rgba(0,${c.green},${Math.round(c.green * 0.14)},${c.alpha})`;
            ctx.fillText(c.ch, c.x, c.y);
        }

        img.style.display = 'none';
        img.parentNode.insertBefore(canvas, img);

        // Shimmer — only repaint changed cells (no full canvas clear needed)
        const shimmerN = Math.max(1, Math.ceil(cells.length * 0.06));
        _matrixPhotoInterval = setInterval(() => {
            for (let i = 0; i < shimmerN; i++) {
                const cell = cells[Math.floor(Math.random() * cells.length)];
                cell.ch = _randPhotoChar();
                // Erase old glyph then paint new one
                ctx.fillStyle = '#000';
                ctx.fillRect(cell.x, cell.y, CELL, CELL);
                if (cell.lum >= 8) {
                    ctx.fillStyle = `rgba(0,${cell.green},${Math.round(cell.green * 0.14)},${cell.alpha})`;
                    ctx.fillText(cell.ch, cell.x, cell.y);
                }
            }
        }, 80);
    }

    if (img.complete && img.naturalWidth > 0) {
        render();
    } else {
        img.addEventListener('load', render, { once: true });
    }
}

function removeMatrixPhoto() {
    clearInterval(_matrixPhotoInterval);
    _matrixPhotoInterval = null;
    const canvas = document.getElementById('matrix-photo-canvas');
    if (canvas) canvas.remove();
    const img = document.querySelector('.picture img');
    if (img) img.style.display = '';
}

// ── Code — radar + per-row glitch, perfectly synchronised ─────
// The radar band (CSS ::after on .app-container) sweeps top→bottom
// in RADAR_DURATION_S seconds.  For each row we measure its actual
// pixel position, calculate the exact moment the band centre crosses
// it, then set animation-delay so the glitch peak fires at that same
// instant.  Both animations share the same cycle — they are locked.

const RADAR_DURATION_S = 3.5;   // must match CSS animation-duration on ::after
const GLITCH_PEAK_FRAC = 0.105; // midpoint of 9%–12% keyframe window = peak of glitch

function applyCodeMasks() {
    const container = document.querySelector('.app-container');
    if (!container) return;

    const rows = [...document.querySelectorAll('.code-row')];
    if (!rows.length) return;

    // Force layout so offsetHeight / offsetTop reflect the current CSS
    const containerHeight = container.offsetHeight;
    const fontSize        = parseFloat(getComputedStyle(document.documentElement).fontSize);
    const bandHeightPx    = 6 * fontSize;          // 6em in pixels — matches CSS height

    // Radar centre travels from -bandHeight/2 (above) to containerHeight+bandHeight/2 (below)
    const radarStart = -bandHeightPx / 2;
    const radarEnd   =  containerHeight + bandHeightPx / 2;
    const radarRange =  radarEnd - radarStart;

    rows.forEach(row => {
        const li = row.querySelector('li');
        if (!li) return;

        // Row centre relative to .app-container (offsetParent when position:relative)
        const rowCentre = row.offsetTop + row.offsetHeight / 2;

        // When (in seconds) does the radar centre pass this row?
        const hitTime = RADAR_DURATION_S * (rowCentre - radarStart) / radarRange;

        // CSS delay that puts the glitch peak exactly at hitTime
        // Negative delay = animation is already N seconds in at t=0
        const delay = hitTime - GLITCH_PEAK_FRAC * RADAR_DURATION_S;

        li.style.animation      = `matrix-row-glitch ${RADAR_DURATION_S}s linear infinite backwards`;
        li.style.animationDelay = `${delay.toFixed(3)}s`;
    });
}

function removeCodeMasks() {
    document.querySelectorAll('.code-row li').forEach(li => {
        li.style.animation      = '';
        li.style.animationDelay = '';
    });
}

function showMatrixException() {
    const alertEl = document.getElementById('matrix-alert');
    const msg = document.getElementById('matrix-alert-message');
    if (!alertEl || !msg) return;

    msg.innerHTML =
        '<span style="color:#00FF41;font-weight:bold;">System.ItWorksOnMyMachineException</span>\n' +
        '<span class="dim">--------------------------------------------------</span>\n' +
        'Unhandled exception in Ivan-Marinov-Portfolio.exe\n\n' +
        '  Code executed successfully in local environment.\n' +
        '  Production is someone else\'s problem.\n\n' +
        '<span class="dim">Stack trace:</span>\n' +
        '<span class="dim">   at Ivan_Marinov_Portfolio.Matrix.Activate()          Matrix.cs:line 1</span>\n' +
        '<span class="dim">   at Ivan_Marinov_Portfolio.Visitor.TriggerEasterEgg() Easter.cs:line 42</span>\n' +
        '<span class="dim">   at Ivan_Marinov_Portfolio.Home.SayHello()            Home.cs:line 1337</span>\n\n' +
        'Press F5 to continue, or CTRL+ALT+DEL to throw it away.';

    alertEl.style.display = 'block';
}

function startMatrixRain(onComplete) {
    matrixRainRunning = true;

    // Reuse or create the canvas element
    let canvas = document.getElementById('matrix-canvas');
    if (!canvas) {
        canvas = document.createElement('canvas');
        canvas.id = 'matrix-canvas';
        document.body.appendChild(canvas);
    }

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.style.display = 'block';
    canvas.style.opacity = '1';

    // Katakana + alphanumeric + code symbols for authenticity
    const chars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEF<>{}[];';
    const fontSize = 16;
    const columns = Math.floor(canvas.width / fontSize);
    const drops = Array(columns).fill(1);

    let startTime = null;
    let themeActivated = false;
    const RAIN_MS   = 3500; // active rain duration
    const FADE_MS   = 1000; // fade-out duration

    function draw(timestamp) {
        if (!startTime) startTime = timestamp;
        const elapsed = timestamp - startTime;

        // All done — hide canvas
        if (elapsed >= RAIN_MS + FADE_MS) {
            canvas.style.opacity = '0';
            canvas.style.display = 'none';
            matrixRainRunning = false;
            return;
        }

        // Fire theme switch at the START of the fade so it's already applied
        // as the rain clears — no delay between rain ending and theme appearing
        if (elapsed >= RAIN_MS && !themeActivated) {
            themeActivated = true;
            if (onComplete) onComplete();
        }

        // Fade out during last second
        if (elapsed >= RAIN_MS) {
            canvas.style.opacity = String(1 - (elapsed - RAIN_MS) / FADE_MS);
        }

        // Trail effect: semi-transparent black over previous frame
        ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.font = `${fontSize}px "Space Mono", monospace`;

        for (let i = 0; i < drops.length; i++) {
            const char = chars[Math.floor(Math.random() * chars.length)];
            // Randomly flash a character white-hot; the rest are Matrix green
            ctx.fillStyle = (Math.random() > 0.98) ? '#FFFFFF' : '#00FF41';
            ctx.fillText(char, i * fontSize, drops[i] * fontSize);

            // Reset drop to top once it reaches the bottom (with randomness)
            if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                drops[i] = 0;
            }
            drops[i]++;
        }

        requestAnimationFrame(draw);
    }

    requestAnimationFrame(draw);
}