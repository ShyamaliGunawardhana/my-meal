# MyMeal

Mobile app (React Native / Expo, Android primary) that matches recipes to
the ingredients you already have, with a deterministic allergen-safety
layer and a hands-free voice cooking assistant.

See `../decisions.md` and `../proposal.txt` for the full design/architecture
decisions. This file only covers running and building the app.

## Requirements

- Node **20.19.4** (pinned in `.nvmrc` — do not use a different version,
  see `decisions.md` "Locked Versions")
- [nvm](https://github.com/nvm-sh/nvm) installed
- An Android phone with the **MyMeal development build** installed (see
  below), or Android Studio for an emulator

## First-time setup

```bash
cd Mobile/my-meal
nvm install    # only needed once, installs 20.19.4 if you don't have it
nvm use        # activates the version pinned in .nvmrc
npm install
```

## Day-to-day development

Once the development build (see next section) is installed on your
phone, everyday coding only needs Metro (the JS bundler) — no native
build step:

```bash
nvm use
npx expo start --dev-client
```

This prints a QR code. Open the **MyMeal** dev-client app already
installed on your phone (not Expo Go) and connect to the server, or
scan the QR code. Code changes hot-reload automatically.

Other useful commands while developing:

```bash
npx tsc --noEmit     # typecheck
npx expo lint        # lint
npx expo start --web # preview in a browser (fastest way to check layout/UI changes)
```

### Why not plain Expo Go?

Expo Go only supports one Expo SDK version at a time (whatever is
currently latest), and it auto-updates from the app stores independently
of this project. Since this project is intentionally pinned to a
specific SDK version (see `decisions.md`), Expo Go can go out of sync
and fail to open the project. A **development build** (below) is our own
build, tied to our own SDK version, so it doesn't depend on what Expo Go
currently ships.

## Building/installing the development build (only needed occasionally)

You only need to (re)do this when:

- setting up a new phone/device for the first time, or
- a new native module is added (a library with native Android code —
  e.g. `expo-sqlite`, `expo-secure-store`, camera/speech libraries)

```bash
nvm use
npx eas-cli@latest login              # one-time login to a free Expo account
npx eas-cli@latest build --profile development --platform android
```

(`eas-cli` is intentionally **not** a project dependency — always run it via
`npx eas-cli@latest`, not a locally installed version; see `expo-doctor`.)

This queues a build on Expo's servers (free tier — typically 10-20
minutes, mostly native/Gradle compilation, not something to redo often).
When it finishes, it prints a link/QR code — open it on your Android
phone to download and install the APK directly (no Play Store needed).

After that one-time install, go back to the **Day-to-day development**
section above — you won't need `eas build` again until the next native
dependency is added.

## Project structure

```
src/
  app/              Expo Router routes - every file here is a screen
    _layout.tsx     Root Stack (single screen: the chat)
    index.tsx       The "new recipe chat" screen (always opens fresh)
  components/       History/Settings overlay panels, shared UI pieces
  data/             Dummy chat/recipe data (placeholder until real
                    matching engine + Gemini integration are built)
  types/            Shared TypeScript types (e.g. ChatMessage)
  global.css        Tailwind directives + font variables (NativeWind)
```

Navigation is a single chat screen, not tabs — see `decisions.md`
"Navigation (revised — no bottom tabs)" for why.

## Tech stack

See `../decisions.md` for the full list and reasoning. Summary: Expo
(React Native) + TypeScript, NativeWind (Tailwind for RN), Zustand,
Expo Router, `expo-sqlite` / `expo-secure-store` for local data, Google
Gemini for the AI-driven features, on-device speech-to-text/text-to-speech.
