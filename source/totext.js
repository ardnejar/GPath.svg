/*

SVG to GPath Converter

Rajendra Serber

*/

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
