var marked = require('marked');

// this.path is path to file being interpreted
// this.body is the actual content (minus shebang line)
// this.mime is the mime type of the response.
// this.read(path) is function to read other files in vfs.
return function* (...args) {
  this.body = JSON.stringify({path:this.path,args,marked});
  this.mime = "application/json";
}
