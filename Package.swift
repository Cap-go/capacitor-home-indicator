// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "CapgoHomeIndicator",
    platforms: [.iOS(.v14)],
    products: [
        .library(
            name: "CapgoHomeIndicator",
            targets: ["CapgoHomeIndicatorPlugin"])
    ],
    dependencies: [
        .package(url: "https://github.com/ionic-team/capacitor-swift-pm.git", from: "7.4.4")
    ],
    targets: [
        .target(
            name: "CapgoHomeIndicatorPlugin",
            dependencies: [
                .product(name: "Capacitor", package: "capacitor-swift-pm"),
                .product(name: "Cordova", package: "capacitor-swift-pm")
            ],
            path: "ios/Sources/CapgoHomeIndicatorPlugin"),
        .testTarget(
            name: "CapgoHomeIndicatorPluginTests",
            dependencies: ["CapgoHomeIndicatorPlugin"],
            path: "ios/Tests/CapgoHomeIndicatorPluginTests")
    ]
)
