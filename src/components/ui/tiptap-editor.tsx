
import React, { useEffect } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Mention from '@tiptap/extension-mention';
import Image from '@tiptap/extension-image';
import { Button } from './button';
import { 
  Bold, 
  Italic, 
  Underline,
  List, 
  ListOrdered,
  Quote,
  Hash,
  Image as ImageIcon,
  Heading2
} from 'lucide-react';

interface TiptapEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  teamMembers?: any[];
  onMention?: (userId: string) => void;
  onHashtag?: (tag: string) => void;
}

export function TiptapEditor({ 
  content, 
  onChange, 
  placeholder,
  teamMembers = [],
  onMention,
  onHashtag 
}: TiptapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Mention.configure({
        HTMLAttributes: { class: 'mention' },
        suggestion: {
          items: ({ query }) => 
            teamMembers
              .filter(member => 
                member.profiles?.display_name?.toLowerCase().includes((query || '').toLowerCase())
              )
              .slice(0, 5),
          render: () => {
            return {
              onStart: () => {},
              onUpdate: () => {},
              onKeyDown: () => false,
              onExit: () => {},
            }
          }
        },
      }),
      Image.configure({
        inline: true,
        allowBase64: true,
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose-base lg:prose-lg xl:prose-xl focus:outline-none min-h-[150px]',
      },
    },
  });

  // Autosave every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (editor?.getHTML()) {
        // You can implement autosave logic here
        console.log('Autosaving...', editor.getHTML());
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className="border rounded-md">
      <div className="sticky top-0 z-10 bg-background border-b">
        <div className="flex flex-wrap gap-1 p-2">
          <ToolbarButton 
            onClick={() => editor.chain().focus().toggleBold().run()}
            active={editor.isActive('bold')}
          >
            <Bold className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton 
            onClick={() => editor.chain().focus().toggleItalic().run()}
            active={editor.isActive('italic')}
          >
            <Italic className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton 
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            active={editor.isActive('underline')}
          >
            <Underline className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton 
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            active={editor.isActive('heading', { level: 2 })}
          >
            <Heading2 className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton 
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            active={editor.isActive('bulletList')}
          >
            <List className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton 
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            active={editor.isActive('orderedList')}
          >
            <ListOrdered className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton 
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            active={editor.isActive('blockquote')}
          >
            <Quote className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton 
            onClick={() => {
              const url = window.prompt('Enter image URL:');
              if (url) {
                editor.chain().focus().setImage({ src: url }).run();
              }
            }}
          >
            <ImageIcon className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton 
            onClick={() => {
              const tag = window.prompt('Enter hashtag:');
              if (tag && onHashtag) {
                onHashtag(tag);
                editor.chain().focus().insertContent(`#${tag} `).run();
              }
            }}
          >
            <Hash className="h-4 w-4" />
          </ToolbarButton>
        </div>
      </div>
      <div className="px-3 py-2">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}

function ToolbarButton({ onClick, active, children }: { 
  onClick: () => void; 
  active?: boolean; 
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
