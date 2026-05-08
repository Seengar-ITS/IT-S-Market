/// <reference types="vite/client" />
declare module '@its-universe/os' {
  import { ReactNode, ComponentType } from 'react'
  export interface ItsUser { id: string; name?: string; email?: string }
  export interface ITSShellProps {
    serviceName: string
    user?: ItsUser | null
    onAvatarClick?: () => void
    notificationCount?: number
    children: ReactNode
  }
  export const ITSShell: ComponentType<ITSShellProps>
  export const ITSButton: ComponentType<{ variant?: string; children: ReactNode; [key: string]: unknown }>
}
