
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Button } from './button';
import { 
  Bold, 
  Italic, 
  List, 
  ListOrdered,
  Quote,
  Heading2,
  Undo,
  Redo,
  Smile
} from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import data from '@emoji-mart/data'
import Picker from '@emoji-mart/react'

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

export function RichTextEditor({ content, onChange, placeholder }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [StarterKit],
    content,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html);
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none min-h-[150px] focus:outline-none p-2',
      },
    },
  });

  if (!editor) {
    return null;
  }

  const addEmoji = (emoji: any) => {
    editor.chain().focus().insertContent(emoji.native).run();
  };

  const preventBubbling = (e: React.MouseEvent | React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleButtonClick = (e: React.MouseEvent, callback: () => void) => {
    e.preventDefault();
    e.stopPropagation();
    callback();
  };

  return (
    <div className="border rounded-md select-none" onMouseDown={preventBubbling} onClick={preventBubbling}>
      <div className="flex flex-wrap gap-1 p-2 border-b bg-muted">
        <Button
          variant="ghost"
          size="sm"
          onMouseDown={(e) => handleButtonClick(e, () => editor.chain().focus().toggleBold().run())}
          className={editor.isActive('bold') ? 'bg-muted-foreground/20' : ''}
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onMouseDown={(e) => handleButtonClick(e, () => editor.chain().focus().toggleItalic().run())}
          className={editor.isActive('italic') ? 'bg-muted-foreground/20' : ''}
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onMouseDown={(e) => handleButtonClick(e, () => editor.chain().focus().toggleHeading({ level: 2 }).run())}
          className={editor.isActive('heading') ? 'bg-muted-foreground/20' : ''}
        >
          <Heading2 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onMouseDown={(e) => handleButtonClick(e, () => editor.chain().focus().toggleBulletList().run())}
          className={editor.isActive('bulletList') ? 'bg-muted-foreground/20' : ''}
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onMouseDown={(e) => handleButtonClick(e, () => editor.chain().focus().toggleOrderedList().run())}
          className={editor.isActive('orderedList') ? 'bg-muted-foreground/20' : ''}
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onMouseDown={(e) => handleButtonClick(e, () => editor.chain().focus().toggleBlockquote().run())}
          className={editor.isActive('blockquote') ? 'bg-muted-foreground/20' : ''}
        >
          <Quote className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onMouseDown={(e) => handleButtonClick(e, () => editor.chain().focus().undo().run())}
        >
          <Undo className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onMouseDown={(e) => handleButtonClick(e, () => editor.chain().focus().redo().run())}
        >
          <Redo className="h-4 w-4" />
        </Button>
        <Popover>
          <PopoverTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm"
              onMouseDown={preventBubbling}
              onClick={preventBubbling}
            >
              <Smile className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent 
            className="w-full p-0" 
            onMouseDownCapture={preventBubbling}
            onPointerDownCapture={preventBubbling}
            onClick={preventBubbling}
            onPointerDown={preventBubbling}
          >
            <div onMouseDown={preventBubbling} onClick={preventBubbling}>
              <Picker 
                data={data} 
                onEmojiSelect={addEmoji}
                theme="light"
                emojiSize={20}
                emojiButtonSize={28}
                maxFrequentRows={1}
              />
            </div>
          </PopoverContent>
        </Popover>
      </div>
      <div className="p-4">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
