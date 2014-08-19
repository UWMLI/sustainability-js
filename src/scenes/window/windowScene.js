var WindowScene = function(game, canv)
{
  var self = this;

  self.ticker;
  self.presser;
  self.drawer;
  self.assetter;

  self.sky;
  self.building;
  self.windows;

  self.numFloors = 5;
  self.numRooms = 4;

  self.ready = function()
  {
    self.ticker = new Ticker();
    self.presser = new Presser();
    self.drawer = new Drawer(canv);
    self.assetter = new Assetter();

    self.sky = new WI_Sky(self);
    self.building = new WI_Building(self);
    self.windows = [];

    for(var i = 0; i < self.numRooms; i++)
      for(var j = 0; j < self.numFloors; j++)
        self.windows.push(new WI_Window(self, i, j));

    self.drawer.register(self.sky);
    self.ticker.register(self.sky);
    self.drawer.register(self.building);
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

var WI_Sky = function(game)
{
  var self = this;

  self.x = 0;
  self.y = -1008;
  self.w = 640;
  self.h = 2016;

  self.t = 0;
  self.period = 1000;

  self.sky_img = game.assetter.asset("win_sky.png");
  self.moon_img = game.assetter.asset("win_moon.png");
  self.sun_img = game.assetter.asset("win_sun.png");

  self.tick = function()
  {
    self.t++;
  }
  var sin;
  var cos;
  self.draw = function(canv)
  {
    sin = Math.sin((self.t/self.period)*2*Math.PI);
    cos = Math.cos((self.t/self.period)*2*Math.PI);
    canv.context.drawImage(self.sky_img,self.x,self.y+(sin*640+125),self.w,self.h);
    canv.context.drawImage(self.moon_img,cos*640+320-100,sin*640+700-100,200,200);
    sin = Math.sin((self.t/self.period)*2*Math.PI+Math.PI);
    cos = Math.cos((self.t/self.period)*2*Math.PI+Math.PI);
    canv.context.drawImage(self.sun_img,cos*640+320-100,sin*640+700-100,200,200);
  }
}

//literally just the building image
var WI_Building = function(game)
{
  var self = this;

  self.x = 0;
  self.y = 0;
  self.w = 640;
  self.h = 1008;

  self.img = game.assetter.asset("win_building.png");

  self.draw = function(canv)
  {
    canv.context.drawImage(self.img,self.x,self.y,self.w,self.h);
  }
}

var WI_Window = function(game, room, floor)
{
  var self = this;

  self.room = room;
  self.floor = floor;

  self.x = room*80+160;
  self.y = floor*110+210;
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

