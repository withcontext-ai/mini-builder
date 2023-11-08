export const isServer = () => typeof window === 'undefined'

export const getCode = () => (!isServer() && localStorage.getItem('code')) || ''
