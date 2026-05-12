import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const staples = [
  ["Rice white cooked", "100 g", "g", 100, "g", 130, 2.7, 28, 0.3, 0.4, "grains", ["rice", "chawal"]],
  ["Brown rice cooked", "100 g", "g", 100, "g", 112, 2.6, 24, 0.9, 1.8, "grains", ["brown rice"]],
  ["Basmati rice cooked", "100 g", "g", 100, "g", 121, 3.5, 25, 0.4, 0.4, "grains", ["basmati"]],
  ["Idli", "1 piece", "piece", 1, "piece", 39, 1.3, 7, 0.2, 0.5, "indian", ["idli"]],
  ["Dosa plain", "1 medium", "piece", 1, "piece", 187, 3.5, 26, 7.5, 1.2, "indian", ["dosa"]],
  ["Uttapam", "1 piece", "piece", 1, "piece", 180, 6, 22, 8, 2, "indian", ["uttapam"]],
  ["Medu vada", "1 piece", "piece", 1, "piece", 150, 5, 15, 8, 2, "indian", ["vada"]],
  ["Sambar 1 cup", "1 cup", "cup", 1, "cup", 120, 6, 18, 3, 4, "indian", ["sambar"]],
  ["Dal tadka", "1 cup", "cup", 1, "cup", 200, 10, 25, 6, 8, "indian", ["dal"]],
  ["Chana masala", "1 cup", "cup", 1, "cup", 280, 12, 35, 10, 9, "indian", ["chickpea"]],
  ["Boiled egg", "1 large", "piece", 1, "piece", 78, 6.3, 0.6, 5.3, 0, "protein", ["egg"]],
  ["Scrambled egg", "100 g", "g", 100, "g", 149, 10, 2, 11, 0, "protein", ["egg"]],
  ["Paneer", "100 g", "g", 100, "g", 265, 18, 3, 20, 0, "dairy", ["paneer"]],
  ["Tofu firm", "100 g", "g", 100, "g", 144, 17, 3, 9, 2, "protein", ["tofu"]],
  ["Chicken breast grilled", "100 g", "g", 100, "g", 165, 31, 0, 3.6, 0, "protein", ["chicken"]],
  ["Chicken thigh roasted", "100 g", "g", 100, "g", 209, 26, 0, 10, 0, "protein", ["chicken thigh"]],
  ["Salmon baked", "100 g", "g", 100, "g", 206, 22, 0, 12, 0, "protein", ["salmon"]],
  ["Tuna canned water", "100 g", "g", 100, "g", 116, 26, 0, 0.8, 0, "protein", ["tuna"]],
  ["Shrimp cooked", "100 g", "g", 100, "g", 99, 24, 0.2, 0.3, 0, "protein", ["shrimp"]],
  ["Beef steak lean", "100 g", "g", 100, "g", 250, 26, 0, 15, 0, "protein", ["beef", "steak"]],
  ["Milk whole", "1 cup", "cup", 1, "cup", 150, 8, 12, 8, 0, "dairy", ["milk"]],
  ["Milk skim", "1 cup", "cup", 1, "cup", 83, 8, 12, 0.2, 0, "dairy", ["skim milk"]],
  ["Yogurt plain", "1 cup", "cup", 1, "cup", 150, 13, 17, 4, 0, "dairy", ["yogurt"]],
  ["Greek yogurt", "1 cup", "cup", 1, "cup", 220, 20, 9, 11, 0, "dairy", ["greek yogurt"]],
  ["Cheddar cheese", "30 g", "g", 30, "g", 120, 7, 0, 10, 0, "dairy", ["cheese"]],
  ["Butter", "1 tbsp", "piece", 1, "piece", 102, 0.1, 0, 11.5, 0, "dairy", ["butter"]],
  ["Heavy cream", "1 tbsp", "piece", 1, "piece", 52, 0.3, 0.4, 5.5, 0, "dairy", ["cream"]],
  ["Oats dry", "40 g", "g", 40, "g", 150, 5, 27, 3, 4, "grains", ["oats"]],
  ["Oatmeal cooked", "1 cup", "cup", 1, "cup", 166, 6, 28, 3.5, 4, "grains", ["oatmeal"]],
  ["Cornflakes", "1 cup", "cup", 1, "cup", 100, 2, 24, 0.1, 1, "grains", ["cereal"]],
  ["Banana medium", "1 medium", "piece", 1, "piece", 105, 1.3, 27, 0.4, 3.1, "fruit", ["banana"]],
  ["Apple medium", "1 medium", "piece", 1, "piece", 95, 0.5, 25, 0.3, 4.4, "fruit", ["apple"]],
  ["Orange", "1 medium", "piece", 1, "piece", 62, 1.2, 15, 0.2, 3.1, "fruit", ["orange"]],
  ["Grapes", "100 g", "g", 100, "g", 69, 0.7, 18, 0.2, 0.9, "fruit", ["grapes"]],
  ["Mango", "100 g", "g", 100, "g", 60, 0.8, 15, 0.4, 1.6, "fruit", ["mango"]],
  ["Watermelon", "100 g", "g", 100, "g", 30, 0.6, 8, 0.2, 0.4, "fruit", ["watermelon"]],
  ["Mixed berries", "100 g", "g", 100, "g", 57, 0.7, 14, 0.3, 2.4, "fruit", ["berries"]],
  ["Dates dried", "40 g", "g", 40, "g", 110, 1, 30, 0.1, 3, "fruit", ["dates"]],
  ["Peanut butter", "2 tbsp", "piece", 1, "piece", 190, 8, 7, 16, 2, "snacks", ["peanut butter"]],
  ["Almonds", "28 g", "g", 28, "g", 164, 6, 6, 14, 3.5, "snacks", ["almonds"]],
  ["White bread slice", "1 slice", "piece", 1, "piece", 80, 3, 14, 1, 1, "grains", ["bread"]],
  ["Whole wheat bread slice", "1 slice", "piece", 1, "piece", 82, 4, 14, 1, 2, "grains", ["wheat bread"]],
  ["Bagel plain", "1 medium", "piece", 1, "piece", 245, 9, 48, 1.5, 2, "grains", ["bagel"]],
  ["Croissant", "1 medium", "piece", 1, "piece", 231, 5, 26, 12, 1, "grains", ["croissant"]],
  ["Flour tortilla", "1 medium", "piece", 1, "piece", 104, 3, 18, 2, 1, "grains", ["tortilla"]],
  ["Pasta cooked", "1 cup", "cup", 1, "cup", 221, 8, 43, 1.3, 2.5, "grains", ["pasta"]],
  ["Quinoa cooked", "1 cup", "cup", 1, "cup", 222, 8, 39, 3.6, 5, "grains", ["quinoa"]],
  ["Potato baked", "1 medium", "piece", 1, "piece", 161, 4, 37, 0.2, 3.8, "veg", ["potato"]],
  ["Sweet potato", "100 g", "g", 100, "g", 86, 1.6, 20, 0.1, 3, "veg", ["sweet potato"]],
  ["Broccoli steamed", "1 cup", "cup", 1, "cup", 55, 3.7, 11, 0.6, 5, "veg", ["broccoli"]],
  ["Spinach cooked", "1 cup", "cup", 1, "cup", 41, 5.4, 7, 0.5, 4.3, "veg", ["spinach"]],
  ["Carrots raw", "100 g", "g", 100, "g", 41, 0.9, 10, 0.2, 2.8, "veg", ["carrot"]],
  ["Tomato", "100 g", "g", 100, "g", 18, 0.9, 3.9, 0.2, 1.2, "veg", ["tomato"]],
  ["Cucumber", "100 g", "g", 100, "g", 16, 0.7, 3.6, 0.1, 0.5, "veg", ["cucumber"]],
  ["Bell pepper", "100 g", "g", 100, "g", 31, 1, 6, 0.3, 2.1, "veg", ["pepper"]],
  ["Onion cooked", "100 g", "g", 100, "g", 44, 1.4, 10, 0.2, 1.7, "veg", ["onion"]],
  ["Garlic", "1 clove", "piece", 1, "piece", 5, 0.2, 1, 0, 0.1, "veg", ["garlic"]],
  ["Olive oil", "1 tbsp", "piece", 1, "piece", 120, 0, 0, 14, 0, "fats", ["olive oil"]],
  ["Coconut oil", "1 tbsp", "piece", 1, "piece", 121, 0, 0, 13.5, 0, "fats", ["coconut oil"]],
  ["Black coffee", "1 cup", "cup", 1, "cup", 2, 0.3, 0, 0, 0, "beverage", ["coffee"]],
  ["Tea black unsweetened", "1 cup", "cup", 1, "cup", 2, 0, 0.5, 0, 0, "beverage", ["tea"]],
  ["Orange juice", "1 cup", "cup", 1, "cup", 112, 1.7, 26, 0.5, 0.5, "beverage", ["juice"]],
  ["Cola soft drink", "12 oz", "piece", 1, "piece", 140, 0, 39, 0, 0, "beverage", ["soda"]],
  ["Protein shake ready", "1 bottle", "piece", 1, "piece", 160, 30, 5, 3, 1, "snacks", ["protein shake"]],
  ["Granola bar", "1 bar", "piece", 1, "piece", 130, 2, 24, 3.5, 2, "snacks", ["granola"]],
  ["Dark chocolate", "28 g", "g", 28, "g", 170, 2, 13, 12, 3, "snacks", ["chocolate"]],
  ["Hummus", "2 tbsp", "piece", 1, "piece", 70, 2, 6, 5, 1.5, "snacks", ["hummus"]],
  ["Avocado", "100 g", "g", 100, "g", 160, 2, 9, 15, 6.7, "veg", ["avocado"]],
  ["Potato chips", "28 g", "g", 28, "g", 150, 2, 15, 10, 1, "snacks", ["chips"]],
  ["Pizza cheese slice", "1 slice", "piece", 1, "piece", 285, 12, 36, 10, 2, "meal", ["pizza"]],
  ["Beef burger", "1 sandwich", "piece", 1, "piece", 540, 25, 40, 30, 3, "meal", ["burger"]],
  ["Chicken wrap", "1 wrap", "piece", 1, "piece", 350, 20, 35, 14, 3, "meal", ["wrap"]],
  ["Caesar salad", "1 bowl", "piece", 1, "piece", 180, 8, 12, 14, 3, "meal", ["salad"]],
  ["Sushi roll average", "6 pieces", "piece", 1, "piece", 250, 9, 38, 7, 1, "meal", ["sushi"]],
  ["Ramen noodles cooked", "1 cup", "cup", 1, "cup", 190, 7, 27, 7, 1, "meal", ["ramen"]],
  ["Mac and cheese", "1 cup", "cup", 1, "cup", 310, 13, 44, 9, 2, "meal", ["macaroni"]],
  ["Lasagna", "1 piece", "piece", 1, "piece", 380, 20, 35, 18, 3, "meal", ["lasagna"]],
  ["Fried rice", "1 cup", "cup", 1, "cup", 330, 9, 55, 10, 2, "meal", ["fried rice"]],
  ["Chicken biryani", "1 cup", "cup", 1, "cup", 420, 18, 55, 14, 3, "indian", ["biryani"]],
  ["Paratha", "1 piece", "piece", 1, "piece", 230, 5, 32, 10, 2, "indian", ["paratha"]],
  ["Chapati", "1 piece", "piece", 1, "piece", 120, 3, 18, 4, 2, "indian", ["chapati", "roti"]],
  ["Poha", "1 cup", "cup", 1, "cup", 250, 6, 45, 6, 3, "indian", ["poha"]],
  ["Upma", "1 cup", "cup", 1, "cup", 220, 6, 35, 8, 2, "indian", ["upma"]],
  ["Khichdi", "1 cup", "cup", 1, "cup", 200, 8, 35, 4, 4, "indian", ["khichdi"]],
  ["Sweet lassi", "1 cup", "cup", 1, "cup", 180, 6, 30, 4, 0, "beverage", ["lassi"]],
  ["Cottage cheese lowfat", "100 g", "g", 100, "g", 72, 12, 3, 1, 0, "dairy", ["cottage cheese"]],
  ["Whey protein powder", "1 scoop", "piece", 1, "piece", 120, 24, 3, 1, 0, "snacks", ["whey"]],
  ["French fries", "100 g", "g", 100, "g", 312, 3.4, 41, 15, 3.8, "snacks", ["fries"]],
  ["Ice cream vanilla", "1/2 cup", "piece", 1, "piece", 140, 2.5, 16, 7, 0, "snack", ["ice cream"]],
  ["Honey", "1 tbsp", "piece", 1, "piece", 64, 0, 17, 0, 0, "sweet", ["honey"]],
  ["Maple syrup", "2 tbsp", "piece", 1, "piece", 104, 0, 27, 0, 0, "sweet", ["maple"]],
  ["Jam", "1 tbsp", "piece", 1, "piece", 50, 0.1, 13, 0, 0.2, "sweet", ["jam"]],
  ["Mayonnaise", "1 tbsp", "piece", 1, "piece", 94, 0.1, 0.1, 10, 0, "fats", ["mayo"]],
  ["Ketchup", "1 tbsp", "piece", 1, "piece", 20, 0, 5, 0, 0, "condiment", ["ketchup"]],
  ["Mustard", "1 tsp", "piece", 1, "piece", 3, 0.2, 0.3, 0.2, 0.2, "condiment", ["mustard"]],
  ["Soy sauce", "1 tbsp", "piece", 1, "piece", 10, 1, 1, 0, 0, "condiment", ["soy sauce"]],
  ["Kimchi", "100 g", "g", 100, "g", 23, 1.7, 4, 0.5, 2, "veg", ["kimchi"]],
  ["Miso soup", "1 cup", "cup", 1, "cup", 40, 3, 4, 1, 0, "meal", ["miso"]],
  ["Edamame", "100 g", "g", 100, "g", 121, 11, 10, 5, 5, "protein", ["edamame"]],
  ["Lentil soup", "1 cup", "cup", 1, "cup", 180, 12, 28, 4, 8, "meal", ["lentil soup"]],
  ["Chili con carne", "1 cup", "cup", 1, "cup", 300, 20, 25, 14, 6, "meal", ["chili"]],
  ["Turkey breast sliced", "100 g", "g", 100, "g", 135, 30, 0, 1, 0, "protein", ["turkey"]],
  ["Pork chop", "100 g", "g", 100, "g", 231, 24, 0, 13, 0, "protein", ["pork"]],
  ["Lamb chop", "100 g", "g", 100, "g", 294, 24, 0, 21, 0, "protein", ["lamb"]],
  ["Protein bar", "1 bar", "piece", 1, "piece", 200, 20, 22, 7, 3, "snacks", ["protein bar"]],
  ["Rice cake", "1 cake", "piece", 1, "piece", 35, 0.7, 7, 0.3, 0.4, "snacks", ["rice cake"]],
  ["Popcorn air popped", "3 cups", "piece", 1, "piece", 90, 3, 18, 1, 3.5, "snacks", ["popcorn"]],
  ["Trail mix", "40 g", "g", 40, "g", 180, 5, 15, 12, 3, "snacks", ["trail mix"]],
  ["Energy drink", "1 can", "piece", 1, "piece", 110, 0, 28, 0, 0, "beverage", ["energy drink"]],
  ["Sports drink", "12 oz", "piece", 1, "piece", 80, 0, 21, 0, 0, "beverage", ["sports drink"]],
  ["Fruit smoothie", "1 cup", "cup", 1, "cup", 130, 2, 30, 0.5, 2, "beverage", ["smoothie"]],
  ["Chai latte", "12 oz", "piece", 1, "piece", 190, 6, 32, 5, 0, "beverage", ["chai"]],
  ["Hot chocolate", "1 cup", "cup", 1, "cup", 190, 8, 27, 8, 2, "beverage", ["hot chocolate"]],
  ["Bagel cream cheese", "1 serving", "piece", 1, "piece", 400, 11, 50, 18, 2, "meal", ["bagel"]],
  ["Chicken caesar wrap", "1 wrap", "piece", 1, "piece", 420, 28, 35, 18, 3, "meal", ["caesar wrap"]],
  ["Egg sandwich", "1 sandwich", "piece", 1, "piece", 320, 16, 30, 14, 2, "meal", ["egg sandwich"]],
  ["Tuna salad sandwich", "1 sandwich", "piece", 1, "piece", 350, 20, 35, 14, 2, "meal", ["tuna sandwich"]],
  ["Veggie burger", "1 patty", "piece", 1, "piece", 220, 18, 25, 8, 6, "meal", ["veggie burger"]],
  ["Falafel", "4 balls", "piece", 1, "piece", 320, 14, 35, 16, 6, "meal", ["falafel"]],
  ["Hummus wrap", "1 wrap", "piece", 1, "piece", 310, 10, 40, 12, 5, "meal", ["hummus wrap"]],
  ["Chicken tikka", "100 g", "g", 100, "g", 180, 25, 4, 8, 1, "indian", ["tikka"]],
  ["Palak paneer", "1 cup", "cup", 1, "cup", 320, 14, 15, 24, 5, "indian", ["palak"]],
  ["Rajma curry", "1 cup", "cup", 1, "cup", 240, 12, 38, 4, 11, "indian", ["rajma"]],
  ["Aloo gobi", "1 cup", "cup", 1, "cup", 200, 5, 30, 8, 5, "indian", ["aloo gobi"]],
  ["Chole", "1 cup", "cup", 1, "cup", 270, 12, 40, 8, 10, "indian", ["chole"]],
  ["Masoor dal", "1 cup", "cup", 1, "cup", 200, 12, 30, 4, 8, "indian", ["masoor dal"]],
  ["Curd rice", "1 cup", "cup", 1, "cup", 220, 8, 40, 4, 1, "indian", ["curd rice"]],
  ["Pesarattu", "1 dosa", "piece", 1, "piece", 180, 10, 22, 6, 3, "indian", ["pesarattu"]],
  ["Appam", "2 pieces", "piece", 1, "piece", 160, 4, 30, 2, 1, "indian", ["appam"]],
  ["Puttu", "1 serving", "piece", 1, "piece", 210, 4, 40, 4, 3, "indian", ["puttu"]],
  ["Pongal", "1 cup", "cup", 1, "cup", 260, 9, 40, 8, 2, "indian", ["pongal"]],
  ["Curd plain", "1 cup", "cup", 1, "cup", 150, 8, 12, 8, 0, "dairy", ["curd", "dahi"]],
  ["Green tea", "1 cup", "cup", 1, "cup", 2, 0, 0, 0, 0, "beverage", ["green tea"]],
  ["Espresso", "1 shot", "piece", 1, "piece", 3, 0.3, 0, 0, 0, "beverage", ["espresso"]],
  ["Latte whole milk", "12 oz", "piece", 1, "piece", 180, 9, 14, 9, 0, "beverage", ["latte"]],
  ["Cappuccino", "12 oz", "piece", 1, "piece", 120, 6, 10, 6, 0, "beverage", ["cappuccino"]],
];

function esc(s) {
  return String(s).replace(/'/g, "''");
}

const valueLines = staples.map(([name, ss, su, ra, ru, cal, p, c, f, fib, cat, aliases]) => {
  const norm = esc(String(name).trim().toLowerCase().replace(/\s+/g, " "));
  return `    ('${esc(name)}', null, '${esc(ss)}', '${esc(su)}', ${ra}::numeric, '${esc(
    ru,
  )}', ${cal}::numeric, ${p}::numeric, ${c}::numeric, ${f}::numeric, ${fib}::numeric, null::numeric, null::numeric, '${esc(
    cat,
  )}', array[${aliases.map((a) => `'${esc(a)}'`).join(",")}]::text[], true, 'kg_emergency_seed', '${norm}')`;
});

const sql = `-- Local emergency seed: 100+ staples (no external APIs). Idempotent per DB.
insert into public.food_database (
  name, brand, serving_size, serving_unit, reference_amount, reference_unit,
  calories, protein, carbs, fat, fiber, sugar, sodium, category, aliases, verified, source, normalized_name
)
select v.*
from (
  values
${valueLines.join(",\n")}
) as v(name, brand, serving_size, serving_unit, reference_amount, reference_unit, calories, protein, carbs, fat, fiber, sugar, sodium, category, aliases, verified, source, normalized_name)
where not exists (select 1 from public.food_database fd where fd.source = 'kg_emergency_seed' limit 1);
`;

const out = path.join(__dirname, "..", "supabase", "migrations", "20260521143000_emergency_local_food_seed.sql");
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, sql);
console.log("wrote", out, "foods", staples.length);
