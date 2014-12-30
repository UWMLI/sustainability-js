var MainScene = function(game, stage)
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

    self.map         = new MA_Map(self);                             self.drawer.register(self.map);         self.dragger.register(self.map)
    self.bikeBtn     = new MA_Button(20, 20,200,20,"Bike",self);     self.drawer.register(self.bikeBtn);     self.clicker.register(self.bikeBtn);
    self.windowBtn   = new MA_Button(20, 60,200,20,"Window",self);   self.drawer.register(self.windowBtn);   self.clicker.register(self.windowBtn);
    self.bulbBtn     = new MA_Button(20,100,200,20,"Bulb",self);     self.drawer.register(self.bulbBtn);     self.clicker.register(self.bulbBtn);
    self.sweaterBtn  = new MA_Button(20,140,200,20,"Sweater",self);  self.drawer.register(self.sweaterBtn);  self.clicker.register(self.sweaterBtn);
    self.barrelBtn   = new MA_Button(20,180,200,20,"Barrel",self);   self.drawer.register(self.barrelBtn);   self.clicker.register(self.barrelBtn);
    self.pavementBtn = new MA_Button(20,220,200,20,"Pavement",self); self.drawer.register(self.pavementBtn); self.clicker.register(self.pavementBtn);
    self.wheelBtn    = new MA_Button(20,260,200,20,"Wheel",self);    self.drawer.register(self.wheelBtn);    self.clicker.register(self.wheelBtn);
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
  self.w = game.stage.drawCanv.canvas.width*4;
  self.h = game.stage.drawCanv.canvas.height*2;

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
  };
  self.dragFinish = function()
  {
  };
  self.draw = function(canv)
  {
    canv.context.strokeStyle = "#000000";
    canv.context.lineWidth = 1;
    for(var i = 0; i < 100; i+=2)
      canv.context.strokeRect(self.x+(self.w/100)*i, self.y, self.w/100, self.h);
    for(var i = 0; i < 100; i+=2)
      canv.context.strokeRect(self.x, self.y+(self.h/100)*i, self.w, self.h/100);
  }
}

var MA_Button = function(x,y,w,h,text,game)
{
  var self = this;
  self.x = x;
  self.y = y;
  self.w = w;
  self.h = h;
  self.text = text;

  self.draw = function(canv)
  {
    canv.context.strokeStyle = "#000000";
    canv.context.strokeRect(self.x, self.y, self.w, self.h);
    canv.context.fillStyle = "#000000";
    canv.context.font = "30px Georgia";
    canv.context.fillText(self.text,self.x,self.y+self.h);
  }
  self.click = function()
  {
    game.buttonClicked(self);
  }
}

