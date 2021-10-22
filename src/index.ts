import { NativeEventEmitter, NativeModules } from 'react-native';

type SharePlayType = {
  isSharePlayAvailable(): Promise<boolean>;
  getInitialSession(): Promise<null | { title: string; extraInfo: string }>;
  startActivity(
    title: string,
    options: {
      extraInfo?: string;
      fallbackURL?: string;
      prepareFirst?: boolean;
    }
  ): Promise<void>;
  joinSession(): void;
  leaveSession(): void;
  endSession(): void;
  sendMessage(info: string): Promise<void>;
};

const { SharePlay } = NativeModules;

export const SharePlayEvent = new NativeEventEmitter(SharePlay);

export default SharePlay as SharePlayType;
