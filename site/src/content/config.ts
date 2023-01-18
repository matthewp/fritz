import { z, defineCollection } from 'astro:content';

const docs = defineCollection({
  schema: z.object({
    title: z.string(),
    category: z.string(),
  })
});

export const collections = {
  docs
};