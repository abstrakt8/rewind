// These are defined through the WebPack/DefinePlugin (which uses the package.json version)
declare const __BUILD_VERSION__: string;

export const environment = {
  production: true,
  version: __BUILD_VERSION__,
};
