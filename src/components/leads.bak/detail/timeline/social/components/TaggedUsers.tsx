interface TaggedUsersProps {
  users: Array<{ id: string; username: string; full_name?: string; is_verified?: boolean }>;
}

export const TaggedUsers = ({ users }: TaggedUsersProps) => {
  if (!users || users.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {users.map((user) => (
        <a 
          key={user.id} 
          href={`https://www.instagram.com/${user.username}/`} 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center space-x-2 text-sm bg-gray-100 p-2 rounded-lg hover:bg-gray-200"
        >
          <span>{user.full_name || user.username}</span>
          {user.is_verified && (
            <span className="flex items-center justify-center w-5 h-5 text-blue-500 ml-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 40 40"
                fill="currentColor"
                className="w-3 h-3"
              >
                <path d="M19.998 3.094 14.638 0l-2.972 5.15H5.432v6.354L0 14.64 3.094 20 0 25.359l5.432 3.137v5.905h5.975L14.638 40l5.36-3.094L25.358 40l3.232-5.6h6.162v-6.01L40 25.359 36.905 20 40 14.641l-5.248-3.03v-6.46h-6.419L25.358 0l-5.36 3.094Z" fillRule="evenodd" />
              </svg>
            </span>
          )}
        </a>
      ))}
    </div>
  );
};