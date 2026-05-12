-- Final batch of local staples (deduped by name).
insert into public.food_database (
  name, brand, serving_size, serving_unit, reference_amount, reference_unit,
  calories, protein, carbs, fat, fiber, sugar, sodium, category, aliases, verified, source, normalized_name
)
select v.*
from (
  values
    ('Honey', null, '1 tbsp', 'piece', 1::numeric, 'piece', 64::numeric, 0::numeric, 17::numeric, 0::numeric, 0::numeric, null::numeric, null::numeric, 'sweet', array['honey']::text[], true, 'kg_emergency_seed', 'honey'),
    ('Maple syrup', null, '2 tbsp', 'piece', 1::numeric, 'piece', 104::numeric, 0::numeric, 27::numeric, 0::numeric, 0::numeric, null::numeric, null::numeric, 'sweet', array['maple']::text[], true, 'kg_emergency_seed', 'maple syrup'),
    ('Jam', null, '1 tbsp', 'piece', 1::numeric, 'piece', 50::numeric, 0.1::numeric, 13::numeric, 0::numeric, 0.2::numeric, null::numeric, null::numeric, 'sweet', array['jam']::text[], true, 'kg_emergency_seed', 'jam'),
    ('Mayonnaise', null, '1 tbsp', 'piece', 1::numeric, 'piece', 94::numeric, 0.1::numeric, 0.1::numeric, 10::numeric, 0::numeric, null::numeric, null::numeric, 'fats', array['mayo']::text[], true, 'kg_emergency_seed', 'mayonnaise'),
    ('Ketchup', null, '1 tbsp', 'piece', 1::numeric, 'piece', 20::numeric, 0::numeric, 5::numeric, 0::numeric, 0::numeric, null::numeric, null::numeric, 'condiment', array['ketchup']::text[], true, 'kg_emergency_seed', 'ketchup'),
    ('Mustard', null, '1 tsp', 'piece', 1::numeric, 'piece', 3::numeric, 0.2::numeric, 0.3::numeric, 0.2::numeric, 0.2::numeric, null::numeric, null::numeric, 'condiment', array['mustard']::text[], true, 'kg_emergency_seed', 'mustard'),
    ('Soy sauce', null, '1 tbsp', 'piece', 1::numeric, 'piece', 10::numeric, 1::numeric, 1::numeric, 0::numeric, 0::numeric, null::numeric, null::numeric, 'condiment', array['soy sauce']::text[], true, 'kg_emergency_seed', 'soy sauce'),
    ('Kimchi', null, '100 g', 'g', 100::numeric, 'g', 23::numeric, 1.7::numeric, 4::numeric, 0.5::numeric, 2::numeric, null::numeric, null::numeric, 'veg', array['kimchi']::text[], true, 'kg_emergency_seed', 'kimchi'),
    ('Miso soup', null, '1 cup', 'cup', 1::numeric, 'cup', 40::numeric, 3::numeric, 4::numeric, 1::numeric, 0::numeric, null::numeric, null::numeric, 'meal', array['miso']::text[], true, 'kg_emergency_seed', 'miso soup'),
    ('Edamame', null, '100 g', 'g', 100::numeric, 'g', 121::numeric, 11::numeric, 10::numeric, 5::numeric, 5::numeric, null::numeric, null::numeric, 'protein', array['edamame']::text[], true, 'kg_emergency_seed', 'edamame'),
    ('Lentil soup', null, '1 cup', 'cup', 1::numeric, 'cup', 180::numeric, 12::numeric, 28::numeric, 4::numeric, 8::numeric, null::numeric, null::numeric, 'meal', array['lentil soup']::text[], true, 'kg_emergency_seed', 'lentil soup'),
    ('Chili con carne', null, '1 cup', 'cup', 1::numeric, 'cup', 300::numeric, 20::numeric, 25::numeric, 14::numeric, 6::numeric, null::numeric, null::numeric, 'meal', array['chili']::text[], true, 'kg_emergency_seed', 'chili con carne'),
    ('Turkey breast sliced', null, '100 g', 'g', 100::numeric, 'g', 135::numeric, 30::numeric, 0::numeric, 1::numeric, 0::numeric, null::numeric, null::numeric, 'protein', array['turkey']::text[], true, 'kg_emergency_seed', 'turkey breast sliced'),
    ('Pork chop', null, '100 g', 'g', 100::numeric, 'g', 231::numeric, 24::numeric, 0::numeric, 13::numeric, 0::numeric, null::numeric, null::numeric, 'protein', array['pork']::text[], true, 'kg_emergency_seed', 'pork chop'),
    ('Lamb chop', null, '100 g', 'g', 100::numeric, 'g', 294::numeric, 24::numeric, 0::numeric, 21::numeric, 0::numeric, null::numeric, null::numeric, 'protein', array['lamb']::text[], true, 'kg_emergency_seed', 'lamb chop'),
    ('Protein bar', null, '1 bar', 'piece', 1::numeric, 'piece', 200::numeric, 20::numeric, 22::numeric, 7::numeric, 3::numeric, null::numeric, null::numeric, 'snacks', array['protein bar']::text[], true, 'kg_emergency_seed', 'protein bar'),
    ('Rice cake', null, '1 cake', 'piece', 1::numeric, 'piece', 35::numeric, 0.7::numeric, 7::numeric, 0.3::numeric, 0.4::numeric, null::numeric, null::numeric, 'snacks', array['rice cake']::text[], true, 'kg_emergency_seed', 'rice cake'),
    ('Popcorn air popped', null, '3 cups', 'piece', 1::numeric, 'piece', 90::numeric, 3::numeric, 18::numeric, 1::numeric, 3.5::numeric, null::numeric, null::numeric, 'snacks', array['popcorn']::text[], true, 'kg_emergency_seed', 'popcorn air popped'),
    ('Trail mix', null, '40 g', 'g', 40::numeric, 'g', 180::numeric, 5::numeric, 15::numeric, 12::numeric, 3::numeric, null::numeric, null::numeric, 'snacks', array['trail mix']::text[], true, 'kg_emergency_seed', 'trail mix'),
    ('Energy drink', null, '1 can', 'piece', 1::numeric, 'piece', 110::numeric, 0::numeric, 28::numeric, 0::numeric, 0::numeric, null::numeric, null::numeric, 'beverage', array['energy drink']::text[], true, 'kg_emergency_seed', 'energy drink'),
    ('Sports drink', null, '12 oz', 'piece', 1::numeric, 'piece', 80::numeric, 0::numeric, 21::numeric, 0::numeric, 0::numeric, null::numeric, null::numeric, 'beverage', array['sports drink']::text[], true, 'kg_emergency_seed', 'sports drink'),
    ('Fruit smoothie', null, '1 cup', 'cup', 1::numeric, 'cup', 130::numeric, 2::numeric, 30::numeric, 0.5::numeric, 2::numeric, null::numeric, null::numeric, 'beverage', array['smoothie']::text[], true, 'kg_emergency_seed', 'fruit smoothie'),
    ('Chai latte', null, '12 oz', 'piece', 1::numeric, 'piece', 190::numeric, 6::numeric, 32::numeric, 5::numeric, 0::numeric, null::numeric, null::numeric, 'beverage', array['chai']::text[], true, 'kg_emergency_seed', 'chai latte'),
    ('Hot chocolate', null, '1 cup', 'cup', 1::numeric, 'cup', 190::numeric, 8::numeric, 27::numeric, 8::numeric, 2::numeric, null::numeric, null::numeric, 'beverage', array['hot chocolate']::text[], true, 'kg_emergency_seed', 'hot chocolate'),
    ('Bagel cream cheese', null, '1 serving', 'piece', 1::numeric, 'piece', 400::numeric, 11::numeric, 50::numeric, 18::numeric, 2::numeric, null::numeric, null::numeric, 'meal', array['bagel']::text[], true, 'kg_emergency_seed', 'bagel cream cheese'),
    ('Chicken caesar wrap', null, '1 wrap', 'piece', 1::numeric, 'piece', 420::numeric, 28::numeric, 35::numeric, 18::numeric, 3::numeric, null::numeric, null::numeric, 'meal', array['caesar wrap']::text[], true, 'kg_emergency_seed', 'chicken caesar wrap'),
    ('Egg sandwich', null, '1 sandwich', 'piece', 1::numeric, 'piece', 320::numeric, 16::numeric, 30::numeric, 14::numeric, 2::numeric, null::numeric, null::numeric, 'meal', array['egg sandwich']::text[], true, 'kg_emergency_seed', 'egg sandwich'),
    ('Tuna salad sandwich', null, '1 sandwich', 'piece', 1::numeric, 'piece', 350::numeric, 20::numeric, 35::numeric, 14::numeric, 2::numeric, null::numeric, null::numeric, 'meal', array['tuna sandwich']::text[], true, 'kg_emergency_seed', 'tuna salad sandwich'),
    ('Veggie burger', null, '1 patty', 'piece', 1::numeric, 'piece', 220::numeric, 18::numeric, 25::numeric, 8::numeric, 6::numeric, null::numeric, null::numeric, 'meal', array['veggie burger']::text[], true, 'kg_emergency_seed', 'veggie burger'),
    ('Falafel', null, '4 balls', 'piece', 1::numeric, 'piece', 320::numeric, 14::numeric, 35::numeric, 16::numeric, 6::numeric, null::numeric, null::numeric, 'meal', array['falafel']::text[], true, 'kg_emergency_seed', 'falafel'),
    ('Hummus wrap', null, '1 wrap', 'piece', 1::numeric, 'piece', 310::numeric, 10::numeric, 40::numeric, 12::numeric, 5::numeric, null::numeric, null::numeric, 'meal', array['hummus wrap']::text[], true, 'kg_emergency_seed', 'hummus wrap'),
    ('Chicken tikka', null, '100 g', 'g', 100::numeric, 'g', 180::numeric, 25::numeric, 4::numeric, 8::numeric, 1::numeric, null::numeric, null::numeric, 'indian', array['tikka']::text[], true, 'kg_emergency_seed', 'chicken tikka'),
    ('Palak paneer', null, '1 cup', 'cup', 1::numeric, 'cup', 320::numeric, 14::numeric, 15::numeric, 24::numeric, 5::numeric, null::numeric, null::numeric, 'indian', array['palak']::text[], true, 'kg_emergency_seed', 'palak paneer'),
    ('Rajma curry', null, '1 cup', 'cup', 1::numeric, 'cup', 240::numeric, 12::numeric, 38::numeric, 4::numeric, 11::numeric, null::numeric, null::numeric, 'indian', array['rajma']::text[], true, 'kg_emergency_seed', 'rajma curry'),
    ('Aloo gobi', null, '1 cup', 'cup', 1::numeric, 'cup', 200::numeric, 5::numeric, 30::numeric, 8::numeric, 5::numeric, null::numeric, null::numeric, 'indian', array['aloo gobi']::text[], true, 'kg_emergency_seed', 'aloo gobi'),
    ('Chole', null, '1 cup', 'cup', 1::numeric, 'cup', 270::numeric, 12::numeric, 40::numeric, 8::numeric, 10::numeric, null::numeric, null::numeric, 'indian', array['chole']::text[], true, 'kg_emergency_seed', 'chole'),
    ('Masoor dal', null, '1 cup', 'cup', 1::numeric, 'cup', 200::numeric, 12::numeric, 30::numeric, 4::numeric, 8::numeric, null::numeric, null::numeric, 'indian', array['masoor dal']::text[], true, 'kg_emergency_seed', 'masoor dal'),
    ('Curd rice', null, '1 cup', 'cup', 1::numeric, 'cup', 220::numeric, 8::numeric, 40::numeric, 4::numeric, 1::numeric, null::numeric, null::numeric, 'indian', array['curd rice']::text[], true, 'kg_emergency_seed', 'curd rice'),
    ('Pesarattu', null, '1 dosa', 'piece', 1::numeric, 'piece', 180::numeric, 10::numeric, 22::numeric, 6::numeric, 3::numeric, null::numeric, null::numeric, 'indian', array['pesarattu']::text[], true, 'kg_emergency_seed', 'pesarattu'),
    ('Appam', null, '2 pieces', 'piece', 1::numeric, 'piece', 160::numeric, 4::numeric, 30::numeric, 2::numeric, 1::numeric, null::numeric, null::numeric, 'indian', array['appam']::text[], true, 'kg_emergency_seed', 'appam'),
    ('Puttu', null, '1 serving', 'piece', 1::numeric, 'piece', 210::numeric, 4::numeric, 40::numeric, 4::numeric, 3::numeric, null::numeric, null::numeric, 'indian', array['puttu']::text[], true, 'kg_emergency_seed', 'puttu'),
    ('Pongal', null, '1 cup', 'cup', 1::numeric, 'cup', 260::numeric, 9::numeric, 40::numeric, 8::numeric, 2::numeric, null::numeric, null::numeric, 'indian', array['pongal']::text[], true, 'kg_emergency_seed', 'pongal'),
    ('Curd plain', null, '1 cup', 'cup', 1::numeric, 'cup', 150::numeric, 8::numeric, 12::numeric, 8::numeric, 0::numeric, null::numeric, null::numeric, 'dairy', array['curd', 'dahi']::text[], true, 'kg_emergency_seed', 'curd plain'),
    ('Green tea', null, '1 cup', 'cup', 1::numeric, 'cup', 2::numeric, 0::numeric, 0::numeric, 0::numeric, 0::numeric, null::numeric, null::numeric, 'beverage', array['green tea']::text[], true, 'kg_emergency_seed', 'green tea'),
    ('Espresso', null, '1 shot', 'piece', 1::numeric, 'piece', 3::numeric, 0.3::numeric, 0::numeric, 0::numeric, 0::numeric, null::numeric, null::numeric, 'beverage', array['espresso']::text[], true, 'kg_emergency_seed', 'espresso'),
    ('Latte whole milk', null, '12 oz', 'piece', 1::numeric, 'piece', 180::numeric, 9::numeric, 14::numeric, 9::numeric, 0::numeric, null::numeric, null::numeric, 'beverage', array['latte']::text[], true, 'kg_emergency_seed', 'latte whole milk'),
    ('Cappuccino', null, '12 oz', 'piece', 1::numeric, 'piece', 120::numeric, 6::numeric, 10::numeric, 6::numeric, 0::numeric, null::numeric, null::numeric, 'beverage', array['cappuccino']::text[], true, 'kg_emergency_seed', 'cappuccino')
) as v(name, brand, serving_size, serving_unit, reference_amount, reference_unit, calories, protein, carbs, fat, fiber, sugar, sodium, category, aliases, verified, source, normalized_name)
where not exists (
  select 1 from public.food_database fd where lower(trim(fd.name)) = lower(trim(v.name))
);
