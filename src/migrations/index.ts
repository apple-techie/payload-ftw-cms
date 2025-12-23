import * as migration_20251223_031322_full_schema from './20251223_031322_full_schema';

export const migrations = [
  {
    up: migration_20251223_031322_full_schema.up,
    down: migration_20251223_031322_full_schema.down,
    name: '20251223_031322_full_schema'
  },
];
