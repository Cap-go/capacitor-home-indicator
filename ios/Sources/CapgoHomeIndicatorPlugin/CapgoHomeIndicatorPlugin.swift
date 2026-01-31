import Foundation
import Capacitor

extension CAPBridgeViewController {

    private struct Holder {
        static var setHomeIndicator: Bool = false
    }

    public func getHomeIndicator() -> Bool {
        return Holder.setHomeIndicator
    }

    public func hideHomeIndicator(_ ishomeIndicatorVisible: Bool) {
        Holder.setHomeIndicator = ishomeIndicatorVisible
        self.setNeedsUpdateOfHomeIndicatorAutoHidden()
    }

    override public var prefersHomeIndicatorAutoHidden: Bool {

        return Holder.setHomeIndicator

    }
}

@objc(CapgoHomeIndicatorPlugin)
public class CapgoHomeIndicatorPlugin: CAPPlugin, CAPBridgedPlugin {

    public let identifier = "CapgoHomeIndicatorPlugin"
    public let jsName = "HomeIndicator"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "hide", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "show", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "isHidden", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "getPluginVersion", returnType: CAPPluginReturnPromise)
    ]

    private let pluginVersion: String = "8.0.13"

    @objc func getPluginVersion(_ call: CAPPluginCall) {
        call.resolve(["version": self.pluginVersion])
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
