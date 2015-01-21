var IntroScene = function(game, stage)
{
  var self = this;
  self.stage = stage;

  var physical_rect    = {x:0,y:0,w:stage.dispCanv.canvas.width,h:stage.dispCanv.canvas.height};
  var theoretical_rect = {x:0,y:0,w:stage.drawCanv.canvas.width,h:stage.drawCanv.canvas.height};
  self.dbugger;
  self.ticker;
  self.clicker;
  self.drawer;
  self.particler;
  self.assetter;

  self.start;

  self.ready = function()
  {
    self.dbugger = new Debugger({source:document.getElementById("debug_div")});
    self.ticker = new Ticker({});
    self.clicker = new Clicker({source:stage.dispCanv.canvas,physical_rect:physical_rect,theoretical_rect:theoretical_rect});
    self.drawer = new Drawer({source:stage.drawCanv});
    self.particler = new Particler({});
    self.assetter = new Assetter({});

    self.start = new IN_startButton(self);
    self.clicker.register(self.start);
    self.drawer.register(self.start);
  };

  self.tick = function()
  {
    self.clicker.flush();
    self.ticker.flush();
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
    self.drawer.clear();
    self.particler.clear();
    self.assetter.clear();

    self.dbugger.detach();
    self.ticker.detach();
    self.clicker.detach();
    self.drawer.detach();
    self.particler.detach();
    self.assetter.detach();
  };

  self.startClicked = function()
  {
    game.setScene(MainScene);
  }
};

var IN_startButton = function(game)
{
  var self = this;
  self.x = 0;
  self.y = 0;
  self.w = game.stage.drawCanv.canvas.width;
  self.h = game.stage.drawCanv.canvas.height;

  self.draw = function(canv)
  {
    canv.context.font = "30px comic_font";
    canv.context.fillText("START",self.x+self.w/2,self.y+self.h/2);
  }
  self.click = function()
  {
    game.startClicked();
  }
}

var IN_somethingElseButton = function()
{

}

