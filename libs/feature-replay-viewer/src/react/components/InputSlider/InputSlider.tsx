import React from "react";
import * as Slider from "@radix-ui/react-slider";

export interface InputSliderProps {
  value: number;
  min: number;
  max: number;
  step: number;
  onValueChange: (value: number) => any;
}

export function InputSlider(props: InputSliderProps) {
  const { value, max, min, step, onValueChange } = props;

  return (
    <Slider.Root
      // defaultValue={[value]}
      value={[value]}
      min={min}
      max={max}
      step={step}
      onValueChange={(a: number[]) => onValueChange(a[0])}
      className="relative flex items-center h-4 select-none w-full"
    >
      <Slider.Track className="relative w-full h-1 bg-gray-200 flex-grow-1 rounded-full">
        {/* highlights what is selected*/}
        <Slider.Range className="absolute h-full overflow-hidden bg-gray-500" />
      </Slider.Track>
      <Slider.Thumb className="block w-4 h-4 bg-white border rounded-full border-neutral-300 focus:outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-500" />
    </Slider.Root>
  );
}
