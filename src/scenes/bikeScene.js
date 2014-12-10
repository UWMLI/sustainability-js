var BikeScene = function(game, stage)
{
  var self = this;

  var physical_rect    = {x:0,y:0,w:stage.dispCanv.canvas.width,h:stage.dispCanv.canvas.height};
  var theoretical_rect = {x:0,y:0,w:stage.drawCanv.canvas.width,h:stage.drawCanv.canvas.height};
  self.dbugger;
  self.ticker;
  self.clicker;
  self.dragger;
  self.flicker;
  self.drawer;
  self.assetter;

  self.panes = [];

  self.ready = function()
  {
    self.dbugger = new Debugger({source:document.getElementById("debug_div")});
    self.ticker = new Ticker({});
    self.clicker = new Clicker({source:stage.dispCanv.canvas,physical_rect:physical_rect,theoretical_rect:theoretical_rect});
    self.dragger = new Dragger({source:stage.dispCanv.canvas,physical_rect:physical_rect,theoretical_rect:theoretical_rect});
    self.flicker = new Flicker({source:stage.dispCanv.canvas,physical_rect:physical_rect,theoretical_rect:theoretical_rect});
    self.drawer = new Drawer({source:stage.drawCanv});
    self.assetter = new Assetter({});

    self.currentPane = 0;
    self.panes.push(new B_FindHelmetPane(self));
    self.panes.push(new B_PumpTirePane(self));
    self.panes.push(new B_GrabKeysPane(self));
    self.panes.push(new B_CardChoicePane(self));

    /*
    //Examples
    new Clickable(
      {
        "x":10,
        "y":10,
        "w":100,
        "h":100,
        "click":function() { self.dbugger.log("click"); }
      }
    );
    new Draggable(
      {
        "x":10,
        "y":10,
        "w":100,
        "h":100,
        "drawgStart": function() { self.dbugger.log("dstart"); }
        "draw":       function() { self.dbugger.log("d"); }
        "drawgFinish":function() { self.dbugger.log("dfin"); }
      }
    );
    new Flickable(
      {
        "x":10,
        "y":10,
        "w":100,
        "h":100,
        "r":100,
        "flick":function(vec) { self.dbugger.log(vec.x); }
      }
    );
    */

    var BG = function(img)
    {
      var self = this;
      self.draw = function(canv)
      {
        canv.context.drawImage(img, 0, 0, canv.canvas.width,canv.canvas.height);
      }
    };
    self.drawer.register(new BG(self.assetter.asset("bike_bg.png")));

    self.panes[self.currentPane].begin();
  };

  self.tick = function()
  {
    self.clicker.flush();
    self.dragger.flush();
    self.flicker.flush();
    self.ticker.flush();

    var i;
    if((i = self.panes[self.currentPane].tick()))
    {
      self.panes[self.currentPane].end();
      self.currentPane = (self.currentPane+1)%self.panes.length;
      self.panes[self.currentPane].begin();
    }
  };

  self.draw = function()
  {
    self.drawer.flush();

    self.panes[self.currentPane].draw(stage.drawCanv);
  };

  self.cleanup = function()
  {
  };
};


//mini scenes
var B_FindHelmetPane = function(scene)
{
  var finished = false;
  var won = false;

  var unhappy_man_img = scene.assetter.asset("bike_helmet_man_unhappy.png");
  var happy_man_img = scene.assetter.asset("bike_helmet_man_happy.png");
  var ace_img = scene.assetter.asset("bike_ace.png");
  var bible_img = scene.assetter.asset("bike_bible.png");
  var bowl_img = scene.assetter.asset("bike_bowl.png");
  var hamster_img = scene.assetter.asset("bike_hamster.png");
  var helmet_img = scene.assetter.asset("bike_helmet.png");
  var pizza_img = scene.assetter.asset("bike_pizza.png");
  var salt_img = scene.assetter.asset("bike_salt.png");
  var mask_img = scene.assetter.asset("bike_mask.png");
  var intro_text_img = scene.assetter.asset("bike_excuse_helmet.png");
  var outro_text_img = scene.assetter.asset("bike_victory_helmet.png");

  var Intro = function(pane)
  {
    var self = this;
    self.intro_count = 0;
    self.tick = function()
    {
      if(pane.mode != 0) return;
      self.intro_count+=0.5;
      if(self.intro_count > 100) pane.introFinished();
    }
    self.draw = function(canv)
    {
      var x;
      if(self.intro_count < 5)        x = -500+((self.intro_count/5)*500);
      else if(self.intro_count < 95)  x = (((self.intro_count-5)/90)*100);
      else if(self.intro_count < 100) x = 100+(((self.intro_count-95)/5)*500);
      else return;

      canv.context.drawImage(intro_text_img, x, 100, 500, 500);
    }
  }

  var Outro = function(pane)
  {
    var self = this;
    self.outro_count = 0;
    self.tick = function()
    {
      if(pane.mode != 2) return;
      self.outro_count+=0.5;
      if(self.outro_count > 100) pane.outroFinished();
    }
    self.draw = function(canv)
    {
      var x;
      if(self.outro_count < 5)        x = -500+((self.outro_count/5)*500);
      else if(self.outro_count < 95)  x = (((self.outro_count-5)/90)*100);
      else if(self.outro_count < 100) x = 100+(((self.outro_count-95)/5)*500);
      else return;

      canv.context.drawImage(outro_text_img, x, 100, 500, 500);
    }
  }

  var Man = function(pane)
  {
    var self = this;
    self.x = 350;
    self.y = 400;
    self.w = 400;
    self.h = 675;
    self.draw = function(canv)
    {
      if(!won) canv.context.drawImage(unhappy_man_img,self.x,self.y,self.w,self.h);
      else     canv.context.drawImage(happy_man_img,self.x,self.y,self.w,self.h);
    }
  }
  var Helmet = function(pane)
  {
    var self = this;
    self.x = 150;
    self.y = 180;
    self.w = 200;
    self.h = 175;
    self.draw = function(canv) { canv.context.drawImage(helmet_img,self.x,self.y,self.w,self.h); }
    self.click = function(evt) { pane.helmetTouched() };
  }
  var Ace = function(pane)
  {
    var self = this;
    self.x = 370;
    self.y = 300;
    self.w = 75;
    self.h = 100;
    self.draw = function(canv) { canv.context.drawImage(ace_img,self.x,self.y,self.w,self.h); }
  }
  var Bible = function(pane)
  {
    var self = this;
    self.x = 50;
    self.y = 20;
    self.w = 200;
    self.h = 150;
    self.draw = function(canv) { canv.context.drawImage(bible_img,self.x,self.y,self.w,self.h); }
  }
  var Bowl = function(pane)
  {
    var self = this;
    self.x = 180;
    self.y = 360;
    self.w = 200;
    self.h = 150;
    self.draw = function(canv) { canv.context.drawImage(bowl_img,self.x,self.y,self.w,self.h); }
  }
  var Hamster = function(pane)
  {
    var self = this;
    self.x = 75;
    self.y = 340;
    self.w = 100;
    self.h = 75;
    self.draw = function(canv) { canv.context.drawImage(hamster_img,self.x,self.y,self.w,self.h); }
  }
  var Pizza = function(pane)
  {
    var self = this;
    self.x = 220;
    self.y = 75;
    self.w = 200;
    self.h = 200;
    self.draw = function(canv) { canv.context.drawImage(pizza_img,self.x,self.y,self.w,self.h); }
  }
  var Salt = function(pane)
  {
    var self = this;
    self.x = 50;
    self.y = 200;
    self.w = 75;
    self.h = 100;
    self.draw = function(canv) { canv.context.drawImage(salt_img,self.x,self.y,self.w,self.h); }
  }
  var Mask = function(pane)
  {
    var self = this;
    self.x = 80;
    self.y = 520;
    self.w = 200;
    self.h = 100;
    self.draw = function(canv) { canv.context.drawImage(mask_img,self.x,self.y,self.w,self.h); }
  }



  var man;
  var hel;
  var ace;
  var bib;
  var bow;
  var ham;
  var piz;
  var sal;
  var mas;
  var intro;
  var outro;
  var self = this;
  self.mode = 0; //0 = intro, 1 = play, 2 = outro

  self.begin = function()
  {
    finished = false;
    won = false;
    self.mode = 0;

    man = new Man(self);
    hel = new Helmet(self);
    ace = new Ace(self);
    bib = new Bible(self);
    bow = new Bowl(self);
    ham = new Hamster(self);
    piz = new Pizza(self);
    sal = new Salt(self);
    mas = new Mask(self);
    intro = new Intro(self);
    outro = new Outro(self);

    scene.drawer.register(man);
    scene.clicker.register(hel);
    scene.drawer.register(hel);
    scene.drawer.register(ace);
    scene.drawer.register(bib);
    scene.drawer.register(bow);
    scene.drawer.register(ham);
    scene.drawer.register(piz);
    scene.drawer.register(sal);
    scene.drawer.register(mas);
    scene.drawer.register(intro);
    scene.ticker.register(intro);
    scene.drawer.register(outro);
    scene.ticker.register(outro);
  }
  self.tick = function() //return 0 for continue, 1 for lose, 2 for win
  {
    if(finished) return finished+won;
  }
  self.draw = function(canv)
  {
  }
  self.end = function()
  {
    scene.drawer.unregister(man);
    scene.clicker.unregister(hel);
    scene.drawer.unregister(hel);
    scene.drawer.unregister(ace);
    scene.drawer.unregister(bib);
    scene.drawer.unregister(bow);
    scene.drawer.unregister(ham);
    scene.drawer.unregister(piz);
    scene.drawer.unregister(sal);
    scene.drawer.unregister(mas);
    scene.drawer.unregister(intro);
    scene.ticker.unregister(intro);
    scene.drawer.unregister(outro);
    scene.ticker.unregister(outro);
  }

  self.introFinished = function()
  {
    self.mode = 1;
  }
  self.outroFinished = function()
  {
    finished = true;
  }
  self.helmetTouched = function()
  {
    if(self.mode != 1) return;
    won = true;
    self.mode = 2;
  }
};

var B_PumpTirePane = function(scene)
{
  var finished = false;
  var won = false;

  var pump_base_img = scene.assetter.asset("bike_pump_base.png");
  var pump_handle_img = scene.assetter.asset("bike_pump_handle.png");
  var intro_text_img = scene.assetter.asset("bike_excuse_pump.png");
  var outro_text_img = scene.assetter.asset("bike_victory_pump.png");

  var Intro = function(pane)
  {
    var self = this;
    self.intro_count = 0;
    self.tick = function()
    {
      if(pane.mode != 0) return;
      self.intro_count+=0.5;
      if(self.intro_count > 100) pane.introFinished();
    }
    self.draw = function(canv)
    {
      var x;
      if(self.intro_count < 5)        x = -500+((self.intro_count/5)*500);
      else if(self.intro_count < 95)  x = (((self.intro_count-5)/90)*100);
      else if(self.intro_count < 100) x = 100+(((self.intro_count-95)/5)*500);
      else return;

      canv.context.drawImage(intro_text_img, x, 100, 500, 150);
    }
  }

  var Outro = function(pane)
  {
    var self = this;
    self.outro_count = 0;
    self.tick = function()
    {
      if(pane.mode != 2) return;
      self.outro_count+=0.5;
      if(self.outro_count > 100) pane.outroFinished();
    }
    self.draw = function(canv)
    {
      var x;
      if(self.outro_count < 5)        x = 680-((self.outro_count/5)*580);
      else if(self.outro_count < 95)  x = 100-(((self.outro_count-5)/90)*250);
      else if(self.outro_count < 100) x = -150+(((self.outro_count-95)/5)*500);
      else return;

      canv.context.drawImage(outro_text_img, x, 0, 800, 1008);
    }
  }

  var Pump = function(pane)
  {
    var self = this;

    self.handle_up_y = 120;
    self.handle_down_y = 300;

    //used to detect drag (sync w/ handle pos)
    self.x = 70;
    self.y = self.handle_down_y; //start down
    self.w = 200;
    self.h = 300;

    self.touch_offset_y = 0; // used to keep track of drag

    self.handle_x = self.x;
    self.handle_y = self.y;
    self.handle_w = self.w;
    self.handle_h = self.h;

    self.base_x = 50;
    self.base_y = 400;
    self.base_w = 220;
    self.base_h = 500;

    self.lastState = 0; //0 = down, 1 = up
    self.halfCycles = 0;

    self.syncHandleWithDrag = function()
    {
      self.handle_x = self.x;
      self.handle_y = self.y;
      self.handle_w = self.w;
      self.handle_h = self.h;
    }

    self.dragStart  = function(evt)
    {
      if(pane.mode != 1) return;
      self.touch_offset_y = self.y+(self.h/2)-evt.doY;
    };
    self.drag = function(evt)
    {
      if(pane.mode != 1) return;
      self.y = evt.doY-(self.h/2)+self.touch_offset_y;
      if(self.y > self.handle_down_y)
      {

        if(self.lastState == 1) self.halfCycles++;
        self.lastState = 0;
        self.y = self.handle_down_y;
      }
      if(self.y < self.handle_up_y) //handle up
      {
        if(self.lastState == 0) self.halfCycles++;
        self.lastState = 1;
        self.y = self.handle_up_y;
      }

      self.syncHandleWithDrag();
    };
    self.dragFinish = function()
    {
    };

    self.draw = function(canv)
    {
      canv.context.drawImage(pump_handle_img,self.handle_x,self.handle_y,self.handle_w,self.handle_h);
      canv.context.drawImage(pump_base_img,self.base_x,self.base_y,self.base_w,self.base_h);
    }
  }

  var p;
  var intro;
  var outro;
  var self = this;
  self.mode = 0;
  self.begin = function()
  {
    finished = false;
    won = false;
    self.mode = 0;
    p = new Pump(self);
    intro = new Intro(self);
    outro = new Outro(self);
    scene.drawer.register(p);
    scene.dragger.register(p);
    scene.ticker.register(intro);
    scene.drawer.register(intro);
    scene.ticker.register(outro);
    scene.drawer.register(outro);
  }
  self.tick = function() //return 0 for continue, 1 for lose, 2 for win
  {
    //let scene handle ticking of doodles, any other ticks can go here
    if(p.halfCycles > 10)
    {
      self.mode = 2;
      won = true;
    }

    if(finished) return finished+won;
  }
  self.draw = function()
  {
    //let scene handle drawing of doodles, any other draws can go here
  }
  self.end = function()
  {
    scene.drawer.unregister(p);
    scene.clicker.unregister(p);
    scene.ticker.unregister(intro);
    scene.drawer.unregister(intro);
    scene.ticker.unregister(outro);
    scene.drawer.unregister(outro);
  }
  self.introFinished = function()
  {
    self.mode = 1;
  }
  self.outroFinished = function()
  {
    finished = true;
  }
};




var B_GrabKeysPane = function(scene)
{
  var finished = false;
  var won = false;

  var hand_open_img = scene.assetter.asset("bike_hand_open.png");
  var hand_hit_img = scene.assetter.asset("bike_hand_hit.png");
  var hand_closed_img = scene.assetter.asset("bike_hand_closed.png");
  var keys_img = scene.assetter.asset("bike_keys.png");
  var smack_img = scene.assetter.asset("bike_smack.png");
  var fail_img = scene.assetter.asset("bike_fail.png");
  var intro_text_img = scene.assetter.asset("bike_excuse_keys.png");
  var outro_text_img = scene.assetter.asset("bike_victory_keys.png");

  var Intro = function(pane)
  {
    var self = this;
    self.intro_count = 0;
    self.tick = function()
    {
      if(pane.mode != 0) return;
      self.intro_count+=0.5;
      if(self.intro_count > 100) pane.introFinished();
    }
    self.draw = function(canv)
    {
      var x;
      if(self.intro_count < 5)        x = -500+((self.intro_count/5)*500);
      else if(self.intro_count < 95)  x = (((self.intro_count-5)/90)*100);
      else if(self.intro_count < 100) x = 100+(((self.intro_count-95)/5)*500);
      else return;

      canv.context.drawImage(intro_text_img, x, 100, 500, 500);
    }
  }

  var Outro = function(pane)
  {
    var self = this;
    self.outro_count = 0;
    self.tick = function()
    {
      if(pane.mode != 2) return;
      self.outro_count+=0.5;
      if(self.outro_count > 100) pane.outroFinished();
    }
    self.draw = function(canv)
    {
      var x;
      if(self.outro_count < 5)        x = -500+((self.outro_count/5)*500);
      else if(self.outro_count < 95)  x = (((self.outro_count-5)/90)*100);
      else if(self.outro_count < 100) x = 100+(((self.outro_count-95)/5)*500);
      else return;

      canv.context.drawImage(outro_text_img, x, 100, 500, 500);
    }
  }

  var Hand = function(pane)
  {
    var self = this;
    self.x = 540;
    self.y = 300;
    self.w = 640;
    self.h = 320;

    self.tapped = false;
    self.grabbed = false;

    self.tick = function()
    {
      if(pane.mode != 1) return;
      if(self.tapped)
      {
        pane.handTapped();
      }
      else if(h.x < 20)
      {
        self.grabbed = true;
        pane.handGrabbed();
      }
      else self.x-=5; //move left
    }
    self.click = function()
    {
      if(pane.mode != 1) return;
      self.tapped = true;
    }
    self.draw = function(canv) //handle drawing keys here too, because of swapping precidence
    {
      if(self.grabbed || self.tapped) //draw keys first
        canv.context.drawImage(keys_img,30,200,150,300);

      if(self.tapped) canv.context.drawImage(hand_hit_img,self.x,self.y,self.w,self.h);
      else if(self.grabbed) canv.context.drawImage(hand_closed_img,self.x,self.y,self.w,self.h);
      else canv.context.drawImage(hand_open_img,self.x,self.y,self.w,self.h);

      if(!self.grabbed && !self.tapped) //draw keys second
        canv.context.drawImage(keys_img,30,200,150,300);

    }
  }

  var h;
  var intro;
  var outro;
  var self = this;
  self.mode = 0;
  self.begin = function()
  {
    finished = false;
    won = false;
    self.mode = 0;

    h = new Hand(self);
    intro = new Intro(self);
    outro = new Outro(self);
    scene.ticker.register(h);
    scene.drawer.register(h);
    scene.clicker.register(h);
    scene.ticker.register(intro);
    scene.drawer.register(intro);
    scene.ticker.register(outro);
    scene.drawer.register(outro);
  }
  self.tick = function() //return 0 for continue, 1 for lose, 2 for win
  {
    //let scene handle ticking of doodles, any other ticks can go here
    if(finished) return finished+won; //#clever
  }
  self.draw = function()
  {
    //let scene handle drawing of doodles, any other draws can go here
  }
  self.end = function()
  {
    scene.ticker.unregister(h);
    scene.drawer.unregister(h);
    scene.clicker.unregister(h);
    scene.ticker.unregister(intro);
    scene.drawer.unregister(intro);
    scene.ticker.unregister(outro);
    scene.drawer.unregister(outro);
  }

  self.handTapped = function()
  {
    won = true;
    self.mode = 2;
  }
  self.handGrabbed = function()
  {
    won = false;
    self.mode = 2;
  }
  self.introFinished = function()
  {
    self.mode = 1;
  }
  self.outroFinished = function()
  {
    finished = true;
  }
};


var B_CardChoicePane = function(scene)
{
  var finished = false;
  var won = false;

  var card_img = scene.assetter.asset("bike_card.png");
  var dull_square_img = scene.assetter.asset("bike_dull_square.png");
  var glow_square_img = scene.assetter.asset("bike_glow_square.png");
  var bike_img = scene.assetter.asset("bike_bike.png");
  var gas_img = scene.assetter.asset("bike_gas.png");
  var intro_text_img = scene.assetter.asset("bike_excuse_card.png");
  var outro_text_img = scene.assetter.asset("bike_victory_card.png");

  var Intro = function(pane)
  {
    var self = this;
    self.intro_count = 0;
    self.tick = function()
    {
      if(pane.mode != 0) return;
      self.intro_count+=0.5;
      if(self.intro_count > 100) pane.introFinished();
    }
    self.draw = function(canv)
    {
      var x;
      if(self.intro_count < 5)        x = -500+((self.intro_count/5)*500);
      else if(self.intro_count < 95)  x = (((self.intro_count-5)/90)*100);
      else if(self.intro_count < 100) x = 100+(((self.intro_count-95)/5)*500);
      else return;

      canv.context.drawImage(intro_text_img, x, 100, 500, 200);
    }
  }

  var Outro = function(pane)
  {
    var self = this;
    self.outro_count = 0;
    self.tick = function()
    {
      if(pane.mode != 2) return;
      self.outro_count+=0.5;
      if(self.outro_count > 100) pane.outroFinished();
    }
    self.draw = function(canv)
    {
      var x;
      if(self.outro_count < 5)        x = -500+((self.outro_count/5)*500);
      else if(self.outro_count < 95)  x = (((self.outro_count-5)/90)*100);
      else if(self.outro_count < 100) x = 100+(((self.outro_count-95)/5)*500);
      else return;

      canv.context.drawImage(outro_text_img, x, 100, 500, 200);
    }
  }

  var Card = function(pane)
  {
    var self = this;
    self.x = 200;
    self.y = 300;
    self.w = 200;
    self.h = 300;
    self.touch_offset_x = 0;
    self.touch_offset_y = 0;

    self.dragStart  = function(evt)
    {
      if(pane.mode != 1) return;
      self.touch_offset_x = self.x+(self.w/2)-evt.doX;
      self.touch_offset_y = self.y+(self.h/2)-evt.doY;
    };
    self.drag = function(evt)
    {
      if(pane.mode != 1) return;
      self.x = evt.doX-(self.w/2)+self.touch_offset_x;
      self.y = evt.doY-(self.h/2)+self.touch_offset_y;
    };
    self.dragFinish = function()
    {
      if(pane.mode != 1) return;
      pane.cardStoppedDrag();
    };

    self.draw = function(canv)
    {
      canv.context.drawImage(card_img,self.x,self.y,self.w,self.h);
    }
  }

  var GlowBox = function(pane)
  {
    var self = this;
    self.x = 50;
    self.y = 50;
    self.w = 200;
    self.h = 200;

    self.glow = false;

    self.collide = function(obj)
    {
      return (self.x+self.w > obj.x) && (self.x < obj.x+obj.w) && (self.y+self.h > obj.y) && (self.y < obj.y+obj.h);
    }

    self.draw = function(canv)
    {
      if(self.glow) canv.context.drawImage(glow_square_img,self.x,self.y,self.w,self.h);
      else          canv.context.drawImage(dull_square_img,self.x,self.y,self.w,self.h);
      canv.context.drawImage(self.img,self.x+30,self.y+30,self.w-60,self.h-60);
    }
  }

  var c;
  var b_box;
  var g_box;
  var intro;
  var outro;
  var self = this;
  self.mode = 0;
  self.begin = function()
  {
    finished = false;
    won = false;
    self.mode = 0;

    c = new Card(self);
    b_box = new GlowBox(self);
    b_box.img = bike_img;
    b_box.x = 50;
    g_box = new GlowBox(self);
    g_box.img = gas_img;
    g_box.x = 400;
    intro = new Intro(self);
    outro = new Outro(self);
    scene.drawer.register(b_box);
    scene.drawer.register(g_box);
    scene.drawer.register(c);
    scene.dragger.register(c);
    scene.drawer.register(intro);
    scene.ticker.register(intro);
    scene.drawer.register(outro);
    scene.ticker.register(outro);
  }
  self.tick = function() //return 0 for continue, 1 for lose, 2 for win
  {
    //let scene handle ticking of doodles, any other ticks can go here
    b_box.glow = b_box.collide(c);
    g_box.glow = g_box.collide(c);

    if(finished) return finished+won; //#clever
  }
  self.draw = function(canv)
  {
    //let scene handle drawing of doodles, any other draws can go here
  }
  self.end = function()
  {
    scene.drawer.unregister(c);
    scene.drawer.unregister(b_box);
    scene.drawer.unregister(g_box);
    scene.dragger.unregister(c);
    scene.drawer.register(intro);
    scene.ticker.register(intro);
    scene.drawer.register(outro);
    scene.ticker.register(outro);
  }

  self.cardStoppedDrag = function()
  {
    if(b_box.collide(c) && !g_box.collide(c))
    {
      self.mode = 2;
      win = true;
    }
    if(g_box.collide(c) && !b_box.collide(c))
    {
      self.mode = 2;
      win = false;
    }
  }

  self.introFinished = function()
  {
    self.mode = 1;
  }
  self.outroFinished = function()
  {
    finished = true;
  }
};

