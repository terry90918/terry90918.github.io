import * as migration_20260209_063657_initial from './20260209_063657_initial'

export const migrations = [
  {
    up: migration_20260209_063657_initial.up,
    down: migration_20260209_063657_initial.down,
    name: '20260209_063657_initial',
  },
]
