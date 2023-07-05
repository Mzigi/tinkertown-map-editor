# tinkertown-map-editor
 
**Try the editor at**
https://mzigi.github.io/tinkertown-map-editor/

## Where are the map folders stored?

C:\Users\YOUR_USER\AppData\LocalLow\Headup\Tinkertown\map\YOUR_MAP

## Known Issues

### Import/Export issues
- Items dropped on the ground aren't saved nor loaded
- Tile closest to the chunk origin is moved to the origin if the chunk isn't filled when exporting
- Changing world name puts some files that should be in the root of the zip in a seperate folder inside the zip with the old world name

### Visual issues
- Big tiles placed near chunk borders might not render fully
- Layer orders might be ignored near chunk borders
- Tiles larger than 1x1 are always drawn with the bottom left corner as the origin
- Tiles in the tile list are sometimes stretched

### Misc issues
- Tiles that are unknown (the ones that look like question marks) are ignored by all tools

# Permissions

Read the LICENSE file for info on what you're allowed to do with the software.
