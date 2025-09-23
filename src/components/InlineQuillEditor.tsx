"use client";

import { useEffect, useRef, useState } from "react";
import "quill/dist/quill.snow.css";
import QuillType from "quill";

interface InlineQuillEditorProps {
  initialValue?: string;
  onSave?: (content: string) => void;
  placeholder?: string;
  className?: string;
}

const InlineQuillEditor: React.FC<InlineQuillEditorProps> = ({
  initialValue = "",
  onSave,
  placeholder = "Enter description...",
  className = "",
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const quillRef = useRef<QuillType | null>(null);
  const isInitializedRef = useRef(false);
  const [isClient, setIsClient] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentContent, setCurrentContent] = useState(initialValue || "");

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Update content when initialValue changes
  useEffect(() => {
    setCurrentContent(initialValue);
  }, [initialValue]);


  useEffect(() => {
    if (!isClient || !editorRef.current || !isEditing) {
      return;
    }

    // Prevent multiple initializations
    if (isInitializedRef.current) return;

    const initializeQuill = async () => {
      const { default: Quill } = await import("quill");

      const quill = new Quill(editorRef.current!, {
        theme: "snow",
        modules: {
          toolbar: [
            [{ header: [1, 2, 3, false] }],
            ["bold", "italic", "underline"],
            [{ list: "ordered" }, { list: "bullet" }],
            ["link"],
            [{ align: [] }],
          ],
        },
        placeholder,
      });

      quillRef.current = quill;
      isInitializedRef.current = true;

      // Set initial content
      if (currentContent) {
        quill.root.innerHTML = currentContent;
      }

      // Focus the editor
      quill.focus();
    };

    initializeQuill();

    // Cleanup function
    return () => {
      if (quillRef.current && isInitializedRef.current) {
        // Don't destroy immediately, let it be handled by state change
      }
    };
  }, [isClient, isEditing, placeholder, currentContent]);

  const handleSave = () => {
    if (quillRef.current && onSave) {
      const content = quillRef.current.root.innerHTML;
      setCurrentContent(content);
      onSave(content);
    }
    cleanupEditor();
  };

  const handleCancel = () => {
    cleanupEditor();
  };

  const cleanupEditor = () => {
    if (quillRef.current && isInitializedRef.current) {
      // Clear the editor content from DOM
      if (editorRef.current) {
        editorRef.current.innerHTML = '';
      }
    }
    setIsEditing(false);
    quillRef.current = null;
    isInitializedRef.current = false;
  };

  const handleStartEditing = () => {
    if (!isEditing) {
      setIsEditing(true);
    }
  };

  if (!isClient) {
    return (
      <div className={className}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  // Helper function to check if content is empty
  const isContentEmpty = (content: string) => {
    return !content || 
           content.trim() === '' || 
           content === '<p><br></p>' || 
           content === '<p></p>' ||
           content.replace(/<[^>]*>/g, '').trim() === '';
  };

  if (!isEditing) {
    return (
      <div className={className}>
        {!isContentEmpty(currentContent) ? (
          <div 
            className="rich-text-content text-sm text-gray-700 cursor-pointer hover:bg-gray-50 p-2 rounded border border-transparent hover:border-gray-200 transition-all duration-200 min-h-[40px] flex items-center"
            dangerouslySetInnerHTML={{ __html: currentContent }}
            onClick={handleStartEditing}
            title="Click to edit description"
          />
        ) : (
          <div 
            className="text-sm text-gray-500 italic cursor-pointer hover:bg-gray-50 p-2 rounded border border-dashed border-gray-300 hover:border-gray-400 transition-all duration-200 min-h-[40px] flex items-center"
            onClick={handleStartEditing}
            title="Click to add description"
          >
            {placeholder}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="relative">
        {/* Close button */}
        <button
          onClick={handleCancel}
          className="absolute top-2 right-2 z-10 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-xs transition-colors"
          title="Close editor"
        >
          ✕
        </button>
        
        <div
          ref={editorRef}
          style={{ height: "150px", backgroundColor: "white" }}
          className="border rounded"
        />
      </div>
      
      <div className="flex justify-between items-center mt-2 px-1">
        <span className="text-xs text-gray-500">Click Save to update or Cancel to discard changes</span>
        <div className="flex space-x-2">
          <button
            onClick={handleCancel}
            className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-3 py-1 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default InlineQuillEditor;