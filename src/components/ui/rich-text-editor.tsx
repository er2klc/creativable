
import React, { useState, useEffect } from 'react';
import { Editor, EditorState, RichUtils, convertToRaw, convertFromHTML, ContentState } from 'draft-js';
import 'draft-js/dist/Draft.css';
import { Button } from './button';
import { 
  Bold, 
  Italic, 
  Underline,
  List, 
  ListOrdered,
  Quote,
  Heading2
} from 'lucide-react';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

export function RichTextEditor({ content, onChange, placeholder }: RichTextEditorProps) {
  const [editorState, setEditorState] = useState(() => {
    if (content) {
      const blocksFromHTML = convertFromHTML(content);
      const contentState = ContentState.createFromBlockArray(
        blocksFromHTML.contentBlocks,
        blocksFromHTML.entityMap
      );
      return EditorState.createWithContent(contentState);
    }
    return EditorState.createEmpty();
  });

  useEffect(() => {
    const contentState = editorState.getCurrentContent();
    const rawContent = convertToRaw(contentState);
    const html = rawContent.blocks.map(block => {
      const text = block.text;
      switch (block.type) {
        case 'header-two':
          return `<h2>${text}</h2>`;
        case 'blockquote':
          return `<blockquote>${text}</blockquote>`;
        case 'unordered-list-item':
          return `<ul><li>${text}</li></ul>`;
        case 'ordered-list-item':
          return `<ol><li>${text}</li></ol>`;
        default:
          return `<p>${text}</p>`;
      }
    }).join('');
    onChange(html);
  }, [editorState, onChange]);

  const handleKeyCommand = (command: string, editorState: EditorState) => {
    const newState = RichUtils.handleKeyCommand(editorState, command);
    if (newState) {
      setEditorState(newState);
      return 'handled';
    }
    return 'not-handled';
  };

  const toggleBlockType = (blockType: string) => {
    setEditorState(RichUtils.toggleBlockType(editorState, blockType));
  };

  const toggleInlineStyle = (inlineStyle: string) => {
    setEditorState(RichUtils.toggleInlineStyle(editorState, inlineStyle));
  };

  return (
    <div className="relative border rounded-md">
      <div className="sticky top-0 z-10 bg-background border-b">
        <div className="flex flex-wrap gap-1 p-2">
          <ToolbarButton 
            onClick={() => toggleInlineStyle('BOLD')}
            active={editorState.getCurrentInlineStyle().has('BOLD')}
          >
            <Bold className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton 
            onClick={() => toggleInlineStyle('ITALIC')}
            active={editorState.getCurrentInlineStyle().has('ITALIC')}
          >
            <Italic className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton 
            onClick={() => toggleInlineStyle('UNDERLINE')}
            active={editorState.getCurrentInlineStyle().has('UNDERLINE')}
          >
            <Underline className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton 
            onClick={() => toggleBlockType('header-two')}
            active={editorState.getCurrentContent().getBlockForKey(editorState.getSelection().getStartKey()).getType() === 'header-two'}
          >
            <Heading2 className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton 
            onClick={() => toggleBlockType('unordered-list-item')}
            active={editorState.getCurrentContent().getBlockForKey(editorState.getSelection().getStartKey()).getType() === 'unordered-list-item'}
          >
            <List className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton 
            onClick={() => toggleBlockType('ordered-list-item')}
            active={editorState.getCurrentContent().getBlockForKey(editorState.getSelection().getStartKey()).getType() === 'ordered-list-item'}
          >
            <ListOrdered className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton 
            onClick={() => toggleBlockType('blockquote')}
            active={editorState.getCurrentContent().getBlockForKey(editorState.getSelection().getStartKey()).getType() === 'blockquote'}
          >
            <Quote className="h-4 w-4" />
          </ToolbarButton>
        </div>
      </div>
      <div className="min-h-[150px] px-3 py-2">
        <Editor
          editorState={editorState}
          onChange={setEditorState}
          handleKeyCommand={handleKeyCommand}
          placeholder={placeholder}
        />
      </div>
    </div>
  );
}

function ToolbarButton({ onClick, active, children }: { 
  onClick: () => void; 
  active: boolean; 
  children: React.ReactNode 
}) {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      className={`h-8 w-8 p-0 ${active ? 'bg-muted' : ''}`}
    >
      {children}
    </Button>
  );
}
