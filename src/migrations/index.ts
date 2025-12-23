import * as migration_20251223_031322_full_schema from './20251223_031322_full_schema'
import * as migration_20251223_060000_add_cover_image_url from './20251223_060000_add_cover_image_url'

export const migrations = [
  {
    up: migration_20251223_031322_full_schema.up,
    down: migration_20251223_031322_full_schema.down,
    name: '20251223_031322_full_schema',
  },
  {
    up: migration_20251223_060000_add_cover_image_url.up,
    down: migration_20251223_060000_add_cover_image_url.down,
    name: '20251223_060000_add_cover_image_url',
  },
]
