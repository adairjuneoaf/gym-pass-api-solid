import { FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';

import { InvalidCredentialsError } from '@/use-cases/errors/invalid-credentials.error';
import { makeAuthenticateUseCase } from '@/use-cases/factories/make-authenticate.usecase';

export const authenticate = async (request: FastifyRequest, reply: FastifyReply) => {
  const { t } = request;

  const authenticateBodySchema = z.object({
    email: z.string({ message: t('validation.required') }).email({ message: t('validation.email') }),
    password: z.string({ message: t('validation.required') }).min(6, { message: t('validation.min', { min: 6 }) }),
  });

  const { email, password } = authenticateBodySchema.parse(request.body);

  try {
    const authenticate = makeAuthenticateUseCase();

    await authenticate.execute({ email, password });
  } catch (err) {
    if (err instanceof InvalidCredentialsError) {
      return reply.status(400).send({ message: err.message });
    }

    throw err;
  }

  reply.status(200).send();
};
