/*!
  GPath.svg - v0.1.0 - 2014-12-08
  https://github.com/ardnejar/GPath.svg.git
  Copyright (c) 2014 Rajendra Serber
  Licensed under MIT license
*/
var last_point = {command: '', x: 0, y: 0}


function GPathInfo (svg_document, options) {

  this.svg_document = svg_document
  this.options = options
  this.gpath = parseSVG(svg_document)
  this.text = gpathToText(this)
  this.errors = displayShapeErrors()

}

function parseSVG (svg_document) {

  var groups_object = { 'groups': [] }
  , parsed_svg = $.parseXML(svg_document)
  , svg_contents = $(parsed_svg).find('svg')
  , groups_xml = svg_contents.find('g')

  if (groups_xml.length) {
    for (var i = 0; i < groups_xml.length; i++) {
      groups_object.groups.push( parseGroups(groups_xml[i]) )
    }
  } else {
    groups_object.groups = [{
      'name': svg_contents.attr('id'), 
      'shapes': extractLayer(svg_contents.children())
    }]
  }
  
  return groups_object

}

function parseGroups (group_contents) {

  var group_object = {'name': group_contents.id}
  , group_family = getChildren(group_contents)

  if (group_family.length > 0) {
    group_object.shapes = extractLayer(group_family)
  }

  return group_object

}


function getChildren (obj) {
  /*
    hack to workaround IE and Safari lack of support for SVGElement.children 
    TODO: Check on IE
  */

  var element_children = {}
  , current_child = obj.firstElementChild
  , i = 0
  
  while (current_child != null) {
    element_children[i++] = current_child
    current_child = current_child.nextElementSibling
  }
  element_children.length = i
  
  return element_children
}


function extractLayer (svg_contents) {

  var layer = []
  
  for (var i = 0; i < svg_contents.length; i++) {
    layer.push( parseShape(i, svg_contents[i]) )
  }

  return layer

}

function parseShape (index, svg_shape) {
console.log(svg_shape.nodeName)
console.dir(svg_shape)
console.dir(svg_shape.SVGPointList)
  var points
  switch (svg_shape.nodeName) {
    case 'path':
      points = pathToGPath(svg_shape.pathSegList)
      break
    case 'polygon':
    case 'polyline':
      points = pointsToGPath(svg_shape.points)
      break
    case 'rect':
      points = rectToGPath(svg_shape)
      break
    case 'line':
      points = lineToGPath(svg_shape)
      break
    case 'ellipse':
      points = extractSVGpoints(svg_shape, ['cx', 'cy', 'rx', 'ry'])
      break
    case 'circle':
      points = extractSVGpoints(svg_shape, ['cx', 'cy', 'r'])
      break
  }

  var layer = {'name': svg_shape.id, 'index': index, 'shape': svg_shape.nodeName, 'points': points}

  return layer

}

function extractSVGpoints (shape, shape_key) {

  var points = {}
  , point

  for (var key = 0; key < shape_key.length; key++) {
    if (shape.getAttribute(shape_key[key]) === undefined) {
      point = "0"
    } else {
      point = shape.getAttribute(shape_key[key])
    }
    if (point.search(/\s|\,/) < 0) {
      points[shape_key[key]] = Number(point)
    } else {
      points[shape_key[key]] = point
    }    
  }

  return points

}


function rectToGPath (rect) {

  var rect_dimensions = extractSVGpoints(rect, ['x', 'y', 'height', 'width'])

  var x1 = rect_dimensions.x
  , y1 = rect_dimensions.y
  , x2 = x1 + rect_dimensions.width
  , y3 = y1 + rect_dimensions.height

  , points =[
    {'x': x1, 'y': y1},
    {'x': x2, 'y': y1},
    {'x': x2, 'y': y3},
    {'x': x1, 'y': y3}
  ]
  
  return points

}

function lineToGPath (line) {

  var line_dimensions = extractSVGpoints(line, ['x1', 'y1', 'x2', 'y2'])

  var points =[
    {'x': line_dimensions.x1, 'y': line_dimensions.y1},
    {'x': line_dimensions.x2, 'y': line_dimensions.y2}
  ]
  return points

}


function pointsToGPath (points) {
  var gpath_array = []
  for (var i = 0; i < points.length; i++) {
      gpath_array.push(points[i])    
  }
  return gpath_array
}


function pathToGPath(points) {
  var gpath_array = []
  for (var i = 0; i < points.numberOfItems; i++) {
    if (points.getItem(i).constructor !== SVGPathSegClosePath) {
      gpath_array.push(adjustPathPoint(points.getItem(i)))    
    }
  }
  return gpath_array
}


function adjustPathPoint(point) {
  // add only x, y values
  // this is where curve control parameters are dropped
  var x, y
  switch (point.pathSegTypeAsLetter) {
    case 'H':
      x = point.x
      y = last_point.y
      break
    case 'V':
      x = last_point.x
      y = point.y
      break
    case 'h':
      x = point.x + last_point.x
      y = last_point.y
      break
    case 'v':
      x = last_point.x
      y = point.y + last_point.y
      break
    default:
      x = point.x
      y = point.y
      // adjust relative commands, not start or end
      if (/[astzqlc]/.test(point.pathSegTypeAsLetter)) {
        x += last_point.x
        y += last_point.y
      }
      break
  }

  last_point = {'command': point.pathSegTypeAsLetter, 'x': Number(x), 'y': Number(y)}

  return {'command': point.pathSegTypeAsLetter, 'x': Number(x), 'y': Number(y)}

}

var path_count


function gpathToText (gpathinfo) {

  var gpathinfo_string = ''
  shapes_omited = 0
  converted_curves = 0
  options = gpathinfo.options
  
  gpathinfo_string += groupsToText(gpathinfo)

  return gpathinfo_string

}

function groupsToText (gpathinfo) {

  var groups = gpathinfo.gpath.groups
  , group_string = ''

  for (var i = 0; i < groups.length; i++) {
    if (groups[i].shapes !== undefined) {
      var shape_text = shapesToText(groups[i].shapes)
      group_string += displayGPathInfoDeclarePathsArray(groups[i].name)
      group_string += shape_text 
      group_string += '};\n\n'
    }
  }

  return group_string

}

function shapesToText (shapes) {

  var shape_ponts_formated = ''
  , shape_formated = ''
  , note
  
  path_count = 0
  
  for (var i = 0; i < shapes.length; i++) {
    if (shapes[i].shape === 'circle' || shapes[i].shape === 'ellipse' || shapes[i].shape === 'polyline') {
      shape_formated += '  // ' + shapes[i].shape.toUpperCase() + ' OMITTED\n'
      shapes_omited++
    } else if ( Array.isArray(shapes[i].points) ){
      path_count++
      shape_ponts_formated = pointsLoop(shapes[i].points)
      note = '[' + (path_count - 1) + '] ' + shapes[i].shape + ' ' + shapes[i].name
      shape_formated += displayGPathStructWrap(note, shape_ponts_formated, shapes[i].points.length)
      if (i < shapes.length - 1) { shape_formated += ',' }
      shape_formated += '\n'
    }
  }
  
  return shape_formated

}

function pointsLoop (points) {

  var points_string = ''
  
  for (var i = 0; i < points.length; i++) {
    points_string += pointsString(points[i])
    if (i < points.length - 1) { points_string += ',' }
    if (points[i].command !== undefined &&
        /[astqc]/.test(points[i].command.toLowerCase())
    ) {
      points_string += ' // CURVE CONVERTED'
      converted_curves++
    }
    points_string += '\n'
  }

  return points_string

}

function pointsString (points) {

  return '      {' + floatOption(points.x) + ', ' + floatOption(points.y) + '}'

}

function floatOption (n) {

  if (options.decimal !== 'none') {
    n = Number(n).toFixed(options.decimal)
  }

  return Number(n)

}

function displayGPathStructWrap (note, points, point_count) {

  var declaration = '  { // ' + note + '\n\
    .num_points = ' + point_count + ',\n\
    .points = (GPoint []) {\n' +
    points + '\
    }\n\
  }'

  return declaration

}

function displayShapeErrors () {

  var error_messages = []
  var error_message
  
  if (shapes_omited > 0) { error_messages.push( shapes_omited + ' UNSUPPORTED SHAPES OMITTED' ) }
  if (converted_curves > 0) { error_messages.push( converted_curves + ' CURVES CONVERTED' ) }

  if (error_messages.length > 0) { 
    error_message = error_messages.join('!<br>\n') + '!\n' 
    return error_message
  } else {
    return ''
  }
  
}

function displayGPathInfoDeclarePathsArray (group_name) {
  
  group_name = group_name.toUpperCase()
  
  var declaration = '#define ' + group_name + '_PATH_COUNT ' + path_count + '\n'
  declaration += 'static const struct GPathInfo ' + group_name + '_PATHS[] = {\n'

  return declaration

}
