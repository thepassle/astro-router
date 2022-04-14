async function invokeMiddleware(context) {
  if (!context.middleware.length) return;

  const mw = context.middleware[0];

  return mw({
    ...context,
    next: async () => {
      await invokeMiddleware({
        ...context,
        middleware: context.middleware.slice(1)
      });
    }
  });
}

const DEFAULT_FALLBACK = new Response(null, {status: 404});

function initRoutes(routes) {
  return routes.map(({
    response, 
    middleware, 
    path
  }) => ({
    response: response,
    middleware: middleware ?? [],
    pattern: new URLPattern({ 
      pathname: path,
      search: '*',
      hash: '*'
    })
  }))
}

function matchRoute(url, routes) {
  for (const route of routes) {
    const match = route.pattern.exec(url);
    if(match) {
      return {
        ...route,
        params: match?.pathname?.groups ?? {},
      };
    }
  }
}

const objectify = (acc, [k,v]) => ({...acc, [k]: v});

export function router({fallback, routes}) {
  const r = initRoutes(routes);

  return async (_, request) => {
    const url = new URL(request.url);
    const query = [...url.searchParams.entries()].reduce(objectify, {}) ?? {};
    const headers = [...request.headers.entries()].reduce(objectify, {}) ?? {};

    const route = matchRoute(url, r);
    const { params, middleware } = route;
    const context = {request, query, params, url, headers};

    if(route) {
      await invokeMiddleware({...context, middleware});
      return await route.response(context);
    } else {
      return fallback ?? DEFAULT_FALLBACK;
    }
  }
}
