import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    publishDate: z
      .preprocess(
        (val) => (val === '' || val === null || val === undefined ? undefined : val),
        z.coerce.date().optional()
      )
      .optional(),
    tags: z.array(z.string()),
    liveUrl: z.string().url().optional(),
    githubUrl: z.string().url().optional(),
    featured: z.boolean().default(false),
    company: z.string().optional(),
    companyUrl: z.string().url().optional(),
    role: z.string().optional(),
    badge: z.string().optional(),
    isCommercial: z.boolean().default(false),
    isClosedSource: z.boolean().default(false),
    inProgress: z.boolean().default(false),
    order: z.number().optional(),
    image: z.string().optional(),
    imageAlt: z.string().optional(),
  }),
});

export const collections = {
  projects,
};
