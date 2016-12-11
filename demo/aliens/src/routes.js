import { makeApp } from '../../../worker.js';
import indexRoute from './index.js';
import articleRoute from './article.js';

const app = makeApp();

app
  .configure(indexRoute)
  .configure(articleRoute);

/**
 * Color scheme
 * https://coolors.co/fefffe-e5fcf5-b3dec1-210124-750d37
 */
