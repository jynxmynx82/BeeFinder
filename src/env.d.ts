/// <reference types="vite/client" />

// If you prefer explicit typing instead of the vite/client ambient types,
// you can define the shape used by this project here. We include the
// standard Vite `ImportMetaEnv` with the known environment variables so
// `import.meta.env.VITE_...` references type-check correctly.

interface ImportMetaEnv {
  readonly VITE_FIREBASE_API_KEY?: string;
  readonly VITE_FIREBASE_AUTH_DOMAIN?: string;
  readonly VITE_FIREBASE_PROJECT_ID?: string;
  readonly VITE_FIREBASE_STORAGE_BUCKET?: string;
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID?: string;
  readonly VITE_FIREBASE_APP_ID?: string;
  readonly VITE_FIREBASE_MEASUREMENT_ID?: string;
  // add other VITE_ env vars here as needed
  readonly [key: string]: string | undefined;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
