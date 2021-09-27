export interface AudioSettings {
  muted: boolean;
  volume: {
    master: number;
    music: number;
    effects: number;
  };
}
