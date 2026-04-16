(() => {
  const appRoot = document.getElementById('app');
  const onboardingScreen = document.getElementById('onboardingScreen');
  if (!appRoot || !onboardingScreen) return;

  function escapeHtml(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function bindNextButtons(scope) {
    scope.querySelectorAll('[data-next-step]').forEach((button) => {
      if (button.dataset.onboardingBound === '1') return;
      button.dataset.onboardingBound = '1';
      button.addEventListener('click', () => {
        if (typeof setOnboardingStep !== 'function') return;
        setOnboardingStep(Number(button.dataset.nextStep));
      });
    });
  }

  function updateStepCopy(step, title, subtitle) {
    if (!step) return;
    const titleEl = step.querySelector('.hero-title');
    const subtitleEl = step.querySelector('.hero-subtitle');
    if (titleEl) titleEl.textContent = title;
    if (subtitleEl) subtitleEl.textContent = subtitle;
  }

  function updatePrimaryButton(step, nextStep, label) {
    const button = step?.querySelector('[data-next-step]');
    if (!button) return;
    button.dataset.nextStep = String(nextStep);
    if (label) button.textContent = label;
  }

  const steps = {
    intro: onboardingScreen.querySelector('.onboarding-step[data-step="1"]'),
    gender: onboardingScreen.querySelector('.onboarding-step[data-step="2"]'),
    birth: onboardingScreen.querySelector('.onboarding-step[data-step="3"]'),
    height: onboardingScreen.querySelector('.onboarding-step[data-step="4"]'),
    weight: onboardingScreen.querySelector('.onboarding-step[data-step="5"]'),
    goal: onboardingScreen.querySelector('.onboarding-step[data-step="6"]'),
    target: onboardingScreen.querySelector('.onboarding-step[data-step="7"]'),
    activity: onboardingScreen.querySelector('.onboarding-step[data-step="8"]'),
    ready: onboardingScreen.querySelector('.onboarding-step[data-step="9"]')
  };

  if (!steps.intro || !steps.goal || !steps.ready) return;

  const initialName = document.getElementById('obName')?.value || '';
  steps.intro.innerHTML = `
    <div class="moon-intro-badge">MOON PLAN</div>
    <div class="moon-intro-art" aria-hidden="true">
      <div class="moon-intro-core"></div>
      <div class="moon-intro-plate"><span class="moon-intro-emoji">🥗</span></div>
      <div class="moon-intro-chip chip-one">макроси</div>
      <div class="moon-intro-chip chip-two">ритм</div>
      <div class="moon-intro-chip chip-three">звички</div>
    </div>
    <div class="moon-intro-copy">
      <h1 class="hero-title">Calorie AI Bot</h1>
      <p class="hero-subtitle">Зберемо спокійний стартовий план, щоб ти бачив(ла) калорії, макроси й свій темп уже з першого дня.</p>
    </div>
    <input id="obName" class="neon-input onboarding-name-hidden" type="text" value="${escapeHtml(initialName)}" aria-hidden="true" tabindex="-1" />
    <button class="primary-action" data-next-step="2">Почати</button>
  `;
  steps.intro.classList.add('moon-intro-screen');
  bindNextButtons(steps.intro);

  steps.goal.dataset.step = '2';
  steps.goal.classList.add('moon-choice-screen');
  updateStepCopy(steps.goal, 'Яка ваша головна мета?', 'Підлаштуємо добову норму й темп саме під цю ціль.');
  updatePrimaryButton(steps.goal, 3, 'Далі');
  const goalLabels = ['Схуднути', 'Підтримувати вагу', 'Набрати вагу'];
  steps.goal.querySelectorAll('.choice-card[data-goal]').forEach((card, index) => {
    if (goalLabels[index]) card.textContent = goalLabels[index];
  });

  steps.gender.dataset.step = '3';
  steps.gender.classList.add('moon-choice-screen');
  updateStepCopy(steps.gender, 'Оберіть свою стать', 'Це допоможе точніше розрахувати базову потребу в калоріях.');
  updatePrimaryButton(steps.gender, 4, 'Далі');
  const genderLabels = ['Чоловіча', 'Жіноча'];
  steps.gender.querySelectorAll('.choice-card[data-gender]').forEach((card, index) => {
    if (genderLabels[index]) card.textContent = genderLabels[index];
  });

  steps.birth.dataset.step = '4';
  updateStepCopy(steps.birth, 'Коли ви народилися?', 'Вік допомагає точніше налаштувати персональний план.');
  updatePrimaryButton(steps.birth, 5, 'Далі');

  steps.height.dataset.step = '5';
  updateStepCopy(steps.height, 'Який у вас зріст?', 'Приблизно теж ок — головне, щоб орієнтир був реалістичним.');
  updatePrimaryButton(steps.height, 6, 'Далі');

  steps.weight.dataset.step = '6';
  updateStepCopy(steps.weight, 'Яка ваша поточна вага?', 'Вкажи комфортно для себе: навіть приблизне значення підійде.');
  updatePrimaryButton(steps.weight, 7, 'Далі');

  steps.target.dataset.step = '7';
  updateStepCopy(steps.target, 'Яка бажана вага?', 'Можна пропустити й повернутися до цього пізніше в налаштуваннях.');
  updatePrimaryButton(steps.target, 8, 'Далі');
  const skipTargetButton = document.getElementById('skipTargetBtn');
  if (skipTargetButton) skipTargetButton.textContent = 'Пропустити поки що';

  steps.activity.dataset.step = '8';
  updateStepCopy(steps.activity, 'Який у вас звичайний темп дня?', 'Це допоможе оцінити, скільки енергії ви витрачаєте щодня.');
  const activityCards = steps.activity.querySelectorAll('.choice-detail-card[data-activity]');
  const activityCopy = [
    ['Спокійний ритм', 'Робота за столом, мінімум руху.'],
    ['Помірна активність', 'Ходьба, справи й трохи руху протягом дня.'],
    ['Активний день', 'Регулярний спорт або рухлива робота.'],
    ['Дуже активний день', 'Інтенсивні тренування чи фізична праця.']
  ];
  activityCards.forEach((card, index) => {
    const titleEl = card.querySelector('.choice-detail-title');
    const textEl = card.querySelector('.choice-detail-text');
    if (titleEl && activityCopy[index]) titleEl.textContent = activityCopy[index][0];
    if (textEl && activityCopy[index]) textEl.textContent = activityCopy[index][1];
  });
  const finishButton = document.getElementById('finishOnboardingBtn');
  if (finishButton) finishButton.textContent = 'Створити план';

  steps.ready.dataset.step = '9';
  updateStepCopy(steps.ready, 'План готовий', 'Ось добова норма, макроси й орієнтир, від якого можна стартувати вже сьогодні.');
  const sectionHeading = steps.ready.querySelector('.section-title.big');
  if (sectionHeading) sectionHeading.textContent = 'Твоя добова норма';
  const startButton = document.getElementById('startAppBtn');
  if (startButton) startButton.textContent = 'Почати';

  updateOnboardingProgress = function(step) {
    const totalSteps = 9;
    const clampedStep = Math.max(1, Math.min(step, totalSteps));
    const progress = totalSteps === 1 ? 1 : (clampedStep - 1) / (totalSteps - 1);
    const degrees = Math.round(progress * 360);
    const ring = document.getElementById('onboardingProgressRing');
    const inner = document.getElementById('onboardingProgressInner');
    if (ring) ring.style.setProperty('--progress-deg', `${degrees}deg`);
    if (inner) inner.textContent = `${clampedStep}/${totalSteps}`;
  };

  function syncOnboardingMode() {
    appRoot.classList.toggle('onboarding-mode', onboardingScreen.classList.contains('active'));
  }

  syncOnboardingMode();
  if (startButton) {
    startButton.addEventListener('click', () => {
      setTimeout(syncOnboardingMode, 0);
    });
  }

  const observer = new MutationObserver(syncOnboardingMode);
  observer.observe(onboardingScreen, { attributes: true, attributeFilter: ['class'] });

  if (onboardingScreen.classList.contains('active') && typeof setOnboardingStep === 'function') {
    setOnboardingStep(typeof state !== 'undefined' ? state.onboardingStep || 1 : 1);
  }
})();
