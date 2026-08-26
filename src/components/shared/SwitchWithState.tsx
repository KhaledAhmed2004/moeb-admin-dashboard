import React, { useState } from "react";
import { Switch } from "../ui/switch";

const SwitchWithState = ({
  isActive,
  onchange,
  id,
}: {
  isActive: boolean;
  onchange: (isActive: boolean, id: string) => void;
  id: string;
}) => {
  const [isOn, setIsOn] = useState(isActive);
  return (
    <>
      <Switch
        checked={isOn}
        onClick={() => {
          setIsOn(!isOn);
          onchange(!isOn, id);
        }}
        className={`${
          isOn ? "!bg-yellow-500" : "bg-gray-200"
        } relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 cursor-pointer`}
        id="airplane-mode"
      />
    </>
  );
};

export default SwitchWithState;
