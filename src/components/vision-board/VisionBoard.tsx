import { useOpenAIKey } from "@/hooks/use-openai-key";
import { NoApiKeyAlert } from "./NoApiKeyAlert";

export const VisionBoard = () => {
  const { apiKey, isLoading } = useOpenAIKey();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  if (!apiKey) {
    return <NoApiKeyAlert />;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Vision Board</h1>
        </div>
        {/* Vision Board content will be added here */}
      </div>
    </div>
  );
};