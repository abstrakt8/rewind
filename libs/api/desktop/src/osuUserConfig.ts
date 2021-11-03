export function osuUserConfigParse(data: string) {
  const lines = data.split(/\r?\n/);
  const records: Record<string, string> = {};

  for (const line of lines) {
    if (line.startsWith("#")) continue;
    // After osu! closes it will always flush the config file with a valid format (spaces included)
    const [key, value] = line.split(" = ");
    if (value !== undefined) {
      records[key] = value;
    }
  }
  return records;
}
