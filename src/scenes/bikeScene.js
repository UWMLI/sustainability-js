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
    self.panes.push(new B_GrabKeysPane(self));
    self.panes.push(new B_PumpTirePane(self));
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
      if(i == 1) console.log('lose :(');
      if(i == 2) console.log('win :)');
      self.currentPane = (self.currentPane+1)%self.panes.length;
      self.panes[self.currentPane].begin();
    }
  };

  self.draw = function()
  {
    self.drawer.flush();

    self.panes[self.currentPane].draw();
  };

  self.cleanup = function()
  {
  };
};

//mini scenes
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

  var Hand = function(pane)
  {
    var self = this;
    self.x = 540;
    self.y = 300;
    self.w = 640;
    self.h = 320;

    self.tapped = false;
    self.tappedCountDown = 100;

    self.grabbed = false;
    self.grabbedCountDown = 100;

    self.tick = function()
    {
      if(self.tapped)
      {
        //only alert parent after time for 'animation' has passed
        self.tappedCountDown--;
        if(self.tappedCountDown == 0)
        {
          pane.handTapped();
        }
      }
      else if(h.x < 20)
      {
        self.grabbed = true;
        //only alert parent after time for 'animation' has passed
        self.grabbedCountDown--;
        if(self.grabbedCountDown == 0)
        {
          pane.handGrabbed();
        }
      }
      else self.x-=3; //move left
    }
    self.click = function()
    {
      self.tapped = true;
    }
    self.draw = function(canv) //handle drawing keys here too, because of swapping precidence
    {
      if(self.grabbed) //draw keys first
        canv.context.drawImage(keys_img,30,200,150,300);

      if(self.tapped) canv.context.drawImage(hand_hit_img,self.x,self.y,self.w,self.h);
      else if(self.grabbed) canv.context.drawImage(hand_closed_img,self.x,self.y,self.w,self.h);
      else canv.context.drawImage(hand_open_img,self.x,self.y,self.w,self.h);

      if(!self.grabbed) //draw keys second
        canv.context.drawImage(keys_img,30,200,150,300);

    }
  }

  var h;
  var self = this;
  self.begin = function()
  {
    finished = false;
    won = false;
    h = new Hand(self);
    scene.ticker.register(h);
    scene.drawer.register(h);
    scene.clicker.register(h);
  }
  self.tick = function() //return 0 for continue, 1 for lose, 2 for win
  {
    //let scene handle ticking of doodles, any other ticks can go here
    return finished+won; //#clever
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
  }

  self.handTapped = function()
  {
    finished = true;
    won = true;
    console.log('tapped');
  }
  self.handGrabbed = function()
  {
    finished = true;
    won = false;
    console.log('grabbed');
  }

};

var B_PumpTirePane = function(scene)
{
  var finished = false;
  var won = false;

  var pump_base_img = scene.assetter.asset("bike_pump_base.png");
  var pump_handle_img = scene.assetter.asset("bike_pump_handle.png");

  var Pump = function(pane)
  {
    var self = this;
    self.x = 200;
    self.y = 200; //handle (used for drag)
    self.baseY = 300;
    self.offY = 0;
    self.w = 100;
    self.h = 500;

    self.lastState = 0; //0 = down, 1 = up
    self.halfCycles = 0;

    self.tick = function()
    {
    }

    self.dragStart  = function(evt)
    {
      self.offY = self.y+(self.h/2)-evt.doY;
    };
    self.drag = function(evt)
    {
      self.y = evt.doY-(self.h/2)+self.offY;
      if(self.y > 220) //handle down
      {

        if(self.lastState == 1) self.halfCycles++;
        self.lastState = 0;
        self.y = 220;
      }
      if(self.y < 80) //handle up
      {
        if(self.lastState == 0) self.halfCycles++;
        self.lastState = 1;
        self.y = 80;
      }
    };
    self.dragFinish = function()
    {
    };

    self.draw = function(canv)
    {
      canv.context.drawImage(pump_handle_img,self.x,self.y,self.w,self.h);
      canv.context.drawImage(pump_base_img,self.x,self.baseY,self.w,self.h);
    }
  }

  var p;
  var self = this;
  self.begin = function()
  {
    finished = false;
    won = false;
    p = new Pump(self);
    scene.ticker.register(p);
    scene.drawer.register(p);
    scene.dragger.register(p);
  }
  self.tick = function() //return 0 for continue, 1 for lose, 2 for win
  {
    //let scene handle ticking of doodles, any other ticks can go here
    if(p.halfCycles > 10)
    {
      finished = true;
      won = true;
    }

    return finished+won; //#clever
  }
  self.draw = function()
  {
    //let scene handle drawing of doodles, any other draws can go here
  }
  self.end = function()
  {
    scene.ticker.unregister(p);
    scene.drawer.unregister(p);
    scene.clicker.unregister(p);
  }
};

var B_CardChoicePane = function(scene)
{
  var finished = false;
  var won = false;

  var Card = function(pane)
  {
    var self = this;
    self.x = 200;
    self.y = 300;
    self.offY = 0;
    self.offX = 0;
    self.w = 100;
    self.h = 500;

    self.tick = function()
    {
    }

    self.dragStart  = function(evt)
    {
      self.offY = self.y+(self.h/2)-evt.doY;
      self.offX = self.x+(self.w/2)-evt.doX;
    };
    self.drag = function(evt)
    {
      self.y = evt.doY-(self.h/2)+self.offY;
      self.x = evt.doX-(self.w/2)+self.offX;
    };
    self.dragFinish = function()
    {
    };

    self.draw = function(canv)
    {
      canv.context.strokeStyle = "#00FF00";
      canv.context.strokeRect(self.x,self.y,self.w,self.h);
    }
  }

  var c;
  var self = this;
  self.begin = function()
  {
    finished = false;
    won = false;
    c = new Card(self);
    scene.ticker.register(c);
    scene.drawer.register(c);
    scene.dragger.register(c);
  }
  self.tick = function() //return 0 for continue, 1 for lose, 2 for win
  {
    //let scene handle ticking of doodles, any other ticks can go here
    if(c.x > 100 && c.x < 200 &&
       c.y > 100 && c.y < 200)
    {
      finished = true;
      won = true;
    }
    if(c.x > 200 && c.x < 300 &&
       c.y > 200 && c.y < 300)
    {
      finished = true;
      won = false;
    }

    return finished+won; //#clever
  }
  self.draw = function()
  {
    //let scene handle drawing of doodles, any other draws can go here
  }
  self.end = function()
  {
    scene.ticker.unregister(c);
    scene.drawer.unregister(c);
    scene.clicker.unregister(c);
  }
};

