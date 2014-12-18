var WheelScene = function(game, stage)
{
  var self = this;

  var physical_rect    = {x:0,y:0,w:stage.dispCanv.canvas.width,h:stage.dispCanv.canvas.height};
  var theoretical_rect = {x:0,y:0,w:stage.drawCanv.canvas.width,h:stage.drawCanv.canvas.height};
  self.dbugger;
  self.ticker;
  self.flicker;
  self.drawer;
  self.assetter;

  self.box;
  self.door;
  self.squirrels;

  self.ready = function()
  {
    self.dbugger = new Debugger({source:document.getElementById("debug_div")});
    self.ticker = new Ticker({});
    self.flicker = new Flicker({source:stage.dispCanv.canvas,physical_rect:physical_rect,theoretical_rect:theoretical_rect});
    self.drawer = new Drawer({source:stage.drawCanv});
    self.assetter = new Assetter({});

    self.box = new WH_Box(self);
    self.door = new WH_Door(self);
    self.squirrels = [];
    self.squirrels.push(new WH_Squirrel(self));
    self.squirrels.push(new WH_Squirrel(self));
    self.squirrels.push(new WH_Squirrel(self));
    self.squirrels.push(new WH_Squirrel(self));

    self.squirrels[0].w = 30
    self.squirrels[0].h = 50
    self.squirrels[0].x = self.box.x+30
    self.squirrels[0].y = self.box.y+30

    self.squirrels[1].w = 30
    self.squirrels[1].h = 50
    self.squirrels[1].x = self.box.x+self.box.w-self.squirrels[1].w-30
    self.squirrels[1].y = self.box.y+30

    self.squirrels[2].w = 30
    self.squirrels[2].h = 50
    self.squirrels[2].x = self.box.x+self.box.w-self.squirrels[2].w-30
    self.squirrels[2].y = self.box.y+self.box.h-self.squirrels[2].h-30

    self.squirrels[3].w = 30
    self.squirrels[3].h = 50
    self.squirrels[3].x = self.box.x+30
    self.squirrels[3].y = self.box.y+self.box.h-self.squirrels[3].h-30

    self.drawer.register(self.box);
    for(var i = 0; i < 4; i++)
    {
      self.drawer.register(self.squirrels[i]);
      self.ticker.register(self.squirrels[i]);
    }
    self.drawer.register(self.door);
    self.ticker.register(self.door);

    self.nextTask();
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

  self.doorFlicked = function()
  {
    self.nextTask();
  }

  self.squirrelFlicked = function()
  {

  }

  self.task = -1;
  self.nextTask = function()
  {
    self.task++;

    if(self.task == 0)
    {
      self.flicker.register(self.door);
    }
    if(self.task == 1)
    {
      for(var i = 0; i < 4; i++)
        self.flicker.register(self.squirrels[i]);
    }
  }
};

var WH_Box = function(game)
{
  var self = this;

  self.x = 100;
  self.y = 100;
  self.w = 400;
  self.h = 300;

  self.draw = function(canv)
  {
    canv.context.strokeStyle = "#000000";
    canv.context.strokeRect(self.x,self.y,self.w,self.h);
  }
}

var WH_Door = function(game)
{
  var self = this;

  self.flicked = false;

  self.startX = 0;
  self.startY = 0;
  self.vec = {"x":0,"y":0};

  self.x = game.box.x+20;
  self.y = game.box.y+20;
  self.w = game.box.w-40;
  self.h = game.box.h-40;
  self.r = self.w/4;

  self.vx = 0;
  self.vy = 0;

  self.draw = function(canv)
  {
    canv.context.fillStyle = "#000000";
    canv.context.fillRect(self.x,self.y,self.w,self.h);
    canv.context.strokeStyle = "#000000";
    canv.context.strokeRect(self.x,self.y,self.w,self.h);
  }

  self.tick = function()
  {
    if(self.flicked)
    {
      self.x += self.vx;
      self.y += self.vy;
      self.vy += 1;
    }
  }

  self.flickStart = function(evt){ self.startX = evt.doX; self.startY = evt.doY; self.flicked = false; };
  self.flicking   = function(evt){ if(self.flicked) return; self.vec.x = (evt.doX-self.startX); self.vec.y = (evt.doY-self.startY); if(Math.sqrt((self.vec.x*self.vec.x)+(self.vec.y*self.vec.y)) >= self.r) { self.flick(self.vec); self.flicked = true; }};

  self.flick = function(vec)
  {
    console.log('flick');
    self.flicked = true;
    self.vx = vec.x/10;
    self.vy = vec.y/5;
    game.doorFlicked();
  }
}

var WH_Squirrel = function(game)
{
  var self = this;

  self.flicked = false;

  self.startX = 0;
  self.startY = 0;
  self.vec = {"x":0,"y":0};

  self.x = game.box.x+20;
  self.y = game.box.y+20;
  self.w = game.box.w-40;
  self.h = game.box.h-40;
  self.r = self.w/4;

  self.vx = 0;
  self.vy = 0;

  self.draw = function(canv)
  {
    canv.context.fillStyle = "#000000";
    canv.context.fillRect(self.x,self.y,self.w,self.h);
    canv.context.strokeStyle = "#000000";
    canv.context.strokeRect(self.x,self.y,self.w,self.h);
  }

  self.tick = function()
  {
    if(self.flicked)
    {
      self.x += self.vx;
      self.y += self.vy;
      self.vy += 1;
    }
  }

  self.flickStart = function(evt){ self.startX = evt.doX; self.startY = evt.doY; self.flicked = false; };
  self.flicking   = function(evt){ if(self.flicked) return; self.vec.x = (evt.doX-self.startX); self.vec.y = (evt.doY-self.startY); if(Math.sqrt((self.vec.x*self.vec.x)+(self.vec.y*self.vec.y)) >= self.r) { self.flick(self.vec); self.flicked = true; }};

  self.flick = function(vec)
  {
    console.log('flick');
    self.flicked = true;
    self.vx = vec.x/10;
    self.vy = vec.y/5;
    game.squirrelFlicked();
  }
}
