let cacheVersion = 1;

export function getCacheVersion() {
  return cacheVersion;
}

export function bumpCacheVersion() {
  cacheVersion += 1;
  return cacheVersion;
}

