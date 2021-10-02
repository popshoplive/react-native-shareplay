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
    const newActivity = SharePlayEvent.addListener('newActivity', (info) => {
      setLogs((p) => [...p, `new activity: ${JSON.stringify(info)}`]);
    });
    const newMessage = SharePlayEvent.addListener('receivedMessage', (info) => {
      setLogs((p) => [...p, `new message: ${info}`]);
    });
    return () => {
      newActivity.remove();
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
          await SharePlay.startActivity(`Started Directly ${Math.random()}`, {
            extraInfo: 'Extra Info',
          });
        }}
      />
      <Button
        title="Ask and start"
        onPress={async () => {
          await SharePlay.startActivity(`Prepare first ${Math.random()}`, {
            extraInfo: 'Extra Info',
            prepareFirst: true,
          });
        }}
      />
      <Button title="Clear" onPress={() => setLogs([])} />
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
