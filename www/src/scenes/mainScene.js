var MainSceneOutroPlayed = false;
var MainScene = function(game, stage)
{
  var self = this;
  self.stage = stage;

  self.outro_vid_src = "assets/game_win.mp4";
  self.outro_vid_stamps = [];

  self.audio_src = "assets/game_music.mp3";

  var physical_rect    = {x:0,y:0,w:stage.dispCanv.canvas.width,h:stage.dispCanv.canvas.height};
  var theoretical_rect = {x:0,y:0,w:stage.drawCanv.canvas.width,h:stage.drawCanv.canvas.height};
  self.dbugger;
  self.ticker;
  self.clicker;
  self.dragger;
  self.drawer;
  self.particler;
  self.assetter;

  self.audio;

  self.map;

  self.bikeBtn;
  self.windowBtn;
  self.bulbBtn;
  self.sweaterBtn;
  self.barrelBtn;
  self.pavementBtn;
  self.wheelBtn;

  self.ready = function()
  {
    self.dbugger = new Debugger({source:document.getElementById("debug_div")});
    self.ticker = new Ticker({});
    self.clicker = new Clicker({source:stage.dispCanv.canvas,physical_rect:physical_rect,theoretical_rect:theoretical_rect});
    self.dragger = new Dragger({source:stage.dispCanv.canvas,physical_rect:physical_rect,theoretical_rect:theoretical_rect});
    self.drawer = new Drawer({source:stage.drawCanv});
    self.particler = new Particler({});
    self.assetter = new Assetter({});

    self.audio = new Aud(self.audio_src);
    self.audio.load();

    self.map         = new MA_Map(self);                                                                  self.drawer.register(self.map);         self.dragger.register(self.map)
    var hw = 50;
    var hh = 50;
    self.bikeBtn     = new MA_Button(self.map.w*(3/4)-hw,self.map.h*(3/4)-hh,100,100,"bike",self);     self.drawer.register(self.bikeBtn);     self.clicker.register(self.bikeBtn);
    self.windowBtn   = new MA_Button(self.map.w*(1/4)-hw,self.map.h*(3/8)-hh,100,100,"window",self);   self.drawer.register(self.windowBtn);   self.clicker.register(self.windowBtn);
    self.bulbBtn     = new MA_Button(self.map.w*(3/8)-hw,self.map.h*(3/4)-hh,100,100,"bulb",self);     self.drawer.register(self.bulbBtn);     self.clicker.register(self.bulbBtn);
    self.sweaterBtn  = new MA_Button(self.map.w*(1/8)-hw,self.map.h*(1/8)-hh,100,100,"sweater",self);  self.drawer.register(self.sweaterBtn);  self.clicker.register(self.sweaterBtn);
    self.barrelBtn   = new MA_Button(self.map.w*(1/8)-hw,self.map.h*(3/4)-hh,100,100,"barrel",self);   self.drawer.register(self.barrelBtn);   self.clicker.register(self.barrelBtn);
    self.pavementBtn = new MA_Button(self.map.w*(7/8)-hw,self.map.h*(5/8)-hh,100,100,"pavement",self); self.drawer.register(self.pavementBtn); self.clicker.register(self.pavementBtn);
    self.wheelBtn    = new MA_Button(self.map.w*(3/8)-hw,self.map.h*(5/8)-hh,100,100,"wheel",self);    self.drawer.register(self.wheelBtn);    self.clicker.register(self.wheelBtn);

    var play = true;
    for(var i = 0; i < game_meta.length; i++)
      play = (play && game_meta[i].complete);
    if(play && !MainSceneOutroPlayed)
    {
      MainSceneOutroPlayed = true;
      setTimeout(function() { game.playVid(self.outro_vid_src, self.outro_vid_stamps, function(){self.audio.play();});},1000);
    }
    else
      self.audio.play();
  };

  self.tick = function()
  {
    self.clicker.flush();
    self.ticker.flush();
    self.dragger.flush();
  };

  self.draw = function()
  {
    self.drawer.flush();
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

  self.buttonClicked = function(btn)
  {
    self.audio.stop();
    if(btn == self.bikeBtn)     game.setScene(BikeScene);
    if(btn == self.windowBtn)   game.setScene(WindowScene);
    if(btn == self.bulbBtn)     game.setScene(BulbScene);
    if(btn == self.sweaterBtn)  game.setScene(SweaterScene);
    if(btn == self.barrelBtn)   game.setScene(BarrelScene);
    if(btn == self.pavementBtn) game.setScene(PavementScene);
    if(btn == self.wheelBtn)    game.setScene(WheelScene);
  }
};

var MA_Map = function(game)
{
  var self = this;

  //nice in smooth dragging
  self.offX = 0;
  self.offY = 0;
  self.deltaX = 0;
  self.deltaY = 0;
  self.x = 0;
  self.y = 0;
  self.w = game.stage.drawCanv.canvas.width*3;
  self.h = game.stage.drawCanv.canvas.height*1.5;

  self.img = game.assetter.asset("overworld_map.png")

  var boundx = 0;
  var boundy = 0;
  var boundw = game.stage.drawCanv.canvas.width;
  var boundh = game.stage.drawCanv.canvas.height;

  self.dragStart = function(evt)
  {
    self.offX = self.x+(self.w/2)-evt.doX;
    self.offY = self.y+(self.h/2)-evt.doY;
  };
  self.drag = function(evt)
  {
    self.deltaX = (evt.doX-(self.w/2)+self.offX)-self.x;
    self.deltaY = (evt.doY-(self.h/2)+self.offY)-self.y;
    if(self.x + self.deltaX > boundx)                 self.deltaX = boundx-self.x;
    if(self.x + self.deltaX < boundx-(self.w-boundw)) self.deltaX = boundx-(self.w-boundw)-self.x;
    if(self.y + self.deltaY > boundy)                 self.deltaY = boundy-self.y;
    if(self.y + self.deltaY < boundy-(self.h-boundh)) self.deltaY = boundy-(self.h-boundh)-self.y;
    self.x += self.deltaX;
    self.y += self.deltaY;

    game.bikeBtn.x += self.deltaX;
    game.bikeBtn.y += self.deltaY;
    game.windowBtn.x += self.deltaX;
    game.windowBtn.y += self.deltaY;
    game.bulbBtn.x += self.deltaX;
    game.bulbBtn.y += self.deltaY;
    game.sweaterBtn.x += self.deltaX;
    game.sweaterBtn.y += self.deltaY;
    game.barrelBtn.x += self.deltaX;
    game.barrelBtn.y += self.deltaY;
    game.pavementBtn.x += self.deltaX;
    game.pavementBtn.y += self.deltaY;
    game.wheelBtn.x += self.deltaX;
    game.wheelBtn.y += self.deltaY;
  };
  self.dragFinish = function()
  {
  };
  self.draw = function(canv)
  {
    canv.context.drawImage(self.img,self.x,self.y,self.w,self.h);
  }
}

var MA_Button = function(x,y,w,h,name,game)
{
  var self = this;
  self.x = x;
  self.y = y;
  self.w = w;
  self.h = h;
  self.name = name;
  self.img = game.assetter.asset("overworld_"+self.name+".png")

  self.meta;
  for(var i = 0; i < game_meta.length; i++)
  {
    if(game_meta[i].name == self.name)
      self.meta = game_meta[i];
  }

  self.draw = function(canv)
  {
    canv.context.drawImage(self.img,self.x,self.y,self.w,self.h);
    if(self.meta.complete)
      canv.context.fillRect(self.x,self.y,self.w,self.h);
  }
  self.click = function()
  {
    game.buttonClicked(self);
  }
}

