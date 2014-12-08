/*

SVG to GPath Converter

Rajendra Serber

*/

// INSTANTIATE HANDLER
document.getElementById('files').addEventListener('change', handleFileSelect, false)


// FUNCTIONS
function handleFileSelect(event) {
// from http://www.html5rocks.com/en/tutorials/file/dndfiles/

var files = event.target.files; // FileList object

  // Loop through the FileList
  for (var i = 0, f; f = files[i]; i++) {

    // Only process SVG files.
    if (!f.type.match('image.svg')) {
      continue
      // TODO: show error if not svg
    }

    var reader = new FileReader()

    // Closure to capture the file information.
    reader.onload = (function(theFile) {
      return function(e) {
        var span = document.createElement('span')
        span.innerHTML = [
          displayGPathInfo(theFile, e)
        ].join('')
        document.getElementById('output').insertBefore(span, document.getElementById('output').firstChild)
      }
    })(f)

    // Read in the svg file as a text.
    reader.readAsText(f)
  }
}


function displayGPathInfo(theFile, fileData) {
  gp = new GPathInfo(fileData.target.result, {
              'decimal': document.getElementById('decimal').value,
            })

  display = '<h2>' + theFile.name + '</h2>\n' + 
  '<span class="preview">' + fileData.target.result + '</span>\n'
  if (gp.errors != '') { display += '<div id="error">' + gp.errors + '</div>\n' }
  display += '<pre>' + gp.text + '</pre>'

  return display // ['<h2>' + theFile.name + '</h2>\n' + gp.errors + '<br>\n' + '<pre>' + gp.text + '</pre>']
}
