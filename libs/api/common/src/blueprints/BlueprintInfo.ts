// TODO: Maybe a better name would be BlueprintMetadata ...
// We DO parse the blue print (.osu), but that's only because we want to retrieve the metadata.
export interface BlueprintInfo {
  md5Hash: string;
  lastPlayed: Date;
  title: string;
  artist: string;
  creator: string;
  // This is assuming that they are in the folderName
  folderName: string;
  audioFileName: string;
  osuFileName: string;

  // [Events]
  bgFileName?: string; // Usually unknown unless .osu file is parsed
}
