# Changelog

## 1.0.0 (2026-04-22)

### Features

- add Traditional Chinese (zh-TW) to admin i18n ([#4](https://github.com/terry90918/terry90918.me/issues/4)) ([e45da8b](https://github.com/terry90918/terry90918.me/commit/e45da8b6dd68749286013008a14d7ccca56ff0bc))
- implement steipete-style blog frontend with Payload CMS Posts collection ([a7219ae](https://github.com/terry90918/terry90918.me/commit/a7219aef7810e70b7f5b8256e8051988b85005d1))
- init blog from lawyer template (Payload CMS v3 + Next.js) ([8c26c2e](https://github.com/terry90918/terry90918.me/commit/8c26c2e588cd76756cc8a89539ca37e480900828))
- unify admin design with frontend — accent blue/orange + Atkinson font ([6d8b603](https://github.com/terry90918/terry90918.me/commit/6d8b6037d4a0272150971d4f2c85757b9b833c93))
- unify frontend/admin design + fix build errors ([3556a52](https://github.com/terry90918/terry90918.me/commit/3556a52d8c2790adb17b7772c17d4d80cab6cd39))

### Bug Fixes

- add explicit color to login form inputs to fix invisible text ([820bf3a](https://github.com/terry90918/terry90918.me/commit/820bf3a934ffbd201d7b60b6e52c5a9fe5cc3625))
- include jose in standalone output to fix /admin 500 ([fbbcb67](https://github.com/terry90918/terry90918.me/commit/fbbcb6701187386c4726b89acc6faacf3626ddf0))
- move Google Fonts [@import](https://github.com/import) before [@import](https://github.com/import) tailwindcss in globals.css ([a1638cd](https://github.com/terry90918/terry90918.me/commit/a1638cd6f6c96d00d7c7942d9b544bba25ba6d6c))
- override build-time env to prevent Coolify ARG injection connecting to real DB ([f3eff9d](https://github.com/terry90918/terry90918.me/commit/f3eff9d457285773f020e45122640dfcce756f1a))
- rename articles → posts in DB migration ([#3](https://github.com/terry90918/terry90918.me/issues/3)) ([9267b33](https://github.com/terry90918/terry90918.me/commit/9267b3322ecf64d8845c2159c74991cd571e4907))
- restore English alongside zh-TW in admin i18n ([#5](https://github.com/terry90918/terry90918.me/issues/5)) ([21960fb](https://github.com/terry90918/terry90918.me/commit/21960fb15f1b9c2e6834cf8f89ea90304119e76e))
- restore Payload admin dark mode by removing --color-base-\* overrides ([799b342](https://github.com/terry90918/terry90918.me/commit/799b34225c733da6fff7b82b98349c1bdd62078d))
