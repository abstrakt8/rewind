import { Button, Container } from "@mui/material";
import { useCallback, useEffect, useRef } from "react";

// Example: https://github.com/cutterbl/SoundTouchJS/blob/master/public/example.js
// Should checkout https://tonejs.github.io/ agian
const audioContext = new AudioContext();
const gainNode = audioContext.createGain();
gainNode.connect(audioContext.destination);

function HitSoundButton(props: { url: string; label: string; playbackRate: number }) {
  const { url, label, playbackRate } = props;
  const audioBufferRef = useRef<AudioBuffer | null>(null);

  useEffect(() => {
    fetch(url)
      .then((response) => response.arrayBuffer())
      .then((buffer) => {
        audioContext.decodeAudioData(buffer, (audioBuffer) => {
          audioBufferRef.current = audioBuffer;
        });
      });
  }, [url]);
  const handleClick = useCallback(() => {
    const source = audioContext.createBufferSource();
    source.buffer = audioBufferRef.current;
    source.playbackRate.value = playbackRate;
    source.connect(gainNode);
    source.start();
  }, [playbackRate]);

  return <Button onClick={handleClick}>{label}</Button>;
}

function HitSoundHtmlButton(props: { url: string; label: string; playbackRate: number }) {
  const { url, label, playbackRate } = props;
  const audioBufferRef = useRef<AudioBuffer | null>(null);

  useEffect(() => {
    const mediaElement = new HTMLAudioElement();
  }, [url]);
  const handleClick = useCallback(() => {
    const source = audioContext.createBufferSource();
    source.buffer = audioBufferRef.current;
    source.playbackRate.value = playbackRate;
    source.connect(gainNode);
    source.start();
  }, [playbackRate]);

  return <Button onClick={handleClick}>{label}</Button>;
}

export function App() {
  const playBackRate = 1.5;
  return (
    <Container>
      <HitSoundButton url={"/assets/soft-hitnormal.ogg"} label={"soft-hitnormal"} playbackRate={playBackRate} />
    </Container>
  );
}

export default App;
