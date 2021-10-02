import { useSettingsModalContext } from "../providers/SettingsProvider";
import { Autocomplete, Box, Modal, TextField } from "@mui/material";
import { BaseSettingsModal } from "./BaseSettingsModal";
import { useTheater } from "../providers/TheaterProvider";
import { useCallback, useState } from "react";
import { DEFAULT_OSU_SKIN_ID, DEFAULT_REWIND_SKIN_ID, SkinId, SkinSource } from "@rewind/web-player/rewind";
// export const defaultSkinId: SkinId =
// export const defaultSkinId: SkinId = {
// export const defaultSkinId: SkinId =
// export const defaultSkinId: SkinId =
// export const defaultSkinId: SkinId =

const sourceName: Record<SkinSource, string> = {
  osu: "osu!/Skins Folder",
  rewind: "Rewind",
};

function SkinsSettings() {
  // TODO: Button for synchronizing skin list again

  const theater = useTheater();
  const [chosenSkinId, setChosenSkinId] = useState<SkinId>(DEFAULT_OSU_SKIN_ID);

  const skinOptions: SkinId[] = [
    DEFAULT_OSU_SKIN_ID,
    DEFAULT_REWIND_SKIN_ID,
    { source: "osu", name: "- # BTMC   ⌞Freedom Dive  ↓⌝" },
    { source: "osu", name: "-         《CK》 WhiteCat 2.1 _ old -lite" },
    { source: "osu", name: "idke+1.2" },
    { source: "osu", name: "Joie's Seoul v9 x owoTuna + whale" },
    { source: "osu", name: "Millhiore Lite" },
    { source: "osu", name: "Rafis 2018-03-26 HDDT" },
    { source: "osu", name: "Toy 2018-09-07" },
  ];

  // TODO:

  const handleSkinChange = useCallback(
    (skinId: SkinId) => {
      theater.changeSkin(skinId).then(() => {
        console.log("Done!");
        setChosenSkinId(skinId);
      });
      // TODO: ERror handling
    },
    [theater],
  );

  return (
    <Box sx={{ p: 2 }}>
      <Autocomplete
        id="skin-selection-demo"
        // TODO: Make sure skinIds are sorted
        options={skinOptions}
        groupBy={(option: SkinId) => sourceName[option.source]}
        value={chosenSkinId}
        onChange={(event, newValue) => {
          if (newValue) {
            handleSkinChange(newValue as SkinId);
          }
        }}
        getOptionLabel={(option: SkinId) => option.name}
        sx={{ width: 300 }}
        renderInput={(params) => <TextField {...params} label="Skin" />}
        isOptionEqualToValue={(option, value) => option.name === value.name && option.source === value.source}
      />
    </Box>
  );
}

export function SettingsModal() {
  const { onSettingsModalOpenChange, settingsModalOpen } = useSettingsModalContext();
  const onClose = () => onSettingsModalOpenChange(false);

  return (
    <Modal
      open={settingsModalOpen}
      onClose={onClose}
      hideBackdrop={false}
      sx={{
        "& .MuiBackdrop-root": {
          backgroundColor: "rgba(0,0,0,0.1)",
        },
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 1028,
          height: 728,
        }}
      >
        <BaseSettingsModal
          onClose={onClose}
          tabs={[
            { label: "General", component: <div>xd</div> },
            {
              label: "Skins",
              component: <SkinsSettings />,
            },
          ]}
        />
      </Box>
    </Modal>
  );
}
