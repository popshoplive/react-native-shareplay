import * as React from 'react';

import { StyleSheet, View, Text, Alert, Button } from 'react-native';
import SharePlay, { SharePlayEvent } from 'react-native-shareplay';
import { useCallback, useState } from 'react';

export default function App() {
  const [logs, setLogs] = useState<string[]>([]);
  const [isAvailable, setIsAvailable] = useState(false);
  React.useEffect(() => {
    SharePlay.isSharePlayAvailable().then((ava) => {
      setLogs((p) => [...p, `available start: ${ava}`]);
      setIsAvailable(ava);
    });
    const em = SharePlayEvent.addListener('available', (a) => {
      setLogs((p) => [...p, `available changed: ${a}`]);
      setIsAvailable(a);
    });
    return () => {
      em.remove();
    };
  }, []);

  React.useEffect(() => {
    if (!isAvailable) {
      return;
    }
    SharePlay.getInitialSession().then((session) => {
      if (session != null) {
        setLogs((p) => [...p, `init session: ${JSON.stringify(session)}`]);
      }
    });
    const newSessionEm = SharePlayEvent.addListener('newSession', (id) => {
      setLogs((p) => [...p, `new session: ${JSON.stringify(id)}`]);
    });
    const newActivity = SharePlayEvent.addListener('newActivity', (info) => {
      setLogs((p) => [...p, `new activity: ${JSON.stringify(info)}`]);
    });
    const newMessage = SharePlayEvent.addListener('receivedMessage', (info) => {
      setLogs((p) => [...p, `new message: ${info}`]);
    });
    const sessionInvalid = SharePlayEvent.addListener(
      'sessionInvalidated',
      (info) => {
        setLogs((p) => [...p, `session invalidated: ${info}`]);
      }
    );
    return () => {
      newActivity.remove();
      newSessionEm.remove();
      newMessage.remove();
      sessionInvalid.remove();
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
      <Button
        title="Join Session"
        onPress={() => {
          SharePlay.joinSession();
        }}
      />
      <Button title="Clear" onPress={() => setLogs([])} />
      <Button title={'Post Message'} onPress={onPost} />
      <Button
        title={'Leave Session'}
        onPress={() => {
          SharePlay.leaveSession();
        }}
      />
      <Button
        title={'End Session'}
        onPress={() => {
          SharePlay.endSession();
        }}
      />
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
