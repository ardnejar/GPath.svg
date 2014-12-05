# SVG to Pebble GPath Converter #

by
Rajendra Serber

##What It Does##

This script takes a standard SVG file and coverts it to a Pebble GPathInfo array that can be drawn with gpath_draw_filled or gpath_draw_outline. SVGs with multiple shapes will have each shape as an item in the GPathInfo array. Each SVG group will be a separate GPathInfo array.

Some primitive shape types are converted to paths. Rects and Lines can be drawn by Pebble when they are converted to paths.

**Rounding**
Before you select the the file for conversion you can choose the level of rounding. Pebble doesn't have hardware accelerated floating point math, so avoiding floats where possible saves processing and therefor battery.

##Limitations##

The current version drops any shapes that can't natively be drawn as a path on Pebble. Circles, Elipses and Polyline shapes can't be natively drawn by gpath draw. The curved data of paths is also dropped, leaving only the path points. Comments are added in place of the omitted data.

