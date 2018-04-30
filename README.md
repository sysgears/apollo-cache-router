## Apollo Cache Router

[![npm version](https://badge.fury.io/js/apollo-cache-router.svg)](https://badge.fury.io/js/apollo-cache-router)
[![Twitter Follow](https://img.shields.io/twitter/follow/sysgears.svg?style=social)](https://twitter.com/sysgears)

## Installation

```bash
npm install --save-dev apollo-cache-router
```

## Usage
``` js
const netCache = new InMemoryCache();
const localCache = new InMemoryCache();
const cache = ApolloCacheRouter.override(
  ApolloCacheRouter.route([netCache, localCache], document => {
    if (hasDirectives(['client'], document) || getOperationAST(document).name.value === 'GeneratedClientQuery') {
      // Pass all @client queries and @client defaults to localCache
      return [localCache];
    } else {
      // Pass all the other queries to netCache
      return [netCache];
    }
  }),
  {
    reset: () => {
      // On apolloClient.resetStore() reset only netCache and keep localCache intact
      return netCache.reset();
    }
  }
);
```

## License
Copyright © 2018 [SysGears LTD]. This source code is licensed under the [MIT] license.

[MIT]: LICENSE
[SysGears LTD]: http://sysgears.com
