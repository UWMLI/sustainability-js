var PavementScene = function(game, stage)
{
  var self = this;
  self.stage = stage;

  self.viewing = 0; //0- intro, 1- gameplay, 2- outro

  self.intro_vid_src = "assets/pavement_intro.mp4";
  self.intro_vid_stamps = [];
  self.outro_vid_src = "assets/pavement_win.mp4";
  self.outro_vid_stamps = [];

  self.audio_src = "assets/game_music.mp3";

  var physical_rect    = {x:0,y:0,w:stage.dispCanv.canvas.width,h:stage.dispCanv.canvas.height};
  var theoretical_rect = {x:0,y:0,w:stage.drawCanv.canvas.width,h:stage.drawCanv.canvas.height};
  self.dbugger;
  self.ticker;
  self.dragger;
  self.clicker;
  self.drawer;
  self.particler;
  self.assetter;

  self.audio;

  self.beginButton;
  self.retryButton;

  self.rain;
  self.cleanBG;
  self.dirtyBG;
  self.finger;
  self.fisher;

  self.percent = 0;
  self.pstage = 0;

  self.initObjects = function()
  {
    self.beginButton = self.beginButton = new Clickable( { "x":0, "y":0, "w":stage.drawCanv.canvas.width, "h":stage.drawCanv.canvas.height, "click":self.beginGame });
    self.retryButton = self.retryButton = new Clickable( { "x":0, "y":0, "w":stage.drawCanv.canvas.width, "h":stage.drawCanv.canvas.height, "click":self.retryGame });

    self.rain = [];
    self.cleanBG = new PV_Background(self);
    self.dirtyBG = new PV_ScratchableBackground(self);
    self.dirtyBG.setStage(0);
    self.finger = new PV_FingerTracker(self);
    self.fisher = new PV_FishKiller(self);
    self.fisher.reset();
  }

  self.registerToDrawer = function()
  {
    self.drawer.register(self.cleanBG);
    self.drawer.register(self.dirtyBG);
    self.drawer.register(self.fisher);
    self.drawer.register(self.finger);
    self.drawer.register(self.particler);
  }

  self.registerToInitialDoodles = function()
  {
    self.dragger.register(self.dirtyBG);
    self.ticker.register(self.dirtyBG);
    self.dragger.register(self.finger);
    self.ticker.register(self.finger);
    self.ticker.register(self.fisher);
    self.ticker.register(self.particler);
  }

  self.resetState = function()
  {
    self.percent = 0;
    self.pstage = 0;
    self.cleanBG.setStage(self.pstage);
    self.dirtyBG.setStage(self.pstage);
    self.fisher.reset();
  }

  self.beginGame = function()
  {
    self.audio.play();

    self.viewing = 1;
    self.clicker.unregister(self.beginButton);

    self.registerToInitialDoodles();
    self.resetState();
  }

  self.retryGame = function()
  {
    self.viewing = 1;
    self.clicker.unregister(self.retryButton);

    self.resetState();
  }

  self.endGame = function()
  {
    self.audio.stop();

    self.viewing = 3;
    game.playVid(self.outro_vid_src, self.outro_vid_stamps, function(){game.setScene(MainScene);});
  }

  self.ready = function()
  {
    self.dbugger = new Debugger({source:document.getElementById("debug_div")});
    self.ticker = new Ticker({});
    self.dragger = new Dragger({source:stage.dispCanv.canvas,physical_rect:physical_rect,theoretical_rect:theoretical_rect});
    self.clicker = new Clicker({source:stage.dispCanv.canvas,physical_rect:physical_rect,theoretical_rect:theoretical_rect});
    self.drawer = new Drawer({source:stage.drawCanv});
    self.particler = new Particler({});
    self.assetter = new Assetter({});

    self.audio = new Aud(self.audio_src);
    self.audio.load();

    self.initObjects();
    self.resetState();
    self.registerToDrawer();

    game.playVid(self.intro_vid_src, self.intro_vid_stamps, function(){self.clicker.register(self.beginButton)});
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
    self.clicker.flush();
    self.ticker.flush();
  };

  self.rainFull = function() { stopGen = true; }

  self.draw = function()
  {
    self.drawer.flush();
    self.stage.drawCanv.context.font = "60px comic_font";
    self.stage.drawCanv.context.fillStyle = "#000000";
    //self.stage.drawCanv.context.fillText(Math.round(self.percent*10000)/100+"%",0,self.stage.drawCanv.canvas.height-100);

    if(self.viewing == 0)
    {
      self.stage.drawCanv.context.fillStyle = "rgba(0,0,0,0.8)";
      self.stage.drawCanv.context.fillRect(0,0,self.stage.drawCanv.canvas.width,self.stage.drawCanv.canvas.height);
      self.stage.drawCanv.context.fillStyle = "#FFFFFF";
      self.stage.drawCanv.context.font = "30px comic_font";
      self.stage.drawCanv.context.fillText("Swipe to swap traditional    ",50,300);
      self.stage.drawCanv.context.fillText("pavement with porous pavement.",50,340);
      self.stage.drawCanv.context.fillText("Reduce runoff and prevent    ",50,380);
      self.stage.drawCanv.context.fillText("algae from killing the fish! ",50,420);
      self.stage.drawCanv.context.fillText("                             ",50,480);
      self.stage.drawCanv.context.fillText("                             ",50,540);
      self.stage.drawCanv.context.fillText("(Touch Anywhere to Begin)",self.stage.drawCanv.canvas.width-480,self.stage.drawCanv.canvas.height-30);
    }
    if(self.viewing == 2)
    {
      self.stage.drawCanv.context.fillStyle = "rgba(0,0,0,0.8)";
      self.stage.drawCanv.context.fillRect(0,0,self.stage.drawCanv.canvas.width,self.stage.drawCanv.canvas.height);
      self.stage.drawCanv.context.fillStyle = "#FFFFFF";
      self.stage.drawCanv.context.font = "30px comic_font";
      self.stage.drawCanv.context.fillText("All the fish died!           ",50,300);
      self.stage.drawCanv.context.fillText("                             ",50,340);
      self.stage.drawCanv.context.fillText("Swipe to swap traditional    ",50,400);
      self.stage.drawCanv.context.fillText("pavement with porous pavement.",50,440);
      self.stage.drawCanv.context.fillText("Reduce runoff and prevent    ",50,480);
      self.stage.drawCanv.context.fillText("algae from killing the fish! ",50,520);
      self.stage.drawCanv.context.fillText("(Touch Anywhere to Begin)",self.stage.drawCanv.canvas.width-480,self.stage.drawCanv.canvas.height-30);
    }
  };

  self.cleanup = function()
  {
    self.dbugger.clear();
    self.ticker.clear();
    self.dragger.clear();
    self.clicker.clear();
    self.drawer.clear();
    self.particler.clear();
    self.assetter.clear();

    self.dbugger.detach();
    self.ticker.detach();
    self.dragger.detach();
    self.clicker.detach();
    self.drawer.detach();
    self.particler.detach();
    self.assetter.detach();
  };

  self.percentFilled = function(p)
  {
    if(p > 1) { p = 1; }
    if(self.percent != 1 && p == 1)
    {
      self.pstage++;
      if(self.pstage == 3) setTimeout(self.endGame,1000);
      else
      {
        self.cleanBG.setStage(self.pstage);
        self.dirtyBG.setStage(self.pstage);
      }
    }
    self.percent = p;
  }

  self.allFishDead = function()
  {
    if(self.viewing != 2)
    {
      self.viewing = 2;
      setTimeout(function(){self.clicker.register(self.retryButton);}, 1000);
    }
  }
};

var PV_FishKiller = function(game)
{
  var self = this;

  self.h = 340;
  self.w = game.stage.drawCanv.canvas.width;
  self.x = 0;
  self.y = game.stage.drawCanv.canvas.height-self.h;

  self.t = 0;

  self.algae_img = game.assetter.asset("pavement_algae.png");
  self.sludge_img = game.assetter.asset("pavement_sludge.png");

  self.fish =
  [
    {"x":Math.random()*self.w,"y":0,"w":100,"h":50,"dir":-1,"wav":Math.random()*Math.PI,"alive":true,"aimg":game.assetter.asset("pavement_fish_0.png"),"dimg":game.assetter.asset("pavement_dfish_0.png")},
    {"x":Math.random()*self.w,"y":0,"w":100,"h":50,"dir": 1,"wav":Math.random()*Math.PI,"alive":true,"aimg":game.assetter.asset("pavement_fish_1.png"),"dimg":game.assetter.asset("pavement_dfish_1.png")},
    {"x":Math.random()*self.w,"y":0,"w":100,"h":50,"dir":-1,"wav":Math.random()*Math.PI,"alive":true,"aimg":game.assetter.asset("pavement_fish_2.png"),"dimg":game.assetter.asset("pavement_dfish_2.png")},
    {"x":Math.random()*self.w,"y":0,"w":100,"h":50,"dir": 1,"wav":Math.random()*Math.PI,"alive":true,"aimg":game.assetter.asset("pavement_fish_1.png"),"dimg":game.assetter.asset("pavement_dfish_1.png")},
    {"x":Math.random()*self.w,"y":0,"w":100,"h":50,"dir":-1,"wav":Math.random()*Math.PI,"alive":true,"aimg":game.assetter.asset("pavement_fish_2.png"),"dimg":game.assetter.asset("pavement_dfish_2.png")},
    {"x":Math.random()*self.w,"y":0,"w":100,"h":50,"dir": 1,"wav":Math.random()*Math.PI,"alive":true,"aimg":game.assetter.asset("pavement_fish_1.png"),"dimg":game.assetter.asset("pavement_dfish_1.png")},
    {"x":Math.random()*self.w,"y":0,"w":100,"h":50,"dir":-1,"wav":Math.random()*Math.PI,"alive":true,"aimg":game.assetter.asset("pavement_fish_0.png"),"dimg":game.assetter.asset("pavement_dfish_0.png")},
    {"x":Math.random()*self.w,"y":0,"w":100,"h":50,"dir": 1,"wav":Math.random()*Math.PI,"alive":true,"aimg":game.assetter.asset("pavement_fish_1.png"),"dimg":game.assetter.asset("pavement_dfish_1.png")},
    {"x":Math.random()*self.w,"y":0,"w":100,"h":50,"dir":-1,"wav":Math.random()*Math.PI,"alive":true,"aimg":game.assetter.asset("pavement_fish_2.png"),"dimg":game.assetter.asset("pavement_dfish_2.png")},
    {"x":Math.random()*self.w,"y":0,"w":100,"h":50,"dir":-1,"wav":Math.random()*Math.PI,"alive":true,"aimg":game.assetter.asset("pavement_fish_2.png"),"dimg":game.assetter.asset("pavement_dfish_2.png")},
    {"x":Math.random()*self.w,"y":0,"w":100,"h":50,"dir": 1,"wav":Math.random()*Math.PI,"alive":true,"aimg":game.assetter.asset("pavement_fish_1.png"),"dimg":game.assetter.asset("pavement_dfish_1.png")},
    {"x":Math.random()*self.w,"y":0,"w":100,"h":50,"dir":-1,"wav":Math.random()*Math.PI,"alive":true,"aimg":game.assetter.asset("pavement_fish_2.png"),"dimg":game.assetter.asset("pavement_dfish_2.png")}
  ]

  self.reset = function()
  {
    self.t = 0;
    for(var i = 0; i < self.fish.length; i++)
    {
      self.fish[i].y = ((self.h/5)*2-10)+((self.h-((self.h/5)*2-10))/(self.fish.length+4))*i;
      self.fish[i].alive = true;
    }
  }

  self.tick = function()
  {
    self.t += 0.05;
    for(var i = 0; i < self.fish.length; i++)
    {
      if(((self.t/3)/self.fish.length-0.1) > i/self.fish.length)
        self.fish[i].alive = false;

      if(self.fish[i].alive)
      {
        self.fish[i].x += self.fish[i].dir;
        if(self.fish[i].x < 0-self.fish[i].w) self.fish[i].x = self.w;
        if(self.fish[i].x > self.w)           self.fish[i].x = 0-self.fish[i].w;
      }
      else
      {
        self.fish[i].y = self.fish[i].y + (((self.h/5)*2-10)-self.fish[i].y)/100;
      }
    }

    if(!self.fish[self.fish.length-1].alive) game.allFishDead();
  }

  self.draw = function(canv)
  {
    var a = (self.t/3)/self.fish.length
    canv.context.globalAlpha = a;
    canv.context.drawImage(self.sludge_img,self.x,self.y,self.w,self.h*1.5);
    canv.context.globalAlpha = 1.0;
    canv.context.drawImage(self.algae_img,self.x-20,self.y-30,self.w+40,70);

    for(var i = 0; i < self.fish.length; i++)
    {
      if(self.fish[i].alive)
        canv.context.drawImage(self.fish[i].aimg,self.x+self.fish[i].x,self.y+self.fish[i].y+Math.sin(self.t+self.fish[i].wav)*10,self.fish[i].w,self.fish[i].h);
      else
        canv.context.drawImage(self.fish[i].dimg,self.x+self.fish[i].x,self.y+self.fish[i].y+Math.sin(self.t+self.fish[i].wav)*10,self.fish[i].w,self.fish[i].h);
    }
  }
}

var PV_FingerTracker = function(game)
{
  var self = this;

  self.x = 0;
  self.y = 0;
  self.w = game.stage.drawCanv.canvas.width;
  self.h = game.stage.drawCanv.canvas.height;

  self.ptx = 0;
  self.pty = 0;
  self.pressed = false;

  self.jack_0_img = game.assetter.asset("pavement_jack_0.png"),
  self.jack_1_img = game.assetter.asset("pavement_jack_1.png"),
  self.shovel_img = game.assetter.asset("pavement_shovel.png"),
  self.imgw = 200;
  self.imgh = 400;

  self.dragStart = function(evt)
  {
    self.pressed = true;
    self.ptx = evt.doX;
    self.pty = evt.doY;
  };
  self.drag = function(evt)
  {
    self.ptx = evt.doX;
    self.pty = evt.doY;
  };
  self.dragFinish = function()
  {
    self.pressed = false;
    self.ptx = 0;
    self.pty = 0;
  };

  self.t = 0;
  self.tick = function()
  {
    self.t++;
  }

  self.draw = function(canv)
  {
    if(self.pressed)
    {
      if(game.pstage == 0)
      {
        var offx = Math.random()*6-3;
        var offy = Math.random()*6-3;
        if(Math.round(self.t/2)%2 == 0)
          canv.context.drawImage(self.jack_0_img,self.ptx-self.imgw/2+offx,self.pty-self.imgh+offy,self.imgw,self.imgh);
        else
          canv.context.drawImage(self.jack_1_img,self.ptx-self.imgw/2+offx,self.pty-self.imgh+offy,self.imgw,self.imgh);
      }
      else if(game.pstage == 1)
      {
        canv.context.drawImage(self.shovel_img,self.ptx-(1.5*self.imgw),self.pty-self.imgh,self.imgw*2,self.imgh);
      }
    }
  }
}

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
    canv.context.lineWidth = 2;
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
    canv.context.font = "60px comic_font";
    canv.context.fillStyle = "#000000";
    canv.context.fillText(self.text,self.x-52,self.y+2);
    canv.context.fillText(self.text,self.x-48,self.y-2);
    canv.context.fillText(self.text,self.x-48,self.y+2);
    canv.context.fillText(self.text,self.x-52,self.y-2);
    canv.context.font = "60px comic_font";
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
  self.h = game.stage.drawCanv.canvas.height;

  self.bottom_buffer = 340; //pixels not worth using in drawable canv

  self.canv;
  var qRatio = 0.05;
  self.qw = Math.round(self.w*qRatio);
  self.qh = Math.round((self.h-self.bottom_buffer)*qRatio);

  self.lastPtX = 0;
  self.lastPtY = 0;

  self.filled = 0;
  self.ticks = 0;

  self.stage = 0;
  self.imgs =
  [
    game.assetter.asset("pavement_bg_0.png"),
    game.assetter.asset("pavement_bg_1.png"),
    game.assetter.asset("pavement_bg_2.png")
  ];

  var brushsize = 100;

  self.setStage = function(s)
  {
    self.stage = s;

    self.canv = new Canv({width:self.w,height:self.h-self.bottom_buffer});
    self.canv.context.drawImage(self.imgs[self.stage],self.x,self.y,self.w,self.h);
    self.canv.context.globalCompositeOperation = "destination-out";
    self.canv.context.fillStyle = "#000000";
    self.canv.context.strokeStyle = "#000000";
    self.canv.context.lineWidth = brushsize;

    self.countcanv = new Canv({width:self.qw,height:self.qh});
    self.countcanv.context.fillStyle = "#000000";
    self.countcanv.context.fillRect(0,0,self.qw,self.qh);
    self.countcanv.context.fillStyle = "#FFFFFF";
    self.countcanv.context.strokeStyle = "#FFFFFF";
    self.countcanv.context.lineWidth = brushsize*qRatio;

    self.filled = 0;
    self.ticks = 0;
  }

  //spread out tally over multiple ticks
  self.tick = function()
  {
    var pixs = self.countcanv.context.getImageData(0, self.ticks, self.qw, 1).data; //add up one row
    for(var i = 0; i < pixs.length; i+=4) //+=4 because pixs = [R,G,B,A,R,G,B,A,...]
      self.filled += (pixs[i]) ? 1 : 0; //only check red because who cares

    self.ticks++;
    if(self.ticks % self.qh == 0)
    {
      //~1000 = road filled
      //1056 = actually filled
      game.percentFilled(self.filled/900);
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
    self.canv.context.arc(evt.doX,evt.doY,brushsize/2,0,Math.PI*2,true);
    self.canv.context.fill();
    ////countcanv
    self.countcanv.context.beginPath();
    self.countcanv.context.arc(evt.doX*qRatio,evt.doY*qRatio,brushsize/2*qRatio,0,Math.PI*2,true);
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
    self.canv.context.arc(evt.doX,evt.doY,brushsize/2,0,Math.PI*2,true);
    self.canv.context.fill();
    ////countcanv
    self.countcanv.context.beginPath();
    self.countcanv.context.arc(evt.doX*qRatio,evt.doY*qRatio,brushsize/2*qRatio,0,Math.PI*2,true);
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
  self.h = game.stage.drawCanv.canvas.height;

  self.stage = 0;
  self.imgs =
  [
    game.assetter.asset("pavement_bg_1.png"),
    game.assetter.asset("pavement_bg_2.png"),
    game.assetter.asset("pavement_bg_3.png")
  ];

  self.setStage = function(s)
  {
    self.stage = s;
  }

  self.draw = function(canv)
  {
    canv.context.drawImage(self.imgs[self.stage],self.x,self.y,self.w,self.h);
  }
}

