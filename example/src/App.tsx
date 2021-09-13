import * as React from 'react';

import { StyleSheet, View, Text, Alert, Button } from 'react-native';
import SharePlay, { SharePlayEvent } from 'react-native-ios-shareplay';
import { useCallback, useState } from 'react';

export default function App() {
  const [isAvailable, setIsAvailable] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  React.useEffect(() => {
    SharePlay.isSharePlayAvailable().then((ava) => {
      setIsAvailable(ava);
      if (ava) {
        SharePlay.getInitialSession().then((session) => {
          if (session != null) {
            SharePlay.joinSession();
          }
        });
      }
    });
    const em = SharePlayEvent.addListener('available', setIsAvailable);
    const newSessionEm = SharePlayEvent.addListener('newSession', (id) => {
      setLogs((p) => [...p, `new session: ${JSON.stringify(id)}`]);
      SharePlay.joinSession();
    });
    const newMessage = SharePlayEvent.addListener('receivedMessage', (info) => {
      setLogs((p) => [...p, `new message: ${info}`]);
    });
    return () => {
      em.remove();
      newSessionEm.remove();
      newMessage.remove();
    };
  }, []);
  const onPost = useCallback(async () => {
    await SharePlay.sendMessage(`Test Message: ${Math.random()}`).catch((e) =>
      Alert.alert(e.message)
    );
  }, []);

  return (
    <View style={styles.container}>
      <Text>{isAvailable ? 'True' : 'False'}</Text>
      <Text>{JSON.stringify(logs, null, 2)}</Text>
      <Button
        title="Start"
        onPress={async () => {
          try {
            await SharePlay.startActivity('Hello', 'World');
          } catch (e) {
            Alert.alert((e as Error).message);
          }
        }}
      />
      <Button title={'Post Message'} onPress={onPost} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  box: {
    width: 60,
    height: 60,
    marginVertical: 20,
  },
});
