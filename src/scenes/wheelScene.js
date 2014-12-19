var WheelScene = function(game, stage)
{
  var self = this;

  var physical_rect    = {x:0,y:0,w:stage.dispCanv.canvas.width,h:stage.dispCanv.canvas.height};
  var theoretical_rect = {x:0,y:0,w:stage.drawCanv.canvas.width,h:stage.drawCanv.canvas.height};
  self.dbugger;
  self.ticker;
  self.flicker;
  self.presser;
  self.dragger;
  self.drawer;
  self.assetter;

  self.box;
  self.door;
  self.squirrels; self.numSquirrels; self.squirrelsFlicked;
  self.nests;     self.numNests;     self.nestsFlicked;
  self.wheel;

  self.ready = function()
  {
    self.dbugger = new Debugger({source:document.getElementById("debug_div")});
    self.ticker = new Ticker({});
    self.flicker = new Flicker({source:stage.dispCanv.canvas,physical_rect:physical_rect,theoretical_rect:theoretical_rect});
    self.presser = new Presser({source:stage.dispCanv.canvas,physical_rect:physical_rect,theoretical_rect:theoretical_rect});
    self.dragger = new Dragger({source:stage.dispCanv.canvas,physical_rect:physical_rect,theoretical_rect:theoretical_rect});
    self.drawer = new Drawer({source:stage.drawCanv});
    self.assetter = new Assetter({});

    self.box = new WH_Box(self);
    self.wheel = new WH_Wheel(self);

    var l = self.box.x;
    var r = self.box.x+self.box.w;
    var t = self.box.y;
    var b = self.box.y+self.box.h;

    self.squirrels = []; self.numSquirrels = 4; self.squirrelsFlicked = 0;
    for(var i = 0; i < self.numSquirrels; i++)
      self.squirrels.push(new WH_Squirrel(self));

    self.squirrels[0].x = l+30;
    self.squirrels[0].y = t+30;

    self.squirrels[1].x = r-self.squirrels[1].w-30;
    self.squirrels[1].y = t+30;

    self.squirrels[2].x = r-self.squirrels[2].w-30;
    self.squirrels[2].y = b-self.squirrels[2].h-30;

    self.squirrels[3].x = l+30;
    self.squirrels[3].y = b-self.squirrels[3].h-30;

    self.nests = []; self.numNests = 64; self.nestsFlicked = 0;
    for(var i = 0; i < self.numNests; i++)
      self.nests.push(new WH_Nest(self));

    self.templateNests = [];
    self.templateNests[0] = new WH_Nest(self);
    self.templateNests[0].x = l+30;
    self.templateNests[0].y = t+30;

    self.templateNests[1] = new WH_Nest(self);
    self.templateNests[1].x = r-self.templateNests[1].w-30;
    self.templateNests[1].y = t+30;

    self.templateNests[2] = new WH_Nest(self);
    self.templateNests[2].x = r-self.templateNests[2].w-30;
    self.templateNests[2].y = b-self.templateNests[2].h-30;

    self.templateNests[3] = new WH_Nest(self);
    self.templateNests[3].x = l+30;
    self.templateNests[3].y = b-self.templateNests[3].h-30;

    for(var i = 0; i < 4; i++)
    {
      for(var j = 0; j < self.numNests/4; j++)
      {
        self.nests[(i*self.numNests/4)+j].x = self.templateNests[i].x+((Math.random()*2)-1)*40;
        self.nests[(i*self.numNests/4)+j].y = self.templateNests[i].y+((Math.random()*2)-1)*10;
      }
    }

    self.door = new WH_Door(self);

    self.drawer.register(self.box);
    self.drawer.register(self.wheel);
    for(var i = 0; i < self.numNests; i++)
    {
      self.drawer.register(self.nests[i]);
      self.ticker.register(self.nests[i]);
    }
    for(var i = 0; i < self.numSquirrels; i++)
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
    self.presser.flush();
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

  self.doorFlicked = function()
  {
    self.nextTask();
  }

  self.squirrelFlicked = function()
  {
    self.squirrelsFlicked++;
    if(self.squirrelsFlicked >= self.numSquirrels)
      self.nextTask();
  }

  self.nestFlicked = function()
  {
    self.nestsFlicked++;
    if(self.nestsFlicked >= self.numNests)
      self.nextTask();
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
      for(var i = 0; i < self.numSquirrels; i++)
        self.flicker.register(self.squirrels[i]);
    }
    if(self.task == 2)
    {
      for(var i = 0; i < self.numNests; i++)
        self.presser.register(self.nests[i]);
    }
    if(self.task == 3)
    {
      self.dragger.register(self.wheel);
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
  self.w = 30;
  self.h = 50;
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
    self.flicked = true;
    self.vx = vec.x/10;
    self.vy = vec.y/5-10;
    game.squirrelFlicked();
  }
}

var WH_Nest = function(game)
{
  var self = this;

  self.flicked = false;

  self.x = game.box.x+20;
  self.y = game.box.y+20;
  self.w = 20;
  self.h = 20;

  self.offsx = ((Math.random()*2)-1)*5;
  self.offsy = ((Math.random()*2)-1)*5;
  self.offex = ((Math.random()*2)-1)*5;
  self.offey = ((Math.random()*2)-1)*5;

  self.vx = 0;
  self.vy = 0;

  self.draw = function(canv)
  {
    canv.context.lineWidth = 2;
    canv.context.strokeStyle = "#773311";
    canv.context.beginPath();
    canv.context.moveTo(self.x+self.offsx,self.y+self.h/2+self.offsy);
    canv.context.lineTo(self.x+self.w+self.offex,self.y+self.h/2+self.offey);
    canv.context.stroke();
    canv.context.closePath();
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

  self.press = function(evt)
  {
    self.flicked = true;
    self.vx = ((Math.random()*2)-1)*20;
    self.vy = Math.random()*-20;
    game.nestFlicked();
  }
  self.unpress = function(evt)
  {

  }
}

var WH_Wheel = function(game)
{
  var self = this;

  self.offX = 0;
  self.offY = 0;
  self.deltaX = 0;
  self.deltaY = 0;

  self.x = game.box.x+20;
  self.y = game.box.y+20;
  self.w = game.box.w-40;
  self.h = game.box.h-40;

  self.draw = function(canv)
  {
    canv.context.lineWidth = 2;
    canv.context.strokeStyle = "#000000";
    canv.context.beginPath();
    canv.context.arc(self.x+self.w/2, self.y+self.h/2, (game.box.h-40)/2, 0, Math.PI*2, true); 
    canv.context.stroke();
    canv.context.closePath();
  }

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
    self.x += self.deltaX;
    self.y += self.deltaY;
  };
  self.dragFinish = function()
  {
  };
}
