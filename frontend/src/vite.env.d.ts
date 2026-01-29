/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_A_SERVICE_URL: string
  readonly VITE_B_SERVICE_URL: string
  readonly VITE_D_SERVICE_URL: string
  readonly VITE_CDN_SERVICE_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}