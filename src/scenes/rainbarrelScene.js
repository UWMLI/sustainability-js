var RainBarrelScene = function(game, canv)
{
  var self = this;
  var tickables;
  var drawables;

  var man;

  self.ready = function()
  {
    tickables = [];
    drawables = [];
    man = new Image();
    man.src = "assets/man.png";
  };

  self.tick = function()
  {
    for(var i = 0; i < tickables.length; i++)
      tickables[i].tick(ih);
  };

  self.draw = function()
  {
    canv.context.drawImage(man,5,5);
    for(var i = 0; i < drawables.length; i++)
      drawables[i].draw(canv);
  };

  self.cleanup = function()
  {
  };
};

