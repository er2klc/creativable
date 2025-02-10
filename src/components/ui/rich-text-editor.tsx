import React from 'react';
import {
  EditorComponent,
  Remirror,
  useRemirror,
  useActive,
  useCommands,
} from '@remirror/react';
import {
  EmojiExtension,
  BoldExtension,
  ItalicExtension,
  UnderlineExtension,
  ListItemExtension,
  BulletListExtension,
  OrderedListExtension,
  BlockquoteExtension,
  HeadingExtension,
} from 'remirror/extensions';
import { Button } from './button';
import { 
  Bold, 
  Italic, 
  Underline,
  List, 
  ListOrdered,
  Quote,
  Heading2,
  Smile
} from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

export function RichTextEditor({ content, onChange, placeholder }: RichTextEditorProps) {
  // Extensions definieren
  const extensions = React.useMemo(
    () => [
      new BoldExtension(),
      new ItalicExtension(),
      new UnderlineExtension(),
      new ListItemExtension(),
      new BulletListExtension(),
      new OrderedListExtension(),
      new BlockquoteExtension(),
      new HeadingExtension(),
      new EmojiExtension({
        data,
        transformCaptured: (emoji) => emoji.native, // Emojis richtig einfügen
      }),
    ],
    []
  );

  // Remirror Manager initialisieren
  const { manager, state } = useRemirror({
    extensions,
    content, // Richtiges Initial-Content-Handling
    stringHandler: 'html',
  });

  return (
    <div className="border rounded-md">
      <Remirror
        manager={manager}
        initialContent={state} // Richtiger Initialwert
        onChange={({ helpers }) => onChange(helpers.getHTML())} // Verbesserter Change-Handler
        placeholder={placeholder}
      >
        <EditorToolbar />
        <EditorComponent className="p-4 min-h-[150px] focus:outline-none" />
      </Remirror>
    </div>
  );
}

function EditorToolbar() {
  const commands = useCommands();
  const active = useActive();

  const addEmoji = (emoji: any) => {
    commands.insertText(emoji.native);
  };

  return (
    <div className="flex flex-wrap gap-1 p-2 border-b bg-muted">
      <ToolbarButton onClick={() => commands.toggleBold()} active={active.bold()}>
        <Bold className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton onClick={() => commands.toggleItalic()} active={active.italic()}>
        <Italic className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton onClick={() => commands.toggleUnderline()} active={active.underline()}>
        <Underline className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton onClick={() => commands.toggleHeading({ level: 2 })} active={active.heading({ level: 2 })}>
        <Heading2 className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton onClick={() => commands.toggleBulletList()} active={active.bulletList()}>
        <List className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton onClick={() => commands.toggleOrderedList()} active={active.orderedList()}>
        <ListOrdered className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton onClick={() => commands.toggleBlockquote()} active={active.blockquote()}>
        <Quote className="h-4 w-4" />
      </ToolbarButton>

      {/* Emoji Picker */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm">
            <Smile className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Picker 
            data={data} 
            onEmojiSelect={addEmoji}
            theme="light"
            emojiSize={20}
            emojiButtonSize={28}
            maxFrequentRows={1}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

// Einfache ToolbarButton Komponente für weniger Code-Wiederholung
function ToolbarButton({ onClick, active, children }: { onClick: () => void; active: boolean; children: React.ReactNode }) {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      className={active ? 'bg-muted-foreground/20' : ''}
    >
      {children}
    </Button>
  );
}
