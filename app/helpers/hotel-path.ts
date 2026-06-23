type HotelPathSource = {
  slug?: string | null;
  business_slug?: string | null;
  business_unique_id?: string | null;
  id?: number | string | null;
  business_id?: number | string | null;
};

/** Public hotel URL segment — slug first, then business unique id, then numeric id. */
export function hotelPathKey(source: HotelPathSource): string | null {
  const slug = source.slug ?? source.business_slug;
  if (slug != null && String(slug).trim() !== '') {
    return String(slug).trim();
  }

  const uniqueId = source.business_unique_id;
  if (uniqueId != null && String(uniqueId).trim() !== '') {
    return String(uniqueId).trim();
  }

  const id = source.id ?? source.business_id;
  if (id != null && String(id).trim() !== '') {
    return String(id).trim();
  }

  return null;
}

export function hotelPathFromBusiness(source: HotelPathSource): string | null {
  const key = hotelPathKey(source);
  return key ? `/hotel/${encodeURIComponent(key)}` : null;
}
