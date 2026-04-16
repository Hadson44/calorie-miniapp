(() => {
  const PROFILE_KEY = "neon_calorie_profile";
  let greetingApplied = false;

  function demoteProfile() {
    try {
      const raw = localStorage.getItem(PROFILE_KEY);
      const profile = raw ? JSON.parse(raw) : {};
      if (profile && typeof profile === "object") {
        profile.onboarded = false;
        localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
      }
    } catch {}
  }

  function syncGreetingDom() {
    const onboardingScreen = document.getElementById("onboardingScreen");
    const mainAppScreen = document.getElementById("mainAppScreen");
    const appRoot = document.getElementById("app");
    if (!onboardingScreen || !mainAppScreen) return false;

    mainAppScreen.classList.remove("active");
    onboardingScreen.classList.add("active");
    appRoot?.classList.add("onboarding-mode");

    if (typeof setOnboardingStep === "function") {
      setOnboardingStep(1);
    } else {
      document.querySelectorAll(".onboarding-step").forEach((step) => {
        step.classList.toggle("active", step.dataset.step === "1");
      });
    }

    const backBtn = document.getElementById("onboardingBackBtn");
    if (backBtn) backBtn.style.visibility = "hidden";
    window.scrollTo({ top: 0, behavior: "auto" });
    return true;
  }

  function applyGreetingForce() {
    demoteProfile();
    if (syncGreetingDom()) {
      greetingApplied = true;
    }
  }

  function runBootstrapForce() {
    window.requestAnimationFrame(applyGreetingForce);
    [0, 60, 180, 420, 900].forEach((delay) => {
      window.setTimeout(applyGreetingForce, delay);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", runBootstrapForce, { once: true });
  } else {
    runBootstrapForce();
  }

  window.addEventListener("pageshow", () => {
    if (!greetingApplied) {
      runBootstrapForce();
    }
  }, { once: true });
})();
