document.addEventListener("DOMContentLoaded", function () {
  var elements = document.querySelectorAll('.letter-by-letter');

  function animate(index) {
    if (index < elements.length) {
      elements[index].style.visibility = 'visible'; // Reveal the content
      elements[index].style.animation = 'none'; // Reset animation
      void elements[index].offsetWidth; // Trigger reflow
      elements[index].style.animation = null; // Clear inline style
      elements[index].style.animationDelay = 'calc(1s * var(--index))'; // Reset animation delay
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


  let isMaximized = false;
  let isFontSizeChanged = false;

  function changeFontSize(newFontSize) {
    h1Elements.forEach((h1, index) => {
      if (!h1.dataset.originalFontSize) {
        h1.dataset.originalFontSize = window.getComputedStyle(h1).fontSize;
      }
      h1.style.fontSize = newFontSize;
      if (index === 0) {
        h1.style.paddingTop = '2em';
      } else {
        h1.style.paddingTop = '';
      }
    });
  }

  function revertToOriginalFontSize() {
    h1Elements.forEach((h1) => {
      h1.style.fontSize = h1.dataset.originalFontSize;
      h1.style.paddingTop = '';
    });
  }

  maximizeButton.addEventListener('click', () => {
    const screenWidth = window.innerWidth;
    if (screenWidth >= 1910 && screenWidth <= 2560) {
      if (!isMaximized) {
        consoleHeader.style.width = '85%';
        consoleWindow.style.width = '85%';
        consoleWindow.style.height = '30em';
        isMaximized = true;
      } else {
        consoleHeader.style.width = '';
        consoleHeader.style.height = '';
        consoleWindow.style.width = '';
        consoleWindow.style.height = '';
        isMaximized = false;
      }

      if (!isFontSizeChanged) {
        changeFontSize('3em');
        isFontSizeChanged = true;
      } else {
        revertToOriginalFontSize();
        isFontSizeChanged = false;
      }
    } else {
      showAlert('Screen width should be between 1910px and 2560px to maximize this window ! ');
    }
  });
});

document.addEventListener('DOMContentLoaded', () => {
  const maximizeButton = document.querySelector('.maximize');
  const consoleHeader = document.querySelector('.console-window-header');
  const consoleWindow = document.querySelector('.console-window');
  const h2Elements = document.querySelectorAll('.console-window h2');
  const picture = document.querySelector('.picture');

  let isMaximized = false;
  let isFontSizeChanged = false;

  function changeFontSize(newFontSize) {
    h2Elements.forEach((h2, index) => {
      if (!h2.dataset.originalFontSize) {
        h2.dataset.originalFontSize = window.getComputedStyle(h2).fontSize;
      }
      h2.style.fontSize = newFontSize;
      picture.style.display = "none";
      if (index === 0) {
        h2.style.paddingTop = '1em'; // Change the padding top
      } else {
        h2.style.paddingTop = ''; // Revert padding top to default
      }
    });
  }

  function revertToOriginalFontSize() {
    h2Elements.forEach((h2) => {
      h2.style.fontSize = h2.dataset.originalFontSize;
      h2.style.paddingTop = ''; // Revert padding top to default
      picture.style.display = "flex";
    });
  }

  maximizeButton.addEventListener('click', () => {
    const screenWidth = window.innerWidth;
    if (screenWidth >= 1910 && screenWidth <= 2560) {
      if (!isMaximized) {
        consoleHeader.style.width = '85%';
        consoleWindow.style.width = '85%';
        consoleWindow.style.height = '35em';
        isMaximized = true;
      } else {
        consoleHeader.style.width = '';
        consoleHeader.style.height = '';
        consoleWindow.style.width = '';
        consoleWindow.style.height = '';
        isMaximized = false;
      }

      if (!isFontSizeChanged) {
        changeFontSize('2em');
        isFontSizeChanged = true;
      } else {
        revertToOriginalFontSize();
        isFontSizeChanged = false;
      }
    } else {
      showAlert('Screen width should be between 1910px and 2560px to maximize this window !');
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
  const closeAlertButton = document.getElementById('closeAlertButton');
  const customAlert = document.getElementById('customAlert');
  const alertMessage = document.getElementById('alertMessage');
  const customAlertPicture = document.getElementById('customAlertPicture');

  // Function to show the exit alert
  const showExitAlert = (message) => {
    alertMessage.textContent = message;
    customAlert.style.display = 'block';
    customAlertPicture.style.display = 'inline';

    const audioFile = exitSounds[message];
    const exitSound = new Audio(audioFile);

    if (audioFile) {
      isAudioPlaying = true;
      closeIcon.disabled = true; // Disable close button while sound is playing
      exitSound.volume = 0.3;
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
      const randomIndex = Math.floor(Math.random() * exitMessages.length);
      const randomMessage = exitMessages[randomIndex];
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

const canvas = document.getElementById("snow-canvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const snowflakes = [];
const maxSnowflakes = 200;

function createSnowflake() {
    return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 4 + 1,
        speed: Math.random() * 3 + 1,
        wind: Math.random() * 2 - 1,
    };
}

for (let i = 0; i < maxSnowflakes; i++) {
    snowflakes.push(createSnowflake());
}

function drawSnowflakes() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "white";
    ctx.beginPath();
    for (const flake of snowflakes) {
        ctx.moveTo(flake.x, flake.y);
        ctx.arc(flake.x, flake.y, flake.radius, 0, Math.PI * 2);
    }
    ctx.fill();
}

function updateSnowflakes() {
    for (const flake of snowflakes) {
        flake.y += flake.speed;
        flake.x += flake.wind;

        if (flake.y > canvas.height) {
            flake.y = 0;
            flake.x = Math.random() * canvas.width;
        }

        if (flake.x > canvas.width) {
            flake.x = 0;
        } else if (flake.x < 0) {
            flake.x = canvas.width;
        }
    }
}

function loop() {
    drawSnowflakes();
    updateSnowflakes();
    requestAnimationFrame(loop);
}

loop();

window.addEventListener("resize", () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});
