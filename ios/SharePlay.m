#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(SharePlay, NSObject)

RCT_EXTERN_METHOD(isSharePlayAvailable:(RCTPromiseResolveBlock)resolve
                         withRejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(getInitialSession:(RCTPromiseResolveBlock)resolve
                         withRejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(startActivity:(NSString *)title
                    withExtraInfo:(NSString *)extraInfo
                withResolver:(RCTPromiseResolveBlock)resolve
                 withRejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(prepareAndStartActivity:(NSString *)title
                    withExtraInfo:(NSString *)extraInfo
                withResolver:(RCTPromiseResolveBlock)resolve
                 withRejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(joinSession)
         
RCT_EXTERN_METHOD(leaveSession)

RCT_EXTERN_METHOD(sendMessage:(NSString *)info
                  withResolver:(RCTPromiseResolveBlock)resolve
                   withRejecter:(RCTPromiseRejectBlock)reject)

@end
