var WindowScene = function(game, canv)
{
  var self = this;

  self.ticker;
  self.presser;
  self.drawer;
  self.assetter;

  self.windows;

  self.numFloors = 5;
  self.numRooms = 5;

  self.ready = function()
  {
    self.ticker = new Ticker();
    self.presser = new Presser();
    self.drawer = new Drawer(canv);
    self.assetter = new Assetter();

    self.windows = [];

    for(var i = 0; i < self.numRooms; i++)
      for(var j = 0; j < self.numFloors; j++)
        self.windows.push(new WI_Window(self, i, j));
    for(var i = 0; i < self.windows.length; i++)
    {
      self.presser.register(self.windows[i]);
      self.drawer.register(self.windows[i]);
    }
  };

  self.tick = function()
  {
    self.presser.flush();
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

var WI_Window = function(game, room, floor)
{
  var self = this;

  self.room = room;
  self.floor = floor;

  self.x = room*75+100;
  self.y = floor*100+100;
  self.w = 65;
  self.h = 90;

  self.state = 0;
  var s_CLOSED = "CLOSED";
  var s_DARKED = "DARKED";
  var s_OPENED = "OPENED";
  var states = [s_CLOSED,s_DARKED,s_OPENED];
  self.imgs = [game.assetter.asset("win_closed.png"),game.assetter.asset("win_drawn.png"),game.assetter.asset("win_open.png")];

  self.draw = function(canv)
  {
    canv.context.drawImage(self.imgs[self.state],self.x,self.y,self.w,self.h);
  }

  self.press = function()
  {
    self.state = (self.state+1)%states.length;
  }
}

