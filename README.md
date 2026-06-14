---
tags:
  - custom-css
  - custom-javascript
  - custom-js
  - electron-webviews
  - frame-config
  - iframe-embedding
  - local-app-frames
  - local-web-apps
  - mobile-iframe-support
  - obsidian-plugins
  - obsidian/plugins
  - open-gate-fork
  - trusted-frames
  - web-app-embedding
  - web-application-development
  - web-embedding
---

# Local App Frames

Local App Frames is a local fork of [Obsidian Open Gate](https://github.com/nguyenvanduocit/obsidian-open-gate), rebranded and preconfigured for trusted local web applications inside Obsidian panes.

The fork keeps Open Gate's power-user configuration surface: editable URLs, titles, icons, pane positions, profile keys, zoom, custom user-agent strings, custom CSS, and custom JavaScript. Custom JavaScript executes in the embedded page context, so use it only with pages you trust.

## Default frames

Fresh installs seed two editable frames:

- OpenDesign — `http://127.0.0.1:7456/`
- SigNoz — `http://127.0.0.1:3301/`

These are ordinary frame settings. Edit or delete them from the plugin settings, and add any additional local or trusted web app frames you need.

## Features

- Embed local or trusted web apps in Obsidian as configurable frames.
- Open each frame on the left, center, or right of the Obsidian UI.
- Embed a frame directly within a note.
- Generate icons from site favicons.
- Use Electron webviews on desktop for sites that cannot be embedded in an iframe.
- Mobile iframe support.
- Inject custom CSS or JavaScript for trusted pages.
- Link to frames from notes with the local frame protocol.

## Attribution

This project is a fork of Obsidian Open Gate by duocnv and contributors, licensed under the MIT License. See `LICENSE` for the original license terms.
