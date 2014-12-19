---
title: SVG to Pebble GPath Converter
id: about
---

by Rajendra Serber

###What It Does###

This script takes a standard SVG file and coverts it to a Pebble GPathInfo array that can be drawn with ['gpath_draw_filled'](http://developer.getpebble.com/docs/c/group___path_drawing.html) or ['gpath_draw_outline'](http://developer.getpebble.com/docs/c/group___path_drawing.html). SVGs with multiple shapes will have each shape as an item in the GPathInfo array. Each SVG group will be a separate GPathInfo array.

Some primitive shape types are converted to paths. Rects, Lines and Polygons can be drawn by Pebble when they are converted to paths. _(There is a bug that prevents Polygons from being converted in Safari and Internet Explorer.)_

**Rounding**
Before you select your SVG file for conversion you can change your rounding preference. "None" will make it not rounded, but the addition function of JavaScript wil make relative points unreasonably long. Pebble doesn't have hardware accelerated floating point math, so avoiding floats where possible saves processing and therefor battery.

###Limitations###

The current version drops any shapes that can't natively be drawn as a path on Pebble. Circles, Elipses and Polyline shapes can't be natively drawn by ['gpath_draw*'](http://developer.getpebble.com/docs/c/group___path_drawing.html). The curve data of paths is also dropped, leaving only the curve's x and y values. Comments are added in place of the omitted data.

**This has only been tested in the latest versions of Chrome, Firefox, Safari and Internet Explorer.** There is no support for older browsers planned.

###Contribute###

There is lots of room for improvement here. If you want to make this better please fork this repository and make a pull requests from the [GPath.svg GitHub](https://github.com/ardnejar/GPath.svg) project page. Every sensible change will be merged. You can also use the GitHub project page to submit issues, feature requests and contact me.

