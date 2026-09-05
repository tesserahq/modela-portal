# PRD 0001 — Knowledge Base Admin UI

## Problem Statement

Operators can create, edit, and delete knowledge base documents, embedding-type model
configs, and tool opt-ins on the modela backend (PRD 0019, Phases 1 & 2), but only via raw
API calls. The core retrieval path exists, but its current API does not yet expose all state
needed for a safe admin workflow. There is no page in modela-portal to author a document,
configure which embedding model powers the knowledge base, or turn `search_knowledge_base`
on for a chat config.

## Solution

Add a "Knowledge Documents" resource to modela-portal (list, create, edit, detail, delete,
and re-index), following the same list/detail/form shell already used by ModelConfigs, MCP
Servers, and System Prompts. Extend the existing ModelConfig form to support
`config_type="embedding"`
(with its chunk_size/chunk_overlap/strategy params) and a chat-only `enabled_tools` picker,
rather than building a separate page for what is the same underlying resource. Documents are
authored as raw markdown with YAML frontmatter in a CodeMirror-based text editor. Companion
changes to the modela backend expose embedding-capable provider/model metadata, retain the
raw document source for lossless editing, expose indexing status, and provide a bulk re-index
operation so operators can safely rotate the default embedding config.

## User Stories

1. As an operator, I want to see a list of all knowledge documents, so that I know what's in the knowledge base.
2. As an operator, I want to create a new knowledge document by pasting/writing markdown with optional YAML frontmatter, so that I can add product knowledge without using the API directly.
3. As an operator, I want a syntax-highlighted code editor for the document body, so that authoring frontmatter + markdown is easier than a plain textarea.
4. As an operator, I want to see a document's parsed frontmatter (tags, status, stale_after, etc.) displayed separately from its body on the detail page, so that I can confirm the split happened correctly.
5. As an operator, I want to see a document's indexing status, indexed revision, last successful indexing time, failure message, and chunk count, so that I can distinguish pending, successful, failed, and empty-document indexing outcomes.
6. As an operator, I want to edit a document's title and/or content, so that I can fix mistakes or update stale information.
7. As an operator, I want editing a document's content to visibly trigger re-indexing and update until it succeeds or fails, so that I know whether the new content is actually searchable.
8. As an operator, I want to delete a knowledge document with a confirmation step, so that I don't accidentally destroy content and its chunks.
9. As an operator, I want to create a ModelConfig with `config_type="embedding"`, so that I can designate which provider/model produces the knowledge base's embeddings.
10. As an operator, I want to set chunk_size, chunk_overlap, and strategy when creating/editing an embedding config, so that I can tune retrieval quality without touching the API.
11. As an operator, I want clear inline validation if chunk_overlap >= chunk_size or chunk_size is out of the allowed range, so that I catch mistakes before submitting.
12. As an operator, I want to see the embedding-config mutation warning (changing provider/model on an in-use config invalidates existing chunks) before I change those fields on an existing embedding config, so that I don't accidentally break retrieval.
13. As an operator, I want to see which ModelConfig is the current default embedding config, so that I know which one is actually powering search_knowledge_base.
14. As an operator, I want to enable `search_knowledge_base` on a chat ModelConfig by checking a box, so that I don't need to hand-craft the enabled_tools array via the API.
15. As an operator, I want the list of available built-in tools to come from the backend's tool registry, so that the checklist never goes stale relative to what the backend actually supports.
16. As an operator, I want the enabled_tools picker to only appear for chat-type configs, so that I'm not shown an irrelevant control on a summary/generation/scan/embedding config.
17. As a developer, I want the knowledge documents resource module (types/schema/queries/hooks) to follow the exact same shape as the existing model-config module, so that the codebase stays consistent and predictable to navigate.
18. As a developer, I want the existing reusable markdown form field to use CodeMirror for its Write surface, so that syntax highlighting is shared without introducing a second overlapping editor abstraction.
19. As an operator, I want the embedding provider/model picker to show only combinations that support embeddings, so that I cannot create a config which is guaranteed to fail at indexing time.
20. As an operator, I want to re-index one document or the full corpus, so that I can recover from an indexing failure or safely move the corpus to a new default embedding config.
21. As an operator, I want changing the default embedding config to offer a confirmed bulk re-index workflow with visible progress, so that knowledge search does not silently become empty after config rotation.

## Implementation Decisions

### Knowledge Documents — new resource

- New resource module `knowledge-documents` under `app/resources/queries/` and
  `app/resources/hooks/`, mirroring the `model-config` module's file layout exactly: a
  hand-written TypeScript type file (document shape: `id`, `title`, `raw_content`, `content`,
  `metadata`, `content_revision`, `active_index`, `created_at`, `updated_at`; `active_index`
  contains `embedding_config_id`, `content_revision`, `status`, `error`, `indexed_at`, and
  `chunk_count`; create/update payload shapes: `title`, `raw_content`), a Zod schema file
  (`title` required, `raw_content` required on create, both optional on update, title capped at
  255 characters, and raw content capped at 1 MiB when UTF-8 encoded) with form default
  values, a queries file wrapping the existing
  `fetchApi()` helper against `/knowledge-documents` (list/get/create/update/delete/re-index
  one/re-index all/get re-index job), a utils file for form-value ↔ payload conversion and
  update-diffing, and a barrel `index.ts`.
- React Query hooks (`useKnowledgeDocuments`, `useKnowledgeDocument`,
  `useCreateKnowledgeDocument`, `useUpdateKnowledgeDocument`, `useDeleteKnowledgeDocument`,
  `useReindexKnowledgeDocument`, `useReindexKnowledgeDocuments`, `useKnowledgeReindexJob`)
  follow the `use-model-config.ts` pattern: a query-key factory, toast notifications on
  mutation success/error, and cache invalidation after every mutation.
- Routes registered in `app/routes.ts` under `/knowledge-documents`, structurally identical
  to the `/mcp-servers` tree: `layout.tsx`, `index.tsx` (list), `new.tsx`, `edit.tsx`, and a
  `details/` subtree with `layout.tsx` (side-menu shell, single "Overview" tab — there is no
  sub-resource to manage since chunks aren't independently editable) and `overview.tsx`.
- Add the Knowledge Documents item to `PrivateLayout.menuItems`, include the new document ID
  route parameter in `shouldCollapseSidebar`, and add its breadcrumb labels. Navigation is
  visible regardless of permission, consistent with the RBAC decision under Out of Scope.
- List page: `DataTable` with columns `title`, `active_index.status`,
  `active_index.chunk_count`, `created_at`, `updated_at`, and a row-actions `Popover`
  (Overview / Edit / Re-index / Delete via the shared `DeleteConfirmation` component),
  matching the existing resource shell.
- Detail/overview page: a `DetailContent` definition list showing `title`, parsed
  `metadata` (rendered with the existing read-only JSON editor so nested arrays and objects
  are supported), a read-only preview of `content` (the post-frontmatter-split body),
  the active index's status/revision/error/chunk-count fields, and `created_at`/`updated_at`.
  Actions popover: Edit / Re-index / Delete.
- Create/edit forms: a dedicated `KnowledgeDocumentForm` component (`title` as
  `Form.Input`, `raw_content` as the upgraded `Form.MarkdownEditor` — see below) rendered from
  `new.tsx`/`edit.tsx` with different `defaultValues`/`onSubmit`, matching the
  `ModelConfigForm` pattern. There is no separate "frontmatter" vs. "body" input on
  create/edit — the operator writes/pastes the whole raw document (optionally starting with
  a `---` block) into one editor, exactly as the API expects it. Edit defaults come from the
  API's losslessly retained `raw_content`; the portal must never reconstruct source YAML
  from parsed `metadata`, because doing so can discard comments, formatting, quoting, or
  normalized scalar representations. The split into
  `content`/`metadata` is a read-only artifact shown only on the detail page.
- Saving changed content or invoking Re-index returns/sets `active_index.status="pending"`.
  While a detail page's active index is pending, its query polls at a bounded interval
  (initially every 2 seconds, stopping on `succeeded` or `failed`) and displays a status
  banner. The successful state is only shown when
  `active_index.content_revision === content_revision`; `active_index.chunk_count=0` by
  itself is not treated as failure because an empty document can legitimately have zero
  chunks. A failed state shows the backend's sanitized `active_index.error` and a Retry
  action.
- The list page shows indexing status as well as chunk count and invalidates/refetches after
  re-index mutations. It does not poll every row indefinitely; pending rows may be refreshed
  manually, while the bulk re-index progress response supplies aggregate progress for the
  config-rotation workflow.

### Existing reusable markdown field: CodeMirror editor

- Upgrade the existing `Form.MarkdownEditor` and its underlying markdown editor rather than
  introducing a second overlapping generic editor. Its Write surface wraps
  `@uiw/react-codemirror` (new dependency) with the markdown language extension, remains
  connected to React Hook Form through the existing `Form.*` contract, and gains a
  `showPreview` prop. Callers never touch CodeMirror extensions directly.
- Existing System Prompt behavior keeps `showPreview=true`; Knowledge Documents use
  `showPreview=false`. This leaves one reusable markdown-authoring abstraction with shared
  styling, validation, accessibility, and form integration.
- Knowledge Documents have no live markdown preview and no YAML-aware frontmatter parsing/
  highlighting in the editor itself — the markdown language extension treats the whole
  document (including the frontmatter block) as one syntax-highlighted text region. Precise
  frontmatter-vs-body visual separation is deferred to the detail page's parsed-metadata
  view, not the editor.

### ModelConfig form — embedding config_type + enabled_tools

- `config_type` selector gains `"embedding"` as an option in the TypeScript union and Zod
  discriminated form schema. The rendered options continue to come from
  `/model-configs/types`; there is no second hardcoded option list in the portal.
- The backend provider response gains explicit capabilities and separate model catalogs (at
  minimum `capabilities: {chat, embeddings}` plus `chat_models` and `embedding_models`). For
  an embedding config, the form filters out providers without embedding support and sources
  the model picker exclusively from `embedding_models`. For other config types it retains
  the existing chat model behavior. Until that backend contract is deployed, the embedding
  form is not considered shippable; choosing a chat model as an embedding fallback is not
  allowed.
- When `config_type === "embedding"` is selected, the form conditionally renders three
  additional fields inside a `params` object: `chunk_size` (number input, 256–8192),
  `chunk_overlap` (number input, ≥0), `strategy` (a select, currently only `"fixed_size"` —
  sourced as a hardcoded option list matching the backend's registered strategies, not
  fetched from an API since the backend has no strategy-listing endpoint). Zod validation
  mirrors the backend's `EmbeddingConfigParams`: `chunk_overlap < chunk_size`, both fields
  required together whenever `config_type === "embedding"` (a Zod `superRefine`/discriminated
  check on the existing schema, not a separate schema file, since it's one resource with
  conditional shape).
- Embedding create/edit screens prominently show the warning from
  `/model-configs/types`. When editing an existing embedding config, a dirty `provider` or
  `model` field requires a blocking confirmation before submit. The dialog explains that an
  in-place change can make existing chunks incompatible and recommends canceling to create a
  new config instead. Confirmation is an operational safeguard; it does not replace backend
  validation or re-indexing.
- A safe config-rotation flow starts bulk re-indexing against a new, non-default embedding
  config. The portal shows the returned job's queued/running/succeeded/failed counts and
  links failed documents to their detail pages. Only after every document reaches a terminal
  successful state does the UI offer to promote the target config to default. This avoids an
  interval where the active config has no indexed corpus. Partial promotion is not allowed in
  v1; the operator must retry or explicitly abandon the rotation.
- When `config_type === "chat"`, the form conditionally renders an `enabled_tools` field: a
  checkbox list, one row per tool returned by the new `tools` query module's `useTools()`
  hook (name as the label, description as helper text beneath it). Unchecked by default;
  submitting sends the checked subset as `enabled_tools: string[]` (omitted/empty array when
  none checked). This field is not rendered at all for `summary`/`generation`/`scan`/
  `embedding` config types, since only chat completions build a toolset on the backend.
- New read-only `tools` resource module (`app/resources/queries/tools/`,
  `app/resources/hooks/tools/use-tools.ts`) wrapping `GET /tools` — a single `useQuery`, no
  mutations, no schema file (nothing is submitted back to this endpoint).
- `model-config.type.ts` gains `params: Record<string, unknown> | null` and
  `enabled_tools: string[] | null` on the read/create/update shapes; `model-config.utils.ts`'s
  form-value/payload conversion and update-diffing helpers are extended to round-trip both
  fields. The payload conversion boundary enforces the conditional invariant: it emits
  `enabled_tools` only for chat configs and `params` only for embedding configs. Changing
  config type explicitly sends `null` for the field that no longer applies so stale hidden
  values are removed server-side. The form also resets incompatible hidden fields on type
  change; correctness must not depend on React Hook Form unregister behavior.

### Backend companion changes (in `modela`, not this repo)

- The existing top-level `chunk_count` is not sufficient once chunks for multiple embedding
  configs coexist. Replace it in the portal contract with `active_index.chunk_count`, scoped
  to the current default embedding config. The backend may retain the old field temporarily
  for compatibility, but this UI does not use an all-config aggregate.
- Persist and return the original `raw_content` alongside parsed `content` and `metadata` so
  the edit UI can round-trip frontmatter without lossy reconstruction. Create/update continue
  to parse and validate the raw source before commit.
- Add a monotonic `content_revision` to each document and a per-document, per-embedding-config
  indexing record (for example, `knowledge_document_indexes`) containing the indexed content
  revision, status (`pending | succeeded | failed`), indexed time, sanitized error, and chunk
  count. `KnowledgeDocumentRead.active_index` resolves the record for the current default
  embedding config. A content update increments the document revision before enqueue.
  Workers claim a specific document revision/config pair and must not let an older or
  out-of-order task overwrite a newer result.
- Add `POST /knowledge-documents/{id}/reindex`, `POST /knowledge-documents/reindex-all`
  (body: `embedding_config_id`), and `GET /knowledge-reindex-jobs/{job_id}`. Both mutation
  operations are idempotent for the same document revision/config and return observable
  job/status identifiers. The job response includes aggregate counts plus per-document
  failures. Bulk dispatch is chunked and bounded rather than enqueueing an unbounded number
  of tasks in the HTTP request. Re-indexing to a non-default target config must be supported
  so the corpus can be prepared before that config is promoted.
- Re-indexing replaces only chunks for the same document and target embedding config; it must
  not delete chunks produced for another config. The existing default config's chunks remain
  searchable until the prepared target config is atomically promoted after a successful bulk
  job.
- Extend `/providers` with explicit provider capabilities and embedding-model metadata. A
  provider without `create_embeddings` support must not advertise embedding capability.

## Testing Decisions

This repository currently has no tests or configured test runner, although Testing Library
dependencies are installed. This feature introduces stateful conditional forms and async
status transitions that are unsafe to verify only by hand, so the implementation adds Vitest
with jsdom and a focused test setup rather than attempting broad retroactive coverage.

Required portal tests:

- Knowledge-document create/edit round-trips `raw_content`, including nested frontmatter,
  comments, quoted scalars, and dates, without reconstructing it from parsed metadata.
- The UTF-8 byte limit and title limit produce inline errors before an API call.
- Detail polling starts only for `pending`, stops for terminal states, and distinguishes
  empty-success from failure. Failed status exposes Retry.
- Embedding forms show only embedding-capable providers/models and cannot select Anthropic or
  a chat-only OpenAI model under the current backend capabilities.
- Switching config types strips and clears incompatible `params`/`enabled_tools` values.
- Provider/model changes on an existing embedding config require confirmation.
- Bulk re-index progress and partial failures remain visible to the operator.

Manual end-to-end verification remains required against modela for create/edit/delete,
single and bulk re-index, embedding-config rotation, and tool opt-in behavior.

## Out of Scope

- A dedicated "Tools" browse page — the tool registry is only surfaced inline as the
  enabled_tools checklist on the ModelConfig form, not as its own list/detail resource.
- Live markdown preview or YAML-aware frontmatter highlighting in the document editor.
- Websocket-driven indexing updates; bounded polling is sufficient for v1.
- Bulk document upload/import (e.g. a zip of markdown files, or syncing from a git repo) —
  one document at a time via the form, matching the backend's one-document-per-request API.
- RBAC-based hiding of the Knowledge Documents nav item or ModelConfig's embedding fields
  based on the viewer's permissions — the backend already enforces RBAC on every request;
  the UI shows these controls to anyone who can reach the portal, same as every other
  resource today.
- Editing chunks directly, viewing individual chunk content/embeddings, or any chunk-level
  UI — chunks are a derived artifact, not a user-managed resource.
- Broad retroactive test coverage for existing resources beyond the shared components and
  ModelConfig behaviors changed by this feature.

## Further Notes

The ModelConfig form changes (embedding config_type + enabled_tools) are the more delicate
half of this PRD, not the new Knowledge Documents page — that page is a straightforward
repeat of an already-proven shell (MCP Servers/System Prompts). The form's conditional-field
logic (three different shapes depending on `config_type`) is the one place worth extra care
in review, since a Zod validation gap there could let an invalid `params` shape reach the
backend's own validation as a confusing 422 rather than a clear inline form error.

The backend companion changes are prerequisites, not follow-up polish: the embedding form
must remain unavailable until capability-aware provider metadata exists, and document edit/
status/re-index UI must not ship against the current read schema. Implement the portal in
vertical slices against those contracts rather than mocking a workflow the backend cannot
yet support.
