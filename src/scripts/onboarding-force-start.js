(() => {
  const PROFILE_KEY = 'neon_calorie_profile';

  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (raw) {
      const profile = JSON.parse(raw);
      if (profile && profile.onboarded) {
        profile.onboarded = false;
        localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
      }
    }
  } catch {}

  function openGreetingFlow() {
    const onboardingScreen = document.getElementById('onboardingScreen');
    const mainAppScreen = document.getElementById('mainAppScreen');
    const appRoot = document.getElementById('app');
    if (!onboardingScreen || !mainAppScreen) return;

    mainAppScreen.classList.remove('active');
    onboardingScreen.classList.add('active');
    appRoot?.classList.add('onboarding-mode');

    if (typeof setOnboardingStep === 'function') {
      setOnboardingStep(1);
    }

    window.scrollTo({ top: 0, behavior: 'auto' });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', openGreetingFlow, { once: true });
  } else {
    openGreetingFlow();
  }
})();
