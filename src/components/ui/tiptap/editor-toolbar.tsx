
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

// Erweiterte Emoji-Liste mit Kategorien
const emojiCategories = {
  "Smileys": [
    { native: "😊", id: "smile" },
    { native: "😄", id: "smile_big" },
    { native: "🥰", id: "love" },
    { native: "😎", id: "cool" },
    { native: "🤩", id: "star_eyes" },
    { native: "😇", id: "innocent" }
  ],
  "Gesten": [
    { native: "👍", id: "thumbsup" },
    { native: "🙌", id: "raised_hands" },
    { native: "👏", id: "clap" },
    { native: "🤝", id: "handshake" },
    { native: "✌️", id: "peace" },
    { native: "💪", id: "muscle" }
  ],
  "Symbole": [
    { native: "❤️", id: "heart" },
    { native: "✨", id: "sparkles" },
    { native: "🔥", id: "fire" },
    { native: "⭐", id: "star" },
    { native: "💡", id: "bulb" },
    { native: "💯", id: "hundred" }
  ],
  "Business": [
    { native: "💼", id: "briefcase" },
    { native: "📈", id: "chart" },
    { native: "🎯", id: "target" },
    { native: "🚀", id: "rocket" },
    { native: "💰", id: "money" },
    { native: "🤔", id: "thinking" }
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
            <div className="absolute top-full left-0 mt-1 bg-background border rounded-lg shadow-lg z-50 min-w-[320px]">
              <div className="p-2 space-y-3">
                {Object.entries(emojiCategories).map(([category, emojis]) => (
                  <div key={category}>
                    <h3 className="text-xs font-medium text-muted-foreground mb-1 px-2">{category}</h3>
                    <div className="grid grid-cols-8 gap-1">
                      {emojis.map((emoji) => (
                        <Button
                          key={emoji.id}
                          variant="ghost"
                          className="h-8 w-8 p-0 hover:bg-muted"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleEmojiClick(emoji.native);
                          }}
                          title={emoji.id}
                        >
                          <span className="text-lg">{emoji.native}</span>
                        </Button>
                      ))}
                    </div>
                  </div>
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
