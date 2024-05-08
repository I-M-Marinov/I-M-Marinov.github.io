document.addEventListener("DOMContentLoaded", function() {
  var elements = document.querySelectorAll('.letter-by-letter');

  function animate(index) {
    if (index < elements.length) {
      elements[index].style.visibility = 'visible'; // Reveal the content
      elements[index].style.animation = 'none'; // Reset animation
      void elements[index].offsetWidth; // Trigger reflow
      elements[index].style.animation = null; // Clear inline style
      elements[index].style.animationDelay = 'calc(1s * var(--index))'; // Reset animation delay
      elements[index].addEventListener('animationend', function() {
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

