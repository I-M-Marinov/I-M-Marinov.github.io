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