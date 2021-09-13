import { NativeModules } from 'react-native';

type SharePlayType = {
  multiply(a: number, b: number): Promise<number>;
};

const { SharePlay } = NativeModules;

export default SharePlay as SharePlayType;
