const translationsUrl = "data/translations.json";

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

  document.body.classList.remove("is-loading");
  document.getElementById("app-content").hidden = false;

  document.querySelectorAll(".lang-btn").forEach(button => {
    button.addEventListener("click", () => {
      applyLanguage(button.dataset.lang, translations);
    });
  });
}

document.getElementById("registryButton").addEventListener("click", event => {
  event.preventDefault();
  alert("Connect this button to the official registration page of your chosen legitimate stem cell donor registry.");
});

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
