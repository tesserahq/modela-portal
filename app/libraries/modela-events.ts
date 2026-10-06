import { z } from 'zod/v4'

/**
 * CloudEvent envelope exposed by Modela's opt-in completion event channel.
 *
 * Event types and event_data remain domain-owned. The portal validates the
 * stable Tessera envelope while allowing domain schemas to evolve without a
 * portal release for every new resource type.
 */
export const modelaEventSchema = z
  .object({
    id: z.string().min(1),
    source: z.string().min(1),
    spec_version: z.literal('1.0'),
    event_type: z.string().min(1),
    data_content_type: z.string().nullable().optional(),
    dataschema: z.string().nullable().optional(),
    subject: z.string().nullable().optional(),
    time: z.string().nullable().optional(),
    event_data: z.unknown().optional(),
    user_id: z.string().nullable().optional(),
    labels: z.record(z.string(), z.unknown()).nullable().optional(),
    tags: z.array(z.string()).nullable().optional(),
    project_id: z.string().nullable().optional(),
    privy: z.boolean().optional(),
  })
  .passthrough()

export type ModelaEvent = z.infer<typeof modelaEventSchema>

export type ModelaChatData = {
  event: ModelaEvent
}
