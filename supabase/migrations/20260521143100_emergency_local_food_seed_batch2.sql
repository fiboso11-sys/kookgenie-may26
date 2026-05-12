-- More local staples (deduped by food name vs existing rows).
insert into public.food_database (
  name, brand, serving_size, serving_unit, reference_amount, reference_unit,
  calories, protein, carbs, fat, fiber, sugar, sodium, category, aliases, verified, source, normalized_name
)
select v.*
from (
  values
    ('Bagel plain', null, '1 medium', 'piece', 1::numeric, 'piece', 245::numeric, 9::numeric, 48::numeric, 1.5::numeric, 2::numeric, null::numeric, null::numeric, 'grains', array['bagel']::text[], true, 'kg_emergency_seed', 'bagel plain'),
    ('Croissant', null, '1 medium', 'piece', 1::numeric, 'piece', 231::numeric, 5::numeric, 26::numeric, 12::numeric, 1::numeric, null::numeric, null::numeric, 'grains', array['croissant']::text[], true, 'kg_emergency_seed', 'croissant'),
    ('Flour tortilla', null, '1 medium', 'piece', 1::numeric, 'piece', 104::numeric, 3::numeric, 18::numeric, 2::numeric, 1::numeric, null::numeric, null::numeric, 'grains', array['tortilla']::text[], true, 'kg_emergency_seed', 'flour tortilla'),
    ('Pasta cooked', null, '1 cup', 'cup', 1::numeric, 'cup', 221::numeric, 8::numeric, 43::numeric, 1.3::numeric, 2.5::numeric, null::numeric, null::numeric, 'grains', array['pasta']::text[], true, 'kg_emergency_seed', 'pasta cooked'),
    ('Quinoa cooked', null, '1 cup', 'cup', 1::numeric, 'cup', 222::numeric, 8::numeric, 39::numeric, 3.6::numeric, 5::numeric, null::numeric, null::numeric, 'grains', array['quinoa']::text[], true, 'kg_emergency_seed', 'quinoa cooked'),
    ('Potato baked', null, '1 medium', 'piece', 1::numeric, 'piece', 161::numeric, 4::numeric, 37::numeric, 0.2::numeric, 3.8::numeric, null::numeric, null::numeric, 'veg', array['potato']::text[], true, 'kg_emergency_seed', 'potato baked'),
    ('Sweet potato', null, '100 g', 'g', 100::numeric, 'g', 86::numeric, 1.6::numeric, 20::numeric, 0.1::numeric, 3::numeric, null::numeric, null::numeric, 'veg', array['sweet potato']::text[], true, 'kg_emergency_seed', 'sweet potato'),
    ('Broccoli steamed', null, '1 cup', 'cup', 1::numeric, 'cup', 55::numeric, 3.7::numeric, 11::numeric, 0.6::numeric, 5::numeric, null::numeric, null::numeric, 'veg', array['broccoli']::text[], true, 'kg_emergency_seed', 'broccoli steamed'),
    ('Spinach cooked', null, '1 cup', 'cup', 1::numeric, 'cup', 41::numeric, 5.4::numeric, 7::numeric, 0.5::numeric, 4.3::numeric, null::numeric, null::numeric, 'veg', array['spinach']::text[], true, 'kg_emergency_seed', 'spinach cooked'),
    ('Carrots raw', null, '100 g', 'g', 100::numeric, 'g', 41::numeric, 0.9::numeric, 10::numeric, 0.2::numeric, 2.8::numeric, null::numeric, null::numeric, 'veg', array['carrot']::text[], true, 'kg_emergency_seed', 'carrots raw'),
    ('Tomato', null, '100 g', 'g', 100::numeric, 'g', 18::numeric, 0.9::numeric, 3.9::numeric, 0.2::numeric, 1.2::numeric, null::numeric, null::numeric, 'veg', array['tomato']::text[], true, 'kg_emergency_seed', 'tomato'),
    ('Cucumber', null, '100 g', 'g', 100::numeric, 'g', 16::numeric, 0.7::numeric, 3.6::numeric, 0.1::numeric, 0.5::numeric, null::numeric, null::numeric, 'veg', array['cucumber']::text[], true, 'kg_emergency_seed', 'cucumber'),
    ('Bell pepper', null, '100 g', 'g', 100::numeric, 'g', 31::numeric, 1::numeric, 6::numeric, 0.3::numeric, 2.1::numeric, null::numeric, null::numeric, 'veg', array['pepper']::text[], true, 'kg_emergency_seed', 'bell pepper'),
    ('Onion cooked', null, '100 g', 'g', 100::numeric, 'g', 44::numeric, 1.4::numeric, 10::numeric, 0.2::numeric, 1.7::numeric, null::numeric, null::numeric, 'veg', array['onion']::text[], true, 'kg_emergency_seed', 'onion cooked'),
    ('Garlic', null, '1 clove', 'piece', 1::numeric, 'piece', 5::numeric, 0.2::numeric, 1::numeric, 0::numeric, 0.1::numeric, null::numeric, null::numeric, 'veg', array['garlic']::text[], true, 'kg_emergency_seed', 'garlic'),
    ('Olive oil', null, '1 tbsp', 'piece', 1::numeric, 'piece', 120::numeric, 0::numeric, 0::numeric, 14::numeric, 0::numeric, null::numeric, null::numeric, 'fats', array['olive oil']::text[], true, 'kg_emergency_seed', 'olive oil'),
    ('Coconut oil', null, '1 tbsp', 'piece', 1::numeric, 'piece', 121::numeric, 0::numeric, 0::numeric, 13.5::numeric, 0::numeric, null::numeric, null::numeric, 'fats', array['coconut oil']::text[], true, 'kg_emergency_seed', 'coconut oil'),
    ('Orange juice', null, '1 cup', 'cup', 1::numeric, 'cup', 112::numeric, 1.7::numeric, 26::numeric, 0.5::numeric, 0.5::numeric, null::numeric, null::numeric, 'beverage', array['juice']::text[], true, 'kg_emergency_seed', 'orange juice'),
    ('Cola soft drink', null, '12 oz', 'piece', 1::numeric, 'piece', 140::numeric, 0::numeric, 39::numeric, 0::numeric, 0::numeric, null::numeric, null::numeric, 'beverage', array['soda']::text[], true, 'kg_emergency_seed', 'cola soft drink'),
    ('Protein shake ready', null, '1 bottle', 'piece', 1::numeric, 'piece', 160::numeric, 30::numeric, 5::numeric, 3::numeric, 1::numeric, null::numeric, null::numeric, 'snacks', array['protein shake']::text[], true, 'kg_emergency_seed', 'protein shake ready'),
    ('Granola bar', null, '1 bar', 'piece', 1::numeric, 'piece', 130::numeric, 2::numeric, 24::numeric, 3.5::numeric, 2::numeric, null::numeric, null::numeric, 'snacks', array['granola']::text[], true, 'kg_emergency_seed', 'granola bar'),
    ('Dark chocolate', null, '28 g', 'g', 28::numeric, 'g', 170::numeric, 2::numeric, 13::numeric, 12::numeric, 3::numeric, null::numeric, null::numeric, 'snacks', array['chocolate']::text[], true, 'kg_emergency_seed', 'dark chocolate'),
    ('Hummus', null, '2 tbsp', 'piece', 1::numeric, 'piece', 70::numeric, 2::numeric, 6::numeric, 5::numeric, 1.5::numeric, null::numeric, null::numeric, 'snacks', array['hummus']::text[], true, 'kg_emergency_seed', 'hummus'),
    ('Avocado', null, '100 g', 'g', 100::numeric, 'g', 160::numeric, 2::numeric, 9::numeric, 15::numeric, 6.7::numeric, null::numeric, null::numeric, 'veg', array['avocado']::text[], true, 'kg_emergency_seed', 'avocado'),
    ('Potato chips', null, '28 g', 'g', 28::numeric, 'g', 150::numeric, 2::numeric, 15::numeric, 10::numeric, 1::numeric, null::numeric, null::numeric, 'snacks', array['chips']::text[], true, 'kg_emergency_seed', 'potato chips'),
    ('Pizza cheese slice', null, '1 slice', 'piece', 1::numeric, 'piece', 285::numeric, 12::numeric, 36::numeric, 10::numeric, 2::numeric, null::numeric, null::numeric, 'meal', array['pizza']::text[], true, 'kg_emergency_seed', 'pizza cheese slice'),
    ('Beef burger', null, '1 sandwich', 'piece', 1::numeric, 'piece', 540::numeric, 25::numeric, 40::numeric, 30::numeric, 3::numeric, null::numeric, null::numeric, 'meal', array['burger']::text[], true, 'kg_emergency_seed', 'beef burger'),
    ('Chicken wrap', null, '1 wrap', 'piece', 1::numeric, 'piece', 350::numeric, 20::numeric, 35::numeric, 14::numeric, 3::numeric, null::numeric, null::numeric, 'meal', array['wrap']::text[], true, 'kg_emergency_seed', 'chicken wrap'),
    ('Caesar salad', null, '1 bowl', 'piece', 1::numeric, 'piece', 180::numeric, 8::numeric, 12::numeric, 14::numeric, 3::numeric, null::numeric, null::numeric, 'meal', array['salad']::text[], true, 'kg_emergency_seed', 'caesar salad'),
    ('Sushi roll average', null, '6 pieces', 'piece', 1::numeric, 'piece', 250::numeric, 9::numeric, 38::numeric, 7::numeric, 1::numeric, null::numeric, null::numeric, 'meal', array['sushi']::text[], true, 'kg_emergency_seed', 'sushi roll average'),
    ('Ramen noodles cooked', null, '1 cup', 'cup', 1::numeric, 'cup', 190::numeric, 7::numeric, 27::numeric, 7::numeric, 1::numeric, null::numeric, null::numeric, 'meal', array['ramen']::text[], true, 'kg_emergency_seed', 'ramen noodles cooked'),
    ('Mac and cheese', null, '1 cup', 'cup', 1::numeric, 'cup', 310::numeric, 13::numeric, 44::numeric, 9::numeric, 2::numeric, null::numeric, null::numeric, 'meal', array['macaroni']::text[], true, 'kg_emergency_seed', 'mac and cheese'),
    ('Lasagna', null, '1 piece', 'piece', 1::numeric, 'piece', 380::numeric, 20::numeric, 35::numeric, 18::numeric, 3::numeric, null::numeric, null::numeric, 'meal', array['lasagna']::text[], true, 'kg_emergency_seed', 'lasagna'),
    ('Fried rice', null, '1 cup', 'cup', 1::numeric, 'cup', 330::numeric, 9::numeric, 55::numeric, 10::numeric, 2::numeric, null::numeric, null::numeric, 'meal', array['fried rice']::text[], true, 'kg_emergency_seed', 'fried rice'),
    ('Chicken biryani', null, '1 cup', 'cup', 1::numeric, 'cup', 420::numeric, 18::numeric, 55::numeric, 14::numeric, 3::numeric, null::numeric, null::numeric, 'indian', array['biryani']::text[], true, 'kg_emergency_seed', 'chicken biryani'),
    ('Paratha', null, '1 piece', 'piece', 1::numeric, 'piece', 230::numeric, 5::numeric, 32::numeric, 10::numeric, 2::numeric, null::numeric, null::numeric, 'indian', array['paratha']::text[], true, 'kg_emergency_seed', 'paratha'),
    ('Chapati', null, '1 piece', 'piece', 1::numeric, 'piece', 120::numeric, 3::numeric, 18::numeric, 4::numeric, 2::numeric, null::numeric, null::numeric, 'indian', array['chapati', 'roti']::text[], true, 'kg_emergency_seed', 'chapati'),
    ('Poha', null, '1 cup', 'cup', 1::numeric, 'cup', 250::numeric, 6::numeric, 45::numeric, 6::numeric, 3::numeric, null::numeric, null::numeric, 'indian', array['poha']::text[], true, 'kg_emergency_seed', 'poha'),
    ('Upma', null, '1 cup', 'cup', 1::numeric, 'cup', 220::numeric, 6::numeric, 35::numeric, 8::numeric, 2::numeric, null::numeric, null::numeric, 'indian', array['upma']::text[], true, 'kg_emergency_seed', 'upma'),
    ('Khichdi', null, '1 cup', 'cup', 1::numeric, 'cup', 200::numeric, 8::numeric, 35::numeric, 4::numeric, 4::numeric, null::numeric, null::numeric, 'indian', array['khichdi']::text[], true, 'kg_emergency_seed', 'khichdi'),
    ('Sweet lassi', null, '1 cup', 'cup', 1::numeric, 'cup', 180::numeric, 6::numeric, 30::numeric, 4::numeric, 0::numeric, null::numeric, null::numeric, 'beverage', array['lassi']::text[], true, 'kg_emergency_seed', 'sweet lassi'),
    ('Cottage cheese lowfat', null, '100 g', 'g', 100::numeric, 'g', 72::numeric, 12::numeric, 3::numeric, 1::numeric, 0::numeric, null::numeric, null::numeric, 'dairy', array['cottage cheese']::text[], true, 'kg_emergency_seed', 'cottage cheese lowfat'),
    ('Whey protein powder', null, '1 scoop', 'piece', 1::numeric, 'piece', 120::numeric, 24::numeric, 3::numeric, 1::numeric, 0::numeric, null::numeric, null::numeric, 'snacks', array['whey']::text[], true, 'kg_emergency_seed', 'whey protein powder'),
    ('French fries', null, '100 g', 'g', 100::numeric, 'g', 312::numeric, 3.4::numeric, 41::numeric, 15::numeric, 3.8::numeric, null::numeric, null::numeric, 'snacks', array['fries']::text[], true, 'kg_emergency_seed', 'french fries'),
    ('Ice cream vanilla', null, '1/2 cup', 'piece', 1::numeric, 'piece', 140::numeric, 2.5::numeric, 16::numeric, 7::numeric, 0::numeric, null::numeric, null::numeric, 'snack', array['ice cream']::text[], true, 'kg_emergency_seed', 'ice cream vanilla')
) as v(name, brand, serving_size, serving_unit, reference_amount, reference_unit, calories, protein, carbs, fat, fiber, sugar, sodium, category, aliases, verified, source, normalized_name)
where not exists (
  select 1 from public.food_database fd where lower(trim(fd.name)) = lower(trim(v.name))
);
