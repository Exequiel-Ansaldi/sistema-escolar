import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

// Health endpoints para orquestación (Unidad V, clase 3):
// - live: ¿está colgado el proceso? SOLO el proceso; no debe tocar la base.
// - ready: ¿puede recibir tráfico? Incluye dependencia (PostgreSQL).
// Ambos públicos: el orquestador no tiene token JWT.
@Controller('health')
export class HealthController {
  constructor(private prisma: PrismaService) {}

  @Get('live')
  live() {
    return { status: 'ok' };
  }

  @Get('ready')
  async ready() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { status: 'ok' };
    } catch {
      // 503: el balanceador/orquestador saca esta instancia del tráfico.
      throw new ServiceUnavailableException({
        status: 'error',
        check: 'database',
      });
    }
  }
}
