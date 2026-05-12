-- Allow anon to execute search RPC so /api/foods/search works when the server has no session cookie
-- but the table is still readable under RLS. Safe: function is read-only on public.food_database.

grant execute on function public.search_food_database(text, int) to anon;
