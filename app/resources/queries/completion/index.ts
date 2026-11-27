export type {
  CompletionRequestType,
  ChatMessage,
  ChatMessageRole,
  ChatCompletionRequest,
  ChatCompletionResponse,
  ChatCompletionChoice,
  ChatCompletionUsage,
  FileRequest,
  ScanResponse,
  SummarizeTextRequest,
  SummarizeResponse,
} from './completion.type'
export {
  getCompletionRequests,
  getCompletionRequest,
  createChatCompletion,
  createScanFile,
  createSummarize,
} from './completion.queries'
