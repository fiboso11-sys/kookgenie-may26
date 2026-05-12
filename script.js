(function () {
  "use strict";

  const LS = {
    calories: "kookgenie_calories",
    water: "kookgenie_water",
    workout: "kookgenie_workout",
    meals: "kookgenie_meals",
    weight: "kookgenie_weight",
  };

  function todayStr() {
    const d = new Date();
    return d.toISOString().slice(0, 10);
  }

  function loadJSON(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  }

  function saveJSON(key, val) {
    localStorage.setItem(key, JSON.stringify(val));
  }

  /* ---------- Navbar ---------- */
  const navToggle = document.querySelector(".nav-toggle");
  const navbar = document.querySelector(".navbar");
  if (navToggle && navbar) {
    navToggle.addEventListener("click", () => {
      const open = navbar.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", open);
    });
    document.querySelectorAll(".nav-links a").forEach((a) => {
      a.addEventListener("click", () => {
        navbar.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  document.getElementById("year").textContent = new Date().getFullYear();

  /* ---------- KGenie Chat ---------- */
  const chatBackdrop = document.getElementById("chat-backdrop");
  const chatPanel = document.getElementById("chat-panel");
  const fab = document.getElementById("fab-kgenie");
  const chatClose = document.getElementById("chat-close");
  const chatForm = document.getElementById("chat-form");
  const chatInput = document.getElementById("chat-input");
  const chatMessages = document.getElementById("chat-messages");

  function openChat() {
    chatBackdrop.hidden = false;
    chatPanel.hidden = false;
    chatBackdrop.classList.add("is-open");
    chatPanel.classList.add("is-open");
    chatPanel.setAttribute("aria-hidden", "false");
    requestAnimationFrame(() => chatInput.focus());
  }

  function closeChat() {
    chatBackdrop.classList.remove("is-open");
    chatPanel.classList.remove("is-open");
    chatPanel.setAttribute("aria-hidden", "true");
    setTimeout(() => {
      chatBackdrop.hidden = true;
      chatPanel.hidden = true;
    }, 280);
  }

  fab.addEventListener("click", openChat);
  chatClose.addEventListener("click", closeChat);
  chatBackdrop.addEventListener("click", closeChat);

  document.getElementById("hero-ask-kgenie")?.addEventListener("click", openChat);
  document.querySelectorAll(".open-chat-from-card").forEach((b) => b.addEventListener("click", openChat));

  document.querySelectorAll(".chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      const prompt = chip.getAttribute("data-prompt");
      if (prompt) sendChatMessage(prompt);
    });
  });

  const CHAT_RESPONSES = [
    {
      test: (q) => /egg/i.test(q),
      reply: `**Egg-cellent ideas**

**1. Veggie scramble** — Sauté onion & tomato, pour in beaten eggs, fold until just set. ~12 min.

**2. Shakshuka** — Simmer spiced tomato sauce, crack eggs in, cover until whites set. Serve with bread.

**3. Egg fried rice** — Cold rice, soy, peas, scramble eggs first then combine on high heat.

*Tip:* Room-temp eggs cook more evenly than ice-cold.`,
    },
    {
      test: (q) => /breakfast|morning/i.test(q),
      reply: `**Healthy breakfast picks**

**Overnight oats** — Rolled oats, chia, milk, berries. Prep night before.

**Greek yogurt parfait** — Yogurt, nuts, seeds, low-sugar fruit.

**Avocado + egg toast** — Whole grain bread, smashed avocado, poached or soft-boiled egg.

Aim for **protein + fiber** to stay full until lunch.`,
    },
    {
      test: (q) => /protein|high.?protein|muscle/i.test(q),
      reply: `**High-protein meals**

**Lemon herb chicken bowl** — 200g chicken breast, quinoa, broccoli, tahini lemon drizzle.

**Lentil & spinach stew** — Red lentils, tomatoes, cumin; finish with Greek yogurt.

**Tofu stir-fry** — Firm tofu cubes, snap peas, peppers, ginger-soy glaze.

Target **25–35g protein** per main meal for most active adults (demo guideline).`,
    },
    {
      test: (q) => /weight\s*loss|lose\s*weight|low\s*cal|diet/i.test(q),
      reply: `**Weight-loss friendly meals**

**Big salad + lean protein** — Greens, colorful veg, grilled chicken or chickpeas, light vinaigrette.

**Zucchini noodles + turkey marinara** — Volume without heavy pasta calories.

**Baked white fish + asparagus** — Herbs, lemon, small portion of roasted potatoes.

Focus on **vegetables, lean protein, whole foods** — this demo keeps portions sensible.`,
    },
  ];

  const CHAT_DEFAULT = `**KookGenie demo reply**

Try asking about **eggs**, a **healthy breakfast**, **high protein**, or **weight loss** meals.

You can also use the **Recipe Generator** with whatever ingredients you have — I'll build a sample recipe instantly.`;

  function formatBotHtml(text) {
    return text
      .split("\n")
      .map((line) => {
        const t = line.trim();
        if (!t) return "";
        if (/^\*\*.+\*\*$/.test(t)) {
          const inner = t.replace(/^\*\*|\*\*$/g, "");
          return `<strong>${inner}</strong>`;
        }
        if (/^\*\*.+\*\*/.test(t)) {
          return t.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
        }
        return t.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
      })
      .filter(Boolean)
      .join("<br>");
  }

  function appendMessage(role, htmlOrText) {
    const div = document.createElement("div");
    div.className = role === "user" ? "msg msg-user" : "msg msg-bot";
    if (role === "user") div.textContent = htmlOrText;
    else div.innerHTML = htmlOrText;
    chatMessages.appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function getChatReply(question) {
    const q = question.trim();
    for (const row of CHAT_RESPONSES) {
      if (row.test(q)) return row.reply;
    }
    return CHAT_DEFAULT;
  }

  function sendChatMessage(text) {
    const q = text.trim();
    if (!q) return;
    appendMessage("user", q);
    const reply = getChatReply(q);
    setTimeout(() => {
      appendMessage("bot", formatBotHtml(reply));
    }, 450);
  }

  chatForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const v = chatInput.value;
    chatInput.value = "";
    sendChatMessage(v);
  });

  /* ---------- Recipe Generator ---------- */
  const ingredientsInput = document.getElementById("ingredients-input");
  const recipeOutput = document.getElementById("recipe-output");

  function titleCaseIngredient(s) {
    return s.trim().replace(/\b\w/g, (c) => c.toUpperCase());
  }

  document.getElementById("btn-generate-recipe").addEventListener("click", () => {
    const raw = ingredientsInput.value.trim() || "pantry staples";
    const parts = raw
      .split(/[,;\n]+/)
      .map((s) => s.trim())
      .filter(Boolean);
    const named = parts.length ? parts.map(titleCaseIngredient) : ["Olive Oil", "Garlic", "Herbs"];
    const title = `${named.slice(0, 2).join(" & ")} Skillet`;
    const time = 20 + (named.length % 4) * 5;
    const cals = 320 + named.length * 45;

    const steps = [
      `Prep: chop ${named.join(", ")} into even pieces.`,
      `Heat 1–2 tbsp oil in a pan over medium-high. Aromatics first if using onion/garlic.`,
      `Add remaining ingredients by cook time — harder veg before soft.`,
      `Season with salt, pepper, and a splash of acid (lemon or vinegar). Finish with fresh herbs.`,
    ];

    recipeOutput.innerHTML = `
      <div class="recipe-result-inner">
        <img src="images/recipe-generated.svg" alt="Generated recipe" width="400" height="240" />
        <h3>${title}</h3>
        <div class="recipe-meta">
          <span>⏱ ${time} min</span>
          <span>🔥 ~${cals} kcal</span>
        </div>
        <p><strong>Ingredients</strong></p>
        <ul>${named.map((i) => `<li>${i}</li>`).join("")}<li>Olive oil, salt, pepper</li></ul>
        <p><strong>Steps</strong></p>
        <ol>${steps.map((s) => `<li>${s}</li>`).join("")}</ol>
      </div>
    `;
  });

  /* ---------- Lessons ---------- */
  const LESSONS = {
    basics: {
      title: "Cooking Basics",
      steps: [
        "Read the full recipe once before starting — mise en place saves mistakes.",
        "Preheat pans and ovens so food cooks predictably from minute one.",
        "Taste and season in layers: a little salt early, adjust at the end.",
        "Use a digital thermometer for proteins: safer and juicier results.",
        "Let meats rest a few minutes so juices redistribute before slicing.",
      ],
    },
    knife: {
      title: "Knife Skills",
      steps: [
        "Use the **claw grip**: fingertips tucked, knuckles guide the blade.",
        "Keep the knife sharp — dull knives slip and cause injuries.",
        "Slice with a forward rocking motion; let the blade do the work.",
        "Stabilize round items by cutting a flat side first.",
        "Clean the board between raw proteins and ready-to-eat foods.",
      ],
    },
    vegetables: {
      title: "How to Cut Vegetables",
      steps: [
        "Wash and dry veg — wet surfaces steam instead of sear.",
        "For strips: square off, slice planks, then matchsticks (julienne).",
        "For dice: cut sticks, rotate 90°, cross-cut to size.",
        "Onions: halve pole-to-pole, peel, slice with the grain for rings or across for dice.",
        "Keep pieces uniform so they cook evenly in the pan.",
      ],
    },
    boiling: {
      title: "Boiling",
      steps: [
        "Use plenty of salted water — it should taste like mild seawater for pasta.",
        "Bring to a rolling boil before adding dense vegetables or pasta.",
        "Stir pasta once early to prevent sticking.",
        "Blanch green veg: boil briefly, then ice bath for bright color and crunch.",
        "Reserve a cup of starchy pasta water to adjust sauce texture.",
      ],
    },
    frying: {
      title: "Frying",
      steps: [
        "Pat food dry — moisture causes splatter and weak crusts.",
        "Choose oil with appropriate smoke point; don't crowd the pan.",
        "Maintain steady medium heat; if smoking excessively, lower heat.",
        "For shallow fry, flip when the crust releases easily from the pan.",
        "Drain on a rack or paper towel; season immediately while hot.",
      ],
    },
    saute: {
      title: "Sauté",
      steps: [
        "Use a wide pan — evaporation = browning instead of steaming.",
        "Heat oil until shimmering; add ingredients in batches if needed.",
        "Keep food moving or flip for even color on high heat.",
        "Deglaze with wine, broth, or citrus to lift fond into a quick sauce.",
        "Finish with butter or herbs off heat for shine and aroma.",
      ],
    },
    grilling: {
      title: "Grilling",
      steps: [
        "Preheat grate until hot; clean and lightly oil grates.",
        "Oil the food, not the flames — reduces flare-ups.",
        "Use two zones: direct heat for sear, indirect for thicker cuts.",
        "Flip when the crust releases — don't force early.",
        "Rest proteins 5–10 minutes; slice against the grain.",
      ],
    },
    baking: {
      title: "Baking",
      steps: [
        "Measure accurately; baking is chemistry — use a scale if possible.",
        "Preheat fully; oven thermometers catch false readings.",
        "Room-temperature eggs and butter emulsify better in batters.",
        "Don't open the oven door early — cakes may collapse.",
        "Cool on a rack for even airflow; frost or slice when fully cool.",
      ],
    },
  };

  const lessonModal = document.getElementById("lesson-modal");
  const lessonBackdrop = document.getElementById("lesson-backdrop");
  const lessonTitle = document.getElementById("lesson-title");
  const lessonSteps = document.getElementById("lesson-steps");
  const lessonClose = document.getElementById("lesson-close");

  function openLesson(key) {
    const L = LESSONS[key];
    if (!L) return;
    lessonTitle.textContent = L.title;
    lessonSteps.innerHTML = L.steps
      .map((s) => `<li>${s.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")}</li>`)
      .join("");
    lessonBackdrop.hidden = false;
    lessonModal.hidden = false;
    requestAnimationFrame(() => {
      lessonBackdrop.classList.add("is-open");
      lessonModal.classList.add("is-open");
    });
  }

  function closeLesson() {
    lessonBackdrop.classList.remove("is-open");
    lessonModal.classList.remove("is-open");
    setTimeout(() => {
      lessonBackdrop.hidden = true;
      lessonModal.hidden = true;
    }, 250);
  }

  lessonClose.addEventListener("click", closeLesson);
  lessonBackdrop.addEventListener("click", closeLesson);

  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    if (chatPanel.classList.contains("is-open")) closeChat();
    if (lessonModal.classList.contains("is-open")) closeLesson();
  });

  document.querySelectorAll(".lesson-tile").forEach((btn) => {
    btn.addEventListener("click", () => openLesson(btn.getAttribute("data-lesson")));
  });

  /* ---------- Nutrition ---------- */
  const nutritionResult = document.getElementById("nutrition-result");

  function hashStr(s) {
    let h = 0;
    for (let i = 0; i < s.length; i++) h = (h << 5) - h + s.charCodeAt(i);
    return Math.abs(h);
  }

  document.getElementById("btn-analyze-nutrition").addEventListener("click", () => {
    const meal = document.getElementById("meal-input").value.trim() || "balanced meal";
    const h = hashStr(meal.toLowerCase());
    const calories = 380 + (h % 220);
    const protein = 18 + (h % 25);
    const carbs = 35 + (h % 40);
    const fat = 12 + (h % 18);
    const score = 6 + (h % 4);

    nutritionResult.hidden = false;
    nutritionResult.innerHTML = `
      <p style="margin-top:0;font-weight:600;color:var(--green-800);">Analysis for: "${meal}"</p>
      <div class="nutrition-grid">
        <div><strong>${calories}</strong><span style="display:block;font-size:0.75rem;color:var(--gray-600);">kcal</span></div>
        <div><strong>${protein}g</strong><span style="display:block;font-size:0.75rem;color:var(--gray-600);">protein</span></div>
        <div><strong>${carbs}g</strong><span style="display:block;font-size:0.75rem;color:var(--gray-600);">carbs</span></div>
        <div><strong>${fat}g</strong><span style="display:block;font-size:0.75rem;color:var(--gray-600);">fat</span></div>
      </div>
      <p class="nutrition-score">Health score (demo): ${score}/10 — balanced plate with whole foods.</p>
    `;
  });

  /* ---------- Fitness ---------- */
  const fitnessResult = document.getElementById("fitness-result");

  const FITNESS_PLANS = {
    weight_loss: {
      workout: [
        "Mon: 40 min brisk walk or bike + 15 min bodyweight circuit",
        "Wed: Strength — full body 3×12 (squat, push-up, row)",
        "Fri: Intervals — 8×1 min hard / 1 min easy",
        "Weekend: Active recovery — swim or yoga 30–45 min",
      ],
      tips: [
        "Aim for 7–9k steps most days (adjust to your baseline).",
        "Prioritize sleep — hunger hormones shift when rested.",
        "Protein at each meal helps fullness in a calorie deficit.",
      ],
      meals: [
        "High-volume salads with grilled protein",
        "Veggie soup + lean sandwich on whole grain",
        "Greek yogurt + berries as a sweet fix",
      ],
    },
    muscle_gain: {
      workout: [
        "Mon: Lower — squat pattern, hinge, single-leg 4×6–8",
        "Tue: Upper push — press variations + triceps 3×8–12",
        "Thu: Upper pull — rows, pull-ups, biceps 3×8–12",
        "Sat: Lower — deadlift focus + accessories",
      ],
      tips: [
        "Progressive overload: add reps, sets, or weight weekly when form is solid.",
        "Eat in a slight surplus with consistent protein (~1.6–2.2 g/kg demo range).",
        "Recovery days matter — muscles grow between sessions.",
      ],
      meals: [
        "Chicken burrito bowl with rice and beans",
        "Salmon, sweet potato, broccoli",
        "Protein smoothie with oats and peanut butter",
      ],
    },
    healthy_lifestyle: {
      workout: [
        "Mix 150 min moderate cardio weekly with 2 strength sessions",
        "Try a sport or dance class for fun adherence",
        "Mobility 10 min daily — hips and thoracic spine",
      ],
      tips: [
        "Walk after meals when possible — great for glucose and mood.",
        "Hydrate early; taper before bed for sleep quality.",
        "Batch-cook one grain and one protein each week.",
      ],
      meals: [
        "Mediterranean plate: fish, olive oil, veg, whole grains",
        "Stir-fry with tofu or chicken and mixed veg",
        "Snack: fruit + handful of nuts",
      ],
    },
  };

  document.getElementById("btn-fitness-plan").addEventListener("click", () => {
    const goal = document.getElementById("fitness-goal").value;
    const plan = FITNESS_PLANS[goal] || FITNESS_PLANS.healthy_lifestyle;
    fitnessResult.hidden = false;
    fitnessResult.innerHTML = `
      <h4>Workout plan</h4>
      <ul>${plan.workout.map((w) => `<li>${w}</li>`).join("")}</ul>
      <h4>Daily activity tips</h4>
      <ul>${plan.tips.map((w) => `<li>${w}</li>`).join("")}</ul>
      <h4>Meal suggestions</h4>
      <ul>${plan.meals.map((w) => `<li>${w}</li>`).join("")}</ul>
    `;
  });

  /* ---------- Trackers ---------- */
  function renderCalories() {
    const entries = loadJSON(LS.calories, []);
    const t = todayStr();
    const todayEntries = entries.filter((e) => e.date === t);
    const total = todayEntries.reduce((s, e) => s + e.amount, 0);
    document.getElementById("tracker-calories-today").textContent = `Today: ${total} kcal`;
    const ul = document.getElementById("tracker-calories-list");
    ul.innerHTML = todayEntries
      .slice()
      .reverse()
      .map(
        (e) =>
          `<li><span>${e.amount} kcal</span><span style="opacity:0.6;">${new Date(e.ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span></li>`
      )
      .join("");
  }

  function renderWater() {
    const entries = loadJSON(LS.water, []);
    const t = todayStr();
    const todayEntries = entries.filter((e) => e.date === t);
    const total = todayEntries.reduce((s, e) => s + e.amount, 0);
    document.getElementById("tracker-water-today").textContent = `Today: ${total} glass(es)`;
    const ul = document.getElementById("tracker-water-list");
    ul.innerHTML = todayEntries
      .slice()
      .reverse()
      .map(
        (e) =>
          `<li><span>+${e.amount}</span><span style="opacity:0.6;">${new Date(e.ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span></li>`
      )
      .join("");
  }

  function renderWorkout() {
    const entries = loadJSON(LS.workout, []);
    const ul = document.getElementById("tracker-workout-list");
    ul.innerHTML = entries
      .slice()
      .reverse()
      .slice(0, 25)
      .map(
        (e) =>
          `<li><span>${escapeHtml(e.text)}</span><span style="opacity:0.6;">${e.date}</span></li>`
      )
      .join("");
  }

  function renderMeals() {
    const entries = loadJSON(LS.meals, []);
    const ul = document.getElementById("tracker-meals-list");
    ul.innerHTML = entries
      .slice()
      .reverse()
      .slice(0, 25)
      .map(
        (e) =>
          `<li><span>${escapeHtml(e.text)}</span><span style="opacity:0.6;">${e.date}</span></li>`
      )
      .join("");
  }

  function renderWeight() {
    const entries = loadJSON(LS.weight, []);
    const ul = document.getElementById("tracker-weight-list");
    ul.innerHTML = entries
      .slice()
      .reverse()
      .slice(0, 30)
      .map(
        (e) =>
          `<li><span>${e.value}</span><span style="opacity:0.6;">${e.date}</span></li>`
      )
      .join("");
  }

  function escapeHtml(s) {
    const d = document.createElement("div");
    d.textContent = s;
    return d.innerHTML;
  }

  document.querySelectorAll(".tracker-card").forEach((card) => {
    const type = card.getAttribute("data-tracker");
    const field = card.querySelector(".tracker-field");
    const addBtn = card.querySelector(".tracker-add");
    const clearBtn = card.querySelector(".tracker-clear");

    addBtn.addEventListener("click", () => {
      if (type === "calories") {
        const n = parseInt(field.value, 10);
        if (!Number.isFinite(n) || n <= 0) return;
        const entries = loadJSON(LS.calories, []);
        entries.push({ date: todayStr(), amount: n, ts: Date.now() });
        saveJSON(LS.calories, entries);
        field.value = "";
        renderCalories();
      } else if (type === "water") {
        const n = parseInt(field.value, 10);
        if (!Number.isFinite(n) || n <= 0) return;
        const entries = loadJSON(LS.water, []);
        entries.push({ date: todayStr(), amount: n, ts: Date.now() });
        saveJSON(LS.water, entries);
        field.value = "";
        renderWater();
      } else if (type === "workout") {
        const text = field.value.trim();
        if (!text) return;
        const entries = loadJSON(LS.workout, []);
        entries.push({ text, date: todayStr(), ts: Date.now() });
        saveJSON(LS.workout, entries);
        field.value = "";
        renderWorkout();
      } else if (type === "meals") {
        const text = field.value.trim();
        if (!text) return;
        const entries = loadJSON(LS.meals, []);
        entries.push({ text, date: todayStr(), ts: Date.now() });
        saveJSON(LS.meals, entries);
        field.value = "";
        renderMeals();
      } else if (type === "weight") {
        const v = parseFloat(field.value);
        if (!Number.isFinite(v) || v <= 0) return;
        const entries = loadJSON(LS.weight, []);
        entries.push({ value: v, date: todayStr(), ts: Date.now() });
        saveJSON(LS.weight, entries);
        field.value = "";
        renderWeight();
      }
    });

    clearBtn.addEventListener("click", () => {
      const t = todayStr();
      if (type === "calories") {
        const entries = loadJSON(LS.calories, []).filter((e) => e.date !== t);
        saveJSON(LS.calories, entries);
        renderCalories();
      } else if (type === "water") {
        const entries = loadJSON(LS.water, []).filter((e) => e.date !== t);
        saveJSON(LS.water, entries);
        renderWater();
      } else if (type === "workout") {
        saveJSON(LS.workout, []);
        renderWorkout();
      } else if (type === "meals") {
        saveJSON(LS.meals, []);
        renderMeals();
      } else if (type === "weight") {
        saveJSON(LS.weight, []);
        renderWeight();
      }
    });
  });

  renderCalories();
  renderWater();
  renderWorkout();
  renderMeals();
  renderWeight();
})();
