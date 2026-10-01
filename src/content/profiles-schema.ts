import { z } from 'astro/zod';

export const profilesSchema = z.strictObject({
  id: z.uuid(),
  title: z.string(),
  url: z.url(),
});

export type ProfileData = z.infer<typeof profilesSchema>;

export function assertUniqueProfiles(
  profiles: readonly Pick<ProfileData, 'id'>[],
): void {
  const ids = new Set<string>();

  for (const profile of profiles) {
    if (ids.has(profile.id)) {
      throw new Error(`Duplicate profile id: ${profile.id}`);
    }
    ids.add(profile.id);
  }
}

const compareByTitle = (a: ProfileData, b: ProfileData): number => {
  if (a.title < b.title) {
    return -1;
  }
  if (a.title > b.title) {
    return 1;
  }
  return 0;
};

export function sortProfiles<T extends ProfileData>(
  profiles: readonly T[],
): T[] {
  assertUniqueProfiles(profiles);
  return [...profiles].sort(compareByTitle);
}
