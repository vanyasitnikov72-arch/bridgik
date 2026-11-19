import { zip, AsyncZippable } from 'fflate';

function getUniqueFileName(rawName: string, usedNames: Set<string>): string {
  const safeName = rawName.replace(/^\/+/, '') || 'file';
  if (!usedNames.has(safeName)) {
    usedNames.add(safeName);
    return safeName;
  }

  const dotIdx = safeName.lastIndexOf('.');
  const base = dotIdx > 0 ? safeName.slice(0, dotIdx) : safeName;
  const ext = dotIdx > 0 ? safeName.slice(dotIdx) : '';

  let counter = 2;
  while (usedNames.has(`${base} (${counter})${ext}`)) {
    counter++;
  }
  const unique = `${base} (${counter})${ext}`;
  usedNames.add(unique);
  return unique;
}

/**
 * Packs multiple downloaded files into a single ZIP archive using fflate.
 * Uses STORE mode (level 0) for lightning-fast bundling without CPU/RAM lag.
 */
export async function createZipFromBlobUrls(
  items: Array<{ name: string; blobUrl: string }>
): Promise<Blob> {
  const zippable: AsyncZippable = {};
  const usedNames = new Set<string>();

  for (const item of items) {
    try {
      const resp = await fetch(item.blobUrl);
      const arrayBuf = await resp.arrayBuffer();
      const data = new Uint8Array(arrayBuf);
      const fileName = getUniqueFileName(item.name, usedNames);
      zippable[fileName] = [data, { level: 0 }];
    } catch (err) {
      console.warn(`[ZIP] Failed to read blob for ${item.name}`, err);
    }
  }

  return new Promise<Blob>((resolve, reject) => {
    zip(zippable, (err, data) => {
      if (err) return reject(err);
      resolve(new Blob([data], { type: 'application/zip' }));
    });
  });
}
