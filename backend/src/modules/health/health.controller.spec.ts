import { ServiceUnavailableException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { HealthController } from './health.controller';
import { PrismaService } from '../../prisma/prisma.service';

class PrismaServiceMock {
  static healthy = true;
  $queryRaw = jest.fn(async () => {
    if (!PrismaServiceMock.healthy) throw new Error('db down');
    return [{ '?column?': 1 }];
  });
}

describe('HealthController', () => {
  let controller: HealthController;

  beforeEach(async () => {
    PrismaServiceMock.healthy = true;
    const module = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [{ provide: PrismaService, useClass: PrismaServiceMock }],
    }).compile();
    controller = module.get(HealthController);
  });

  it('live responde ok SIN consultar la base (liveness no depende de la base)', async () => {
    expect(controller.live()).toEqual({ status: 'ok' });
    const prisma = controller['prisma'] as PrismaServiceMock;
    expect(prisma.$queryRaw).not.toHaveBeenCalled();
  });

  it('ready con base accesible → ok', async () => {
    await expect(controller.ready()).resolves.toEqual({ status: 'ok' });
  });

  it('ready con base caída → 503 ServiceUnavailable', async () => {
    PrismaServiceMock.healthy = false;
    await expect(controller.ready()).rejects.toThrow(
      ServiceUnavailableException,
    );
  });
});
