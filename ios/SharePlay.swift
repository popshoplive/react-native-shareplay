import GroupActivities
import Combine

enum SharePlayEvent: String, CaseIterable {
    case available
    case newSession
    case receivedMessage
}

struct GenericGroupActivity: GroupActivity {
    let title: String
    let extraInfo: String?
    
    static var activityIdentifier: String = "generic-group-activity"
    
    @available(iOS 15, *)
    var metadata: GroupActivityMetadata {
        var metadata = GroupActivityMetadata()
        metadata.title = self.title
        metadata.type = .generic
        return metadata
    }
}

struct GenericActivityMessage: Codable {
    let info: String
}

@available(iOS 15, *)
class ActualSharePlay {

    weak var emitter: RCTEventEmitter?
    init(emitter: RCTEventEmitter) {
        self.emitter = emitter
        
        GroupStateObserver().$isEligibleForGroupSession.sink(receiveValue: {[weak self] available in
            self?.send(event: .available, body: available)
        }).store(in: &cancelable)
        
        Task {[weak self] in
            for await session in GenericGroupActivity.sessions() {
                self?.received(newSession: session)
            }
        }
    }
    
    func send(event: SharePlayEvent, body: Any!) {
        self.emitter?.sendEvent(withName: event.rawValue, body: body)
    }
    
    var cancelable = Set<AnyCancellable>()
    var tasks = Set<Task<Void, Error>>()
    var groupSession: GroupSession<GenericGroupActivity>?
    var messenger: GroupSessionMessenger?
    func reset() {
        self.groupSession?.leave()
        self.groupSession = nil
        self.messenger = nil
        self.tasks.forEach { $0.cancel() }
        self.cancelable = Set()
    }
    
    func getInitialSession() -> NSDictionary? {
        if let groupSession = groupSession {
            return [
                "title": groupSession.activity.title,
                "extraInfo": groupSession.activity.extraInfo ?? ""
            ]
        }
        return nil
    }
    
    func received(newSession: GroupSession<GenericGroupActivity>) {
        self.groupSession = newSession
        
        let messenger = GroupSessionMessenger(session: newSession)
        
        newSession.$state.sink {[weak self] state in
            if case .invalidated = state {
                self?.reset()
            }
        }.store(in: &cancelable)
        
        self.tasks.insert(Task {[weak self] in
            for await (message, _) in messenger.messages(of: GenericActivityMessage.self) {
                self?.send(event: .receivedMessage, body: message.info)
            }
        })
        
        self.send(event: .newSession, body: [
            "title":newSession.activity.title,
            "extraInfo":newSession.activity.extraInfo
        ])

        self.messenger = messenger
    }
    
    func start(title: String, extraInfo: String?) async throws {
        let activity = GenericGroupActivity(title: title, extraInfo: extraInfo)
        _ = try await activity.activate()
    }
    
    func prepare(title: String, extraInfo: String?) async throws {
        let activity = GenericGroupActivity(title: title, extraInfo: extraInfo)
        let result = await activity.prepareForActivation()
        if case .activationPreferred = result {
            _ = try await activity.activate()
        }
    }
    
    func join() {
        if let groupSession = groupSession {
            groupSession.join()
        }
    }
    
    func sendMessage(info: String) async throws {
        if let messenger = messenger {
            try await messenger.send(GenericActivityMessage(info: info))
        }
    }
    
    func leave() {
        self.reset()
    }
    
}

@objc(SharePlay)
class SharePlay: RCTEventEmitter {
    
    override func supportedEvents() -> [String]! {
        return SharePlayEvent.allCases.map({ $0.rawValue })
    }

    var realthing: Any?
    
    @available(iOS 15, *)
    var sharePlay: ActualSharePlay? {
        return self.realthing as? ActualSharePlay
    }
    
    override init() {
        super.init()

        if #available(iOS 15, *) {
            self.realthing = ActualSharePlay(emitter: self)
        }
    }


    var hasObserver = false
    override func startObserving() {
        self.hasObserver = true
    }
    override func stopObserving() {
        self.hasObserver = false
    }
    override func sendEvent(withName name: String!, body: Any!) {
        if hasObserver {
            super.sendEvent(withName: name, body: body)
        }
    }

    @objc(isSharePlayAvailable:withRejecter:)
    func isSharePlayAvailable(resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) -> Void {
        if #available(iOS 15, *) {
            resolve(self.sharePlay?.groupSession != nil || GroupStateObserver().isEligibleForGroupSession)
        } else {
            resolve(false)
        }
    }

    @objc(startActivity:withExtraInfo:withResolver:withRejecter:)
    func startActivity(title: String, extraInfo: String?, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) -> Void {
        if #available(iOS 15, *) {
            Task {
                do {
                    try await self.sharePlay?.start(title: title, extraInfo: extraInfo)
                    resolve(nil)
                } catch {
                    reject("failed", "Failed to start group activity", error)
                }

            }
        } else {
            reject("not_available", "Share Play is not available on this iOS version", nil)
        }
    }
    
    @objc(prepareAndStartActivity:withExtraInfo:withResolver:withRejecter:)
    func prepareAndStartActivity(title: String, extraInfo: String?, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) -> Void {
        if #available(iOS 15, *) {
            Task {
                do {
                    try await self.sharePlay?.start(title: title, extraInfo: extraInfo)
                    resolve(nil)
                } catch {
                    reject("failed", "Failed to start group activity", error)
                }

            }
        } else {
            reject("not_available", "Share Play is not available on this iOS version", nil)
        }
    }

    
    @objc(getInitialSession:withRejecter:)
    func getInitialSession(resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) -> Void {
        if #available(iOS 15, *) {
            resolve(self.sharePlay?.getInitialSession())
        } else {
            resolve(nil)
        }
    }

    
    @objc(joinSession)
    func joinSession() {
        if #available(iOS 15, *) {
            self.sharePlay?.join()
        }
    }

    @objc(leaveSession)
    func leaveSession() {
        if #available(iOS 15, *) {
            self.sharePlay?.leave()
        }
    }
    
    @objc(sendMessage:withResolver:withRejecter:)
    func sendMessage(info: String, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        if #available(iOS 15, *) {
            Task {
                do {
                    try await self.sharePlay?.sendMessage(info: info)
                    resolve(nil)
                } catch {
                    reject("failed", "Failed to start group activity", error)
                }

            }
        } else {
            reject("not_available", "Share Play is not available on this iOS version", nil)
        }
    }

}
