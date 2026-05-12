export type Recipe = {
  id: string;
  title: string;
  image: string;
  calories: number;
  cookTimeMin: number;
  tags: string[];
  ingredients: string[];
  steps: string[];
  nutrition: { label: string; value: string }[];
};

export const recipes: Recipe[] = [
  {
    id: "herb-chicken-skillet",
    title: "Herb Garlic Chicken Skillet",
    image:
      "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=800&q=80",
    calories: 420,
    cookTimeMin: 35,
    tags: ["High protein", "Gluten-free"],
    ingredients: [
      "2 chicken breasts",
      "3 cloves garlic, minced",
      "1 cup cherry tomatoes",
      "1 tbsp olive oil",
      "1 tsp dried oregano",
      "Salt and pepper",
      "Fresh parsley",
    ],
    steps: [
      "Pat chicken dry and season with salt, pepper, and oregano.",
      "Heat olive oil in a skillet over medium-high heat. Sear chicken 4–5 minutes per side.",
      "Lower heat, add garlic and tomatoes; simmer 12–15 minutes until chicken is cooked through.",
      "Rest 3 minutes, slice, garnish with parsley, and serve.",
    ],
    nutrition: [
      { label: "Protein", value: "42g" },
      { label: "Carbs", value: "12g" },
      { label: "Fat", value: "18g" },
      { label: "Fiber", value: "3g" },
    ],
  },
  {
    id: "rainbow-veggie-bowl",
    title: "Rainbow Veggie Grain Bowl",
    image:
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80",
    calories: 380,
    cookTimeMin: 25,
    tags: ["Vegan", "Meal prep"],
    ingredients: [
      "1 cup cooked quinoa",
      "1 cup chickpeas, drained",
      "1 cup shredded purple cabbage",
      "1 carrot, ribboned",
      "1 avocado, sliced",
      "2 tbsp tahini",
      "Lemon juice, salt, pepper",
    ],
    steps: [
      "Whisk tahini with lemon juice, a splash of water, salt, and pepper for dressing.",
      "Warm chickpeas with a pinch of salt in a pan or microwave.",
      "Layer quinoa, chickpeas, cabbage, and carrot in bowls.",
      "Top with avocado and drizzle dressing. Toss gently before eating.",
    ],
    nutrition: [
      { label: "Protein", value: "14g" },
      { label: "Carbs", value: "48g" },
      { label: "Fat", value: "16g" },
      { label: "Fiber", value: "12g" },
    ],
  },
  {
    id: "salmon-asparagus",
    title: "Baked Salmon & Asparagus",
    image:
      "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800&q=80",
    calories: 465,
    cookTimeMin: 22,
    tags: ["Omega-3", "Low carb"],
    ingredients: [
      "2 salmon fillets",
      "1 bunch asparagus",
      "2 tbsp lemon butter",
      "1 tsp paprika",
      "Garlic powder, salt, pepper",
      "Lemon wedges",
    ],
    steps: [
      "Preheat oven to 400°F (205°C). Line a sheet pan with parchment.",
      "Season salmon and asparagus; arrange on the pan. Dot with lemon butter.",
      "Bake 12–15 minutes until salmon flakes and asparagus is tender.",
      "Finish with paprika and lemon wedges.",
    ],
    nutrition: [
      { label: "Protein", value: "38g" },
      { label: "Carbs", value: "8g" },
      { label: "Fat", value: "28g" },
      { label: "Fiber", value: "4g" },
    ],
  },
  {
    id: "turkey-stuffed-peppers",
    title: "Turkey Stuffed Bell Peppers",
    image:
      "https://images.unsplash.com/photo-1604908177526-1e0e7a5e6b0e?w=800&q=80",
    calories: 410,
    cookTimeMin: 50,
    tags: ["Family dinner"],
    ingredients: [
      "4 bell peppers, tops removed",
      "1 lb lean ground turkey",
      "1 cup cooked brown rice",
      "1 cup marinara sauce",
      "1 onion, diced",
      "Italian seasoning, salt, pepper",
      "Mozzarella (optional)",
    ],
    steps: [
      "Sauté onion until soft; add turkey, season, and cook through.",
      "Stir in rice and half the marinara. Stuff peppers and place in a baking dish.",
      "Pour remaining marinara around peppers; cover with foil.",
      "Bake at 375°F (190°C) for 35–40 minutes. Add cheese in last 5 minutes if using.",
    ],
    nutrition: [
      { label: "Protein", value: "35g" },
      { label: "Carbs", value: "32g" },
      { label: "Fat", value: "14g" },
      { label: "Fiber", value: "6g" },
    ],
  },
];

export function getRecipeById(id: string) {
  return recipes.find((r) => r.id === id);
}
