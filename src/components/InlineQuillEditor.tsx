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
  const [isEditing, setIsEditing] = useState(true); // Start in editing mode by default
  const [currentContent, setCurrentContent] = useState(initialValue || "");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Update content when initialValue changes
  useEffect(() => {
    setCurrentContent(initialValue);
  }, [initialValue]);


  useEffect(() => {
    console.log('InlineQuillEditor useEffect:', { isClient, hasEditorRef: !!editorRef.current, isEditing, isInitialized: isInitializedRef.current });
    if (!isClient || !editorRef.current || !isEditing) {
      return;
    }

    // Prevent multiple initializations
    if (isInitializedRef.current) return;

    const initializeQuill = async () => {
      try {
        console.log('Initializing Quill editor...');
        const { default: Quill } = await import("quill");
        console.log('Quill imported successfully');

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
        console.log('Quill instance created');

        quillRef.current = quill;
        isInitializedRef.current = true;
        console.log('Quill editor initialized successfully');

        // Set initial content
        if (currentContent) {
          console.log('Setting initial content:', currentContent);
          quill.root.innerHTML = currentContent;
        }

        // Focus the editor
        console.log('Focusing Quill editor');
        setTimeout(() => {
          quill.focus();
        }, 100); // Small delay to ensure DOM is ready
      } catch (error) {
        console.error('Error initializing Quill editor:', error);
        setError(error instanceof Error ? error.message : 'Failed to initialize editor');
      }
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

  if (error) {
    return (
      <div className={className}>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-red-700 text-sm font-medium mb-2">Editor Error:</div>
          <div className="text-red-600 text-sm">{error}</div>
          <button
            onClick={() => {
              setError(null);
              setIsEditing(true);
            }}
            className="mt-2 px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="relative">
        <div
          ref={editorRef}
          style={{ height: "150px", backgroundColor: "white" }}
          className="border rounded"
        />
      </div>
      
      <div className="flex justify-between items-center mt-2 px-1">
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