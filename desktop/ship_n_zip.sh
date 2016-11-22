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
  codesign --verbose --deep --force --keychain ~/Library/Keychains/mac-build.keychain --sign "$APP_KEY" "$FRAMEWORKS_PATH/Electron Framework.framework/Versions/A"
  codesign --verbose --deep --force --keychain ~/Library/Keychains/mac-build.keychain --sign "$APP_KEY" "$FRAMEWORKS_PATH/Mantle.framework/Versions/A"
  codesign --verbose --deep --force --keychain ~/Library/Keychains/mac-build.keychain --sign "$APP_KEY" "$FRAMEWORKS_PATH/Squirrel.framework/Versions/A"
  codesign --verbose --deep --force --keychain ~/Library/Keychains/mac-build.keychain --sign "$APP_KEY" "$FRAMEWORKS_PATH/ReactiveCocoa.framework/Versions/A"
  codesign --verbose --deep --force --keychain ~/Library/Keychains/mac-build.keychain --sign "$APP_KEY" "$FRAMEWORKS_PATH/$APP Helper.app/"
  codesign --verbose --deep --force --keychain ~/Library/Keychains/mac-build.keychain --sign "$APP_KEY" "$FRAMEWORKS_PATH/$APP Helper EH.app/"
  codesign --verbose --deep --force --keychain ~/Library/Keychains/mac-build.keychain --sign "$APP_KEY" "$FRAMEWORKS_PATH/$APP Helper NP.app/"
  codesign --verbose --deep --force --keychain ~/Library/Keychains/mac-build.keychain --sign "$APP_KEY" "$APP_PATH"
fi

pkgbuild --quiet --component "$APP_PATH" --ownership preserve --scripts "./libs/Scripts/pkg/Scripts" --identifier com.decosoftware.deco --version "$VERSION" --install-location /Applications "$RESULT_COMP_PATH"

if [ "$SIGN_PACKAGE" = "true" ]; then
  codesign --verbose --force --keychain ~/Library/Keychains/mac-build.keychain --sign "$APP_KEY" "$RESULT_COMP_PATH"
  productbuild --quiet --distribution "./installer/osx/mpkg/Distribution" --resources "./installer/osx/mpkg/Resources" --plugins "./installer/osx/mpkg/Plugins" --sign "$INSTALLER_KEY" --package-path "$PACKAGE_PATH" "$RESULT_PATH"
else
  productbuild --quiet --distribution "./installer/osx/mpkg/Distribution" --resources "./installer/osx/mpkg/Resources" --plugins "./installer/osx/mpkg/Plugins" --package-path "$PACKAGE_PATH" "$RESULT_PATH"
fi

pushd ../app/deco/Deco-darwin-x64
zip --quiet --symlinks -r $ZIP_FILE './Deco.app'
mv $ZIP_FILE ../../../dist/osx
popd

if [ "$SIGN_PACKAGE" = "true" ]; then
  pushd ../dist/osx
  codesign -fs "$APP_KEY" $ZIP_FILE
  popd
fi

#verify bundle
codesign --verify --deep --strict --verbose=2 "$APP_PATH"
