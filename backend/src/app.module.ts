import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsuariosModule } from './modules/usuarios/usuarios.module';
import { AlumnosModule } from './modules/alumnos/alumnos.module';
import { CursosModule } from './modules/cursos/cursos.module';
import { InscripcionModule } from './modules/inscripcion/inscripcion.module';
import { DocentesModule } from './modules/docentes/docentes.module';
import { MateriasModule } from './modules/materias/materias.module';
import { AsistenciaModule } from './modules/asistencia/asistencia.module';
import { CalificacionesModule } from './modules/calificaciones/calificaciones.module';
import { ActasModule } from './modules/actas/actas.module';
import { LicenciasModule } from './modules/licencias/licencias.module';
import { ModulosSemanaModule } from './modules/modulos-semana/modulos-semana.module';
import { DiasSinClasesModule } from './modules/dias-sin-clases/dias-sin-clases.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { ReportesModule } from './modules/reportes/reportes.module';
import { LoggerMiddleware } from './middleware/logger.middleware';
import { AuditInterceptor } from './common/interceptors/audit.interceptor';
import appConfig from './config/app.config';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({ load: [appConfig], isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsuariosModule,
    AlumnosModule,
    CursosModule,
    InscripcionModule,
    DocentesModule,
    MateriasModule,
    AsistenciaModule,
    CalificacionesModule,
    ActasModule,
    LicenciasModule,
    ModulosSemanaModule,
    DiasSinClasesModule,
    DashboardModule,
    ReportesModule,
  ],
  providers: [
    { provide: APP_INTERCEPTOR, useClass: AuditInterceptor },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}