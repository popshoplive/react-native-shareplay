# react-native-shareplay

iOS 15 share play API in react-native

## Installation

```sh
yarn add react-native-shareplay
```

And go to Xcode Capabilities and enable "Group Activities"

## Example

<video src='https://user-images.githubusercontent.com/1057756/135738117-349cbd3e-5e80-48cf-a1cc-40ab4df027e0.mp4' width=280></video>

## Usage

```js
import SharePlay from 'react-native-shareplay';

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
