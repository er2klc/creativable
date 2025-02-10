
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
    content,
    stringHandler: 'html',
  });

  return (
    <div className="border rounded-md">
      <Remirror
        manager={manager}
        initialContent={content}
        onChange={({ helpers }) => {
          const html = helpers.getHTML();
          onChange(html);
        }}
        placeholder={placeholder}
      >
        <EditorToolbar />
        <EditorComponent className="p-4 min-h-[150px] prose prose-sm max-w-none focus:outline-none" />
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
      <Button
        variant="ghost"
        size="sm"
        onClick={() => commands.toggleBold()}
        className={active.bold() ? 'bg-muted-foreground/20' : ''}
      >
        <Bold className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => commands.toggleItalic()}
        className={active.italic() ? 'bg-muted-foreground/20' : ''}
      >
        <Italic className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => commands.toggleUnderline()}
        className={active.underline() ? 'bg-muted-foreground/20' : ''}
      >
        <Underline className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => commands.toggleHeading({ level: 2 })}
        className={active.heading({ level: 2 }) ? 'bg-muted-foreground/20' : ''}
      >
        <Heading2 className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => commands.toggleBulletList()}
        className={active.bulletList() ? 'bg-muted-foreground/20' : ''}
      >
        <List className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => commands.toggleOrderedList()}
        className={active.orderedList() ? 'bg-muted-foreground/20' : ''}
      >
        <ListOrdered className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => commands.toggleBlockquote()}
        className={active.blockquote() ? 'bg-muted-foreground/20' : ''}
      >
        <Quote className="h-4 w-4" />
      </Button>
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
