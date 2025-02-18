
import { Editor } from '@tiptap/react';
import { ToolbarButton } from './toolbar-button';
import { Button } from '../button';
import { Popover, PopoverContent, PopoverTrigger } from '../popover';
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
  onEmojiSelect: (emoji: string) => void;
}

const commonEmojis = [
  { native: "😊", id: "smile" },
  { native: "👍", id: "thumbsup" },
  { native: "🎉", id: "party" },
  { native: "❤️", id: "heart" },
  { native: "🔥", id: "fire" },
  { native: "✨", id: "sparkles" },
  { native: "🙌", id: "raised_hands" },
  { native: "👏", id: "clap" },
  { native: "🤝", id: "handshake" },
  { native: "💡", id: "bulb" },
  { native: "⭐", id: "star" },
  { native: "💪", id: "muscle" },
];

export function EditorToolbar({ 
  editor, 
  onImageClick, 
  onLinkClick, 
  onHashtagClick,
  onEmojiSelect
}: EditorToolbarProps) {
  const handleEmojiClick = (e: React.MouseEvent, emoji: string) => {
    e.preventDefault();
    e.stopPropagation();
    onEmojiSelect(emoji);
  };

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
        <ToolbarButton onClick={() => onImageClick()}>
          <ImageIcon className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton 
          onClick={() => onLinkClick()}
          active={editor.isActive('link')}
        >
          <LinkIcon className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => onHashtagClick()}>
          <Hash className="h-4 w-4" />
        </ToolbarButton>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={(e) => e.stopPropagation()}
            >
              <Smile className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-fit p-2" align="end" onClick={(e) => e.stopPropagation()}>
            <div className="grid grid-cols-6 gap-1">
              {commonEmojis.map((emoji) => (
                <Button
                  key={emoji.id}
                  variant="ghost"
                  className="h-8 w-8 p-0 hover:bg-muted"
                  onClick={(e) => handleEmojiClick(e, emoji.native)}
                >
                  <span className="text-lg">{emoji.native}</span>
                </Button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
