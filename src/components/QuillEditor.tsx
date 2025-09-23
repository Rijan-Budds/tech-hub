"use client";

import { useEffect, useRef, useState } from "react";
import "quill/dist/quill.snow.css";
import QuillType from "quill"; // import type for Quill

interface QuillEditorProps {
  value?: string;
  onChange?: (content: string) => void;
  placeholder?: string;
  height?: string;
  className?: string;
}

const QuillEditor: React.FC<QuillEditorProps> = ({
  value = "",
  onChange,
  placeholder = "Product Description",
  height = "300px",
  className = "",
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const quillRef = useRef<QuillType | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    if (!isClient || !editorRef.current) return;
    if (quillRef.current) return; // Prevent re-initialization

    const initializeQuill = async () => {
      const { default: Quill } = await import("quill");

      const quill = new Quill(editorRef.current!, {
        theme: "snow",
        modules: {
          toolbar: [
            [{ header: [1, 2, 3, false] }],
            ["bold", "italic", "underline", "strike"],
            [{ list: "ordered" }, { list: "bullet" }],
            ["link", "image"],
            [{ align: [] }],
          ],
        },
        placeholder,
      });

      quillRef.current = quill;

      // Set initial content
      if (value) {
        quill.root.innerHTML = value;
      }

      quill.on("text-change", () => {
        if (onChangeRef.current) {
          onChangeRef.current(quill.root.innerHTML);
        }
      });
    };

    initializeQuill();
  }, [isClient, placeholder, value]);

  // Handle external value updates safely (e.g., reset editor externally)
  useEffect(() => {
    if (quillRef.current && value !== undefined) {
      const currentHTML = quillRef.current.root.innerHTML;
      // Only update if the editor doesn't have focus and content is different
      if (currentHTML !== value && !quillRef.current.hasFocus()) {
        quillRef.current.root.innerHTML = value;
      }
    }
  }, [value]);

  if (!isClient) {
    return (
      <div className={className}>
        <div className="animate-pulse">
          <div className="h-10 bg-gray-200 rounded mb-2"></div>
          <div className="bg-gray-200 rounded" style={{ height }}></div>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div
        ref={editorRef}
        style={{ height, backgroundColor: "white" }}
        className="border rounded"
      />
    </div>
  );
};

export default QuillEditor;
