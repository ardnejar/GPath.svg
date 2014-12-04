/*

SVG to GPath Converter

Rajendra Serber

*/



var last_point = {command: '', x: 0, y: 0}


function GPathInfo (svg_document, options) {

  this.svg_document = svg_document,
  this.gpath = parseSVG(svg_document)
  this.text = gpathToText(this.gpath, options)

}

function parseSVG (svg_document) {

  var groups_object = {
    'groups': []
  }

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

  if (group_contents.childElementCount > 0) {
    group_object.shapes = extractLayer(group_contents.children)
  }

  return group_object

}

function extractLayer (svg_contents) {

  var layer = []
  
  for (var i = 0; i < svg_contents.length; i++) {
    layer.push( parseShape(i, svg_contents[i]) )
  }

  return layer

}

function parseShape (index, svg_shape, array) {

  var shape_keys = {
    circle: ['cx', 'cy', 'r'],
    ellipse: ['cx', 'cy', 'rx', 'ry'],
    line: ['x1', 'y1', 'x2', 'y2'],
    path: ['d'],
    polygon: ['points'],
    polyline: ['points'],
    rect: ['x', 'y', 'height', 'width'],
  }

  var points = extractSVGpoints(svg_shape, shape_keys[svg_shape.nodeName])

console.log(svg_shape.nodeName)
  switch (svg_shape.nodeName) {
    case 'path':
      points = pathToGPath(svg_shape.pathSegList)
      break
    case 'polygon':
    case 'polyline':
console.dir(svg_shape.points)
console.dir(points.points)
      points = pointsToGPath(points.points)
      break
    case 'rect':
      points = rectToPath(points)
      break
    case 'line':
      points = lineToPath(points)
      break
  }
console.dir(points)

  var layer = {'name': svg_shape.id, 'count': index, 'shape': svg_shape.nodeName, 'points': points}

  return layer

}

function extractSVGpoints (shape, shape_key) {

  var points = {}
  , point

  for (key in shape_key) {
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


function rectToPath (rect_dimensions) {

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

function lineToPath (line_dimensions) {

  var points =[
    {'x': line_dimensions.x1, 'y': line_dimensions.y1},
    {'x': line_dimensions.x2, 'y': line_dimensions.y2}
  ]
  return points

}


function pointsToGPath (shape_points) {

  var points = []
  , point_split

  points_array = shape_points.split(' ')

  for (point in points_array) {
    if (points_array[point].length > 1) {
      point_split = points_array[point].split(',')
      points.push( {'x': Number(point_split[0]), 'y': Number(point_split[1])} )
    }
  }

  return points

}


function pathToGPath(points) {
  var gpath_array = []
  for (var i = 0; i < points.length; i++) {
    if (points[i].constructor.name != 'SVGPathSegClosePath') {
      gpath_array.push(adjustPathPoint(points[i]))    
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
