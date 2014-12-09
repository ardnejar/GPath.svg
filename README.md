# SVG to Pebble GPath Converter #

by
Rajendra Serber

###What It Does###

This script takes a standard SVG file and coverts it to a Pebble GPathInfo array that can be drawn with `gpath_draw_filled` or `gpath_draw_outline`. SVGs with multiple shapes will have each shape as an item in the GPathInfo array. Each SVG group will be a separate GPathInfo array.

Some primitive shape types are converted to paths. Rects and Lines can be drawn by Pebble when they are converted to paths.

**Rounding**  
Currently the only option that GPath.svg takes is "decimal." This allows you to set how many decimal places the points are rounded to. Pebble doesn't have hardware accelerated floating point math, so avoiding floats where possible saves processing and therefor battery.

###Limitations###

The current version drops any shapes that can't natively be drawn as a path on Pebble. Circles, Elipses and Polyline shapes can't be drawn by `gpath_draw_*`. The curve data of paths is also dropped, leaving only the curve's x and y values. Comments are added in place of the omitted data.

This has only been tested in the latest versions of Chrome, Firefox, Safari  and Internet Explorer. There is no support for older browsers planned.

###How To Use###
First try it out in your browser at [GPathSVG.org](http://gpathsvg.org).

If you just want to include this function in your project you can download the minified version from the source folder in the repository. Not that it is dependent on JQueary for xml parsing.

Documentation for integration into your JavaScript to coming later... 


###Contribute###

There is lots of room for improvement here! If you want to make this better please fork this repository and make a [pull requests](https://help.github.com/articles/using-pull-requests). Every sensible change will be merged.