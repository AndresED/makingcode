/** Shared helpers for post_series + post_series_members in seed/patch scripts. */

export function slugToSeriesTitle(slug) {
  return slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export async function upsertSeriesMembership(
  supabase,
  { seriesSlug, seriesOrder, seriesTitle, seriesDescription, postId },
  dryRun = false,
) {
  if (!seriesSlug || seriesOrder == null) return;

  const seriesRow = {
    slug: seriesSlug,
    title_en: seriesTitle?.title_en ?? slugToSeriesTitle(seriesSlug),
    title_es: seriesTitle?.title_es ?? seriesTitle?.title_en ?? slugToSeriesTitle(seriesSlug),
    ...(seriesDescription?.description_en
      ? {
          description_en: seriesDescription.description_en,
          description_es: seriesDescription.description_es ?? seriesDescription.description_en,
        }
      : {}),
  };

  if (dryRun) {
    console.log(`[dry-run] series ${seriesSlug} #${seriesOrder} → post ${postId}`);
    return;
  }

  const { data: series, error: seriesError } = await supabase
    .from('post_series')
    .upsert(seriesRow, { onConflict: 'slug' })
    .select('id')
    .single();

  if (seriesError) throw seriesError;

  const { error: memberError } = await supabase.from('post_series_members').upsert(
    {
      series_id: series.id,
      post_id: postId,
      position: seriesOrder,
    },
    { onConflict: 'post_id' },
  );

  if (memberError) throw memberError;
}
