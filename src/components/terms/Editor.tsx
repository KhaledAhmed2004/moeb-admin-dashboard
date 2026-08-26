// components/Editor.tsx
"use client";

import { useMemo } from "react";
import dynamic from "next/dynamic";

import "react-quill-new/dist/quill.snow.css"; // Import styles

// Dynamically import ReactQuill with SSR disabled
const ReactQuill = dynamic(() => import("react-quill-new"), {
  ssr: false,
  loading: () => <p>Loading Editor...</p>
});

interface EditorProps {
  value: string;
  onChange: (value: string) => void;
}

const Editor = ({ value, onChange }: EditorProps) => {
  // Memoize modules to prevent re-rendering on every keystroke
  const modules = useMemo(
    () => ({
      toolbar: [
        [{ header: [1, 2, false] }],
        ["bold", "italic", "underline", "strike"],
        [{ list: "ordered" }, { list: "bullet" }],
        ["link"],
        ["clean"]
      ]
    }),
    []
  );

  return (
    <ReactQuill
      theme="snow"
      className="bg-white"
      value={value}
      onChange={onChange}
      modules={modules}
    />
  );
};

export default Editor;
