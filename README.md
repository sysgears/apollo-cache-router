## Apollo Cache Logger

[![npm version](https://badge.fury.io/js/apollo-cache-logger.svg)](https://badge.fury.io/js/apollo-cache-logger)
[![Twitter Follow](https://img.shields.io/twitter/follow/sysgears.svg?style=social)](https://twitter.com/sysgears)

## Installation

```bash
npm install --save-dev apollo-cache-logger
```

## Usage
``` js
import LogCache from 'apollo-cache-logger';

const cache = new LogCache(new InMemoryCache(), { logger: msg => console.log(msg) });
```

Sample output:

``` js
read(query CounterState {
  counterState @client {
    counter
  }
}
) -> {"counterState":{"counter":1,"__typename":"CounterState"}}
diff(query CounterState {
  counterState @client {
    counter
    __typename
  }
}
) -> {"result":{"counterState":{"counter":1,"__typename":"CounterState"}},"complete":true}
read(query counterQuery {
  counter {
    amount
  }
}
) -> {"counter":{"amount":19,"__typename":"Counter"}}
```

## License
Copyright © 2018 [SysGears LTD]. This source code is licensed under the [MIT] license.

[MIT]: LICENSE
[SysGears LTD]: http://sysgears.com
