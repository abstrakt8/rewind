import React, { useCallback, useState } from "react";
import styled from "styled-components";
import { FaBug, FaDiscord, FaGraduationCap, FaQuestion, IoClose } from "react-icons/all";
import { Dialog } from "@headlessui/react";

export function Key({ text }: { text: string }) {
  return (
    <span className={"bg-gray-300 font-mono text-gray-800 rounded border-b-4 border-r-4 border-gray-600 pl-1 pr-1"}>
      {text}
    </span>
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

const left = "←";
const right = "→";

// ↓  ↑

function KeyBindings({ separator = "+", keys }: { separator?: string; keys: string[] }) {
  return (
    <div>
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
  return <h1 className={"text-xl"}>{children}</h1>;
}

function PlaybarNavigationShortcuts() {
  return (
    <div className={"flex flex-col gap-4"}>
      <Title>Shortcuts</Title>
      <ShortcutBox>
        <KeyBindings keys={["Spacebar"]} /> <span>Start / Pause</span>
        <KeyBindings separator={","} keys={[left, "a"]} /> <span>Small jump back</span>
        <KeyBindings separator={","} keys={[right, "d"]} /> <span>Small jump forward</span>
        <KeyBindings separator={"+"} keys={["Ctrl", left]} /> <span>Micro jump back</span>
        <KeyBindings separator={"+"} keys={["Ctrl", right]} /> <span>Micro jump forward</span>
        <KeyBindings separator={"+"} keys={["Shift", left]} /> <span>Large jump back</span>
        <KeyBindings separator={"+"} keys={["Shift", right]} /> <span>Large jump forward</span>
        <KeyBindings keys={["w"]} /> <span>Increase speed</span>
        <KeyBindings keys={["s"]} /> <span>Decrease speed</span>
        <KeyBindings keys={["f"]} /> <span>Toggle hidden</span>
      </ShortcutBox>
    </div>
  );
}

function OtherResources() {
  return (
    <div className={"pl-4 pr-4 flex flex-col gap-4"}>
      <Title>Other resources</Title>
      <ul>
        <li>
          <a href={"#"}>
            <FaQuestion className={"inline"} /> FAQ
          </a>
        </li>
        <li>
          <a href={"#"}>
            <FaGraduationCap className={"inline"} /> Tutorial
          </a>
        </li>
        <li>
          <a href={"#"}>
            <FaBug className={"inline"} /> Report a bug
          </a>
        </li>
        <li>
          <a href={"#"}>
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
    <div className={"bg-gray-700 text-gray-200 rounded px-12 py-8 gap-4 relative"}>
      <button className={"absolute top-0 right-0 p-2"} onClick={onClose}>
        <IoClose className={"h-6 w-6 text-gray-400"} />
      </button>
      <div className={"divide-x divide-gray-600 gap-8 flex"}>
        <PlaybarNavigationShortcuts />
        <OtherResources />
      </div>
    </div>
  );
}

export function HelpModalDialog(props: HelpModalProps) {
  const { isOpen, onClose } = props;

  return (
    <Dialog onClose={onClose} open={isOpen} className={"fixed z-10 overflow-y-auto inset-0"}>
      <div className={"flex items-center justify-center min-h-screen"}>
        <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />
        <HelpBox onClose={onClose} />
      </div>
    </Dialog>
  );
}
