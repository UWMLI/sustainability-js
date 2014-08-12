var Drawer = function(canv)
{
  var self = this;

  var drawables = [];
  self.register = function(drawable) { drawables.push(drawable); }
  self.unregister = function(drawable) { drawables.splice(drawables.indexOf(drawable),1); }
  self.clear = function() { drawables = []; }

  self.flush = function()
  {
    for(var i = 0; i < drawables.length; i++)
      drawables[i].draw(canv);
  }
}

//example drawable- just needs draw function
var Drawable = function(args)
{
  var self = this;

  //example args
  self.x = args.x ? args.x : 0;
  self.y = args.y ? args.y : 0;
  self.w = args.w ? args.w : 0;
  self.h = args.h ? args.h : 0;

  self.draw = function(canv)
  {
    canv.context.strokeStyle = "#00FF00";
    canv.context.strokeRect(self.x,self.y,self.w,self.h);
  }
}

