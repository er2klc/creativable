
import { Editor } from '@tiptap/react';
import { ToolbarButton } from './toolbar-button';
import { Button } from '../button';
import { useState, useRef, useEffect } from 'react';
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
  Smile,
  Calendar
} from 'lucide-react';
import { EventSelector } from '../../teams/posts/dialog/EventSelector';

interface EditorToolbarProps {
  editor: Editor;
  onImageClick: () => void;
  onLinkClick: () => void;
  onHashtagClick: () => void;
  onEmojiSelect: (emoji: string) => void;
  isAdmin?: boolean;
  teamId?: string;
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
  onEmojiSelect,
  isAdmin = false,
  teamId
}: EditorToolbarProps) {
  const [isEmojiOpen, setIsEmojiOpen] = useState(false);
  const [isEventSelectorOpen, setIsEventSelectorOpen] = useState(false);
  const emojiContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (emojiContainerRef.current && !emojiContainerRef.current.contains(event.target as Node)) {
        setIsEmojiOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleEmojiClick = (emoji: string) => {
    onEmojiSelect(emoji);
    setIsEmojiOpen(false);
  };

  const handleEventSelect = (events: any[]) => {
    const eventContent = events.map(event => `
      <div class="p-4 my-2 border rounded-lg" style="border-left: 4px solid ${event.color}">
        <h4 class="font-medium">${event.title}</h4>
        <p class="text-sm text-gray-500">${new Date(event.start_time).toLocaleString('de-DE', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })}</p>
      </div>
    `).join('');

    editor.chain().focus().insertContent(eventContent).run();
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

        <div className="relative" ref={emojiContainerRef}>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => setIsEmojiOpen(!isEmojiOpen)}
          >
            <Smile className="h-4 w-4" />
          </Button>
          {isEmojiOpen && (
            <div className="absolute top-full left-0 mt-1 bg-background border rounded-md shadow-md z-50">
              <div className="grid grid-cols-6 gap-1 p-2">
                {commonEmojis.map((emoji) => (
                  <Button
                    key={emoji.id}
                    variant="ghost"
                    className="h-8 w-8 p-0 hover:bg-muted"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleEmojiClick(emoji.native);
                    }}
                  >
                    <span className="text-lg">{emoji.native}</span>
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>

        {isAdmin && teamId && (
          <>
            <ToolbarButton onClick={() => setIsEventSelectorOpen(true)}>
              <Calendar className="h-4 w-4" />
            </ToolbarButton>
            <EventSelector
              teamId={teamId}
              open={isEventSelectorOpen}
              onOpenChange={setIsEventSelectorOpen}
              onSelect={handleEventSelect}
            />
          </>
        )}
      </div>
    </div>
  );
}
