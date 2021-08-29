import { promises } from "fs";

const { readdir, stat } = promises;

export const fileLastModifiedTime = async (path: string): Promise<number> => {
  const s = await stat(path);
  // mtime is changed when there was a write to the content
  // ctime is for meta data changes like filename/access change
  return s.mtimeMs;
};

export const fileLastModifiedDate = async (path: string): Promise<Date> => {
  const s = await stat(path);
  return s.mtime;
};

const filterUndefined = (p: any) => p !== undefined;

export async function filterFilenamesInDirectory(
  dirName: string,
  condition: (fileName: string) => Promise<boolean>,
): Promise<string[]> {
  const fileNamesInFolder = await readdir(dirName);
  return (
    await Promise.all(
      fileNamesInFolder.map(async (fileName) => {
        if (await condition(fileName)) {
          return fileName;
        } else {
          return undefined;
        }
      }),
    )
  ).filter(filterUndefined) as string[];
}
