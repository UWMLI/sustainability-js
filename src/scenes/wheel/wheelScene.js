var WheelScene = function(game, canv)
{
  var self = this;

  self.ticker;
  self.flicker;
  self.drawer;
  self.assetter;

  self.flickables;

  self.ready = function()
  {
    self.ticker = new Ticker();
    self.flicker = new Flicker();
    self.drawer = new Drawer(canv);
    self.assetter = new Assetter();

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

