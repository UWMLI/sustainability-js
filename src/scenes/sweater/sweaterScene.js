var SweaterScene = function(game, canv)
{
  var self = this;

  self.ticker;
  self.clicker;
  self.drawer;
  self.assetter;

  self.player;
  self.buttons;
  self.enemies;
  self.sweaters;

  self.enemyFactory;
  self.sweaterFactory;

  self.numFloors = 5;

  self.ready = function()
  {
    self.ticker = new Ticker();
    self.clicker = new Clicker();
    self.drawer = new Drawer(canv);
    self.assetter = new Assetter();

    self.player = new SW_Player(self);
    self.buttons = [];
    self.enemies = [];
    self.sweaters = [];

    self.enemyFactory = new SW_EnemyFactory(self);
    self.sweaterFactory = new SW_SweaterFactory(self);

    self.buttons.push(new Clickable({"x":0,"y":100,"w":100,"h":100,"click":function(){self.player.setFloor(4);}}));
    self.buttons.push(new Clickable({"x":0,"y":200,"w":100,"h":100,"click":function(){self.player.setFloor(3);}}));
    self.buttons.push(new Clickable({"x":0,"y":300,"w":100,"h":100,"click":function(){self.player.setFloor(2);}}));
    self.buttons.push(new Clickable({"x":0,"y":400,"w":100,"h":100,"click":function(){self.player.setFloor(1);}}));
    self.buttons.push(new Clickable({"x":0,"y":500,"w":100,"h":100,"click":function(){self.player.setFloor(0);}}));
    for(var i = 0; i < self.buttons.length; i++)
    {
      self.clicker.register(self.buttons[i]);
      self.drawer.register(self.buttons[i]);
    }

    self.ticker.register(self.player);
    self.drawer.register(self.player);

    self.ticker.register(self.enemyFactory);
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

var SW_EnemyFactory = function(game)
{
  var self = this;

  self.tick = function()
  {
    if(Math.random() < 0.01)
    {
      
      var e = new SW_Enemy(game,Math.floor(Math.random()*game.numFloors));
      game.enemies.push(e);
      game.ticker.register(e);
      game.drawer.register(e);
    }
  }
}

var SW_Enemy = function(game, floor)
{
  var self = this;

  self.floor = floor;
  self.x = 1000;
  self.y = (game.numFloors-self.floor)*100;
  self.w = 50;
  self.h = 50;

  self.img = game.assetter.asset("assets/man.png");

  self.tick = function()
  {
    self.x--;
    if(self.x < -20) self.kill();
  }

  self.draw = function(canv)
  {
    canv.context.drawImage(self.img,self.x,self.y,self.w,self.h);
  }

  self.kill = function()
  {
    game.enemies.splice(game.enemies.indexOf(self),1);
    game.ticker.unregister(self);
    game.drawer.unregister(self);
  }
}


var SW_SweaterFactory = function(game)
{
  var self = this;

  self.produce = function()
  {
    var s = new SW_Sweater(game,game.player.floor);
    game.sweaters.push(s);
    game.ticker.register(s);
    game.drawer.register(s);
  }
}

var SW_Sweater = function(game, floor)
{
  var self = this;

  self.floor = floor;
  self.x = 0;
  self.y = (game.numFloors-self.floor)*100;
  self.w = 50;
  self.h = 50;

  self.img = game.assetter.asset("assets/man.png");

  self.tick = function()
  {
    self.x++;
    if(self.x > 1000) self.kill();

    //collision resolution. could/should go in a collision handler. #umad
    for(var i = 0; i < game.enemies.length; i++)
    {
      if(self.floor == game.enemies[i].floor && self.x + (self.w/2) > game.enemies[i].x && self.x + (self.w/2) < game.enemies[i].x + game.enemies[i].w)
      {
        game.enemies[i].kill();
        self.kill();
        break;
      }
    }
  }

  self.draw = function(canv)
  {
    canv.context.drawImage(self.img,self.x,self.y,self.w,self.h);
  }

  self.kill = function()
  {
    game.sweaters.splice(game.sweaters.indexOf(self),1);
    game.ticker.unregister(self);
    game.drawer.unregister(self);
  }
}

