# @userpilot/segment-react-native

`DestinationPlugin` for [Userpilot](https://www.userpilot.com/). Wraps [`@userpilot/react-native`](https://github.com/userpilot/userpilot-react-native-module).

## Installation

You need to install the `@userpilot/segment-react-native` and the `@userpilot/react-native` dependency.

Using NPM:
```bash
npm install --save @userpilot/segment-react-native @userpilot/react-native
```

Using Yarn:
```bash
yarn add @userpilot/segment-react-native @userpilot/react-native
```

Run `pod install` after the installation to autolink the Userpilot SDK.

See [Userpilot React Native Module](https://github.com/Userpilot/segment-userpilot-react-native) for more details of this dependency.
## Usage

Follow the [instructions for adding plugins](https://github.com/segmentio/analytics-react-native#adding-plugins) on the main Analytics client:

In your code where you initialize the analytics client call the `.add(plugin)` method with an `UserpilotPlugin` instance:

```ts
import { createClient } from '@segment/analytics-react-native';

import { Userpilotlugin } from '@userpilot/segment-react-native';

const segmentClient = createClient({
  writeKey: 'SEGMENT_KEY'
});

segmentClient.add({ plugin: new UserpilotPlugin() });
```

## Support

Please use Github issues, Pull Requests, or feel free to reach out to our [support team](dev@userpilot.co).
