#!/bin/bash

# Name of your app.
APP="Deco"
VERSION=$1
SIGN_PACKAGE=$2
# The path of the app to sign.
APP_PATH="../app/deco/Deco-darwin-x64/Deco.app"
# The path to the location you want to put the signed package.
PACKAGE_PATH="./installer/osx/mpkg"
RESULT_COMP_PATH="$PACKAGE_PATH/$APP.pkg"
RESULT_PATH="../dist/osx/$APP-$VERSION.pkg"
# The name of certificates you requested.
APP_KEY="Developer ID Application: Deco Software Inc. (M5Y2HY4UM2)"
INSTALLER_KEY="Developer ID Installer: Deco Software Inc. (M5Y2HY4UM2)"

FRAMEWORKS_PATH="$APP_PATH/Contents/Frameworks"
ZIP_FILE="$APP-$VERSION-osx.zip"

mkdir -p "$PACKAGE_PATH"

if [ "$SIGN_PACKAGE" = "true" ]; then
  codesign --deep --force --keychain ~/Library/Keychains/mac-build.keychain --sign "$APP_KEY" "$FRAMEWORKS_PATH/Electron Framework.framework/Libraries/libnode.dylib"
  codesign --deep --force --keychain ~/Library/Keychains/mac-build.keychain --sign "$APP_KEY" "$FRAMEWORKS_PATH/Electron Framework.framework/Electron Framework"
  codesign --deep --force --keychain ~/Library/Keychains/mac-build.keychain --sign "$APP_KEY" "$FRAMEWORKS_PATH/Electron Framework.framework/"
  codesign --deep --force --keychain ~/Library/Keychains/mac-build.keychain --sign "$APP_KEY" "$FRAMEWORKS_PATH/$APP Helper.app/"
  codesign --deep --force --keychain ~/Library/Keychains/mac-build.keychain --sign "$APP_KEY" "$FRAMEWORKS_PATH/$APP Helper EH.app/"
  codesign --deep --force --keychain ~/Library/Keychains/mac-build.keychain --sign "$APP_KEY" "$FRAMEWORKS_PATH/$APP Helper NP.app/"
  codesign --deep --force --keychain ~/Library/Keychains/mac-build.keychain --sign "$APP_KEY" "$APP_PATH"
fi

pkgbuild --component "$APP_PATH" --ownership preserve --scripts "./Scripts" --identifier com.decosoftware.deco --version "$VERSION" --install-location /Applications "$RESULT_COMP_PATH"

if [ "$SIGN_PACKAGE" = "true" ]; then
  codesign --force --keychain ~/Library/Keychains/mac-build.keychain --sign "$APP_KEY" "$RESULT_COMP_PATH"
  productbuild --distribution "./installer/osx/mpkg/Distribution" --resources "./installer/osx/mpkg/Resources" --plugins "./installer/osx/mpkg/Plugins" --sign "$INSTALLER_KEY" --package-path "$PACKAGE_PATH" "$RESULT_PATH"
else
  productbuild --distribution "./installer/osx/mpkg/Distribution" --resources "./installer/osx/mpkg/Resources" --plugins "./installer/osx/mpkg/Plugins" --package-path "$PACKAGE_PATH" "$RESULT_PATH"
fi

pushd ../app/deco/Deco-darwin-x64
zip -r $ZIP_FILE './Deco.app'
mv $ZIP_FILE ../../../dist/osx
popd

if [ "$SIGN_PACKAGE" = "true" ]; then
  pushd ../dist/osx
  codesign -fs "$APP_KEY" $ZIP_FILE
  popd
fi
