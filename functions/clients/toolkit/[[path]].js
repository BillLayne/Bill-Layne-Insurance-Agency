// Ensure every toolkit asset passes through the directory authentication middleware.
export function onRequest({request,env}) { return env.ASSETS.fetch(request); }
