import { randomUUID } from 'node:crypto';

import { CheckIn, Prisma } from '@prisma/client';
import dayjs from 'dayjs';

import { CheckInRepository } from '../interfaces/interface-check-in.repository';

export class InMemoryCheckInRepository implements CheckInRepository {
  public items: CheckIn[] = [];

  async findById(id: string): Promise<CheckIn | null> {
    const checkIn = this.items.find((item) => item.id === id);

    if (!checkIn) return null;

    return checkIn;
  }

  async findByUserIdOnDate(userId: string, date: Date): Promise<CheckIn | null> {
    const startOfTheDay = dayjs(date).startOf('date');
    const endOfTheDay = dayjs(date).endOf('date');

    const checkInOnSameDate = this.items.find((checkIn) => {
      const checkInDate = dayjs(checkIn.createdAt);
      const isOnSameDate = checkInDate.isAfter(startOfTheDay) && checkInDate.isBefore(endOfTheDay);

      return checkIn.userId === userId && isOnSameDate;
    });

    if (!checkInOnSameDate) {
      return null;
    }

    return checkInOnSameDate;
  }

  async create(data: Prisma.CheckInUncheckedCreateInput): Promise<CheckIn> {
    const checkIn = {
      id: data.id ?? randomUUID(),
      userId: data.userId,
      gymId: data.gymId,
      validatedAt: data.validatedAt ? new Date(data.validatedAt) : null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.items.push(checkIn);

    return checkIn;
  }
}