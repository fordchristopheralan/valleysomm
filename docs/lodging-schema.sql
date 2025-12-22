create table public.lodging (
  id uuid not null default gen_random_uuid (),
  name text not null,
  slug text not null,
  description text null,
  tagline text null,
  address text not null,
  city text not null,
  state text not null default 'NC'::text,
  zip_code text null,
  latitude numeric(10, 8) not null,
  longitude numeric(11, 8) not null,
  phone text null,
  website text null,
  email text null,
  booking_url text null,
  lodging_type text not null,
  price_tier text null,
  price_range text null,
  room_count integer null,
  max_guests integer null,
  amenities text[] null default '{}'::text[],
  winery_distance_notes text null,
  nearest_winery_id uuid null,
  nearest_winery_minutes integer null,
  wine_packages_available boolean null default false,
  wine_package_notes text null,
  vibe_tags text[] null default '{}'::text[],
  best_for text[] null default '{}'::text[],
  check_in_time text null,
  check_out_time text null,
  minimum_stay integer null default 1,
  partner_winery_ids uuid[] null default '{}'::uuid[],
  partnership_notes text null,
  is_winery_lodging boolean null default false,
  associated_winery_id uuid null,
  active boolean null default true,
  featured boolean null default false,
  priority_rank integer null default 50,
  data_source text null,
  data_completeness_score integer null,
  last_verified_at timestamp with time zone null,
  internal_notes text null,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint lodging_pkey primary key (id),
  constraint lodging_slug_key unique (slug),
  constraint lodging_associated_winery_id_fkey foreign KEY (associated_winery_id) references wineries (id),
  constraint lodging_nearest_winery_id_fkey foreign KEY (nearest_winery_id) references wineries (id)
) TABLESPACE pg_default;

create index IF not exists idx_lodging_active on public.lodging using btree (active) TABLESPACE pg_default;

create index IF not exists idx_lodging_location on public.lodging using btree (latitude, longitude) TABLESPACE pg_default;

create index IF not exists idx_lodging_type on public.lodging using btree (lodging_type) TABLESPACE pg_default;

create index IF not exists idx_lodging_price_tier on public.lodging using btree (price_tier) TABLESPACE pg_default;

create index IF not exists idx_lodging_vibe_tags on public.lodging using gin (vibe_tags) TABLESPACE pg_default;

create index IF not exists idx_lodging_best_for on public.lodging using gin (best_for) TABLESPACE pg_default;

create index IF not exists idx_lodging_winery_lodging on public.lodging using btree (is_winery_lodging) TABLESPACE pg_default
where
  (is_winery_lodging = true);

create trigger update_lodging_updated_at BEFORE
update on lodging for EACH row
execute FUNCTION update_updated_at_column ();