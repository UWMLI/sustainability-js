var GamePlayScene = function(game, canv)
{
  var self = this;
  var ticker;
  var clicker;
  var drawer;

  self.ready = function()
  {
    ticker = new Ticker();
    clicker = new Clicker();
    drawer = new Drawer(canv);
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

