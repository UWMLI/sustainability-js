var RainBarrelScene = function(game, canv)
{
  var self = this;

  self.ticker;
  self.clicker;
  self.dragger;
  self.drawer;
  self.assetter;

  self.player;
  self.buttons;
  self.barrels;

  self.ready = function()
  {
    self.ticker = new Ticker();
    self.clicker = new Clicker();
    self.dragger = new Dragger();
    self.drawer = new Drawer(canv);
    self.assetter = new Assetter();

    self.buttons = [];
    self.barrels = [];

    self.buttons.push(new Draggable({"x":0,"y":100,"w":100,"h":100}));
    self.buttons.push(new Draggable({"x":0,"y":200,"w":100,"h":100}));
    self.buttons.push(new Draggable({"x":0,"y":300,"w":100,"h":100}));
    self.buttons.push(new Draggable({"x":0,"y":400,"w":100,"h":100}));
    self.buttons.push(new Draggable({"x":0,"y":500,"w":100,"h":100}));
    for(var i = 0; i < self.buttons.length; i++)
    {
      self.dragger.register(self.buttons[i]);
      self.drawer.register(self.buttons[i]);
    }

  };

  self.tick = function()
  {
    self.clicker.flush();
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

var SW_Player = function(game)
{
  var self = this;
  self.floor = 0;
  self.img = game.assetter.asset("assets/man.png");

  self.setFloor = function(floor)
  {
    if(floor == self.floor) game.sweaterFactory.produce();
    self.floor = floor;
  }

  self.tick = function()
  {

  }

  self.draw = function(canv)
  {
    canv.context.drawImage(self.img,10,(game.numFloors-self.floor)*100);
  }
}

var SW_Enemy = function(game, floor)
{
  var self = this;

  self.floor = floor;
  self.x = 1000;
  self.y = (game.numFloors-self.floor)*100;
  self.width = 50;
  self.height = 50;

  self.img = game.assetter.asset("assets/man.png");

  self.tick = function()
  {
    self.x--;
    if(self.x < -20) self.kill();
  }

  self.draw = function(canv)
  {
    canv.context.drawImage(self.img,self.x,self.y,self.width,self.height);
  }

  self.kill = function()
  {
    game.enemies.splice(game.enemies.indexOf(self),1);
    game.ticker.unregister(self);
    game.drawer.unregister(self);
  }
}

var SW_Sweater = function(game, floor)
{
  var self = this;

  self.floor = floor;
  self.x = 0;
  self.y = (game.numFloors-self.floor)*100;
  self.width = 50;
  self.height = 50;

  self.img = game.assetter.asset("assets/man.png");

  self.tick = function()
  {
    self.x++;
    if(self.x > 1000) self.kill();

    //collision resolution. could/should go in a collision handler. #umad
    for(var i = 0; i < game.enemies.length; i++)
    {
      if(self.floor == game.enemies[i].floor && self.x + (self.width/2) > game.enemies[i].x && self.x + (self.width/2) < game.enemies[i].x + game.enemies[i].width)
      {
        game.enemies[i].kill();
        self.kill();
        break;
      }
    }
  }

  self.draw = function(canv)
  {
    canv.context.drawImage(self.img,self.x,self.y,self.width,self.height);
  }

  self.kill = function()
  {
    game.sweaters.splice(game.sweaters.indexOf(self),1);
    game.ticker.unregister(self);
    game.drawer.unregister(self);
  }
}

