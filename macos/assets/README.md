# Assets Directory

This directory is for application icons and other assets.

## Icon Requirements

To add a custom icon for the macOS app:

1. Create an `.icns` file (macOS icon format)
2. Name it `icon.icns`
3. Place it in this directory

### Creating an .icns file

You can use tools like:
- `iconutil` (built into macOS)
- Online converters
- Image2icon app

The icon should be at least 512x512 pixels for best quality.

If no icon is provided, electron-builder will use a default icon.
