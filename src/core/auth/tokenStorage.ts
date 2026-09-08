const ACCESS_KEY = 'foodie_access_token'; const REFRESH_KEY = 'foodie_refresh_token'

// Web storage cannot offer mobile secure-storage guarantees. Tokens are kept in
// sessionStorage by default, and localStorage only when the user chooses Remember me.
export const tokenStorage = {
  getAccessToken: () => sessionStorage.getItem(ACCESS_KEY) ?? localStorage.getItem(ACCESS_KEY),
  save(accessToken: string, refreshToken: string, remember: boolean) {
    this.clear(); const storage = remember ? localStorage : sessionStorage
    storage.setItem(ACCESS_KEY, accessToken); storage.setItem(REFRESH_KEY, refreshToken)
  },
  clear() { for (const storage of [localStorage, sessionStorage]) { storage.removeItem(ACCESS_KEY); storage.removeItem(REFRESH_KEY) } },
}
