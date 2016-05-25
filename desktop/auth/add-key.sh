#!/usr/bin/env sh

# Create a custom keychain
security create-keychain -p travis mac-build.keychain

# Make the custom keychain default, so xcodebuild will use it for signing
security default-keychain -s mac-build.keychain

# Unlock the keychain
security unlock-keychain -p travis mac-build.keychain

# Set keychain timeout to 1 hour for long builds
# see http://www.egeek.me/2013/02/23/jenkins-and-xcode-user-interaction-is-not-allowed/
security set-keychain-settings -t 3600 -l ~/Library/Keychains/mac-build.keychain

# Add certificates to keychain and allow codesign to access them
security import ./auth/certs/apple.cer -k ~/Library/Keychains/mac-build.keychain -T /usr/bin/codesign -T /usr/bin/productbuild
security import ./auth/certs/devid_app.cer -k ~/Library/Keychains/mac-build.keychain -T /usr/bin/codesign -T /usr/bin/productbuild
security import ./auth/certs/devid_app.p12 -k ~/Library/Keychains/mac-build.keychain -P $KEY_PASSWORD -T /usr/bin/codesign -T /usr/bin/productbuild
security import ./auth/certs/devid_install.cer -k ~/Library/Keychains/mac-build.keychain -T /usr/bin/codesign -T /usr/bin/productbuild
security import ./auth/certs/devid_install.p12 -k ~/Library/Keychains/mac-build.keychain -P $KEY_PASSWORD -T /usr/bin/codesign -T /usr/bin/productbuild

# Put the provisioning profile in place
mkdir -p ~/Library/MobileDevice/Provisioning\ Profiles
cp "./auth/profile/$PROFILE_NAME.provisionprofile" ~/Library/MobileDevice/Provisioning\ Profiles/
