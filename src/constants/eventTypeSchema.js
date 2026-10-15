export function isEventTypeSchemaReady() {
  return import.meta.env.VITE_SUPABASE_EVENT_TYPE_SCHEMA_READY === 'true';
}

export const EVENT_TYPE_SCHEMA_ACTIVATION_MESSAGE =
  'Event Type saving is disabled until the database migration is applied and schema readiness is explicitly approved.';
