import style from "./AudioSettingsPanel.module.css";
import { InputSlider } from "../InputSlider/InputSlider";

type OnChange = (x: number) => any;

export interface AudioSettingsPanelProps {
  masterVolume: number;
  musicVolume: number;
  effectVolume: number;

  onMasterVolumeChange: OnChange;
  onMusicVolumeChange: OnChange;
  onEffectVolumeChange: OnChange;
}

const audioSliderArgs = {
  min: 0,
  max: 100,
  step: 1,
};

export const AudioSettingsPanel = (props: AudioSettingsPanelProps) => {
  const { onMasterVolumeChange, onMusicVolumeChange, musicVolume, masterVolume } = props;
  return (
    <div className={style.container}>
      <label>Master</label>
      <InputSlider {...audioSliderArgs} value={masterVolume} onValueChange={onMasterVolumeChange} />
      <label>Music</label>
      <InputSlider {...audioSliderArgs} value={musicVolume} onValueChange={onMusicVolumeChange} />
      <label>Effect</label>
      <div className={"text-sm text-gray-300"}>Coming soon...</div>
    </div>
  );
};
