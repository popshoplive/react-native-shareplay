# react-native-share-play

iOS 15 share play API in RN

## Installation

```sh
yarn add react-native-share-play
```

## Usage

```js
import SharePlay from "react-native-share-play";

// initialize

if (await SharePlay.isSharePlayAvailable()) {
  if (await SharePlay.getInitialSession() != null) {
    SharePlay.joinSession();
  }
}

// event
const newSessionEm = SharePlayEvent.addListener('newSession', (info) => {
  // get ready
  SharePlay.joinSession();
});

const newMessage = SharePlayEvent.addListener('receivedMessage', (info) => {
  // process message
});

// post message
await SharePlay.sendMessage(`Test Message: ${Math.random()}`).catch((e) =>
  Alert.alert(e.message)
);

```

## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT
