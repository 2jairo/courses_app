import type { UserAuthServiceUserProfileResponse } from "@/types/client/auth";

export type UserStateMessage =
  | { type: 'USER_LOGGED_IN'; user: UserAuthServiceUserProfileResponse }
  | { type: 'USER_LOGGED_OUT' }

export class UserStateBroadcastChannel {
  public channel = new BroadcastChannel('user_state')
  private onLogin: ((user: UserAuthServiceUserProfileResponse) => void) | null = null
  private onLogout: (() => void) | null = null

  constructor() {
    this.channel.addEventListener('message', (event: MessageEvent<UserStateMessage>) => {
      if (event.data.type === 'USER_LOGGED_IN') {
        this.onLogin?.(event.data.user)
      } else if (event.data.type === 'USER_LOGGED_OUT') {
        this.onLogout?.()
      }
    })
  }

  setOnLogin(cb: (user: UserAuthServiceUserProfileResponse) => void) {
    this.onLogin = cb
  }

  setOnLogout(cb: () => void) {
    this.onLogout = cb
  }

  broadcastLogin(user: UserAuthServiceUserProfileResponse) {
    this.channel.postMessage({ type: 'USER_LOGGED_IN', user } satisfies UserStateMessage)
  }

  broadcastLogout() {
    this.channel.postMessage({ type: 'USER_LOGGED_OUT' } satisfies UserStateMessage)
  }
}