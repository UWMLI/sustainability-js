var RainBarrelScene = function(game, canv)
{
  var self = this;

  var ticker;
  var clicker;
  var drawer;

  var player;
  var buttons;

  self.numFloors = 5;

  self.ready = function()
  {
    ticker = new Ticker();
    clicker = new Clicker();
    drawer = new Drawer(canv);

    player = new RB_Player(self);
    buttons = [];

    buttons.push(new Clickable({"x":0,"y":100,"w":100,"h":100,"callback":function(){player.floor = 4;}}));
    buttons.push(new Clickable({"x":0,"y":200,"w":100,"h":100,"callback":function(){player.floor = 3;}}));
    buttons.push(new Clickable({"x":0,"y":300,"w":100,"h":100,"callback":function(){player.floor = 2;}}));
    buttons.push(new Clickable({"x":0,"y":400,"w":100,"h":100,"callback":function(){player.floor = 1;}}));
    buttons.push(new Clickable({"x":0,"y":500,"w":100,"h":100,"callback":function(){player.floor = 0;}}));
    for(var i = 0; i < buttons.length; i++)
    {
      clicker.register(buttons[i]);
      drawer.register(buttons[i]);
    }

    ticker.register(player);
    drawer.register(player);
  };

  self.tick = function()
  {
    clicker.flush();
    ticker.flush();
  };

  self.draw = function()
  {
    drawer.flush();
  };

  self.cleanup = function()
  {
  };
};

