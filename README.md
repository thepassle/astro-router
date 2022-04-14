# astro-router

At the time of writing, Astro SSR does not yet support Middleware. This project is just a simple router that adds middleware to your Astro SSR projects, as well as some utilities like getting params, query params, headers, etc.

## Installation

```
npm i -S astro-router
```

## Usage

Import the `router`:
```js
import { router } from 'astro-router';
```

Then export your `get`, `post`, etc:
`/foo/[...all]/index.js`:
```js
export const get = router({
  routes: [
    {
      path: '/foo',
      response: () => new Response(null, {status: 200})
    }
  ]
});
```

## Examples

`/sales/[...all]/index.js`:
```js
import { router } from 'astro-router';
import { auth, logger } from './middleware.js';
import { User, Order } from './db.js';

export const get = router({
  routes: [
    {
      path: '/sales/:user/:order',
      middleware: [logger, auth],
      response({params}) {
        const user = await User.findOne({id: params.user});
        const order = await Order.findOne({id: params.order});

        return new Response(null, {status: 200});
      }
    }
  ]
})
```

`Request: /users/1234?foo=bar`:
```js
export const get = router({
  path: '/users/:id',
  middleware: [logger, auth],
  response: ({params, query}) => {
    console.log(params.id) // '1234'
    console.log(query.foo) // 'bar'
  }
});
```

## Api

### Router

```js
export const get = router({
  /** Routes */
  routes: [
    {
      /** The path to match, supports 'express'-style route params */
      path: '/users/:id',
      middleware: [
        ({
          /** Astro's original `request` object */
          request,
          /** Any query params as object */
          query,
          /** Route params as object */
          params,
          /** Headers as object */
          headers
          /** Url object */
          url,
          /** Next middleware to invoke */
          next
        }) => {
          next();
        }
      ],
      response: ({
        /** Astro's original `request` object */
        request,
        /** Any query params as object */
        query,
        /** Route params as object */
        params,
        /** Headers as object */
        headers
        /** Url object */
        url,
      }) => {
        return new Response(null, {status: 200})
      }
    }
  ],
  /** 
   * Custom fallback in case no routes match 
   * defaults to a 404 response
   */
  fallback: () => new Response(null, {status: 404}),
})
```