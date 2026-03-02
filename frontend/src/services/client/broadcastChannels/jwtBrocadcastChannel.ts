export type RefreshMessage =
  | { type: 'TOKEN_REFRESHED'; token: string }
  | { type: 'REFRESH_FAILED'; error: unknown }
  | { type: 'REFRESH_BEGIN' }

export class JwtRefreshBroadcastChannel {
  public channel = new BroadcastChannel('jwt_refresh')
  public isRefreshing = false
  public waiters: {
    resolve: (data: { token: string }) => void
    reject: (err: unknown) => void
  }[] = []

  constructor(
    public onTokenRefreshed: (token: string) => void,  
    public onRefreshFailed: ((error: unknown) => void)
  ) {
    this.channel.addEventListener('message', (event: MessageEvent<RefreshMessage>) => {
      if (event.data.type === 'TOKEN_REFRESHED') {
        this.handleTokenRefreshed(event.data.token)
      } else if (event.data.type === 'REFRESH_BEGIN') {
        this.handleRefreshBegin()
      } else if (event.data.type === 'REFRESH_FAILED') {
        this.handleRefreshFailed(event.data.error)
      }
    })
  }

  handleRefreshBegin() {
    this.isRefreshing = true
  }

  handleTokenRefreshed(token: string) {
    this.onTokenRefreshed?.(token)
    this.waiters.forEach(w => w.resolve({ token }))
    this.waiters = []
    this.isRefreshing = false
  }

  handleRefreshFailed(error: unknown) {
    this.onRefreshFailed?.(error)
    this.waiters.forEach(w => w.reject(error))
    this.waiters = []
    this.isRefreshing = false
  }

  addWaiter(resolve: (data: { token: string }) => void, reject: (err: unknown) => void) {
    this.waiters.push({ resolve, reject })
  }
}