-- Ensure starter library includes common lookups (idempotent inserts).

insert into public.food_database (
  name,
  normalized_name,
  serving_size,
  serving_unit,
  reference_amount,
  reference_unit,
  calories,
  protein,
  carbs,
  fat,
  fiber,
  category,
  aliases,
  verified,
  source
)
select
  'Apple (medium)',
  'apple (medium)',
  '1 medium (~182 g)',
  'piece',
  1,
  'piece',
  95,
  0.5,
  25,
  0.3,
  4.4,
  'fruit',
  array['apple', 'apples'],
  true,
  'manual'
where not exists (
  select 1 from public.food_database fd where fd.normalized_name = 'apple (medium)'
);

-- Strengthen rice discovery: alias "ric" is too aggressive; ensure plain "rice" hits cooked rice row.
update public.food_database fd
set aliases = array_append(fd.aliases, 'white rice')
where fd.name = 'Cooked rice (white)'
  and not ('white rice' = any (fd.aliases));
