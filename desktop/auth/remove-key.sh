#!/usr/bin/env sh
security delete-keychain mac-build.keychain
rm -f "~/Library/MobileDevice/Provisioning Profiles/$PROFILE_NAME.provisionprofile"
