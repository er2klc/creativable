interface PlatformDetailHeaderProps {
  moduleTitle: string;
  title: string;
  isCompleted: boolean;
  onComplete: () => void;
  isAdmin: boolean;
  onEdit: () => void;
  onDelete: () => void;
  videoDuration: number;
  documentsCount: number;
  progress: number;
}

export const PlatformDetailHeader = ({
  moduleTitle,
  title,
  isCompleted,
  onComplete,
  isAdmin,
  onEdit,
  onDelete,
  videoDuration,
  documentsCount,
  progress
}: PlatformDetailHeaderProps) => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-xl font-bold">{moduleTitle}</h1>
        <h2 className="text-lg">{title}</h2>
        <div className="flex items-center">
          <span className={`text-sm ${isCompleted ? 'text-green-600' : 'text-red-600'}`}>
            {isCompleted ? 'Abgeschlossen' : 'Nicht abgeschlossen'}
          </span>
          <div className="ml-2">
            <progress value={progress} max="100" className="w-full" />
          </div>
        </div>
      </div>
      <div className="flex space-x-2">
        {isAdmin && (
          <>
            <button onClick={onEdit} className="text-blue-600 hover:underline">Bearbeiten</button>
            <button onClick={onDelete} className="text-red-600 hover:underline">Löschen</button>
          </>
        )}
        <button onClick={onComplete} className={`text-${isCompleted ? 'red' : 'green'}-600 hover:underline`}>
          {isCompleted ? 'Wieder öffnen' : 'Abschließen'}
        </button>
      </div>
      <div className="text-sm">
        {videoDuration > 0 && <span>Dauer: {videoDuration} Minuten</span>}
        {documentsCount > 0 && <span className="ml-2">Dokumente: {documentsCount}</span>}
      </div>
    </div>
  );
};