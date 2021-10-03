# react-native-ios-shareplay

iOS 15 share play API in react-native

## Installation

```sh
yarn add react-native-ios-shareplay
```

And go to Xcode Capabilities and enable "Group Activities"

## Usage

```js
import SharePlay from 'react-native-ios-shareplay';

// initialize

if (await SharePlay.isSharePlayAvailable()) {
  if ((await SharePlay.getInitialSession()) != null) {
    SharePlay.joinSession();
  }
}

// event
const newSessionEm = SharePlayEvent.addListener('newSession', (info) => {
  // get ready
  SharePlay.joinSession();
});

const newSessionEm = SharePlayEvent.addListener('newActivity', (info) => {
  // process activity
});

const newMessage = SharePlayEvent.addListener('receivedMessage', (info) => {
  // process message
});

// start activity
await SharePlay.startActivity(`Test Message: ${Math.random()}`, {
  extraInfo: JSON.stringify(payload),
  fallbackURL: 'https://fallback.url.that.will.open.on.desktop',
  prepareFirst: false,
}).catch((e) => Alert.alert(e.message));

// post message
await SharePlay.sendMessage(`Test Message: ${Math.random()}`).catch((e) =>
  Alert.alert(e.message)
);
```

## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT
