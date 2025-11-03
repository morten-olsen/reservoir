import 'fastify';
import type { Services } from './utils/utils.services.ts';

declare module 'fastify' {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface FastifyInstance {
    services: Services;
  }
}
