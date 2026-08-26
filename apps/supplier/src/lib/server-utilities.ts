// Bridge module: re-exports from REST API client instead of createServerFn
// This enables static site deployment without server-side rendering

export { getUtilitiesServer, addUtilityReadingServer, editUtilityReadingServer, deleteUtilityReadingServer } from './api-utilities';

