
import { Editor } from '@tiptap/react';
import { ToolbarButton } from './toolbar-button';
import { Button } from '../button';
import { Popover, PopoverContent, PopoverTrigger } from '../popover';
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

interface EditorToolbarProps {
  editor: Editor;
  onImageClick: () => void;
  onLinkClick: () => void;
  onHashtagClick: () => void;
  onEmojiSelect: (emoji: any) => void;
}

export function EditorToolbar({ 
  editor, 
  onImageClick, 
  onLinkClick, 
  onHashtagClick,
  onEmojiSelect
}: EditorToolbarProps) {
  return (
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
        <ToolbarButton onClick={onImageClick}>
          <ImageIcon className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton 
          onClick={onLinkClick}
          active={editor.isActive('link')}
        >
          <LinkIcon className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={onHashtagClick}>
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
            <div className="emoji-mart">
              <Picker 
                data={data} 
                onEmojiSelect={onEmojiSelect}
                previewPosition="none"
                skinTonePosition="none"
                maxFrequentRows={0}
                emojiSize={20}
                emojiButtonSize={28}
                perLine={8}
              />
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
