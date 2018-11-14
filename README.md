## Apollo Cache Router

[![npm version](https://badge.fury.io/js/apollo-cache-router.svg)](https://badge.fury.io/js/apollo-cache-router)
[![Twitter Follow](https://img.shields.io/twitter/follow/sysgears.svg?style=social)](https://twitter.com/sysgears)

## Installation

```bash
npm install --save-dev apollo-cache-router
```

## Usage
``` js
import { InMemoryCache } from 'apollo-cache-inmemory';
import ApolloCacheRouter from 'apollo-cache-router';
import { hasDirectives } from 'apollo-utilities';

const netCache = new InMemoryCache();
const localCache = new InMemoryCache();
const cache = ApolloCacheRouter.override(
  ApolloCacheRouter.route([netCache, localCache], document => {
    const astName = getOperationAST(document).name;
    if (hasDirectives(['client'], document)
        || (astName && astName.value === 'GeneratedClientQuery')) {
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

### Logging
If you want log cache access and errors please check [`apollo-cache-logger`](https://github.com/sysgears/apollo-cache-logger)

## License
Copyright © 2018 [SysGears LTD]. This source code is licensed under the [MIT] license.

[MIT]: LICENSE
[SysGears LTD]: http://sysgears.com
