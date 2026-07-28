import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function getMonday(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

async function main() {
  console.log('Migrando módulos diarios → semanales...');

  const oldModulos = await prisma.$queryRawUnsafe<any[]>(
    `SELECT * FROM "modulos" ORDER BY "id" ASC`
  );

  if (oldModulos.length === 0) {
    console.log('No hay módulos diarios para migrar.');
    return;
  }

  console.log(`Leídos ${oldModulos.length} registros diarios`);

  const grupos = new Map<string, {
    cursoId: number; materiaId: number; docenteId: number; semanaInicio: Date;
    modulosPrevistos: number; modulosDictados: number;
    factor: string | null; observacion: string | null;
  }>();

  for (const m of oldModulos) {
    const semana = getMonday(new Date(m.fecha)).toISOString();
    const key = `${m.curso_id}|${m.materia_id}|${m.docente_id}|${semana}`;

    const existing = grupos.get(key);
    if (existing) {
      existing.modulosPrevistos += m.modulos_previstos;
      existing.modulosDictados += m.modulos_dictados;
      if (m.factor) existing.factor = m.factor;
      if (m.observacion) existing.observacion = m.observacion;
    } else {
      grupos.set(key, {
        cursoId: m.curso_id,
        materiaId: m.materia_id,
        docenteId: m.docente_id,
        semanaInicio: new Date(semana),
        modulosPrevistos: m.modulos_previstos,
        modulosDictados: m.modulos_dictados,
        factor: m.factor ?? null,
        observacion: m.observacion ?? null,
      });
    }
  }

  const values = Array.from(grupos.values());
  console.log(`Agrupados en ${values.length} registros semanales`);

  for (const v of values) {
    await prisma.$executeRawUnsafe(
      `INSERT INTO "modulos_semanales" ("docente_id", "curso_id", "materia_id", "semana_inicio", "modulos_previstos", "modulos_dictados", "factor", "observacion")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      v.docenteId, v.cursoId, v.materiaId, v.semanaInicio,
      v.modulosPrevistos, v.modulosDictados, v.factor, v.observacion
    );
  }

  console.log('Migración completada exitosamente');
}

main()
  .catch(e => { console.error('Error en migración:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
