// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "CapgoHomeIndicator",
    platforms: [.iOS(.v14)],
    products: [
        .library(
            name: "CapgoHomeIndicator",
            targets: ["HomeIndicatorPlugin"])
    ],
    dependencies: [
        .package(url: "https://github.com/ionic-team/capacitor-swift-pm.git", from: "7.0.0")
    ],
    targets: [
        .target(
            name: "HomeIndicatorPlugin",
            dependencies: [
                .product(name: "Capacitor", package: "capacitor-swift-pm"),
                .product(name: "Cordova", package: "capacitor-swift-pm")
            ],
            path: "ios/Sources/HomeIndicatorPlugin"),
        .testTarget(
            name: "HomeIndicatorPluginTests",
            dependencies: ["HomeIndicatorPlugin"],
            path: "ios/Tests/HomeIndicatorPluginTests")
    ]
)