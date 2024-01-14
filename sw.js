/**@type {ServiceWorkerGlobalScope} sw */
const sw = self


sw.oninstall = evt => {
    evt.waitUntil(
        (async () => {
            caches.open('v1').then(cache => cache.addAll([
                '/', '/index.html',
                '/snake/', '/snake/index.html', '/snake/style.css', '/snake/script.js'
            ]))
        })()
    )
}

sw.onactivate = async () => {
    await sw.registration.navigationPreload?.enable()

    const cacheAllowList = ['v1']
    const cacheCurrent = await caches.keys()

    // Delete all cache items that are not included in cacheAllowList
    cacheCurrent
        .filter(e => !cacheAllowList.includes(e))
        .forEach(e => caches.delete(e))
}

sw.onfetch = evt => {
    evt.respondWith((async () => {
        
        const putToCache = res => !!res?(caches.open('v1').then(cache=>cache.put(evt.request, res.clone())), res):res

        return (await caches.match(evt.request))
            ?? putToCache(await evt.preloadResponse)
            ?? putToCache(await fetch(evt.request).catch(()=>undefined))
            ?? (new Response('Network error',{status:408,headers:{'Content-Type':'text/plain'}}))
    })())
}
