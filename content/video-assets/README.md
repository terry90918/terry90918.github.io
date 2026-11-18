# Published video assets

Article videos and their posters use the dedicated HTTPS origin `https://terry90918-public-media.nbg1.your-objectstorage.com`. Object keys contain the SHA-256 of their bytes. The site accepts only immutable video and poster paths on this origin; credentials, signed query strings and other storage buckets are not article media sources.

`videos.json` records the original Git commit and asset hash, optimization parameters, duration, unchanged audio packet hash, published URLs and verified object hashes. Original assets remain recoverable from the recorded Git commit. The published variants keep H.264, 1280×720, 24 fps and the original AAC audio stream; MP4 metadata is placed before media data for streaming.

Before changing a published article's media URL, decode the complete candidate, verify its duration and audio, inspect representative text and transitions, upload it to a new content-addressed object key, then read it anonymously and verify its SHA-256, MIME type, HTTP 206 byte ranges and playback/seek behavior. Preserve the original until the replacement is verified. Audio podcasts remain separate unchanged MP3 assets.

The bucket ACL stays private. Its policy grants anonymous `GetObject` only for `videos/` and `posters/`; listing and writing are not public. CORS permits GET/HEAD from the canonical website. No existing private production bucket is made public. Public files must not contain credentials or private information.
