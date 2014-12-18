var PavementScene = function(game, stage)
{
  var self = this;
  self.stage = stage;

  var physical_rect    = {x:0,y:0,w:stage.dispCanv.canvas.width,h:stage.dispCanv.canvas.height};
  var theoretical_rect = {x:0,y:0,w:stage.drawCanv.canvas.width,h:stage.drawCanv.canvas.height};
  self.dbugger;
  self.ticker;
  self.dragger;
  self.drawer;
  self.particler;
  self.assetter;

  self.rain;
  self.cleanBG;
  self.dirtyBG;

  self.ready = function()
  {
    self.dbugger = new Debugger({source:document.getElementById("debug_div")});
    self.ticker = new Ticker({});
    self.dragger = new Dragger({source:stage.dispCanv.canvas,physical_rect:physical_rect,theoretical_rect:theoretical_rect});
    self.drawer = new Drawer({source:stage.drawCanv});
    self.particler = new Particler({});
    self.assetter = new Assetter({});

    self.rain = [];
    self.cleanBG = new PV_Background(self);
    self.dirtyBG = new PV_ScratchableBackground(self);

    self.drawer.register(self.cleanBG);
    self.drawer.register(self.dirtyBG);
    self.dragger.register(self.dirtyBG);
    self.ticker.register(self.dirtyBG);
    self.drawer.register(self.particler);
    self.ticker.register(self.particler);
  };

  var stopGen = false;
  self.tick = function()
  {
    if(!stopGen)
    {
      for(var i = 0; i < 5; i++)
      {
        self.rain.push(new PV_Rain(self));
        self.drawer.register(self.rain[self.rain.length-1]);
        self.ticker.register(self.rain[self.rain.length-1]);
      }
    }
    self.dragger.flush();
    self.ticker.flush();
  };

  self.rainFull = function() { stopGen = true; }

  self.draw = function()
  {
    self.drawer.flush();
    self.stage.drawCanv.context.font = "60px Georgia";
    self.stage.drawCanv.context.fillStyle = "#000000";
    self.stage.drawCanv.context.fillText(Math.round(percent*10000)/100+"%",0,self.stage.drawCanv.canvas.height-100);
  };

  self.cleanup = function()
  {
  };

  var percent = 0;
  self.percentFilled = function(p)
  {
    if(p > 1) p = 1;
    percent = p;
  }
};

var PV_Rain = function(game)
{
  var self = this;

  self.refresh = function()
  {
    self.dx = 2;
    self.dy = 10;
    self.x = Math.random()*game.stage.drawCanv.canvas.width;
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

    if(self.y > game.stage.drawCanv.canvas.height-200)     game.rainFull(self);
    while(self.x < 0)                                      self.x += game.stage.drawCanv.canvas.width;
    while(self.x > game.stage.drawCanv.canvas.width)       self.x -= game.stage.drawCanv.canvas.width;
    while(self.y < 0)                                      self.y += game.stage.drawCanv.canvas.height-200;
    while(self.y > game.stage.drawCanv.canvas.height-200)  self.y -= game.stage.drawCanv.canvas.height-200;

    return true; //never expire (just auto-loop)
  }

  self.draw = function(canv)
  {
    canv.context.lineWidth = 5;
    canv.context.strokeStyle = "#0000FF";
    canv.context.beginPath();
    canv.context.moveTo(self.x,self.y);
    canv.context.lineTo(self.x+self.dx,self.y+self.dy);
    canv.context.stroke();
    canv.context.closePath();
  }
}

var PV_EncouragementParticle = function(x,y,game)
{
  var self = this;

  self.x = x;
  self.sy = y;
  self.y = y;
  self.ey = y-20;

  self.t = 0;

  self.text = Math.floor(Math.random()*9);
       if(self.text == 0) self.text = "cool!";
  else if(self.text == 1) self.text = "great!";
  else if(self.text == 2) self.text = "word!";
  else if(self.text == 3) self.text = "rad!";
  else if(self.text == 4) self.text = "sweet!";
  else if(self.text == 5) self.text = "nice!";
  else if(self.text == 6) self.text = "swell!";
  else if(self.text == 7) self.text = "good!";
  else if(self.text == 8) self.text = "wow!";

  self.tick = function()
  {
    self.t += 0.05;
    self.y = self.y+(self.ey-self.y)/50;
    return self.t < 1;
  }

  self.draw = function(canv)
  {
    canv.context.globalAlpha = 1-(self.t*self.t*self.t);
    canv.context.font = "60px Georgia";
    canv.context.fillStyle = "#000000";
    canv.context.fillText(self.text,self.x-52,self.y+2);
    canv.context.fillText(self.text,self.x-48,self.y-2);
    canv.context.fillText(self.text,self.x-48,self.y+2);
    canv.context.fillText(self.text,self.x-52,self.y-2);
    canv.context.font = "60px Georgia";
    canv.context.fillStyle = "#FFFFFF";
    canv.context.fillText(self.text,self.x-50,self.y);
    canv.context.globalAlpha = 1.0;
  }
}

var PV_ScratchableBackground = function(game)
{
  var self = this;

  self.x = 0;
  self.y = 0;
  self.w = game.stage.drawCanv.canvas.width;
  self.h = game.stage.drawCanv.canvas.height-200;

  self.canv = new Canv({width:self.w,height:self.h});
  self.img = game.assetter.asset("back2.png");
  self.canv.context.drawImage(self.img,self.x,self.y,self.w,self.h);
  self.canv.context.globalCompositeOperation = "destination-out";
  self.canv.context.fillStyle = "#000000";
  self.canv.context.strokeStyle = "#000000";
  self.canv.context.lineWidth = 50;

  var qRatio = 0.05;
  self.qw = Math.round(self.w*qRatio);
  self.qh = Math.round(self.h*qRatio);
  self.countcanv = new Canv({width:self.qw,height:self.qh});
  self.countcanv.context.fillStyle = "#000000";
  self.countcanv.context.fillRect(0,0,self.qw,self.qh);
  self.countcanv.context.fillStyle = "#FFFFFF";
  self.countcanv.context.strokeStyle = "#FFFFFF";
  self.countcanv.context.lineWidth = 50*qRatio;

  self.lastPtX = 0;
  self.lastPtY = 0;

  self.filled = 0;
  self.ticks = 0;
  //spread out tally over multiple ticks
  self.tick = function()
  {
    var pixs = self.countcanv.context.getImageData(0, self.ticks, self.qw, 1).data; //add up one row
    for(var i = 0; i < pixs.length; i+=4) //+=4 because pixs = [R,G,B,A,R,G,B,A,...]
      self.filled += (pixs[i]) ? 1 : 0; //only check red because who cares

    self.ticks++;
    if(self.ticks % self.qh == 0)
    {
      game.percentFilled(self.filled/1250);
      self.ticks = 0;
      self.filled = 0;
    }
  }

  var dragPartMaxCharge = 5;
  var dragPartCharge = dragPartMaxCharge; //used to pump out particle every once in a while
  self.dragStart = function(evt)
  {
    //just draw circle
    ////canv
    self.canv.context.beginPath();
    self.canv.context.arc(evt.doX,evt.doY,25,0,Math.PI*2,true);
    self.canv.context.fill();
    ////countcanv
    self.countcanv.context.beginPath();
    self.countcanv.context.arc(evt.doX*qRatio,evt.doY*qRatio,25*qRatio,0,Math.PI*2,true);
    self.countcanv.context.fill();

    self.lastPtX = evt.doX;
    self.lastPtY = evt.doY;
  };
  self.drag = function(evt)
  {
    //handle particle
    dragPartCharge--;
    if(dragPartCharge <= 0)
    {
      dragPartCharge = dragPartMaxCharge;
      game.particler.register(new PV_EncouragementParticle(evt.doX,evt.doY,game));
    }

    //draw line (for long frames)
    ////canv
    self.canv.context.beginPath();
    self.canv.context.moveTo(self.lastPtX, self.lastPtY);
    self.canv.context.lineTo(evt.doX, evt.doY);
    self.canv.context.stroke();
    ////countcanv
    self.countcanv.context.beginPath();
    self.countcanv.context.moveTo(self.lastPtX*qRatio, self.lastPtY*qRatio);
    self.countcanv.context.lineTo(evt.doX*qRatio, evt.doY*qRatio);
    self.countcanv.context.stroke();

    //draw circle (for short frames)
    ////canv
    self.canv.context.beginPath();
    self.canv.context.arc(evt.doX,evt.doY,25,0,Math.PI*2,true);
    self.canv.context.fill();
    ////countcanv
    self.countcanv.context.beginPath();
    self.countcanv.context.arc(evt.doX*qRatio,evt.doY*qRatio,25*qRatio,0,Math.PI*2,true);
    self.countcanv.context.fill();

    self.lastPtX = evt.doX;
    self.lastPtY = evt.doY;
  };
  self.dragFinish = function(){ self.lastPtX = 0; self.lastPtY = 0; };

  self.draw = function(canv)
  {
    canv.context.drawImage(self.canv.canvas, 0, 0, self.canv.canvas.width, self.canv.canvas.height, 0, 0, self.canv.canvas.width, self.canv.canvas.height);
  }
}

//literally just the bg image
var PV_Background = function(game)
{
  var self = this;

  self.x = 0;
  self.y = 0;
  self.w = game.stage.drawCanv.canvas.width;
  self.h = game.stage.drawCanv.canvas.height-200;

  self.img = game.assetter.asset("back1.png");

  self.draw = function(canv)
  {
    canv.context.drawImage(self.img,self.x,self.y,self.w,self.h);
  }
}

