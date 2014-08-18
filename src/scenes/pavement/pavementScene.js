var PavementScene = function(game, canv)
{
  var self = this;

  self.ticker;
  self.dragger;
  self.drawer;
  self.assetter;

  self.cleanBG;
  self.dirtyBG;

  self.ready = function()
  {
    self.ticker = new Ticker();
    self.dragger = new Dragger();
    self.drawer = new Drawer(canv);
    self.assetter = new Assetter();

    self.cleanBG = new PV_Background(self);
    self.dirtyBG = new PV_ScratchableBackground(self);

    self.drawer.register(self.cleanBG);
    self.drawer.register(self.dirtyBG);
    self.dragger.register(self.dirtyBG);
  };

  self.tick = function()
  {
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

var PV_ScratchableBackground = function(game)
{
  var self = this;

  self.x = 0;
  self.y = 0;
  self.w = 640;
  self.h = 1008;

  self.canv = new Canv(self.w,self.h);
  self.img = game.assetter.asset("assets/back2.png");
  self.canv.context.drawImage(self.img,self.x,self.y,self.w,self.h);
  self.canv.context.globalCompositeOperation = "destination-out";

  self.lastPtX = 0;
  self.lastPtY = 0;

  self.dragStart = function(evt){ self.lastPtX = evt.offsetX; self.lastPtY = evt.offsetY; };
  self.drag = function(evt)
  {
    //draw line (for long frames)
    self.canv.context.strokeStyle = "#000000";
    self.canv.context.lineWidth = 50;
    self.canv.context.beginPath();
    self.canv.context.moveTo(self.lastPtX, self.lastPtY);
    self.canv.context.lineTo(evt.offsetX, evt.offsetY);
    self.canv.context.stroke();

    //draw circle (for short frames)
    self.canv.context.fillStyle = "#000000";
    self.canv.context.beginPath();
    self.canv.context.arc(evt.offsetX,evt.offsetY,25,0,Math.PI*2,true);
    self.canv.context.fill();

    self.lastPtX = evt.offsetX;
    self.lastPtY = evt.offsetY;
  };
  self.dragFinish = function(){ self.lastPtX = 0; self.lastPtY = 0; };

  self.draw = function(canv)
  {
    self.canv.blitTo(canv);
  }
}

//literally just the bg image
var PV_Background = function(game)
{
  var self = this;

  self.x = 0;
  self.y = 0;
  self.w = 640;
  self.h = 1080;

  self.img = game.assetter.asset("assets/back1.png");

  self.draw = function(canv)
  {
    canv.context.drawImage(self.img,self.x,self.y,self.w,self.h);
  }
}

