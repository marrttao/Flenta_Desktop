// Share refresh across automatic retries and the idle-session dialog.
export function createSessionRefresh({ getSession, getVersion, refresh, acceptSession, endSession }) {
  let inFlight = null
  return () => {
    const version = getVersion()
    if (inFlight?.version === version) return inFlight.promise
    const session = getSession()
    if (!session) return Promise.reject(new Error('You need to login first'))
    const assertCurrent = () => {
      if (getVersion() !== version) throw new Error('Session was closed!')
    }
    const promise = Promise.resolve().then(() => {
      assertCurrent()
      return refresh(session.refreshToken)
    }).then(value => {
      assertCurrent()
      acceptSession(value)
      return value
    }).catch(error => {
      if (getVersion() === version && [400, 401, 403].includes(error?.status)) endSession()
      throw error
    }).finally(() => {
      if (inFlight?.promise === promise) inFlight = null
    })
    inFlight = { version, promise }
    return promise
  }
}
