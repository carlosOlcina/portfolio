import { z } from 'astro/zod';
import type { ImageMetadata } from 'astro';

export interface ProjectsSchemaDependencies<TCover extends z.ZodType> {
  image: () => TCover;
}

export function buildProjectsSchema<
  TCover extends z.ZodType = z.ZodType<ImageMetadata>,
>({ image }: ProjectsSchemaDependencies<TCover>) {
  return z.object({
    id: z.uuid(),
    title: z.string(),
    description: z.string(),
    technologies: z.array(z.string()).min(1),
    coverPath: image(),
    coverAlt: z.string(),
    websiteUrl: z.url(),
    githubUrl: z.url().optional(),
    priority: z.number(),
    featured: z.boolean().default(false),
  });
}

export type ProjectData = z.infer<
  ReturnType<typeof buildProjectsSchema<z.ZodType<ImageMetadata>>>
>;

export type SortableProject = Pick<ProjectData, 'id' | 'priority'>;

export function assertUniqueProjects(
  projects: readonly SortableProject[],
): void {
  const priorities = new Set<number>();
  const ids = new Set<string>();

  for (const project of projects) {
    if (priorities.has(project.priority)) {
      throw new Error(`Duplicate project priority: ${project.priority}`);
    }
    if (ids.has(project.id)) {
      throw new Error(`Duplicate project id: ${project.id}`);
    }
    priorities.add(project.priority);
    ids.add(project.id);
  }
}

export function sortProjects<T extends SortableProject>(
  projects: readonly T[],
): T[] {
  assertUniqueProjects(projects);
  return [...projects].sort((a, b) => a.priority - b.priority);
}
