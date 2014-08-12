var RainBarrelScene = function(game, canv)
{
  var self = this;
  var bh;
  var tickables;
  var drawables;

  var man;

  self.ready = function()
  {
    bh = new ButtonHandler();
    tickables = [];
    drawables = [];

    bh.register(new Button({"x":10,"y":10,"w":10,"h":10,"callback":function(){console.log("ello guvna");}}))
    man = new Image();
    man.src = "assets/man.png";
  };

  self.tick = function()
  {
    bh.flush();
    for(var i = 0; i < tickables.length; i++)
      tickables[i].tick();
  };

  self.draw = function()
  {
    canv.context.drawImage(man,5,5);
    canv.context.fillStyle = "#000000";
    canv.context.fillRect(10,10,10,10);
    for(var i = 0; i < drawables.length; i++)
      drawables[i].draw(canv);
  };

  self.cleanup = function()
  {
  };
};

