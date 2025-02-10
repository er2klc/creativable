
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
        transformCaptured: (emoji) => emoji.native,
      }),
    ],
    []
  );

  const { manager } = useRemirror({
    extensions,
    content: content || '',
    stringHandler: 'html',
  });

  return (
    <div className="relative">
      <Remirror
        manager={manager}
        onChange={({ helpers }) => {
          const html = helpers.getHTML();
          onChange(html);
        }}
        placeholder={placeholder}
        autoFocus={false}
        classNames={{
          editor: 'min-h-[150px] px-3 py-2 focus:outline-none',
        }}
      >
        <div className="sticky top-0 z-10 bg-background border-b">
          <EditorToolbar />
        </div>
        <EditorComponent />
      </Remirror>
    </div>
  );
}

function EditorToolbar() {
  const commands = useCommands();
  const active = useActive();

  const handleAddEmoji = React.useCallback((emoji: { native: string }) => {
    if (emoji?.native) {
      commands.insertText(emoji.native);
    }
  }, [commands]);

  return (
    <div className="flex flex-wrap gap-1 p-2">
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

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Smile className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Picker 
            data={data} 
            onEmojiSelect={handleAddEmoji}
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

function ToolbarButton({ onClick, active, children }: { onClick: () => void; active: boolean; children: React.ReactNode }) {
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

