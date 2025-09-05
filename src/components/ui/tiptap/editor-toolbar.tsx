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
import { cn } from '@/lib/utils';

interface EditorToolbarProps {
  editor: Editor;
  onImageClick: () => void;
  onLinkClick: () => void;
  onHashtagClick: () => void;
  onEmojiSelect: (emoji: string) => void;
  isAdmin?: boolean;
  teamId?: string;
}

const emojiCategories = {
  "Smileys": [
    { native: "😊", id: "smile" },
    { native: "😄", id: "smile_big" },
    { native: "🥰", id: "love" },
    { native: "😎", id: "cool" },
    { native: "🤩", id: "star_eyes" },
    { native: "😇", id: "innocent" },
    { native: "😂", id: "joy" },
    { native: "🤣", id: "rofl" }
  ],
  "Gesten": [
    { native: "👍", id: "thumbsup" },
    { native: "🙌", id: "raised_hands" },
    { native: "👏", id: "clap" },
    { native: "🤝", id: "handshake" },
    { native: "✌️", id: "peace" },
    { native: "💪", id: "muscle" },
    { native: "🙏", id: "pray" },
    { native: "👋", id: "wave" }
  ],
  "Symbole": [
    { native: "❤️", id: "heart" },
    { native: "✨", id: "sparkles" },
    { native: "🔥", id: "fire" },
    { native: "⭐", id: "star" },
    { native: "💡", id: "bulb" },
    { native: "💯", id: "hundred" },
    { native: "🎯", id: "dart" },
    { native: "✅", id: "check" }
  ],
  "Business": [
    { native: "💼", id: "briefcase" },
    { native: "📈", id: "chart" },
    { native: "🎯", id: "target" },
    { native: "🚀", id: "rocket" },
    { native: "💰", id: "money" },
    { native: "🤔", id: "thinking" },
    { native: "📊", id: "stats" },
    { native: "💡", id: "idea" }
  ],
  "Natur": [
    { native: "🌸", id: "blossom" },
    { native: "🌺", id: "hibiscus" },
    { native: "☀️", id: "sun" },
    { native: "🌈", id: "rainbow" },
    { native: "⭐", id: "star_nature" },
    { native: "🌙", id: "moon" },
    { native: "🌲", id: "tree" },
    { native: "🌺", id: "flower" }
  ],
  "Essen & Trinken": [
    { native: "☕️", id: "coffee" },
    { native: "🍕", id: "pizza" },
    { native: "🍜", id: "noodles" },
    { native: "🍱", id: "bento" },
    { native: "🍔", id: "burger" },
    { native: "🥗", id: "salad" },
    { native: "🍷", id: "wine" },
    { native: "🍰", id: "cake" }
  ],
  "Technologie": [
    { native: "💻", id: "laptop" },
    { native: "📱", id: "phone" },
    { native: "⌚️", id: "watch" },
    { native: "🖥️", id: "desktop" },
    { native: "📸", id: "camera" },
    { native: "🎮", id: "gaming" },
    { native: "🎯", id: "target_tech" },
    { native: "📱", id: "mobile" }
  ]
};

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
      <div class="p-4 my-2 border rounded-lg transition-colors hover:bg-accent/50" 
           style="border-left: 4px solid ${event.color}">
        <div class="flex items-center justify-between">
          <div>
            <h4 class="font-medium">${event.title}</h4>
            <p class="text-sm text-muted-foreground">${new Date(event.start_time).toLocaleString('de-DE', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}</p>
          </div>
          ${event.is_team_event ? '<span class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">Team Event</span>' : ''}
        </div>
      </div>
    `).join('');

    editor.chain().focus().insertContent(eventContent).run();
  };

  const allEmojis = Object.values(emojiCategories).flat();

  return (
    <div className="sticky top-0 z-[50] bg-background border-b">
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
            <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-background border rounded-lg shadow-lg z-[9999] w-[900px] max-h-[400px] overflow-y-auto">
              <div className="flex flex-wrap gap-1 p-2">
                {allEmojis.map((emoji) => (
                  <Button
                    key={emoji.id}
                    variant="ghost"
                    className="h-10 w-10 p-0 hover:bg-muted"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleEmojiClick(emoji.native);
                    }}
                    title={emoji.id}
                  >
                    <span className="text-2xl">{emoji.native}</span>
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
