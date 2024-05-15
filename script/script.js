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
        h2.style.paddingTop = '3em'; // Change the padding top
      } else {
        h2.style.paddingTop = ''; // Revert padding top to default
      }
    });
  }

  function revertToOriginalFontSize() {
    h2Elements.forEach((h2) => {
      h2.style.fontSize = h2.dataset.originalFontSize;
      h2.style.paddingTop = ''; // Revert padding top to default
      picture.style.display = "block";
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
        changeFontSize('2em');
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

function showExitAlert(message) {
  const customAlert = document.getElementById('customAlert');
  const alertMessage = document.getElementById('alertMessage');
  const closeAlert = document.getElementById('closeAlertButton');

  alertMessage.textContent = message;
  customAlert.style.display = 'block';

  closeAlert.addEventListener('click', () => {
    customAlert.style.display = 'none';
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const closeIcon = document.querySelector('.close');

  closeIcon.addEventListener('click', () => {
    showExitAlert(`Don't fail me again, Admiral.`);
  })
});