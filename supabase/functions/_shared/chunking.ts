export interface ChunkMetadata {
  source_type: string;
  chunk_index: number;
  total_chunks: number;
  timestamp: string;
  title?: string;
}

export interface DocumentChunk {
  content: string;
  metadata: ChunkMetadata;
}

export const chunkDocument = (
  text: string,
  metadata: Partial<ChunkMetadata>,
  maxChunkSize: number = 500,
  overlap: number = 100
): DocumentChunk[] => {
  const words = text.split(' ');
  const chunks: DocumentChunk[] = [];
  let currentChunk: string[] = [];
  let chunkIndex = 0;

  for (let i = 0; i < words.length; i++) {
    currentChunk.push(words[i]);

    // Check if current chunk is at max size
    if (currentChunk.length >= maxChunkSize) {
      chunks.push({
        content: currentChunk.join(' '),
        metadata: {
          ...metadata,
          chunk_index: chunkIndex,
          total_chunks: Math.ceil(words.length / (maxChunkSize - overlap)),
          timestamp: new Date().toISOString(),
          source_type: metadata.source_type || 'unknown'
        }
      });

      // Keep overlap words for next chunk
      currentChunk = words.slice(i - overlap + 1, i + 1);
      chunkIndex++;
    }
  }

  // Add remaining words as last chunk
  if (currentChunk.length > 0) {
    chunks.push({
      content: currentChunk.join(' '),
      metadata: {
        ...metadata,
        chunk_index: chunkIndex,
        total_chunks: chunkIndex + 1,
        timestamp: new Date().toISOString(),
        source_type: metadata.source_type || 'unknown'
      }
    });
  }

  return chunks;
}
