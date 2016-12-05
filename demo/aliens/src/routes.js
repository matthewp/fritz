import { makeApp } from '../../../worker.js';
import indexRoute from './index.js';

const app = makeApp();

indexRoute(app);
