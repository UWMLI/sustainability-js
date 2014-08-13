var RainBarrelScene = function(game, canv)
{
  var self = this;

  self.ticker;
  self.clicker;
  self.dragger;
  self.drawer;
  self.assetter;

  self.barrels;
  self.map;

  self.ready = function()
  {
    self.ticker = new Ticker();
    self.clicker = new Clicker();
    self.dragger = new Dragger();
    self.drawer = new Drawer(canv);
    self.assetter = new Assetter();

    self.barrels = [];
    self.barrels.push(new SW_Barrel(self,{"x":20,"y":100}));
    self.barrels.push(new SW_Barrel(self,{"x":100,"y":75}));
    self.barrels.push(new SW_Barrel(self,{"x":50,"y":50}));
    self.barrels.push(new SW_Barrel(self,{"x":140,"y":33}));
    self.barrels.push(new SW_Barrel(self,{"x":90,"y":190}));
    self.map = new SW_Map(self);
    for(var i = 0; i < self.barrels.length; i++)
    {
      self.clicker.register(self.barrels[i]);
      self.drawer.register(self.barrels[i]);
    }
    self.dragger.register(self.map);
    self.drawer.register(self.map);

  };

  self.tick = function()
  {
    self.clicker.flush();
    self.dragger.flush();
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

var SW_Map = function(game)
{
  var self = this;
  self.img = game.assetter.asset("assets/man.png");

  //nice in smooth dragging
  self.offX = 0;
  self.offY = 0;
  self.deltaX = 0;
  self.deltaY = 0;
  self.x = 0;
  self.y = 0;
  self.w = 200;
  self.h = 200;

  self.tick = function()
  {

  }

  self.dragStart = function(evt)
  {
    self.offX = self.x+(self.w/2)-evt.offsetX;
    self.offY = self.y+(self.h/2)-evt.offsetY;
  };
  self.drag = function(evt)
  {
    self.deltaX = (evt.offsetX-(self.w/2)+self.offX)-self.x;
    self.deltaY = (evt.offsetY-(self.h/2)+self.offY)-self.y;
    self.x += self.deltaX;
    self.y += self.deltaY;
    for(var i = 0; i < game.barrels.length; i++)
    {
      game.barrels[i].x += self.deltaX;
      game.barrels[i].y += self.deltaY;
    }
  };
  self.dragFinish = function()
  {
  };

  self.draw = function(canv)
  {
    canv.context.strokeStyle = "#00FF00";
    canv.context.strokeRect(self.x,self.y,self.w,self.h);
  }
}

var SW_Barrel = function(game, args)
{
  var self = this;

  self.x = args.x ? args.x : 0;
  self.y = args.y ? args.y : 0;
  self.w = 10;
  self.h = 10;

  self.img = game.assetter.asset("assets/man.png");

  self.tick = function()
  {
  }

  self.click = function(evt)
  {
    console.log(self);
  }

  self.draw = function(canv)
  {
    canv.context.drawImage(self.img,self.x,self.y,self.w,self.h);
  }

  self.kill = function()
  {
    game.barrels.splice(game.barrels.indexOf(self),1);
    game.ticker.unregister(self);
    game.drawer.unregister(self);
  }
}

