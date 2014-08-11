var GamePlayScene = function(game, canv)
{
  var self = this;
  var tickables;
  var drawables;

  self.ready = function()
  {
    tickables = [];
    drawables = [];
  };

  self.tick = function()
  {
    for(var i = 0; i < tickables.length; i++)
      tickables[i].tick(ih);
  };

  self.draw = function()
  {
    for(var i = 0; i < drawables.length; i++)
      drawables[i].draw(canv);
  };

  self.cleanup = function()
  {
  };
};

