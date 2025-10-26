import { WebPlugin } from '@capacitor/core';

import type { HomeIndicatorPlugin } from './definitions';

export class HomeIndicatorWeb extends WebPlugin implements HomeIndicatorPlugin {
  async hide(): Promise<void> {
    this.unimplemented('Not implemented on web.');
    console.log('hide');
  }
  async show(): Promise<void> {
    this.unimplemented('Not implemented on web.');
    console.log('show');
  }
  async isHidden(): Promise<{ hidden: boolean }> {
    this.unimplemented('Not implemented on web.');
    console.log('getStatus');
    return { hidden: true };
  }
  async getPluginVersion(): Promise<{ version: string }> {
    console.warn('Cannot get plugin version in web');
    return { version: 'default' };
  }
}
