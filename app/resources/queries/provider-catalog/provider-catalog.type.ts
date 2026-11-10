export type ProviderCatalogChangeKind = 'added' | 'removed' | 'check_failed'

export type ProviderCatalogChangeType = {
  id: string
  provider_id: string
  kind: ProviderCatalogChangeKind
  model_id: string | null
  error_category: string | null
  detected_at: string
  reviewed_at: string | null
  reviewed_by_id: string | null
}

export type ProviderCatalogChangeFilters = {
  provider_id?: string
  kind?: ProviderCatalogChangeKind
  reviewed?: boolean
}
