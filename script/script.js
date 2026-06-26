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
        animate(index + 1);
      });
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
    // Swap alert picture: Agent Smith in Matrix mode, Vader otherwise
    customAlertPicture.src = matrixModeActive
        ? './images/alert-picture/agent-smith.jpg'
        : './images/alert-picture/alert-picture.jpg';

    // Use Smith sounds when Matrix mode is active, Vader sounds otherwise
    const activeSounds = matrixModeActive ? smithSounds : exitSounds;
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
      // Pick from Smith or Vader depending on active theme
      const activeMessages = matrixModeActive ? smithMessages : exitMessages;
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

      requestAnimationFrame(animateSnowflakes);
  }

  animateSnowflakes();
}

startSnowAnimation();

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

// Shared state flags
let matrixModeActive = false;
let matrixRainRunning = false;

// Restore Matrix mode from a previous page navigation (no rain on restore)
if (localStorage.getItem('matrixMode') === 'true') {
    document.body.classList.add('matrix-mode');
    matrixModeActive = true;
}

// Inject the floating button and the Matrix exception alert element
document.addEventListener('DOMContentLoaded', () => {
    // ── Floating toggle button — icon reflects restored state ──
    const btn = document.createElement('button');
    btn.id = 'matrix-toggle-btn';
    btn.title = matrixModeActive ? 'Exit the Matrix' : 'Enter the Matrix';
    btn.textContent = matrixModeActive ? '×' : '⬡';
    document.body.appendChild(btn);

    btn.addEventListener('click', () => {
        if (matrixRainRunning) return;
        if (!matrixModeActive) {
            startMatrixRain(() => activateMatrixTheme());
        } else {
            deactivateMatrixTheme();
        }
    });

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
    btn.textContent = '×';
    btn.title = 'Exit the Matrix';
    showMatrixException();
}

function deactivateMatrixTheme() {
    document.body.classList.remove('matrix-mode');
    matrixModeActive = false;
    localStorage.removeItem('matrixMode');
    const btn = document.getElementById('matrix-toggle-btn');
    btn.textContent = '⬡';
    btn.title = 'Enter the Matrix';
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