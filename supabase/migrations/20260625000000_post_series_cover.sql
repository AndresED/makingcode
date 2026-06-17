-- Series card cover image (public /series index + series hub header)

alter table public.post_series
  add column if not exists cover_image_url text;

comment on column public.post_series.cover_image_url is
  'Optional cover for series cards and series page hero. Same storage as post covers (/api/upload/cover).';
