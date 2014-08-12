//ok "assetter" doesn't really make as much sense as "drawer" or "ticker", but hell if I'm changing it...
var Assetter = function(canv)
{
  var self = this;

  var assets = [];
  self.asset = function(file)
  {
    if(!assets[file])
    {
      assets[file] = new Image();
      assets[file].src = file;
    }
    return assets[file];
  }

}

