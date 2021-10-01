import * as React from 'react';

import { StyleSheet, View, Text, Alert, Button } from 'react-native';
import SharePlay, { SharePlayEvent } from 'react-native-ios-shareplay';
import { useCallback, useState } from 'react';

const useIsSharePlayAvailable = () => {
  const [isAvailable, setIsAvailable] = useState(false);
  React.useEffect(() => {
    SharePlay.isSharePlayAvailable().then((ava) => {
      setIsAvailable(ava);
    });
    const em = SharePlayEvent.addListener('available', setIsAvailable);
    return () => {
      em.remove();
    };
  }, []);
  return isAvailable;
};

export default function App() {
  const isAvailable = useIsSharePlayAvailable();
  const [logs, setLogs] = useState<string[]>([]);
  React.useEffect(() => {
    if (!isAvailable) {
      return;
    }
    SharePlay.getInitialSession().then((session) => {
      if (session != null) {
        SharePlay.joinSession();
      }
    });
    const newSessionEm = SharePlayEvent.addListener('newSession', (id) => {
      setLogs((p) => [...p, `new session: ${JSON.stringify(id)}`]);
      SharePlay.joinSession();
    });
    const newMessage = SharePlayEvent.addListener('receivedMessage', (info) => {
      setLogs((p) => [...p, `new message: ${info}`]);
    });
    return () => {
      newSessionEm.remove();
      newMessage.remove();
    };
  }, [isAvailable]);
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
        title="Start Directly"
        onPress={async () => {
          await SharePlay.startActivity(
            `Started Directly ${Math.random()}`,
            'Extra Info'
          );
        }}
      />
      <Button
        title="Ask and start"
        onPress={async () => {
          await SharePlay.prepareAndStartActivity(
            `Asked and Start ${Math.random()}`,
            'Extra Info'
          );
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
