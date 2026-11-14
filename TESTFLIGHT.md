# TestFlight

Goose Z is an iPhone gallery for the book. The bundle id is `app.goosez.gallery`.

The Apple Developer Program enrollment for this app is the Individual plan, and it is still pending. Do not upload a build until Apple approves the membership and an App Store Connect record exists for this bundle id. The repository stays private.

## When the membership is active

1. Sign in to EAS: `npx eas-cli@latest login`
2. Link this project: `npx eas-cli@latest init`
3. Confirm `app.json` still has `ios.bundleIdentifier` set to `app.goosez.gallery`.
4. Create the iOS app in App Store Connect with that bundle id.
5. Put the Apple Team ID and the App Store Connect app id into `eas.json` under `submit.production.ios`:

   ```json
   "ios": {
     "appleTeamId": "YOUR_TEAM_ID",
     "ascAppId": "YOUR_APP_STORE_CONNECT_APP_ID"
   }
   ```

6. Build for the store: `npx eas-cli@latest build --platform ios --profile production`
7. Submit that build: `npx eas-cli@latest submit --platform ios --profile production`
8. In App Store Connect, add the processed build to an internal TestFlight group.

`ios.infoPlist.ITSAppUsesNonExemptEncryption` is already `false`. Favorites and the morning-notice preference stay on the phone. The Amazon control is a placeholder until the hardcover listing exists. See the TODO in `src/data/listing.ts`.
