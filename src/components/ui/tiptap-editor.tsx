
import React, { useEffect, useState } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Mention from '@tiptap/extension-mention';
import Image from '@tiptap/extension-image';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import { Button } from './button';
import { InputDialog } from './input-dialog';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import { 
  Bold, 
  Italic, 
  Underline as UnderlineIcon, 
  List, 
  ListOrdered, 
  Quote, 
  Hash,
  Image as ImageIcon,
  Heading2,
  Link as LinkIcon,
  Smile
} from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from './popover';

interface TiptapEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  teamMembers?: any[];
  onMention?: (userId: string) => void;
  onHashtag?: (tag: string) => void;
  preventSubmitOnEnter?: boolean;
  editorProps?: any;
}

export function TiptapEditor({ 
  content, 
  onChange, 
  placeholder,
  teamMembers = [],
  onMention,
  onHashtag,
  preventSubmitOnEnter = false,
  editorProps
}: TiptapEditorProps) {
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [showHashtagDialog, setShowHashtagDialog] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        hardBreak: {
          keepMarks: true,
          HTMLAttributes: {
            class: 'my-2'
          }
        },
        paragraph: {
          keepMarks: true,
          HTMLAttributes: {
            class: 'mb-4'
          }
        },
        heading: {
          levels: [2],
        }
      }),
      Underline,
      Link.configure({
        openOnClick: true,
        linkOnPaste: true,
        autolink: true,
        HTMLAttributes: {
          class: 'text-primary underline hover:text-primary/80 transition-colors'
        }
      }),
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
        class: 'prose-sm focus:outline-none min-h-[150px] max-w-none break-words w-full overflow-y-auto max-h-[500px] p-4 whitespace-pre-wrap',
      },
      ...editorProps
    },
  });

  useEffect(() => {
    const interval = setInterval(() => {
      if (editor?.getHTML()) {
        console.log('Autosaving...', editor.getHTML());
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [editor]);

  if (!editor) {
    return null;
  }

  const handleSetLink = (url: string) => {
    if (url === '') {
      editor.chain().focus().unsetLink().run();
      return;
    }
    editor.chain().focus().setLink({ href: url }).run();
  };

  const handleSetImage = (url: string) => {
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const handleSetHashtag = (tag: string) => {
    if (tag) {
      editor.chain().focus().insertContent(`#${tag} `).run();
      setShowHashtagDialog(false);
    }
  };

  const handleEmojiSelect = (emoji: any) => {
    editor.chain().focus().insertContent(emoji.native).run();
  };

  return (
    <div className="border rounded-md w-full overflow-hidden flex flex-col">
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
            <UnderlineIcon className="h-4 w-4" />
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
            onClick={() => setShowImageDialog(true)}
          >
            <ImageIcon className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton 
            onClick={() => setShowLinkDialog(true)}
            active={editor.isActive('link')}
          >
            <LinkIcon className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton 
            onClick={() => setShowHashtagDialog(true)}
          >
            <Hash className="h-4 w-4" />
          </ToolbarButton>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
              >
                <Smile className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0" align="end">
              <Picker 
                data={data} 
                onEmojiSelect={handleEmojiSelect}
                theme="light"
                skinTonePosition="none"
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="px-3 py-2">
          <EditorContent editor={editor} />
        </div>
      </div>

      <InputDialog
        isOpen={showLinkDialog}
        onClose={() => setShowLinkDialog(false)}
        onConfirm={handleSetLink}
        title="Link einfügen"
        placeholder="https://example.com"
        defaultValue={editor.getAttributes('link').href}
      />

      <InputDialog
        isOpen={showImageDialog}
        onClose={() => setShowImageDialog(false)}
        onConfirm={handleSetImage}
        title="Bild einfügen"
        placeholder="https://example.com/image.jpg"
      />

      <InputDialog
        isOpen={showHashtagDialog}
        onClose={() => setShowHashtagDialog(false)}
        onConfirm={handleSetHashtag}
        title="Hashtag einfügen"
        placeholder="hashtag"
      />
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
      type="button"
      variant="ghost"
      size="sm"
      onClick={(e) => {
        e.preventDefault();
        onClick();
      }}
      className={`h-8 w-8 p-0 ${active ? 'bg-muted' : ''}`}
    >
      {children}
    </Button>
  );
}
