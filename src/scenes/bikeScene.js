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

  var Hand = function(pane)
  {
    var self = this;
    self.x = 200;
    self.y = 300;
    self.w = 100;
    self.h = 500;
    self.tick = function()
    {
      self.x-=0.1; //move left
    }
    self.click = function()
    {
      pane.handTapped();
    }
    self.draw = function(canv)
    {
      canv.context.strokeStyle = "#00FF00";
      canv.context.strokeRect(self.x,self.y,self.w,self.h);
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
    if(h.x < 0)
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
};

var B_PumpTirePane = function(scene)
{
  var finished = false;
  var won = false;

  var Pump = function(pane)
  {
    var self = this;
    self.x = 200;
    self.y = 300;
    self.offY = 0;
    self.w = 100;
    self.h = 500;

    self.handleY = 300;
    self.lastState = 0; //0 = down, 1 = up
    self.halfCycles = 0;

    self.tick = function()
    {
    }

    self.dragStart  = function(evt)
    {
      self.offY = self.handleY+(self.h/2)-evt.doY;
    };
    self.drag = function(evt)
    {
      self.handleY = evt.doY-(self.h/2)+self.offY;
      if(self.handleY > 380) //handle down
      {

        if(self.lastState == 1) self.halfCycles++;
        self.lastState = 0;
        self.handleY = 380;
      }
      if(self.handleY < 220) //handle up
      {
        if(self.lastState == 0) self.halfCycles++;
        self.lastState = 1;
        self.handleY = 220;
      }
    };
    self.dragFinish = function()
    {
    };

    self.draw = function(canv)
    {
      canv.context.strokeStyle = "#00FF00";
      canv.context.strokeRect(self.x,self.y,self.w,self.h);
      canv.context.strokeRect(self.x,self.handleY,self.w,self.h);
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

