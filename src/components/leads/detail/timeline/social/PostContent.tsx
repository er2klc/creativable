export interface PostContentProps {
  text: string;
  caption: string;
  expanded: boolean;
  onToggle: () => void;
}

export const PostContent = ({ text, caption, expanded, onToggle }: PostContentProps) => {
  const content = text || caption;
  const shouldTruncate = content.length > 150;

  return (
    <div>
      <p className={`${!expanded && shouldTruncate ? 'line-clamp-3' : ''}`}>
        {content}
      </p>
      {shouldTruncate && (
        <button 
          onClick={onToggle} 
          className="text-gray-500 text-sm mt-1"
        >
          {expanded ? 'Show less' : 'Show more'}
        </button>
      )}
    </div>
  );
};
