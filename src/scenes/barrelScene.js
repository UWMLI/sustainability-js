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

  self.mapView;

  self.rain; //keep record of it for updating deltas during panning
  self.runoff;
  self.barrels;
  self.map;

  self.numBarrels;
  self.barrelsFound;
  self.totalRunoff;

  self.ready = function()
  {
    self.dbugger = new Debugger({source:document.getElementById("debug_div")});
    self.ticker = new Ticker({});
    self.clicker = new Clicker({source:stage.dispCanv.canvas,physical_rect:physical_rect,theoretical_rect:theoretical_rect});
    self.dragger = new Dragger({source:stage.dispCanv.canvas,physical_rect:physical_rect,theoretical_rect:theoretical_rect});
    self.drawer = new Drawer({source:stage.drawCanv});
    self.particler = new Particler({});
    self.assetter = new Assetter({});

    self.numBarrels = 50;
    self.barrelsFound = 0;
    self.totalRunoff = 0;

    self.mapView = new RB_MapView(self);

    self.rain = [];
    self.runoff = new RB_Runoff(self);

    self.barrels = [];
    var bar = new RB_Barrel(self,0,0); //BS variable because js doesn't have static props
    var randx = function(){ return (Math.random()*((self.mapView.w*2)-bar.w)); }
    var randy = function(){ return (Math.random()*((self.mapView.h*2)-bar.h)); }
    for(var i = 0; i < self.numBarrels; i++)
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

    self.drawer.register(self.mapView); //strategically must place after map, before overlays

    self.ticker.register(self.runoff);
    self.drawer.register(self.runoff);
  };

  var stopGen = false;
  self.tick = function()
  {
    if(!stopGen)
    {
      for(var i = 0; i < 5; i++)
      {
        self.rain.push(new RB_Rain(self));
        self.ticker.register(self.rain[self.rain.length-1]);
        self.drawer.register(self.rain[self.rain.length-1]);
      }
    }
    self.totalRunoff += ((self.numBarrels-self.barrelsFound)/self.numBarrels)*15;
    if(self.totalRunoff > 10000) self.totalRunoff = 10000;
    self.clicker.flush();
    self.dragger.flush();
    self.ticker.flush();
  };

  self.draw = function()
  {
    self.drawer.flush();

    stage.drawCanv.context.font = "30px Georgia";
    stage.drawCanv.context.fillStyle = "#000000";
    stage.drawCanv.context.fillText(self.barrelsFound+"/"+self.barrels.length+" barrels placed",30,30);
  };

  self.cleanup = function()
  {
  };

  self.barrelPlaced = function(barrel)
  {
    self.barrelsFound++;
    self.particler.register(new RB_BarrelParticle(barrel,self));
  }

  self.rainFull = function(drop)
  {
    stopGen = true;
  }
};

var RB_MapView = function(game)
{
  var self = this;
  self.x = 50;
  self.y = 50;
  self.w = game.stage.drawCanv.canvas.width-100;
  self.h = game.stage.drawCanv.canvas.height-400;

  self.draw = function(canv)
  {
    canv.context.fillStyle = "#FFFFFF";
    canv.context.fillRect(0,0,game.stage.drawCanv.canvas.width,self.y);
    canv.context.fillRect(0,0,self.x,game.stage.drawCanv.canvas.height);
    canv.context.fillRect(0,self.y+self.h,game.stage.drawCanv.canvas.width,(game.stage.drawCanv.canvas.height-self.h)-self.y);
    canv.context.fillRect(self.x+self.w,0,(game.stage.drawCanv.canvas.width-self.w)-self.x,game.stage.drawCanv.canvas.height);
    canv.context.strokeStyle = "#000000";
    canv.context.strokeRect(self.x,self.y,self.w,self.h);
  }
}

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
  self.w = game.mapView.w*2;
  self.h = game.mapView.h*2;

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
    if(self.x + self.deltaX > game.mapView.x)                         self.deltaX = game.mapView.x-self.x;
    if(self.x + self.deltaX < game.mapView.x-(self.w-game.mapView.w)) self.deltaX = game.mapView.x-(self.w-game.mapView.w)-self.x;
    if(self.y + self.deltaY > game.mapView.y)                         self.deltaY = game.mapView.y-self.y;
    if(self.y + self.deltaY < game.mapView.y-(self.h-game.mapView.h)) self.deltaY = game.mapView.y-(self.h-game.mapView.h)-self.y;
    self.x += self.deltaX;
    self.y += self.deltaY;
    for(var i = 0; i < game.barrels.length; i++)
    {
      game.barrels[i].x += self.deltaX;
      game.barrels[i].y += self.deltaY;
    }
    for(var i = 0; i < game.rain.length; i++)
    {
      game.rain[i].x += self.deltaX;
      game.rain[i].y += self.deltaY;
    }
  };
  self.dragFinish = function()
  {
  };
  self.draw = function(canv)
  {
  }
}

var RB_Rain = function(game)
{
  var self = this;

  self.refresh = function()
  {
    self.dx = 2;
    self.dy = 10;
    self.x = (Math.random()*game.mapView.w)+game.mapView.x;
    self.y = game.mapView.y-10+Math.random();
    self.r = (Math.random()/2)+1;
    self.dx *= self.r;
    self.dy *= self.r;
  }
  self.refresh();

  self.tick = function()
  {
    self.x += self.dx;
    self.y += self.dy;

    if(self.y > game.mapView.y+game.mapView.h)    game.rainFull(self);
    while(self.x < game.mapView.x)                self.x += game.mapView.w;
    while(self.x > game.mapView.x+game.mapView.w) self.x -= game.mapView.w;
    while(self.y < game.mapView.y)                self.y += game.mapView.h;
    while(self.y > game.mapView.y+game.mapView.h) self.y -= game.mapView.h;

    return true; //never expire (just auto-loop)
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

var RB_Runoff = function(game)
{
  var self = this;
  self.stream_w = 1; //calculated on tick
  self.stream_h = 100;
  self.stream_max_w = 100;
  self.pool_w = 500;
  self.pool_h = 1; //calculated on tick
  self.pool_max_h = 230;
  self.draw = function(canv)
  {
    canv.context.fillStyle = "#0000FF";
    canv.context.fillRect(canv.canvas.width/2-self.stream_w/2,game.mapView.y+game.mapView.h,self.stream_w,self.stream_h+self.pool_max_h);
    canv.context.fillRect(canv.canvas.width/2-self.pool_w/2,game.mapView.y+game.mapView.h+self.stream_h+(self.pool_max_h-self.pool_h),self.pool_w,self.pool_h);
    canv.context.strokeStyle = "#000000";
    canv.context.strokeRect(0,game.mapView.y+game.mapView.h+self.stream_h,canv.canvas.width,1);
  }

  self.tick = function()
  {
    self.stream_w = ((game.numBarrels-game.barrelsFound)/game.numBarrels)*self.stream_max_w;
    self.pool_h = (game.totalRunoff/10000)*self.pool_max_h;
  }
}

var RB_Barrel = function(game, args)
{
  var self = this;

  self.x = args.x ? args.x : 0;
  self.y = args.y ? args.y : 0;
  self.w = 100;
  self.h = 100;

  self.img = game.assetter.asset("man.png");
  self.placed = false;

  self.tick = function()
  {
  }

  self.click = function(evt)
  {
    if(!self.placed)
    {
      self.placed = true;
      game.barrelPlaced(self);
    }
  }

  self.draw = function(canv)
  {
    canv.context.lineWidth = 5;
    canv.context.strokeStyle = "#FF0000";
    if(!self.placed && self.x < game.mapView.x-self.w)
    {
      canv.context.beginPath();
      canv.context.moveTo(game.mapView.x+10,self.y);
      canv.context.lineTo(game.mapView.x+20,self.y);
      canv.context.stroke();
      canv.context.closePath();
    }
    else if(!self.placed && self.x > game.mapView.x+game.mapView.w)
    {
      canv.context.beginPath();
      canv.context.moveTo(game.mapView.x+game.mapView.w-10,self.y);
      canv.context.lineTo(game.mapView.x+game.mapView.w-20,self.y);
      canv.context.stroke();
      canv.context.closePath();
    }
    else if(!self.placed && self.y < game.mapView.y-self.h)
    {
      canv.context.beginPath();
      canv.context.moveTo(self.x,game.mapView.y+10);
      canv.context.lineTo(self.x,game.mapView.y+20);
      canv.context.stroke();
      canv.context.closePath();
    }
    else if(!self.placed && self.y > game.mapView.y+game.mapView.h)
    {
      canv.context.beginPath();
      canv.context.moveTo(self.x,game.mapView.y+game.mapView.h-10);
      canv.context.lineTo(self.x,game.mapView.y+game.mapView.h-20);
      canv.context.stroke();
      canv.context.closePath();
    }
    else //in visible range
    {
      canv.context.drawImage(self.img,self.x+self.w/4,self.y+self.h/4,self.w/2,self.h/2);
      if(self.placed) canv.context.strokeStyle = "#00FF00";
      else            canv.context.strokeStyle = "#FF0000";
      canv.context.strokeRect(self.x+self.w/4,self.y+self.h/4,self.w/2,self.h/2);
    }
  }

  self.kill = function()
  {
    game.barrels.splice(game.barrels.indexOf(self),1);
    game.ticker.unregister(self);
    game.drawer.unregister(self);
  }
}

var RB_BarrelParticle = function(barrel,game)
{
  var self = this;

  self.sy = 0;
  self.y = 0;
  self.ey = -20;

  self.t = 0;

  self.text = Math.floor(Math.random()*14);
       if(self.text == 0) self.text = "cool!";
  else if(self.text == 1) self.text = "great!";
  else if(self.text == 2) self.text = "fantastic!";
  else if(self.text == 3) self.text = "word!";
  else if(self.text == 4) self.text = "rad!";
  else if(self.text == 5) self.text = "sweet!";
  else if(self.text == 6) self.text = "noice!";
  else if(self.text == 7) self.text = "swell!";
  else if(self.text == 8) self.text = "the bee's knees!";
  else if(self.text == 9) self.text = "excellent!";
  else if(self.text == 10) self.text = "pleasant!";
  else if(self.text == 11) self.text = "good!";
  else if(self.text == 12) self.text = "wow!";
  else if(self.text == 13) self.text = "acceptable!";

  self.tick = function()
  {
    self.t += 0.01;
    self.y = self.y+(self.ey-self.y)/50;
    return self.t < 1;
  }

  self.draw = function(canv)
  {
    canv.context.globalAlpha = 1-(self.t*self.t*self.t);
    canv.context.font = "30px Georgia";
    canv.context.fillStyle = "#000000";
    canv.context.fillText(self.text,barrel.x+5,barrel.y+self.y+10);
    canv.context.globalAlpha = 1.0;
  }
}


