import z from 'zod';
import { AUTH_ENV } from './auth-env';
import { DATABASE_ENV } from './database-env';
import { ENV_KEYS } from './env-keys';

export type EnvSchema = z.infer<typeof envSchema>;

const envSchema = z.object({
  [ENV_KEYS.PORT]: z.string().nonempty(),
  [ENV_KEYS.NODE_ENV]: z.string().nonempty(),
  [ENV_KEYS.CORS_ORIGIN]: z.string().nonempty(),
  //database
  [DATABASE_ENV.DATABASE_HOST]: z.string().nonempty(),
  [DATABASE_ENV.DATABASE_NAME]: z.string().nonempty(),
  [DATABASE_ENV.DATABASE_PASSWORD]: z.string().nonempty(),
  [DATABASE_ENV.DATABASE_PORT]: z.string().nonempty(),
  [DATABASE_ENV.DATABASE_USER]: z.string().nonempty(),
  //Auth
  [AUTH_ENV.AUTH_SECRET]: z.string().nonempty(),
  [AUTH_ENV.AUTH_EXPIRATION_MILLS]: z.string().nonempty(),
  [AUTH_ENV.AUTH_REFRESH_TOKEN_EXPIRATION_DAYS]: z.string().nonempty(),
  [AUTH_ENV.AUTH_COOKIE_SAME_SITE]: z.string().nonempty(),
});

export const validateEnv = (config: Record<string, unknown>) => {
  const validateResult = envSchema.safeParse(config);

  if (!validateResult.success) throw new Error(validateResult.error.message);

  return validateResult.data;
};
