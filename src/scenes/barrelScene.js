var BarrelScene = function(game, stage)
{
  var self = this;
  self.stage = stage;

  var physical_rect    = {x:0,y:0,w:stage.dispCanv.canvas.width,h:stage.dispCanv.canvas.height};
  var theoretical_rect = {x:0,y:0,w:stage.drawCanv.canvas.width,h:stage.drawCanv.canvas.height};
  self.dbugger;
  self.ticker;
  self.clicker;
  self.dragger;
  self.drawer;
  self.assetter;

  self.barrels;
  self.map;

  self.ready = function()
  {
    self.dbugger = new Debugger({source:document.getElementById("debug_div")});
    self.ticker = new Ticker({});
    self.clicker = new Clicker({source:stage.dispCanv.canvas,physical_rect:physical_rect,theoretical_rect:theoretical_rect});
    self.dragger = new Dragger({source:stage.dispCanv.canvas,physical_rect:physical_rect,theoretical_rect:theoretical_rect});
    self.drawer = new Drawer({source:stage.drawCanv});
    self.assetter = new Assetter({});

    self.barrels = [];
    var randx = function(){ return Math.random()*self.stage.drawCanv.canvas.width*2; }
    var randy = function(){ return Math.random()*self.stage.drawCanv.canvas.height*2; }
    self.barrels.push(new RB_Barrel(self,{"x":randx(),"y":randy()}));
    self.barrels.push(new RB_Barrel(self,{"x":randx(),"y":randy()}));
    self.barrels.push(new RB_Barrel(self,{"x":randx(),"y":randy()}));
    self.barrels.push(new RB_Barrel(self,{"x":randx(),"y":randy()}));
    self.barrels.push(new RB_Barrel(self,{"x":randx(),"y":randy()}));
    self.map = new RB_Map(self);
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

var RB_Map = function(game)
{
  var self = this;
  self.img = game.assetter.asset("man.png");

  //nice in smooth dragging
  self.offX = 0;
  self.offY = 0;
  self.deltaX = 0;
  self.deltaY = 0;
  self.x = 0;
  self.y = 0;
  self.w = game.stage.drawCanv.canvas.width*2;
  self.h = game.stage.drawCanv.canvas.height*2;

  self.tick = function()
  {

  }

  self.dragStart = function(evt)
  {
    self.offX = self.x+(self.w/2)-evt.doX;
    self.offY = self.y+(self.h/2)-evt.doY;
  };
  self.drag = function(evt)
  {
    self.deltaX = (evt.doX-(self.w/2)+self.offX)-self.x;
    self.deltaY = (evt.doY-(self.h/2)+self.offY)-self.y;
    if(self.x + self.deltaX > 0) self.deltaX = 0-self.x;
    if(self.x + self.deltaX < 0-(self.w-game.stage.drawCanv.canvas.width)) self.deltaX = -(self.w-game.stage.drawCanv.canvas.width)-self.x;
    if(self.y + self.deltaY > 0) self.deltaY = 0-self.y;
    if(self.y + self.deltaY < 0-(self.h-game.stage.drawCanv.canvas.height)) self.deltaY = -(self.h-game.stage.drawCanv.canvas.height)-self.y;
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
    game.dbugger.log("("+self.x+","+self.y+","+self.w+","+self.h+")");
  }
}

var RB_Barrel = function(game, args)
{
  var self = this;

  self.x = args.x ? args.x : 0;
  self.y = args.y ? args.y : 0;
  self.w = 30;
  self.h = 30;

  self.img = game.assetter.asset("man.png");

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

