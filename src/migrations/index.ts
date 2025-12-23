import * as migration_20251223_030705_initial_schema_v2 from './20251223_030705_initial_schema_v2';

export const migrations = [
  {
    up: migration_20251223_030705_initial_schema_v2.up,
    down: migration_20251223_030705_initial_schema_v2.down,
    name: '20251223_030705_initial_schema_v2'
  },
];
