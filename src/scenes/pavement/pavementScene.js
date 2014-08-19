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
    self.ticker.register(self.dirtyBG);
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
  self.img = game.assetter.asset("back2.png");
  self.canv.context.drawImage(self.img,self.x,self.y,self.w,self.h);
  self.canv.context.globalCompositeOperation = "destination-out";
  self.canv.context.fillStyle = "#000000";
  self.canv.context.strokeStyle = "#000000";
  self.canv.context.lineWidth = 50;

  var qRatio = 0.05;
  self.qw = Math.round(self.w*qRatio);
  self.qh = Math.round(self.h*qRatio);
  self.qcanv = new Canv(self.qw,self.qh);
  self.qcanv.context.fillStyle = "#000000";
  self.qcanv.context.fillRect(0,0,self.qw,self.qh);
  self.qcanv.context.fillStyle = "#FFFFFF";
  self.qcanv.context.strokeStyle = "#FFFFFF";
  self.qcanv.context.lineWidth = 50*qRatio;

  self.lastPtX = 0;
  self.lastPtY = 0;

  self.filled = 0;
  self.ticks = 0;
  //spread out tally over multiple ticks
  self.tick = function()
  {
    var pixs = self.qcanv.context.getImageData(0, self.ticks, self.qw, 1).data; //add up one row
    for(var i = 0; i < pixs.length; i+=4) //+=4 because pixs = [R,G,B,A,R,G,B,A,...]
      self.filled += (pixs[i]) ? 1 : 0; //only check red because who cares

    self.ticks++;
    if(self.ticks % self.qh == 0)
    {
      if(self.filled > 1550) console.log("FILLED!");
      self.ticks = 0;
      self.filled = 0;
    }
  }

  self.dragStart = function(evt)
  {
    //just draw circle
    ////canv
    self.canv.context.beginPath();
    self.canv.context.arc(evt.offsetX,evt.offsetY,25,0,Math.PI*2,true);
    self.canv.context.fill();
    ////qcanv
    self.qcanv.context.beginPath();
    self.qcanv.context.arc(evt.offsetX*qRatio,evt.offsetY*qRatio,25*qRatio,0,Math.PI*2,true);
    self.qcanv.context.fill();

    self.lastPtX = evt.offsetX;
    self.lastPtY = evt.offsetY; 
  };
  self.drag = function(evt)
  {
    //draw line (for long frames)
    ////canv
    self.canv.context.beginPath();
    self.canv.context.moveTo(self.lastPtX, self.lastPtY);
    self.canv.context.lineTo(evt.offsetX, evt.offsetY);
    self.canv.context.stroke();
    ////qcanv
    self.qcanv.context.beginPath();
    self.qcanv.context.moveTo(self.lastPtX*qRatio, self.lastPtY*qRatio);
    self.qcanv.context.lineTo(evt.offsetX*qRatio, evt.offsetY*qRatio);
    self.qcanv.context.stroke();

    //draw circle (for short frames)
    ////canv
    self.canv.context.beginPath();
    self.canv.context.arc(evt.offsetX,evt.offsetY,25,0,Math.PI*2,true);
    self.canv.context.fill();
    ////qcanv
    self.qcanv.context.beginPath();
    self.qcanv.context.arc(evt.offsetX*qRatio,evt.offsetY*qRatio,25*qRatio,0,Math.PI*2,true);
    self.qcanv.context.fill();

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

  self.img = game.assetter.asset("back1.png");

  self.draw = function(canv)
  {
    canv.context.drawImage(self.img,self.x,self.y,self.w,self.h);
  }
}

