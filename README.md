## Apollo Cache Logger

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

## License
Copyright © 2018 [SysGears LTD]. This source code is licensed under the [MIT] license.

[MIT]: LICENSE
[SysGears LTD]: http://sysgears.com
