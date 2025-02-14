import { Gym } from '@prisma/client';

import { GymRepository } from '@/repositories/interfaces/gym.interface';
import { PrismaGymsRepository } from '@/repositories/prisma/gyms.repository';

interface CreateGymUseCaseRequest {
  name: string;
  description: string | null;
  phone: string | null;
  latitude: number;
  longitude: number;
}

interface CreateGymUseCaseResponse {
  gym: Gym;
}

class CreateGymUseCase {
  constructor(private gymRepository: GymRepository) {}

  async execute(data: CreateGymUseCaseRequest): Promise<CreateGymUseCaseResponse> {
    const { name, description, phone, latitude, longitude } = data;

    const gym = await this.gymRepository.create({
      name,
      description,
      phone,
      latitude,
      longitude,
    });

    return { gym };
  }
}

const makeCreateGymUseCase = () => {
  const gymRepository = new PrismaGymsRepository();
  const createGymUseCase = new CreateGymUseCase(gymRepository);

  return createGymUseCase;
};

export { CreateGymUseCase, makeCreateGymUseCase };
