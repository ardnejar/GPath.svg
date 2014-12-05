/*

SVG to GPath Converter

Rajendra Serber

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
  , group_family = countChildren(group_contents)

  if (group_family.length > 0) {
    group_object.shapes = extractLayer(group_family)
  }

  return group_object

}


function countChildren (obj) {
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
    if (shape.getAttribute(shape_key[key]) == undefined) {
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
    if (points.getItem(i).constructor != SVGPathSegClosePath) {
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
