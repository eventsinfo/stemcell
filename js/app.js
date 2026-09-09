const translationsUrl = new URL("data/translations.json", document.baseURI).href;

history.scrollRestoration = "manual";
const navigationEntry = performance.getEntriesByType("navigation")[0];
if (navigationEntry?.type === "reload") {
  if (window.location.hash) {
    window.history.replaceState(null, document.title, `${window.location.pathname}${window.location.search}`);
  }
  window.scrollTo(0, 0);
}

function waitForPageAssets() {
  document.querySelectorAll("img").forEach(image => {
    image.loading = "eager";
  });

  const imagePromises = Array.from(document.images).map(image => {
    if (image.complete) return image.decode ? image.decode().catch(() => {}) : Promise.resolve();

    return new Promise(resolve => {
      image.addEventListener("load", resolve, { once: true });
      image.addEventListener("error", resolve, { once: true });
    }).then(() => (image.decode ? image.decode().catch(() => {}) : undefined));
  });

  return Promise.all([
    document.fonts ? document.fonts.ready : Promise.resolve(),
    ...imagePromises
  ]);
}

function finishLoading() {
  const loader = document.querySelector(".match-loader");

  return new Promise(resolve => {
    let finished = false;
    const complete = () => {
      if (finished) return;
      finished = true;
      document.body.classList.remove("is-loading");
      resolve();
    };

    loader.classList.add("is-exiting");
    loader.addEventListener("animationend", complete, { once: true });
    window.setTimeout(complete, 700);
  });
}

function applyLanguage(lang, translations) {
  const dict = translations[lang] || translations.ml;

  document.querySelectorAll("[data-i18n]").forEach(element => {
    const key = element.getAttribute("data-i18n");
    if (dict[key] !== undefined) element.textContent = dict[key];
  });

  document.documentElement.setAttribute("lang", lang);
  document.body.classList.toggle("lang-en", lang === "en");
  document.querySelectorAll(".lang-btn").forEach(button => {
    button.setAttribute("aria-pressed", String(button.dataset.lang === lang));
  });

  try {
    localStorage.setItem("matchhope-lang", lang);
  } catch (error) {
    // Storage can be unavailable in privacy-restricted browsers.
  }
}

async function init() {
  const response = await fetch(translationsUrl);
  const translations = await response.json();
  let savedLanguage = "ml";

  try {
    savedLanguage = localStorage.getItem("matchhope-lang") || "ml";
  } catch (error) {
    // Use Malayalam when storage is unavailable.
  }

  applyLanguage(savedLanguage, translations);
  await waitForPageAssets();
  await finishLoading();

  document.querySelectorAll(".lang-btn").forEach(button => {
    button.addEventListener("click", () => {
      applyLanguage(button.dataset.lang, translations);
    });
  });
}

const calendarBtn = document.getElementById("calendarButton");
if (calendarBtn) {
  calendarBtn.addEventListener("click", () => {
    const calendarUrl = new URL("https://calendar.google.com/calendar/render");
    calendarUrl.searchParams.set("action", "TEMPLATE");
    calendarUrl.searchParams.set("text", "Mega Stem Cell Donor Registration Camp");
    calendarUrl.searchParams.set("dates", "20260927T033000Z/20260927T113000Z");
    calendarUrl.searchParams.set(
      "details",
      "Mega Stem Cell Donor Registration Camp organized by Snehatheeram Volunteer Wing for Rafiya Sherin and others. Painless 1-minute cheek swab, no needles or blood test. Eligible age: 18-55. Helplines: 80863 46346 / 94962 46004."
    );
    calendarUrl.searchParams.set("location", "SSM Polytechnic College, Tirur, Malappuram Dt.");
    window.location.assign(calendarUrl.href);
  });
}

const countdownTarget = Date.UTC(2026, 8, 27, 3, 30, 0);
const countdownElements = {
  days: document.getElementById("countdownDays"),
  hours: document.getElementById("countdownHours"),
  minutes: document.getElementById("countdownMinutes"),
  seconds: document.getElementById("countdownSeconds")
};

function updateCountdown() {
  const remaining = Math.max(0, countdownTarget - Date.now());
  const totalSeconds = Math.floor(remaining / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  countdownElements.days.textContent = String(days).padStart(2, "0");
  countdownElements.hours.textContent = String(hours).padStart(2, "0");
  countdownElements.minutes.textContent = String(minutes).padStart(2, "0");
  countdownElements.seconds.textContent = String(seconds).padStart(2, "0");

  if (remaining === 0) {
    document.querySelector(".drive-countdown-label").textContent =
      document.documentElement.lang === "en" ? "Event started" : "ക്യാമ്പ് ആരംഭിച്ചു";
    window.clearInterval(countdownTimer);
  }
}

const countdownTimer = window.setInterval(updateCountdown, 1000);
updateCountdown();

function setFaqState(item, isOpen) {
  item.classList.toggle("is-open", isOpen);
  item.querySelector(".faq-question").setAttribute("aria-expanded", String(isOpen));
}

document.querySelectorAll(".faq-item").forEach(item => {
  item.querySelector(".faq-question").addEventListener("click", () => {
    const isOpen = item.classList.contains("is-open");
    document.querySelectorAll(".faq-item").forEach(other => {
      if (other !== item) setFaqState(other, false);
    });
    setFaqState(item, !isOpen);
  });
});

init().catch(error => {
  console.error("Unable to load translations.", error);
});
