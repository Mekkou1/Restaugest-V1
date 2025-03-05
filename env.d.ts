/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_APP_TITLE: string
    readonly VITE_API_URL: string
    readonly VITE_WS_URL: string
    readonly VITE_JWT_SECRET: string
    readonly VITE_SESSION_DURATION: string
    readonly VITE_SESSION_REFRESH_THRESHOLD: string
    readonly VITE_ENABLE_PWA: string
    readonly VITE_ENABLE_NOTIFICATIONS: string
    readonly VITE_ENABLE_OFFLINE_MODE: string
    readonly VITE_PRIMARY_COLOR: string
    readonly VITE_SECONDARY_COLOR: string
    readonly VITE_DEFAULT_THEME: string
    readonly VITE_DEFAULT_LANGUAGE: string
    readonly VITE_MAX_ITEMS_PER_PAGE: string
    readonly VITE_DEBOUNCE_DELAY: string
    readonly VITE_MAX_LOGIN_ATTEMPTS: string
    readonly VITE_LOCKOUT_DURATION: string
    readonly VITE_PASSWORD_MIN_LENGTH: string
    readonly VITE_API_TIMEOUT: string
    readonly VITE_NOTIFICATION_DURATION: string
    readonly VITE_SESSION_CHECK_INTERVAL: string
    readonly VITE_MAX_FILE_SIZE: string
    readonly VITE_ALLOWED_FILE_TYPES: string
    readonly VITE_CACHE_DURATION: string
    readonly VITE_ENABLE_REQUEST_CACHE: string
    readonly VITE_ERROR_REPORTING_LEVEL: string
  }
  
  interface ImportMeta {
    readonly env: ImportMetaEnv
  }
  
  declare module '*.vue' {
    import type { DefineComponent } from 'vue'
    const component: DefineComponent<{}, {}, any>
    export default component
  }
  
  declare module '*.svg' {
    const content: any
    export default content
  }
  
  declare module '*.png' {
    const content: any
    export default content
  }
  
  declare module '*.jpg' {
    const content: any
    export default content
  }
  
  declare module '*.jpeg' {
    const content: any
    export default content
  }
  
  declare module '*.gif' {
    const content: any
    export default content
  }
  
  declare module '*.webp' {
    const content: any
    export default content
  }
  
  declare module '*.json' {
    const content: any
    export default content
  }
  
  declare module '*.css' {
    const content: any
    export default content
  }
  
  declare module '*.scss' {
    const content: any
    export default content
  }
  
  declare module '*.sass' {
    const content: any
    export default content
  }
  
  declare module '*.less' {
    const content: any
    export default content
  }
  
  declare module '*.styl' {
    const content: any
    export default content
  }
  
  declare module '*.md' {
    const content: any
    export default content
  }
  
  // Global type definitions
  declare interface Window {
    // Add custom window properties here
    webkitRequestAnimationFrame: (callback: FrameRequestCallback) => number
    mozRequestAnimationFrame: (callback: FrameRequestCallback) => number
    msRequestAnimationFrame: (callback: FrameRequestCallback) => number
  }
  
  declare interface Navigator {
    // Add custom navigator properties here
    connection?: {
      type: string
      effectiveType: string
      downlink: number
      rtt: number
      saveData: boolean
      addEventListener: (type: string, listener: EventListener) => void
      removeEventListener: (type: string, listener: EventListener) => void
    }
  }
  
  // Custom type definitions
  declare type UserRole = 'Administrateur' | 'Caissier' | 'Serveur' | 'Cuisinier'
  declare type UserStatus = 'Actif' | 'Inactif' | 'Connecté' | 'Déconnecté' | 'Suspendu'
  
  declare interface User {
    id: number
    pseudo: string
    nom: string
    prenom: string
    email: string
    role: UserRole
    etat: UserStatus
    derniere_connexion?: Date
    tentatives_connexion: number
    bloque_jusqu_a?: Date
    created_at: Date
    updated_at: Date
  }
  
  declare interface Session {
    id: number
    session_id: string
    user_id: number
    refresh_token: string
    ip_address: string
    user_agent: string
    expires_at: Date
    last_activity: Date
    created_at: Date
    updated_at: Date
  }
  