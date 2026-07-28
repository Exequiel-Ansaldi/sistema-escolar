const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
p.curso.findMany({ where: { estado: 'activo' }, select: { id: true, anio: true, division: true, turno: true } }).then(r => { console.log(JSON.stringify(r, null, 2)); p.$disconnect(); });
