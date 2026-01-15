/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_A_SERVICE_URL: string
  readonly VITE_B_SERVICE_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}