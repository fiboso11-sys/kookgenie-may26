export type CookingLesson = {
  slug: string;
  title: string;
  summary: string;
  steps: string[];
  tips: string[];
};

export const lessons: CookingLesson[] = [
  {
    slug: "kitchen-setup",
    title: "Kitchen Setup",
    summary: "Organize your space for safer, faster cooking.",
    steps: [
      "Clear countertops and gather tools before you start (mise en place).",
      "Keep a trash bowl nearby for peels and trim.",
      "Place a damp towel under your cutting board to prevent slipping.",
      "Preheat pans or ovens while you prep ingredients.",
    ],
    tips: [
      "Group ingredients by recipe step to reduce back-and-forth.",
      "Sharp knives are safer than dull ones—hone before each session.",
    ],
  },
  {
    slug: "knife-skills",
    title: "Knife Skills",
    summary: "Grip, stance, and basic cuts every cook should know.",
    steps: [
      "Use a pinch grip on the blade and a claw grip with your guiding hand.",
      "Slice with a forward-rocking motion, not a straight press down.",
      "Practice uniform pieces so food cooks evenly.",
      "Clean the blade between cuts when sticky foods cling.",
    ],
    tips: [
      "Let the knife do the work—forcing leads to slips.",
      "A honing steel realigns an edge; sharpening restores it.",
    ],
  },
  {
    slug: "cutting-techniques",
    title: "Cutting Techniques",
    summary: "Dice, julienne, and chiffonade explained simply.",
    steps: [
      "Dice: square off produce, slice planks, then sticks, then cubes.",
      "Julienne: cut thin matchsticks for quick stir-fries.",
      "Chiffonade: stack leafy herbs, roll tightly, slice ribbons.",
      "Mince garlic: smash, rock-chop, then gather and repeat.",
    ],
    tips: [
      "Stable base first—flat side down for round vegetables.",
      "For onions, leave the root intact while slicing to hold layers together.",
    ],
  },
  {
    slug: "cleaning-hygiene",
    title: "Cleaning & Hygiene",
    summary: "Prevent cross-contamination and keep your kitchen spotless.",
    steps: [
      "Wash hands for 20 seconds before and after handling raw proteins.",
      "Use separate boards for produce vs. raw meat, or sanitize between uses.",
      "Sanitize surfaces with hot soapy water or a food-safe spray.",
      "Refrigerate leftovers within 2 hours of cooking.",
    ],
    tips: [
      "Color-coded cutting boards reduce mix-ups in busy kitchens.",
      "Thermometers beat guesswork for food safety.",
    ],
  },
  {
    slug: "ingredient-storage",
    title: "Ingredient Storage",
    summary: "Keep flavors bright and reduce waste with smart storage.",
    steps: [
      "Store herbs like flowers in water, loosely covered, in the fridge.",
      "Keep dry goods in airtight containers with dates labeled.",
      "Freeze stock and sauces in flat bags for quick thawing.",
      "Store potatoes and onions separately—onions speed sprouting in potatoes.",
    ],
    tips: [
      "First in, first out: rotate pantry items to the front.",
      "Citrus lasts longer in the fridge crisper.",
    ],
  },
  {
    slug: "cooking-methods",
    title: "Cooking Methods",
    summary: "When to sauté, roast, steam, or simmer.",
    steps: [
      "Sauté: medium-high heat, small pieces, quick browning.",
      "Roast: dry heat, larger cuts or trays of vegetables.",
      "Steam: gentle, preserves color and nutrients in delicate foods.",
      "Simmer: small bubbles for stocks, beans, and braises.",
    ],
    tips: [
      "Pat proteins dry before searing for a better crust.",
      "Rest meats so juices redistribute before slicing.",
    ],
  },
  {
    slug: "meal-prep",
    title: "Meal Prep",
    summary: "Batch cook without boredom.",
    steps: [
      "Pick 2 proteins, 2 carbs, and 3 vegetables for mix-and-match bowls.",
      "Cook grains and roast trays on the same oven schedule.",
      "Portion into containers; keep sauces separate until serving.",
      "Label containers with dates and reheating notes.",
    ],
    tips: [
      "Undercook veggies slightly if you will microwave later.",
      "Freeze half your batch if you cannot finish within 4 days.",
    ],
  },
];

export function getLessonBySlug(slug: string) {
  return lessons.find((l) => l.slug === slug);
}
