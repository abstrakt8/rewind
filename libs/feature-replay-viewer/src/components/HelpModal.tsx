import React from "react";
import styled from "styled-components";
import { FaBug, FaDiscord, FaGraduationCap } from "react-icons/all";
import { RewindLinks } from "../utils/Constants";
import { Box, Divider, IconButton, Modal, Paper, Stack, Typography } from "@mui/material";
import { Close, Help } from "@mui/icons-material";
import { PromotionFooter } from "./BaseDialog";

export function Key({ text }: { text: string }) {
  return (
    <Box
      component={"span"}
      sx={{
        backgroundColor: "hsl(0,2%,44%)",
        fontFamily: "monospace",
        borderStyle: "solid",
        borderRadius: 1,
        borderWidth: "0px 4px 4px 0",
        // borderBottomWidth: 2,
        // borderRightWidth: 4,
        borderColor: "hsl(0,2%,20%)",
        paddingLeft: 1,
        paddingRight: 1,
      }}
    >
      {text}
    </Box>
    // <span className={"bg-gray-300 font-mono text-gray-800 rounded border-b-4 border-r-4 border-gray-600 pl-1 pr-1"}>
    //   {text}
    // </span>
  );
}

const ShortcutBox = styled.div`
  display: grid;
  grid-template-columns: max-content 1fr;
  grid-column-gap: 1em;
  grid-row-gap: 0.5em;
  align-items: center;
  justify-content: center;
`;

const leftArrowKey = "←";
const rightArrowKey = "→";
const upArrowKey = "↑";
const downArrowKey = "↓";

const leftKeys = [leftArrowKey, "a"];
const rightKeys = [rightArrowKey, "d"];

function KeyBindings({ separator = "+", keys, inline }: { separator?: string; keys: string[]; inline?: boolean }) {
  return (
    <div className={inline ? "inline" : ""}>
      {keys.map((k, i) => (
        <React.Fragment key={i}>
          <Key text={k} />
          {i + 1 < keys.length && ` ${separator} `}
        </React.Fragment>
      ))}
    </div>
  );
}

function Title({ children }: any) {
  return <Typography variant={"h6"}>{children}</Typography>;
}

// Which one?
const orSeparator = " or ";

// const orSeparator = " , ";

function PlaybarNavigationShortcuts() {
  return (
    <Stack sx={{ py: 2 }} flexDirection={"column"} gap={1}>
      <Title>Shortcuts</Title>
      <ShortcutBox>
        <KeyBindings keys={["Spacebar"]} /> <span>Start / Pause</span>
        <KeyBindings separator={orSeparator} keys={[upArrowKey, "w"]} /> <span>Increase speed</span>
        <KeyBindings separator={orSeparator} keys={[downArrowKey, "s"]} /> <span>Decrease speed</span>
        <KeyBindings separator={orSeparator} keys={leftKeys} /> <span>Small jump back</span>
        <KeyBindings separator={orSeparator} keys={rightKeys} /> <span>Small jump forward</span>
        {/*<div>*/}
        {/*  <KeyBindings keys={["Ctrl"]} inline /> + <KeyBindings separator={orSeparator} keys={leftKeys} inline />*/}
        {/*</div>*/}
        <KeyBindings separator={"+"} keys={["Ctrl", leftArrowKey]} />
        <span>Micro jump back</span>
        {/*<div>*/}
        {/*  <KeyBindings keys={["Ctrl"]} inline /> + <KeyBindings separator={orSeparator} keys={rightKeys} inline />*/}
        {/*</div>*/}
        <KeyBindings separator={"+"} keys={["Ctrl", rightArrowKey]} />
        <span>Micro jump forward</span>
        {/*<div>*/}
        {/*  <KeyBindings keys={["Shift"]} inline /> + <KeyBindings separator={orSeparator} keys={leftKeys} inline />*/}
        {/*</div>*/}
        <KeyBindings separator={"+"} keys={["Shift", leftArrowKey]} />
        <span>Large jump back</span>
        {/*<div>*/}
        {/*  <KeyBindings keys={["Shift"]} inline /> + <KeyBindings separator={orSeparator} keys={rightKeys} inline />*/}
        {/*</div>*/}
        <KeyBindings separator={"+"} keys={["Shift", rightArrowKey]} />
        <span>Large jump forward</span>
        <KeyBindings keys={["f"]} /> <span>Toggle hidden</span>
      </ShortcutBox>
    </Stack>
  );
}

function OtherResources() {
  return (
    <div className={"pl-8 pr-4 flex flex-col gap-4"}>
      <Title>Other resources</Title>
      <ul>
        <li>
          <a href={RewindLinks.Guide} target={"_blank"}>
            <FaGraduationCap className={"inline"} /> Tutorial
          </a>
        </li>
        <li>
          <a href={RewindLinks.OsuUniDiscord} target={"_blank"}>
            <FaBug className={"inline"} /> Report a bug
          </a>
        </li>
        <li>
          <a href={RewindLinks.OsuUniDiscord} target={"_blank"}>
            <FaDiscord className={"inline"} /> osu! University
          </a>
        </li>
      </ul>
    </div>
  );
}

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HelpBox(props: Pick<HelpModalProps, "onClose">) {
  const { onClose } = props;
  return (
    <Paper sx={{ px: 2, py: 2, display: "flex", flexDirection: "column" }}>
      {/*MenuBar could be reused*/}
      <Stack sx={{ alignItems: "center" }} direction={"row"} gap={1}>
        <Help />
        <Typography fontWeight={"bolder"}>Help</Typography>
        <Box flexGrow={1} />
        <IconButton onClick={onClose}>
          <Close />
        </IconButton>
      </Stack>
      <Divider />

      <PlaybarNavigationShortcuts />
      {/*<OtherResources />*/}
      {/*Footer*/}
      <Divider />
      <Stack sx={{ paddingTop: 1 }}>
        <PromotionFooter />
      </Stack>
    </Paper>
  );
}

export function HelpModalDialog(props: HelpModalProps) {
  const { isOpen, onClose } = props;

  return (
    <Modal open={isOpen} onClose={onClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          minWidth: 600,
          // maxWidth: 700,
          maxWidth: "100%",
          // maxHeight: 600,
          maxHeight: "100%",
        }}
      >
        <HelpBox onClose={onClose} />
      </Box>
    </Modal>
  );
}
