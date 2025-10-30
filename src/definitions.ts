/**
 * Capacitor Home Indicator Plugin for controlling the iOS home indicator visibility.
 * The home indicator is the horizontal bar at the bottom of iOS devices without a physical home button.
 *
 * @since 0.0.1
 */
export interface HomeIndicatorPlugin {
  /**
   * Hide the home indicator at the bottom of the screen.
   *
   * This visually hides the iOS home indicator bar, providing a more immersive
   * full-screen experience. Users can still swipe up to access home, but the
   * indicator will not be visible until they start the gesture.
   *
   * iOS only. Has no effect on Android or web.
   *
   * @returns Promise that resolves when the home indicator is hidden
   * @throws Error if hiding the indicator fails
   * @since 0.0.1
   * @example
   * ```typescript
   * await HomeIndicator.hide();
   * ```
   */
  hide(): Promise<void>;

  /**
   * Show the home indicator at the bottom of the screen.
   *
   * This restores the default iOS home indicator visibility, making it
   * always visible to the user. This is the default behavior.
   *
   * iOS only. Has no effect on Android or web.
   *
   * @returns Promise that resolves when the home indicator is shown
   * @throws Error if showing the indicator fails
   * @since 0.0.1
   * @example
   * ```typescript
   * await HomeIndicator.show();
   * ```
   */
  show(): Promise<void>;

  /**
   * Check whether the home indicator is currently hidden.
   *
   * Returns the current visibility state of the iOS home indicator.
   *
   * @returns Promise that resolves with an object containing the hidden status
   * @throws Error if checking the status fails
   * @since 0.0.1
   * @example
   * ```typescript
   * const { hidden } = await HomeIndicator.isHidden();
   * if (hidden) {
   *   console.log('Home indicator is hidden');
   * } else {
   *   console.log('Home indicator is visible');
   * }
   * ```
   */
  isHidden(): Promise<{ hidden: boolean }>;

  /**
   * Get the native Capacitor plugin version.
   *
   * @returns Promise that resolves with the plugin version
   * @throws Error if getting the version fails
   * @since 0.0.1
   * @example
   * ```typescript
   * const { version } = await HomeIndicator.getPluginVersion();
   * console.log('Plugin version:', version);
   * ```
   */
  getPluginVersion(): Promise<{ version: string }>;
}
