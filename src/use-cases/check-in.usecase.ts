import { CheckIn } from '@prisma/client';

import { env } from '@/env';
import { CheckInRepository } from '@/repositories/interfaces/check-in.interface';
import { GymRepository } from '@/repositories/interfaces/gym.interface';
import { PrismaGymsRepository } from '@/repositories/prisma/gyms.repository';
import { PrismaCheckInsRepository } from '@/repositories/prisma/prisma-check-ins.repository';
import { getDistanceBetweenCoordinates } from '@/utils/get-distance-between-coordinates';

import { MaxDistanceError } from './errors/max-distance.error';
import { MaxNumberCheckInReachedError } from './errors/max-number-check-in-reached.error';
import { ResourceNotFoundError } from './errors/resource-not-found.error';

interface CheckInUseCaseRequest {
  userId: string;
  gymId: string;
  userLatitude: number;
  userLongitude: number;
}

interface CheckInUseCaseResponse {
  checkIn: CheckIn;
}

class CheckInUseCase {
  constructor(
    private checkInRespository: CheckInRepository,
    private gymRespository: GymRepository,
  ) {}
  async execute(data: CheckInUseCaseRequest): Promise<CheckInUseCaseResponse> {
    const { userId, gymId, userLatitude, userLongitude } = data;

    const gym = await this.gymRespository.findById(gymId);

    if (!gym) {
      throw new ResourceNotFoundError();
    }

    const distanceBetweenUserAndGym = getDistanceBetweenCoordinates(
      {
        latitude: userLatitude,
        longitude: userLongitude,
      },
      {
        latitude: gym.latitude.toNumber(),
        longitude: gym.longitude.toNumber(),
      },
    );

    if (distanceBetweenUserAndGym > env.MAX_DISTANCE_IN_KILOMETERS) {
      throw new MaxDistanceError();
    }

    const checkInOnSameDate = await this.checkInRespository.findByUserIdOnDate(userId, new Date());

    if (checkInOnSameDate) {
      throw new MaxNumberCheckInReachedError();
    }

    const checkIn = await this.checkInRespository.create({ gymId, userId });

    return { checkIn };
  }
}

const makeCheckInUseCase = () => {
  const gymRespository = new PrismaGymsRepository();
  const checkInRespository = new PrismaCheckInsRepository();
  const listGymsUseCase = new CheckInUseCase(checkInRespository, gymRespository);

  return listGymsUseCase;
};

export { CheckInUseCase, makeCheckInUseCase };
