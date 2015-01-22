var BarrelScene = function(game, stage)
{
  var self = this;
  self.stage = stage;

  //try to inject as much intro stuff as possible here
  self.viewing = 0; //0- intro, 1- gameplay, 2- outro

  self.intro_vid_src = "assets/barrel_intro.mp4";
  self.intro_vid_stamps = [];
  self.outro_vid_src = "assets/barrel_win.mp4";
  self.outro_vid_stamps = [];

  self.beginGame = function()
  {
    self.viewing = 1;
    self.clicker.unregister(self.beginButton);

    // register all gameplay stuff
    for(var i = 0; i < self.barrels.length; i++)
      self.clicker.register(self.barrels[i]);
    self.dragger.register(self.map);
    self.ticker.register(self.runoff);
    // end register
  }

  self.retryGame = function()
  {
    self.viewing = 1;
    self.clicker.unregister(self.retryButton);

    for(var i = 0; i < self.barrels.length; i++)
      self.barrels[i].placed = false;
    self.totalRunoff = 0;
    self.barrelsFound = 0;
  }

  self.endGame = function()
  {
    self.viewing = 3;
    game.playVid(self.outro_vid_src, self.outro_vid_stamps, function(){game.setScene(MainScene);});
  }

  self.beginButton = self.beginButton = new Clickable( { "x":0, "y":0, "w":stage.drawCanv.canvas.width, "h":stage.drawCanv.canvas.height, "click":self.beginGame });
  self.retryButton = self.retryButton = new Clickable( { "x":0, "y":0, "w":stage.drawCanv.canvas.width, "h":stage.drawCanv.canvas.height, "click":self.retryGame });

  //end intro stuff

  var physical_rect    = {x:0,y:0,w:stage.dispCanv.canvas.width,h:stage.dispCanv.canvas.height};
  var theoretical_rect = {x:0,y:0,w:stage.drawCanv.canvas.width,h:stage.drawCanv.canvas.height};
  self.dbugger;
  self.ticker;
  self.clicker;
  self.dragger;
  self.drawer;
  self.particler;
  self.assetter;

  self.mapBorder;
  self.mapPipe;

  self.rain; //keep record of it for updating deltas during panning
  self.runoff;
  self.barrels;
  self.map;

  self.barrelsFound;
  self.totalRunoff;
  self.maxRunoff;

  self.ready = function()
  {
    self.dbugger = new Debugger({source:document.getElementById("debug_div")});
    self.ticker = new Ticker({});
    self.clicker = new Clicker({source:stage.dispCanv.canvas,physical_rect:physical_rect,theoretical_rect:theoretical_rect});
    self.dragger = new Dragger({source:stage.dispCanv.canvas,physical_rect:physical_rect,theoretical_rect:theoretical_rect});
    self.drawer = new Drawer({source:stage.drawCanv});
    self.particler = new Particler({});
    self.assetter = new Assetter({});

    //self.clicker.register(new RB_PlaceLogger(self));

    self.barrelsFound = 0;
    self.totalRunoff = 0;
    self.maxRunoff = 300;

    self.mapBorder = new RB_MapBorder(self);
    self.mapPipe   = new RB_MapPipe(self);
    self.map = new RB_Map(self);
    self.runoff = new RB_Runoff(self);

    self.rain = [];
    self.barrels = [];

    /*
    //for randomly placed barrels
    var bar = new RB_Barrel(self,0,0); //BS variable because js doesn't have static props
    var randx = function(){ return (Math.random()*((self.map.w)-bar.w))+self.mapBorder.insetX; }
    var randy = function(){ return (Math.random()*((self.map.h)-bar.h))+self.mapBorder.insetY; }
    for(var i = 0; i < 50; i++)
      self.barrels.push(new RB_Barrel(self,{"x":randx(),"y":randy()}));
    */
    var barxs = [ 98,224,130, 40,-16,246,376,508,640,768,899,813,865,581,449,313,449,579,709,781,643,373,631,499,233,104, 54];
    var barys = [ 38,104,254,392,518,516,584,642,706,774,840,544,432,434,368,294,204,272,338,118, 52,730,862,794,662,600,840];
    for(var i = 0; i < barxs.length; i++)
      self.barrels.push(new RB_Barrel(self,{"x":barxs[i]+30,"y":barys[i]+30}));

    self.drawer.register(self.map);

    for(var i = 0; i < self.barrels.length; i++)
      self.drawer.register(self.barrels[i]);

    self.drawer.register(self.particler);
    self.ticker.register(self.particler);
    self.drawer.register(self.mapBorder);

    self.drawer.register(self.runoff);

    self.drawer.register(self.mapPipe);

    game.playVid(self.intro_vid_src, self.intro_vid_stamps, function(){self.clicker.register(self.beginButton)});
  };

  var stopGen = false;
  var tryingretry = false;
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
    if(self.totalRunoff < self.maxRunoff)
      self.totalRunoff += (self.barrels.length-self.barrelsFound)/self.barrels.length;
    else if(self.totalRunoff >= self.maxRunoff && self.viewing != 2)
    {
      self.totalRunoff = self.maxRunoff;
      self.viewing = 2;
      setTimeout(function(){ self.clicker.register(self.retryButton); },1000);
    }
    self.clicker.flush();
    self.dragger.flush();
    self.ticker.flush();
  };

  self.draw = function()
  {
    self.drawer.flush();

    stage.drawCanv.context.font = "30px comic_font";
    stage.drawCanv.context.fillStyle = "#000000";
    stage.drawCanv.context.fillText(self.barrelsFound+"/"+self.barrels.length+" barrels placed",50-3,685-3);
    stage.drawCanv.context.fillText(self.barrelsFound+"/"+self.barrels.length+" barrels placed",50+3,685-3);
    stage.drawCanv.context.fillText(self.barrelsFound+"/"+self.barrels.length+" barrels placed",50-3,685+3);
    stage.drawCanv.context.fillText(self.barrelsFound+"/"+self.barrels.length+" barrels placed",50+3,685+3);
    stage.drawCanv.context.fillStyle = "#FFFFFF";
    stage.drawCanv.context.fillText(self.barrelsFound+"/"+self.barrels.length+" barrels placed",50,685);

    if(self.viewing == 0)
    {
      self.stage.drawCanv.context.fillStyle = "rgba(0,0,0,0.8)";
      self.stage.drawCanv.context.fillRect(0,0,self.stage.drawCanv.canvas.width,self.stage.drawCanv.canvas.height);
      self.stage.drawCanv.context.fillStyle = "#FFFFFF";
      self.stage.drawCanv.context.font = "30px comic_font";
      self.stage.drawCanv.context.fillText("Tap to install barrels before",50,300);
      self.stage.drawCanv.context.fillText("the holding tank overflows!  ",50,340);
      self.stage.drawCanv.context.fillText("(Touch Anywhere to Begin)",self.stage.drawCanv.canvas.width-480,self.stage.drawCanv.canvas.height-30);
    }

    if(self.viewing == 2)
    {
      self.stage.drawCanv.context.fillStyle = "rgba(0,0,0,0.8)";
      self.stage.drawCanv.context.fillRect(0,0,self.stage.drawCanv.canvas.width,self.stage.drawCanv.canvas.height);
      self.stage.drawCanv.context.fillStyle = "#FFFFFF";
      self.stage.drawCanv.context.font = "30px comic_font";
      self.stage.drawCanv.context.fillText("The holding tank overflowed  ",50,300);
      self.stage.drawCanv.context.fillText("and the algae monster        ",50,340);
      self.stage.drawCanv.context.fillText("escaped!                     ",50,380);
      self.stage.drawCanv.context.fillText("Tap to install barrels before",50,440);
      self.stage.drawCanv.context.fillText("the holding tank overflows!  ",50,480);
      self.stage.drawCanv.context.fillText("(Touch Anywhere to Begin)",self.stage.drawCanv.canvas.width-480,self.stage.drawCanv.canvas.height-30);
    }
  };

  self.cleanup = function()
  {
    self.dbugger.clear();
    self.ticker.clear();
    self.clicker.clear();
    self.dragger.clear();
    self.drawer.clear();
    self.particler.clear();
    self.assetter.clear();

    self.dbugger.detach();
    self.ticker.detach();
    self.clicker.detach();
    self.dragger.detach();
    self.drawer.detach();
    self.particler.detach();
    self.assetter.detach();
  };

  self.barrelPlaced = function(barrel)
  {
    self.barrelsFound++;
    self.particler.register(new RB_BarrelParticle(barrel,self));
    if(self.barrelsFound >= self.barrels.length) setTimeout(self.endGame,1000);
  }

  self.rainFull = function(drop)
  {
    stopGen = true;
  }
};

var RB_PlaceLogger = function(game)
{
  var self = this;

  self.x = 0;
  self.y = 0;
  self.w = game.stage.drawCanv.canvas.width;
  self.h = game.stage.drawCanv.canvas.height;

  self.click = function(evt)
  {
    var x = (evt.doX-game.map.x)-50;
    var y = (evt.doY-game.map.y)-50;
    game.barrels.push(new RB_Barrel(game,{"x":evt.doX-50,"y":evt.doY-50}));
    game.drawer.register(game.barrels[game.barrels.length-1]);
    console.log(x+","+y);
  }
}

var RB_MapBorder = function(game)
{
  var self = this;
  self.x = 0;
  self.y = 0;
  self.w = game.stage.drawCanv.canvas.width;
  self.h = game.stage.drawCanv.canvas.height;

  self.insetX = 32;
  self.insetY = 30;
  self.insetW = game.stage.drawCanv.canvas.width-67;
  self.insetH = game.stage.drawCanv.canvas.width+48;

  self.img_0 = game.assetter.asset("barrel_border_0.png");

  self.draw = function(canv)
  {
    canv.context.drawImage(self.img_0,self.x,self.y,self.w,self.h);
  }
}

var RB_MapPipe = function(game)
{
  var self = this;
  self.x = 0;
  self.y = 0;
  self.w = game.stage.drawCanv.canvas.width;
  self.h = game.stage.drawCanv.canvas.height;

  self.img_1 = game.assetter.asset("barrel_border_1.png");

  self.draw = function(canv)
  {
    canv.context.drawImage(self.img_1,self.x,self.y,self.w,self.h-220);
  }
}

var RB_Map = function(game)
{
  var self = this;

  //nice in smooth dragging
  self.offX = 0;
  self.offY = 0;
  self.deltaX = 0;
  self.deltaY = 0;

  self.x = 30;
  self.y = 30;
  self.w = 1008;
  self.h = 1008;

  self.map_img = game.assetter.asset("barrel_map.png");
  self.road_img = game.assetter.asset("barrel_road.png");

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
    if(self.x + self.deltaX > game.mapBorder.insetX)                                self.deltaX = game.mapBorder.insetX-self.x;
    if(self.x + self.deltaX < game.mapBorder.insetX-(self.w-game.mapBorder.insetW)) self.deltaX = game.mapBorder.insetX-(self.w-game.mapBorder.insetW)-self.x;
    if(self.y + self.deltaY > game.mapBorder.insetY)                                self.deltaY = game.mapBorder.insetY-self.y;
    if(self.y + self.deltaY < game.mapBorder.insetY-(self.h-game.mapBorder.insetH)) self.deltaY = game.mapBorder.insetY-(self.h-game.mapBorder.insetH)-self.y;
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
      canv.context.drawImage(self.road_img,self.x,self.y,self.w,self.h);
      canv.context.drawImage(self.map_img,self.x,self.y,self.w,self.h);
  }
}

var RB_Rain = function(game)
{
  var self = this;

  self.refresh = function()
  {
    self.dx = 2;
    self.dy = 10;
    self.x = (Math.random()*game.mapBorder.w)+game.mapBorder.x;
    self.y = game.mapBorder.y-10+Math.random();
    self.r = (Math.random()/2)+1;
    self.dx *= self.r;
    self.dy *= self.r;
  }
  self.refresh();

  self.tick = function()
  {
    self.x += self.dx;
    self.y += self.dy;

    if(self.y > game.mapBorder.y+game.mapBorder.h)    game.rainFull(self);
    while(self.x < game.mapBorder.x)                  self.x += game.mapBorder.w;
    while(self.x > game.mapBorder.x+game.mapBorder.w) self.x -= game.mapBorder.w;
    while(self.y < game.mapBorder.y)                  self.y += game.mapBorder.h;
    while(self.y > game.mapBorder.y+game.mapBorder.h) self.y -= game.mapBorder.h;

    return true; //never expire (just auto-loop)
  }

  self.draw = function(canv)
  {
    canv.context.lineWidth = 2;
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
  self.stream_h = 200;
  self.stream_max_w = 45;
  self.pool_w = game.stage.drawCanv.canvas.width-50;
  self.pool_h = 140;
  self.min_pool_y = game.stage.drawCanv.canvas.height-190;
  self.max_pool_y = game.stage.drawCanv.canvas.height-80;
  self.pool_y = self.max_pool_y; //calculated on tick

  self.stream_img = game.assetter.asset("barrel_stream.png");
  self.pool_img   = game.assetter.asset("barrel_pool.png");
  self.fg_img     = game.assetter.asset("barrel_fg.png");
  self.monster_img   = game.assetter.asset("barrel_monster.png");
  var runoffPulse = 0;
  self.draw = function(canv)
  {
    if(self.stream_w > 0)
    {
      runoffPulse+=0.2;
      canv.context.fillStyle = "rgba(255,255,255,"+((Math.sin(runoffPulse)+1)/2)+")";
      canv.context.fillRect(0,self.max_pool_y-60,self.pool_w-100,self.pool_h);
    }

    //clipping
    canv.context.save();
    canv.context.beginPath();
    canv.context.moveTo(                0, game.mapBorder.insetY+game.mapBorder.insetH+50);
    canv.context.lineTo(canv.canvas.width, game.mapBorder.insetY+game.mapBorder.insetH+50);
    canv.context.lineTo(canv.canvas.width, canv.canvas.height                            );
    canv.context.lineTo(                0, canv.canvas.height                            );
    canv.context.closePath();
    canv.context.clip();
    canv.context.drawImage(self.stream_img, 100+(self.stream_max_w/2)-(self.stream_w/2), game.mapBorder.insetY+game.mapBorder.insetH+50+self.t%self.stream_h-self.stream_h,self.stream_w,self.stream_h);
    canv.context.drawImage(self.stream_img, 100+(self.stream_max_w/2)-(self.stream_w/2), game.mapBorder.insetY+game.mapBorder.insetH+50+self.t%self.stream_h,              self.stream_w,self.stream_h);
    canv.context.restore();

    canv.context.drawImage(self.pool_img,      0,    self.pool_y, self.pool_w, self.pool_h);
    canv.context.drawImage(self.monster_img, 200, self.pool_y-20,         300,         75);
    canv.context.drawImage(self.fg_img, 0, canv.canvas.height-190, canv.canvas.width, 190);
  }

  self.t = 0;
  self.tick = function()
  {
    self.t+=20;
    self.stream_w = ((game.barrels.length-game.barrelsFound)/game.barrels.length)*self.stream_max_w;
    self.pool_y = self.max_pool_y-((self.max_pool_y-self.min_pool_y)*(game.totalRunoff/game.maxRunoff));
  }
}

var RB_Barrel = function(game, args)
{
  var self = this;

  self.x = args.x ? args.x : 0;
  self.y = args.y ? args.y : 0;
  self.w = 100;
  self.h = 100;

  self.img_mark = game.assetter.asset("barrel_marker.png");
  self.img_placed = game.assetter.asset("barrel_barrel.png");
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
    if(self.placed)
    {
      canv.context.drawImage(self.img_placed,self.x+self.w/4,self.y+self.h/4,self.w/2,self.h/2);
    }
    else
    {
      canv.context.drawImage(self.img_mark,  self.x+self.w/4,self.y+self.h/4,self.w/2,self.h/2);
      canv.context.drawImage(self.img_mark,  self.x+self.w/4,self.y+self.h/4,self.w/2,self.h/2);
      canv.context.drawImage(self.img_mark,  self.x+self.w/4,self.y+self.h/4,self.w/2,self.h/2);
      canv.context.drawImage(self.img_mark,  self.x+self.w/4,self.y+self.h/4,self.w/2,self.h/2);
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
    canv.context.font = "30px comic_font";
    canv.context.fillStyle = "#000000";
    canv.context.fillText(self.text,barrel.x+50-52,barrel.y+self.y+10+2);
    canv.context.fillText(self.text,barrel.x+50-48,barrel.y+self.y+10-2);
    canv.context.fillText(self.text,barrel.x+50-48,barrel.y+self.y+10+2);
    canv.context.fillText(self.text,barrel.x+50-52,barrel.y+self.y+10-2);
    canv.context.fillStyle = "#FFFFFF";
    canv.context.fillText(self.text,barrel.x+50-50,barrel.y+self.y+10);
    canv.context.globalAlpha = 1.0;
  }
}


