document.addEventListener("DOMContentLoaded", () => {
  // 0. Automatically update the footer year
  const currentYearEl = document.getElementById("currentYear");
  if (currentYearEl) {
    currentYearEl.textContent = new Date().getFullYear();
  }

  // 1. Mobile menu toggle
  const menuToggle = document.getElementById("menuToggle");
  const navLinks = document.getElementById("navLinks");

  if (menuToggle && navLinks) {
    menuToggle.addEventListener("click", (e) => {
      e.stopPropagation();
      const isOpen = navLinks.classList.toggle("open");
      menuToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });

    navLinks.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        navLinks.classList.remove("open");
        menuToggle.setAttribute("aria-expanded", "false");
      });
    });

    document.addEventListener("click", (e) => {
      if (!navLinks.contains(e.target) && !menuToggle.contains(e.target)) {
        navLinks.classList.remove("open");
        menuToggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  // 2. Interactive Hero Loan Estimator
  const amountSlider = document.getElementById("amountSlider");
  const sliderDisplay = document.getElementById("sliderDisplay");
  const weeklyEstimate = document.getElementById("weeklyEstimate");
  const periodBtns = document.querySelectorAll(".period-btn");
  const useEstimateBtn = document.getElementById("useEstimateBtn");
  const amountInput = document.getElementById("amount");

  let selectedWeeks = 4;

  function updateCalculator() {
    if (!amountSlider || !sliderDisplay || !weeklyEstimate) return;

    const principal = Number(amountSlider.value);
    sliderDisplay.textContent = `$${principal.toLocaleString()} USD`;

    const rateFactor = 1 + (selectedWeeks / 4) * 0.14;
    const weekly = (principal * rateFactor) / selectedWeeks;

    weeklyEstimate.textContent = `$${weekly.toFixed(2)} / wk`;
  }

  if (amountSlider) {
    amountSlider.addEventListener("input", updateCalculator);
  }

  periodBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      periodBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      selectedWeeks = Number(btn.dataset.weeks);
      updateCalculator();
    });
  });

  if (useEstimateBtn && amountSlider && amountInput) {
    useEstimateBtn.addEventListener("click", () => {
      amountInput.value = amountSlider.value;
    });
  }

  updateCalculator();

  // 3. Loan Category Tabs
  const tabBtns = document.querySelectorAll(".tab-btn");
  const tabContents = document.querySelectorAll(".tab-content");

  tabBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      tabBtns.forEach((b) => b.classList.remove("active"));
      tabContents.forEach((c) => c.classList.remove("active"));

      btn.classList.add("active");

      const targetTab = document.getElementById(btn.dataset.tab);

      if (targetTab) {
        targetTab.classList.add("active");
      }
    });
  });

  // 4. Pre-select loan type when clicking a loan card
  const loanSelect = document.getElementById("loanType");

  document.querySelectorAll(".card-link").forEach((link) => {
    link.addEventListener("click", () => {
      const selectedLoan = link.dataset.loan;

      if (selectedLoan && loanSelect) {
        loanSelect.value = selectedLoan;
      }
    });
  });

  // 5. Customer GPS Location Detection
  const locationInput = document.getElementById("location");
  const locationButton = document.getElementById("useCurrentLocation");
  const locationStatus = document.getElementById("locationStatus");

  let customerCoordinates = null;

  if (locationButton && locationInput && locationStatus) {
    locationButton.addEventListener("click", () => {
      if (!navigator.geolocation) {
        locationStatus.textContent =
          "Your browser does not support GPS location detection. Please enter your location manually.";
        return;
      }

      locationButton.disabled = true;
      locationButton.textContent = "Detecting Location...";
      locationStatus.textContent =
        "Please allow location access when your browser asks for permission.";

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const latitude = position.coords.latitude;
          const longitude = position.coords.longitude;

          customerCoordinates = {
            latitude: latitude,
            longitude: longitude
          };

          locationInput.value = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
          locationStatus.textContent =
            "Location detected successfully. Your GPS coordinates will be included in your WhatsApp enquiry.";

          locationButton.disabled = false;
          locationButton.textContent = "Location Detected ✓";
        },
        (error) => {
          customerCoordinates = null;

          let errorMessage =
            "Unable to detect your location. Please enter it manually.";

          if (error.code === error.PERMISSION_DENIED) {
            errorMessage =
              "Location permission was denied. Please allow location access in your browser settings or enter your location manually.";
          } else if (error.code === error.POSITION_UNAVAILABLE) {
            errorMessage =
              "Your current location is unavailable. Please try again or enter it manually.";
          } else if (error.code === error.TIMEOUT) {
            errorMessage =
              "Location detection took too long. Please try again.";
          }

          locationStatus.textContent = errorMessage;
          locationButton.disabled = false;
          locationButton.textContent = "Try Again";
        },
        {
          enableHighAccuracy: true,
          timeout: 20000,
          maximumAge: 0
        }
      );
    });
  }

  // Clear saved GPS coordinates if the user edits location manually
  if (locationInput) {
    locationInput.addEventListener("input", () => {
      customerCoordinates = null;

      if (locationStatus) {
        locationStatus.textContent =
          "Location entered manually. You can use the GPS button to detect your current location.";
      }

      if (locationButton) {
        locationButton.textContent = "Use My Current Location";
      }
    });
  }

  // 6. Send Loan Enquiry Form via WhatsApp
  const loanForm = document.getElementById("loanForm");

  if (loanForm) {
    loanForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const name = document.getElementById("fullName").value.trim();
      const phone = document.getElementById("phone").value.trim();
      const loanType = document.getElementById("loanType").value;
      const amount = document.getElementById("amount").value.trim();
      const location =
        (locationInput && locationInput.value.trim()) || "Not specified";

      let message =
        "Hello Charisma Bridge Capital, I would like to apply for a loan:\n\n" +
        `*Name:* ${name}\n` +
        `*Phone:* ${phone}\n` +
        `*Loan Type:* ${loanType}\n` +
        `*Amount Needed:* $${amount} USD\n` +
        `*Location:* ${location}`;

      if (customerCoordinates) {
        const latitude = customerCoordinates.latitude;
        const longitude = customerCoordinates.longitude;
        const mapsLink = `https://www.google.com/maps?q=${latitude},${longitude}`;

        message +=
          "\n\n*GPS Coordinates:*\n" +
          `Latitude: ${latitude}\n` +
          `Longitude: ${longitude}\n` +
          `*View Customer Location:* ${mapsLink}`;
      }

      const waNumber = "263774936425";
      const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`;

      window.open(waUrl, "_blank", "noopener,noreferrer");
    });
  }
});