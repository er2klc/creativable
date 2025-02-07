
import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { PresentationLoading } from '@/components/presentation/PresentationLoading';
import { PresentationError } from '@/components/presentation/PresentationError';
import { PresentationContent } from '@/components/presentation/PresentationContent';
import { usePresentationData } from '@/components/presentation/hooks/usePresentationData';
import { usePresentationView } from '@/components/presentation/hooks/usePresentationView';
import { useUnloadHandler } from '@/components/presentation/hooks/useUnloadHandler';

export default function PresentationPage() {
  const { pageId } = useParams();
  const leadId = useParams().leadId;
  const { pageData, isLoading, error, loadPresentationPage } = usePresentationData(pageId);
  const { viewId, createView, updateProgress, isCreatingView } = usePresentationView(pageId, leadId);

  useUnloadHandler(viewId);

  // Load page data only once when pageId is available and data isn't already loading or loaded
  useEffect(() => {
    if (pageId && !isLoading && !pageData && !error) {
      console.log('Loading presentation page data...', { pageId, leadId });
      loadPresentationPage();
    }
  }, [pageId, leadId, isLoading, pageData, error, loadPresentationPage]);

  // Create view once when we have page data
  useEffect(() => {
    if (pageData && !viewId && !isCreatingView) {
      console.log('Initializing presentation view with pageData:', pageData);
      createView(pageData);
    }
  }, [pageData, viewId, createView, isCreatingView]);

  // Show loading state while loading data or creating view
  if (isLoading || isCreatingView) {
    return <PresentationLoading />;
  }

  // Show error if there's an error or no data
  if (error || !pageData) {
    return <PresentationError error={error || "Präsentation nicht gefunden"} />;
  }

  // Show content when everything is ready
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#0A0A0A]">
      <div className="absolute inset-0 bg-gradient-to-b from-purple-600/20 via-yellow-500/10 to-blue-500/20 opacity-30" />
      <PresentationContent 
        pageData={pageData} 
        onProgress={(progress) => {
          if (viewId) {
            console.log('Progress update:', progress);
            updateProgress(progress, pageData);
          }
        }} 
      />
    </div>
  );
}
