var WheelScene = function(game, stage)
{
  var self = this;

  var physical_rect    = {x:0,y:0,w:stage.dispCanv.canvas.width,h:stage.dispCanv.canvas.height};
  var theoretical_rect = {x:0,y:0,w:stage.drawCanv.canvas.width,h:stage.drawCanv.canvas.height};
  self.ticker;
  self.flicker;
  self.drawer;
  self.assetter;

  self.flickables;

  self.ready = function()
  {
    self.ticker = new Ticker({});
    self.flicker = new Flicker({source:stage.dispCanv.canvas,physical_rect:physical_rect,theoretical_rect:theoretical_rect});
    self.drawer = new Drawer({source:stage.drawCanv});
    self.assetter = new Assetter({});

    self.flickables = [];
    self.flickables.push(new Flickable({"x":10,"y":10,"w":10,"h":10,"r":10,"flick":function(vec) { console.log(vec); }}));
    for(var i = 0; i < self.flickables.length; i++)
    {
      self.flicker.register(self.flickables[i]);
      self.drawer.register(self.flickables[i]);
    }
  };

  self.tick = function()
  {
    self.flicker.flush();
    self.ticker.flush();
  };

  self.draw = function()
  {
    self.drawer.flush();
  };

  self.cleanup = function()
  {
  };
};

