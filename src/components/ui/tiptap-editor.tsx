import React, { useEffect, useState } from 'react';
import { EditorContent, useEditor, ReactRenderer } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Mention from '@tiptap/extension-mention';
import Image from '@tiptap/extension-image';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import { InputDialog } from './input-dialog';
import { EditorToolbar } from './tiptap/editor-toolbar';
import { MentionList } from "@/components/teams/posts/components/comments/MentionList";
import tippy from 'tippy.js';

interface TiptapEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  teamMembers?: any[];
  onMention?: (userId: string) => void;
  onHashtag?: (tag: string) => void;
  preventSubmitOnEnter?: boolean;
  editorProps?: any;
  isAdmin?: boolean;
  teamId?: string;
}

export function TiptapEditor({ 
  content, 
  onChange, 
  placeholder,
  teamMembers = [],
  onMention,
  onHashtag,
  preventSubmitOnEnter = false,
  editorProps,
  isAdmin = false,
  teamId
}: TiptapEditorProps) {
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [showHashtagDialog, setShowHashtagDialog] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: {
          keepMarks: true,
          HTMLAttributes: {
            class: 'list-disc ml-4 space-y-2 mb-4'
          }
        },
        orderedList: {
          keepMarks: true,
          HTMLAttributes: {
            class: 'list-decimal ml-4 space-y-2 mb-4'
          }
        },
        heading: {
          levels: [2],
          HTMLAttributes: {
            class: 'text-2xl font-bold mt-6 mb-4'
          }
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
        HTMLAttributes: { 
          class: 'text-primary underline cursor-pointer hover:text-primary/80'
        },
        suggestion: {
          items: ({ query }) => {
            return teamMembers
              ?.filter(member => 
                member.profiles?.display_name
                  ?.toLowerCase()
                  .includes(query.toLowerCase())
              )
              .slice(0, 5) || [];
          },
          render: () => {
            let component: any;
            let popup: any;

            return {
              onStart: (props: any) => {
                component = new ReactRenderer(MentionList, {
                  props,
                  editor: props.editor,
                });

                popup = tippy("body", {
                  getReferenceClientRect: props.clientRect,
                  appendTo: () => document.body,
                  content: component.element,
                  showOnCreate: true,
                  interactive: true,
                  trigger: "manual",
                  placement: "bottom-start",
                });
              },
              onUpdate: (props: any) => {
                component?.updateProps(props);

                popup?.[0].setProps({
                  getReferenceClientRect: props.clientRect,
                });
              },
              onKeyDown: (props: any) => {
                if (props.event.key === "Escape") {
                  popup?.[0].hide();
                  return true;
                }
                return component?.ref?.onKeyDown(props);
              },
              onExit: () => {
                popup?.[0].destroy();
                component?.destroy();
              },
            };
          },
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
    } else {
      editor.chain().focus().setLink({ href: url }).run();
    }
    setShowLinkDialog(false);
  };

  const handleSetImage = (url: string) => {
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
    setShowImageDialog(false);
  };

  const handleSetHashtag = (tag: string) => {
    if (tag) {
      editor.chain().focus().insertContent(`#${tag} `).run();
    }
    setShowHashtagDialog(false);
  };

  const handleEmojiSelect = (emoji: string) => {
    if (emoji) {
      editor.chain().focus().insertContent(emoji).run();
    }
  };

  return (
    <div 
      className="border rounded-md w-full overflow-hidden flex flex-col" 
      onClick={(e) => e.stopPropagation()}
    >
      <EditorToolbar 
        editor={editor}
        onImageClick={() => setShowImageDialog(true)}
        onLinkClick={() => setShowLinkDialog(true)}
        onHashtagClick={() => setShowHashtagDialog(true)}
        onEmojiSelect={handleEmojiSelect}
        isAdmin={isAdmin}
        teamId={teamId}
      />

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
