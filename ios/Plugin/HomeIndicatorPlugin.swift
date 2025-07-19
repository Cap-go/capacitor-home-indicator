import Foundation
import Capacitor

extension CAPBridgeViewController {

    private struct Holder {
        static var _setHomeIndicator: Bool = false
    }

    public func getHomeIndicator() -> Bool {
        return Holder._setHomeIndicator
    }

    public func hideHomeIndicator(_ ishomeIndicatorVisible: Bool) {
        Holder._setHomeIndicator = ishomeIndicatorVisible
        self.setNeedsUpdateOfHomeIndicatorAutoHidden()
    }

    override public var prefersHomeIndicatorAutoHidden: Bool {

        return Holder._setHomeIndicator

    }
}

@objc(HomeIndicatorPlugin)
public class HomeIndicatorPlugin: CAPPlugin, CAPBridgedPlugin {

    private let PLUGIN_VERSION = "0.1.8"

    @objc func getPluginVersion(_ call: CAPPluginCall) {
        call.resolve(["version": self.PLUGIN_VERSION])
    }
    @objc func hide(_ call: CAPPluginCall) {
        guard let bridgeVC = self.bridge?.viewController as? CAPBridgeViewController else {
            call.reject("")
            return
        }
        DispatchQueue.main.async {
            bridgeVC.hideHomeIndicator(true)
            call.resolve()
        }
    }

    @objc func show(_ call: CAPPluginCall) {
        guard let bridgeVC = self.bridge?.viewController as? CAPBridgeViewController else {
            call.reject("")
            return
        }
        DispatchQueue.main.async {
            bridgeVC.hideHomeIndicator(false)
            call.resolve()
        }
    }

    @objc func isHidden(_ call: CAPPluginCall) {
        guard let bridgeVC = self.bridge?.viewController as? CAPBridgeViewController else {
            call.reject("")
            return
        }
        call.resolve(["hidden": bridgeVC.getHomeIndicator()])
    }
}
