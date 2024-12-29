interface UserSearchResultsProps {
  searchResults: SearchResult[];
  onSelectUser: (email: string) => void;
}

export const UserSearchResults = ({ searchResults, onSelectUser }: UserSearchResultsProps) => {
  if (!searchResults || searchResults.length === 0) {
    return <div className="p-4">Keine Benutzer gefunden.</div>;
  }

  return (
    <div className="p-4">
      {searchResults.map((result) => (
        <div
          key={result.id}
          onClick={() => onSelectUser(result.email)}
          className="cursor-pointer hover:bg-gray-100 p-2 rounded"
        >
          {result.email}
        </div>
      ))}
    </div>
  );
};
