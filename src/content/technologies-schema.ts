import { z } from 'astro/zod';

export const TECHNOLOGY_CATEGORIES = [
  'Frontend',
  'Backend y Nube',
  'IA y Sistemas',
  'Flujo de Trabajo y Diseño',
] as const;

export type TechnologyCategory = (typeof TECHNOLOGY_CATEGORIES)[number];

export const LOCAL_ICON_PATH_PATTERN = /^\/icons\/logos\/[a-z0-9-]+\.svg$/;

export const technologiesSchema = z.strictObject({
  id: z.uuid(),
  category: z.enum(TECHNOLOGY_CATEGORIES),
  iconUrl: z.string().regex(LOCAL_ICON_PATH_PATTERN),
  name: z.string(),
});

export type TechnologyData = z.infer<typeof technologiesSchema>;

export function assertUniqueTechnologies(
  technologies: readonly Pick<TechnologyData, 'id'>[],
): void {
  const ids = new Set<string>();

  for (const technology of technologies) {
    if (ids.has(technology.id)) {
      throw new Error(`Duplicate technology id: ${technology.id}`);
    }
    ids.add(technology.id);
  }
}

export interface TechnologyGroup<T extends TechnologyData = TechnologyData> {
  category: TechnologyCategory;
  items: T[];
}

const compareByName = (a: TechnologyData, b: TechnologyData): number => {
  if (a.name < b.name) {
    return -1;
  }
  if (a.name > b.name) {
    return 1;
  }
  return 0;
};

export function groupTechnologies<T extends TechnologyData>(
  technologies: readonly T[],
): TechnologyGroup<T>[] {
  assertUniqueTechnologies(technologies);

  return TECHNOLOGY_CATEGORIES.flatMap((category) => {
    const items = technologies
      .filter((technology) => technology.category === category)
      .sort(compareByName);

    return items.length > 0 ? [{ category, items }] : [];
  });
}
