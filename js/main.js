// Loader with AOS initialization
window.addEventListener("load", () => {
  const loader = document.getElementById("loader");
  if (!loader) return;

  // Don't initialize AOS yet - wait for loader to finish
  setTimeout(() => {
    loader.style.opacity = "0";
    setTimeout(() => {
      loader.remove();

      // Now initialize AOS AFTER loader is completely removed
      AOS.init({
        mirror: true,
        once: true,
      });

      document.querySelectorAll(".nav-link").forEach((tab) => {
        tab.addEventListener("click", function () {
          setTimeout(() => {
            AOS.refresh();
          }, 350); // Wait for fade animation to complete
        });
      });
    }, 300); // This matches the CSS transition time
  }, 1500);
});
// Navbar scroll effect
$(document).ready(function () {
  const topbar = $(".topbar");
  const navbar = $(".navbar");
  const topbarHeight = topbar.outerHeight();
  const navbarToggler = $(".navbar-light.navbar-toggler-icon");
  $(window).scroll(function () {
    const scrollPosition = $(window).scrollTop();

    if (scrollPosition >= topbarHeight) {
      // Add fixed class when scrolled past topbar
      navbar.addClass("navbar-fixed");
    } else {
      // Remove fixed class when at top
      navbar.removeClass("navbar-fixed");
    }
  });
});

// back-to-top
document.querySelector(".back-to-top").addEventListener("click", () => {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
});
// video player
const videoPlayer = document.querySelector(".video-player");
const videoOverlay = document.getElementById("videoOverlay");

// Add this check
if (!videoPlayer || !videoOverlay) {
  console.error("Video player or overlay not found!");
}

videoOverlay.addEventListener("click", function () {
  this.style.display = "none";

  videoPlayer
    .play()
    .then(() => {
      console.log("Video playing successfully");
    })
    .catch((error) => {
      console.error("Error playing video:", error);
    });

  videoPlayer.setAttribute("controls", "controls");
  document.querySelector(".upper-overlay").style.display = "none";
});

videoPlayer.addEventListener("ended", function () {
  videoOverlay.style.display = "block";
  videoPlayer.removeAttribute("controls");
});
