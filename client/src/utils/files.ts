/**
 * Recursively extracts files from DataTransferItems, preserving subfolder contents
 */
export async function extractFilesFromDataTransfer(items: DataTransferItemList): Promise<File[]> {
  const files: File[] = [];

  const traverseEntry = async (entry: any, path = ''): Promise<void> => {
    if (!entry) return;

    if (entry.isFile) {
      await new Promise<void>((resolve) => {
        entry.file((file: File) => {
          // If in subfolder, create new File with relative path as name
          if (path) {
            const relativeName = `${path}/${file.name}`;
            const renamedFile = new (window as any).File([file], relativeName, {
              type: file.type,
              lastModified: file.lastModified,
            });
            files.push(renamedFile);
          } else {
            files.push(file);
          }
          resolve();
        }, () => resolve());
      });
    } else if (entry.isDirectory) {
      const reader = entry.createReader();
      const readEntries = async (): Promise<any[]> => {
        return new Promise((resolve) => {
          reader.readEntries((entries: any[]) => resolve(entries), () => resolve([]));
        });
      };

      let dirEntries: any[] = [];
      let batch: any[] = [];
      do {
        batch = await readEntries();
        dirEntries = dirEntries.concat(batch);
      } while (batch.length > 0);

      const nextPath = path ? `${path}/${entry.name}` : entry.name;
      for (const child of dirEntries) {
        await traverseEntry(child, nextPath);
      }
    }
  };

  const entries: any[] = [];
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (item.webkitGetAsEntry) {
      const entry = item.webkitGetAsEntry();
      if (entry) entries.push(entry);
    }
  }

  if (entries.length > 0) {
    for (const entry of entries) {
      await traverseEntry(entry);
    }
  }

  return files;
}
