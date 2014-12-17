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
  self.particler;
  self.assetter;

  self.rain_active;  self.num_rain_active;
  self.barrels;
  self.map;

  self.ready = function()
  {
    self.dbugger = new Debugger({source:document.getElementById("debug_div")});
    self.ticker = new Ticker({});
    self.clicker = new Clicker({source:stage.dispCanv.canvas,physical_rect:physical_rect,theoretical_rect:theoretical_rect});
    self.dragger = new Dragger({source:stage.dispCanv.canvas,physical_rect:physical_rect,theoretical_rect:theoretical_rect});
    self.drawer = new Drawer({source:stage.drawCanv});
    self.particler = new Particler({});
    self.assetter = new Assetter({});

    //pre-fill out arrays
    var rains = 10000;
    self.rain_active = [];
    for(var i = 0; i < rains; i++) self.rain_active[i] = new RB_Rain(self);
    self.num_rain_active = 0;

    self.barrels = [];
    var randx = function(){ return Math.random()*self.stage.drawCanv.canvas.width*2; }
    var randy = function(){ return Math.random()*self.stage.drawCanv.canvas.height*2; }
    for(var i = 0; i < 50; i++)
      self.barrels.push(new RB_Barrel(self,{"x":randx(),"y":randy()}));
    self.map = new RB_Map(self);
    for(var i = 0; i < self.barrels.length; i++)
    {
      self.clicker.register(self.barrels[i]);
      self.drawer.register(self.barrels[i]);
    }
    self.dragger.register(self.map);
    self.drawer.register(self.map);

    self.drawer.register(self.particler);
    self.ticker.register(self.particler);
  };

  self.tick = function()
  {
    self.clicker.flush();
    self.dragger.flush();
    self.ticker.flush();
    for(var i = 0; i < 20; i++)
    {
      self.rain_active[self.num_rain_active].refresh();
      self.particler.register(self.rain_active[self.num_rain_active]);
      self.num_rain_active++;
    }
  };

  self.draw = function()
  {
    self.drawer.flush();
  };

  self.cleanup = function()
  {
  };

  var tmpDrop;
  self.retireDrop = function(drop)
  {
    for(var i = 0; i < self.num_rain_active; i++)
    {
      if(self.rain_active[i] === drop)
      {
        tmpDrop = self.rain_active[i];
        self.rain_active[i] = self.rain_active[self.num_rain_active];
        self.rain_active[self.num_rain_active] = tmpDrop;
        self.num_rain_active--;
      }
    }
  }
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
    canv.context.lineWidth = 1;
    canv.context.strokeStyle = "#00FF00";
    canv.context.strokeRect(self.x,self.y,self.w,self.h);
    //game.dbugger.log("("+self.x+","+self.y+","+self.w+","+self.h+")");
  }
}

var RB_Rain = function(game)
{
  var self = this;

  self.refresh = function()
  {
    self.dx = 2;
    self.dy = 10;
    self.x = (Math.random()*
      (game.stage.drawCanv.canvas.height+
      (self.dx/self.dy)*
      game.stage.drawCanv.canvas.height))-((self.dx/self.dy)*
      game.stage.drawCanv.canvas.height);
    self.y = -10+Math.random();
    self.r = (Math.random()/2)+1;
    self.dx *= self.r;
    self.dy *= self.r;
  }
  self.refresh();

  self.tick = function()
  {
    self.x += self.dx;
    self.y += self.dy;

    if(self.y > game.stage.drawCanv.canvas.height)
    {
      game.retireDrop(self);
      return false;
    }
    return true;
  }

  self.draw = function(canv)
  {
    canv.context.lineWidth = 1;
    canv.context.strokeStyle = "#0000FF";
    canv.context.beginPath();
    canv.context.moveTo(self.x,self.y);
    canv.context.lineTo(self.x+self.dx,self.y+self.dy);
    canv.context.stroke();
    canv.context.closePath();
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
  self.placed = false;

  self.tick = function()
  {
  }

  self.click = function(evt)
  {
    self.placed = true;
  }

  self.draw = function(canv)
  {
    canv.context.lineWidth = 5;
    canv.context.strokeStyle = "#FF0000";
    if(!self.placed && self.x < 0-self.w)
    {
      canv.context.beginPath();
      canv.context.moveTo(10,self.y);
      canv.context.lineTo(20,self.y);
      canv.context.stroke();
      canv.context.closePath();
    }
    else if(!self.placed && self.x > game.stage.drawCanv.canvas.width)
    {
      canv.context.beginPath();
      canv.context.moveTo(game.stage.drawCanv.canvas.width-10,self.y);
      canv.context.lineTo(game.stage.drawCanv.canvas.width-20,self.y);
      canv.context.stroke();
      canv.context.closePath();
    }
    else if(!self.placed && self.y < 0-self.h)
    {
      canv.context.beginPath();
      canv.context.moveTo(self.x,10);
      canv.context.lineTo(self.x,20);
      canv.context.stroke();
      canv.context.closePath();
    }
    else if(!self.placed && self.y > game.stage.drawCanv.canvas.height)
    {
      canv.context.beginPath();
      canv.context.moveTo(self.x,game.stage.drawCanv.canvas.height-10);
      canv.context.lineTo(self.x,game.stage.drawCanv.canvas.height-20);
      canv.context.stroke();
      canv.context.closePath();
    }
    else //in visible range
    {
      canv.context.lineWidth = 1;
      canv.context.drawImage(self.img,self.x,self.y,self.w,self.h);
      if(self.placed) canv.context.strokeStyle = "#00FF00";
      else            canv.context.strokeStyle = "#FF0000";
      canv.context.strokeRect(self.x,self.y,self.w,self.h);
    }
  }

  self.kill = function()
  {
    game.barrels.splice(game.barrels.indexOf(self),1);
    game.ticker.unregister(self);
    game.drawer.unregister(self);
  }
}

