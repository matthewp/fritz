export const IMPORT = 'astro-fritz:import';

export type ImportMessage = {
  type: typeof IMPORT,
  url: string;
};

