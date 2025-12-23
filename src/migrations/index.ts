import * as migration_20251223_025434_initial_schema from './20251223_025434_initial_schema';

export const migrations = [
  {
    up: migration_20251223_025434_initial_schema.up,
    down: migration_20251223_025434_initial_schema.down,
    name: '20251223_025434_initial_schema'
  },
];
