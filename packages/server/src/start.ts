import { createApi } from './api/api.ts';

const app = await createApi();
await app.listen({
  port: 9111,
  host: process.env.SERVER_HOST,
});
