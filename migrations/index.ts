import * as migration_20260209_063657_initial from './20260209_063657_initial'
import * as migration_20260409_135051_rename_articles_to_posts from './20260409_135051_rename_articles_to_posts'

export const migrations = [
  {
    up: migration_20260209_063657_initial.up,
    down: migration_20260209_063657_initial.down,
    name: '20260209_063657_initial',
  },
  {
    up: migration_20260409_135051_rename_articles_to_posts.up,
    down: migration_20260409_135051_rename_articles_to_posts.down,
    name: '20260409_135051_rename_articles_to_posts',
  },
]
