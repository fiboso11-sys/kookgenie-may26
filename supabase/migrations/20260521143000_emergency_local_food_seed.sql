-- Local emergency seed: 40+ staples (no external APIs). Idempotent: skips if any `kg_emergency_seed` row exists.
-- For the full 100+ list, run `npm run db:seed-emergency` and replace this file, or merge the generated SQL.
insert into public.food_database (
  name, brand, serving_size, serving_unit, reference_amount, reference_unit,
  calories, protein, carbs, fat, fiber, sugar, sodium, category, aliases, verified, source, normalized_name
)
select v.*
from (
  values
    ('Rice white cooked', null, '100 g', 'g', 100::numeric, 'g', 130::numeric, 2.7::numeric, 28::numeric, 0.3::numeric, 0.4::numeric, null::numeric, null::numeric, 'grains', array['rice', 'chawal']::text[], true, 'kg_emergency_seed', 'rice white cooked'),
    ('Brown rice cooked', null, '100 g', 'g', 100::numeric, 'g', 112::numeric, 2.6::numeric, 24::numeric, 0.9::numeric, 1.8::numeric, null::numeric, null::numeric, 'grains', array['brown rice']::text[], true, 'kg_emergency_seed', 'brown rice cooked'),
    ('Basmati rice cooked', null, '100 g', 'g', 100::numeric, 'g', 121::numeric, 3.5::numeric, 25::numeric, 0.4::numeric, 0.4::numeric, null::numeric, null::numeric, 'grains', array['basmati']::text[], true, 'kg_emergency_seed', 'basmati rice cooked'),
    ('Idli', null, '1 piece', 'piece', 1::numeric, 'piece', 39::numeric, 1.3::numeric, 7::numeric, 0.2::numeric, 0.5::numeric, null::numeric, null::numeric, 'indian', array['idli']::text[], true, 'kg_emergency_seed', 'idli'),
    ('Dosa plain', null, '1 medium', 'piece', 1::numeric, 'piece', 187::numeric, 3.5::numeric, 26::numeric, 7.5::numeric, 1.2::numeric, null::numeric, null::numeric, 'indian', array['dosa']::text[], true, 'kg_emergency_seed', 'dosa plain'),
    ('Uttapam', null, '1 piece', 'piece', 1::numeric, 'piece', 180::numeric, 6::numeric, 22::numeric, 8::numeric, 2::numeric, null::numeric, null::numeric, 'indian', array['uttapam']::text[], true, 'kg_emergency_seed', 'uttapam'),
    ('Medu vada', null, '1 piece', 'piece', 1::numeric, 'piece', 150::numeric, 5::numeric, 15::numeric, 8::numeric, 2::numeric, null::numeric, null::numeric, 'indian', array['vada']::text[], true, 'kg_emergency_seed', 'medu vada'),
    ('Sambar 1 cup', null, '1 cup', 'cup', 1::numeric, 'cup', 120::numeric, 6::numeric, 18::numeric, 3::numeric, 4::numeric, null::numeric, null::numeric, 'indian', array['sambar']::text[], true, 'kg_emergency_seed', 'sambar 1 cup'),
    ('Dal tadka', null, '1 cup', 'cup', 1::numeric, 'cup', 200::numeric, 10::numeric, 25::numeric, 6::numeric, 8::numeric, null::numeric, null::numeric, 'indian', array['dal']::text[], true, 'kg_emergency_seed', 'dal tadka'),
    ('Chana masala', null, '1 cup', 'cup', 1::numeric, 'cup', 280::numeric, 12::numeric, 35::numeric, 10::numeric, 9::numeric, null::numeric, null::numeric, 'indian', array['chickpea']::text[], true, 'kg_emergency_seed', 'chana masala'),
    ('Boiled egg', null, '1 large', 'piece', 1::numeric, 'piece', 78::numeric, 6.3::numeric, 0.6::numeric, 5.3::numeric, 0::numeric, null::numeric, null::numeric, 'protein', array['egg']::text[], true, 'kg_emergency_seed', 'boiled egg'),
    ('Scrambled egg', null, '100 g', 'g', 100::numeric, 'g', 149::numeric, 10::numeric, 2::numeric, 11::numeric, 0::numeric, null::numeric, null::numeric, 'protein', array['egg']::text[], true, 'kg_emergency_seed', 'scrambled egg'),
    ('Paneer', null, '100 g', 'g', 100::numeric, 'g', 265::numeric, 18::numeric, 3::numeric, 20::numeric, 0::numeric, null::numeric, null::numeric, 'dairy', array['paneer']::text[], true, 'kg_emergency_seed', 'paneer'),
    ('Tofu firm', null, '100 g', 'g', 100::numeric, 'g', 144::numeric, 17::numeric, 3::numeric, 9::numeric, 2::numeric, null::numeric, null::numeric, 'protein', array['tofu']::text[], true, 'kg_emergency_seed', 'tofu firm'),
    ('Chicken breast grilled', null, '100 g', 'g', 100::numeric, 'g', 165::numeric, 31::numeric, 0::numeric, 3.6::numeric, 0::numeric, null::numeric, null::numeric, 'protein', array['chicken']::text[], true, 'kg_emergency_seed', 'chicken breast grilled'),
    ('Chicken thigh roasted', null, '100 g', 'g', 100::numeric, 'g', 209::numeric, 26::numeric, 0::numeric, 10::numeric, 0::numeric, null::numeric, null::numeric, 'protein', array['chicken thigh']::text[], true, 'kg_emergency_seed', 'chicken thigh roasted'),
    ('Salmon baked', null, '100 g', 'g', 100::numeric, 'g', 206::numeric, 22::numeric, 0::numeric, 12::numeric, 0::numeric, null::numeric, null::numeric, 'protein', array['salmon']::text[], true, 'kg_emergency_seed', 'salmon baked'),
    ('Tuna canned water', null, '100 g', 'g', 100::numeric, 'g', 116::numeric, 26::numeric, 0::numeric, 0.8::numeric, 0::numeric, null::numeric, null::numeric, 'protein', array['tuna']::text[], true, 'kg_emergency_seed', 'tuna canned water'),
    ('Shrimp cooked', null, '100 g', 'g', 100::numeric, 'g', 99::numeric, 24::numeric, 0.2::numeric, 0.3::numeric, 0::numeric, null::numeric, null::numeric, 'protein', array['shrimp']::text[], true, 'kg_emergency_seed', 'shrimp cooked'),
    ('Beef steak lean', null, '100 g', 'g', 100::numeric, 'g', 250::numeric, 26::numeric, 0::numeric, 15::numeric, 0::numeric, null::numeric, null::numeric, 'protein', array['beef', 'steak']::text[], true, 'kg_emergency_seed', 'beef steak lean'),
    ('Milk whole', null, '1 cup', 'cup', 1::numeric, 'cup', 150::numeric, 8::numeric, 12::numeric, 8::numeric, 0::numeric, null::numeric, null::numeric, 'dairy', array['milk']::text[], true, 'kg_emergency_seed', 'milk whole'),
    ('Milk skim', null, '1 cup', 'cup', 1::numeric, 'cup', 83::numeric, 8::numeric, 12::numeric, 0.2::numeric, 0::numeric, null::numeric, null::numeric, 'dairy', array['skim milk']::text[], true, 'kg_emergency_seed', 'milk skim'),
    ('Yogurt plain', null, '1 cup', 'cup', 1::numeric, 'cup', 150::numeric, 13::numeric, 17::numeric, 4::numeric, 0::numeric, null::numeric, null::numeric, 'dairy', array['yogurt']::text[], true, 'kg_emergency_seed', 'yogurt plain'),
    ('Greek yogurt', null, '1 cup', 'cup', 1::numeric, 'cup', 220::numeric, 20::numeric, 9::numeric, 11::numeric, 0::numeric, null::numeric, null::numeric, 'dairy', array['greek yogurt']::text[], true, 'kg_emergency_seed', 'greek yogurt'),
    ('Cheddar cheese', null, '30 g', 'g', 30::numeric, 'g', 120::numeric, 7::numeric, 0::numeric, 10::numeric, 0::numeric, null::numeric, null::numeric, 'dairy', array['cheese']::text[], true, 'kg_emergency_seed', 'cheddar cheese'),
    ('Butter', null, '1 tbsp', 'piece', 1::numeric, 'piece', 102::numeric, 0.1::numeric, 0::numeric, 11.5::numeric, 0::numeric, null::numeric, null::numeric, 'dairy', array['butter']::text[], true, 'kg_emergency_seed', 'butter'),
    ('Heavy cream', null, '1 tbsp', 'piece', 1::numeric, 'piece', 52::numeric, 0.3::numeric, 0.4::numeric, 5.5::numeric, 0::numeric, null::numeric, null::numeric, 'dairy', array['cream']::text[], true, 'kg_emergency_seed', 'heavy cream'),
    ('Oats dry', null, '40 g', 'g', 40::numeric, 'g', 150::numeric, 5::numeric, 27::numeric, 3::numeric, 4::numeric, null::numeric, null::numeric, 'grains', array['oats']::text[], true, 'kg_emergency_seed', 'oats dry'),
    ('Oatmeal cooked', null, '1 cup', 'cup', 1::numeric, 'cup', 166::numeric, 6::numeric, 28::numeric, 3.5::numeric, 4::numeric, null::numeric, null::numeric, 'grains', array['oatmeal']::text[], true, 'kg_emergency_seed', 'oatmeal cooked'),
    ('Cornflakes', null, '1 cup', 'cup', 1::numeric, 'cup', 100::numeric, 2::numeric, 24::numeric, 0.1::numeric, 1::numeric, null::numeric, null::numeric, 'grains', array['cereal']::text[], true, 'kg_emergency_seed', 'cornflakes'),
    ('Banana medium', null, '1 medium', 'piece', 1::numeric, 'piece', 105::numeric, 1.3::numeric, 27::numeric, 0.4::numeric, 3.1::numeric, null::numeric, null::numeric, 'fruit', array['banana']::text[], true, 'kg_emergency_seed', 'banana medium'),
    ('Apple medium', null, '1 medium', 'piece', 1::numeric, 'piece', 95::numeric, 0.5::numeric, 25::numeric, 0.3::numeric, 4.4::numeric, null::numeric, null::numeric, 'fruit', array['apple']::text[], true, 'kg_emergency_seed', 'apple medium'),
    ('Orange', null, '1 medium', 'piece', 1::numeric, 'piece', 62::numeric, 1.2::numeric, 15::numeric, 0.2::numeric, 3.1::numeric, null::numeric, null::numeric, 'fruit', array['orange']::text[], true, 'kg_emergency_seed', 'orange'),
    ('Grapes', null, '100 g', 'g', 100::numeric, 'g', 69::numeric, 0.7::numeric, 18::numeric, 0.2::numeric, 0.9::numeric, null::numeric, null::numeric, 'fruit', array['grapes']::text[], true, 'kg_emergency_seed', 'grapes'),
    ('Mango', null, '100 g', 'g', 100::numeric, 'g', 60::numeric, 0.8::numeric, 15::numeric, 0.4::numeric, 1.6::numeric, null::numeric, null::numeric, 'fruit', array['mango']::text[], true, 'kg_emergency_seed', 'mango'),
    ('Watermelon', null, '100 g', 'g', 100::numeric, 'g', 30::numeric, 0.6::numeric, 8::numeric, 0.2::numeric, 0.4::numeric, null::numeric, null::numeric, 'fruit', array['watermelon']::text[], true, 'kg_emergency_seed', 'watermelon'),
    ('Mixed berries', null, '100 g', 'g', 100::numeric, 'g', 57::numeric, 0.7::numeric, 14::numeric, 0.3::numeric, 2.4::numeric, null::numeric, null::numeric, 'fruit', array['berries']::text[], true, 'kg_emergency_seed', 'mixed berries'),
    ('Dates dried', null, '40 g', 'g', 40::numeric, 'g', 110::numeric, 1::numeric, 30::numeric, 0.1::numeric, 3::numeric, null::numeric, null::numeric, 'fruit', array['dates']::text[], true, 'kg_emergency_seed', 'dates dried'),
    ('Peanut butter', null, '2 tbsp', 'piece', 1::numeric, 'piece', 190::numeric, 8::numeric, 7::numeric, 16::numeric, 2::numeric, null::numeric, null::numeric, 'snacks', array['peanut butter']::text[], true, 'kg_emergency_seed', 'peanut butter'),
    ('Almonds', null, '28 g', 'g', 28::numeric, 'g', 164::numeric, 6::numeric, 6::numeric, 14::numeric, 3.5::numeric, null::numeric, null::numeric, 'snacks', array['almonds']::text[], true, 'kg_emergency_seed', 'almonds'),
    ('White bread slice', null, '1 slice', 'piece', 1::numeric, 'piece', 80::numeric, 3::numeric, 14::numeric, 1::numeric, 1::numeric, null::numeric, null::numeric, 'grains', array['bread']::text[], true, 'kg_emergency_seed', 'white bread slice'),
    ('Whole wheat bread slice', null, '1 slice', 'piece', 1::numeric, 'piece', 82::numeric, 4::numeric, 14::numeric, 1::numeric, 2::numeric, null::numeric, null::numeric, 'grains', array['wheat bread']::text[], true, 'kg_emergency_seed', 'whole wheat bread slice'),
    ('Black coffee', null, '1 cup', 'cup', 1::numeric, 'cup', 2::numeric, 0.3::numeric, 0::numeric, 0::numeric, 0::numeric, null::numeric, null::numeric, 'beverage', array['coffee']::text[], true, 'kg_emergency_seed', 'black coffee'),
    ('Tea black unsweetened', null, '1 cup', 'cup', 1::numeric, 'cup', 2::numeric, 0::numeric, 0.5::numeric, 0::numeric, 0::numeric, null::numeric, null::numeric, 'beverage', array['tea']::text[], true, 'kg_emergency_seed', 'tea black unsweetened')
) as v(name, brand, serving_size, serving_unit, reference_amount, reference_unit, calories, protein, carbs, fat, fiber, sugar, sodium, category, aliases, verified, source, normalized_name)
where not exists (
  select 1 from public.food_database fd where lower(trim(fd.name)) = lower(trim(v.name))
);
