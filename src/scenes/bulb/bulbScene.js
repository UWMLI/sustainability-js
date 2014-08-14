var BulbScene = function(game, canv)
{
  var self = this;

  self.ticker;
  self.clicker;
  self.drawer;
  self.assetter;

  self.player;
  self.buttons;
  self.enemies;
  self.bulbs;

  self.enemyFactory;
  self.bulbFactory;

  self.numFloors = 5;

  self.ready = function()
  {
    self.ticker = new Ticker();
    self.clicker = new Clicker();
    self.drawer = new Drawer(canv);
    self.assetter = new Assetter();

    self.player = new BU_Player(self);
    self.buttons = [];
    self.enemies = [];
    self.bulbs = [];

    self.enemyFactory = new BU_EnemyFactory(self);
    self.bulbFactory = new BU_BulbFactory(self);

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

var BU_Player = function(game)
{
  var self = this;
  self.floor = 0;
  self.img = game.assetter.asset("assets/man.png");

  self.setFloor = function(floor)
  {
    if(floor == self.floor) game.bulbFactory.produce();
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

var BU_EnemyFactory = function(game)
{
  var self = this;

  self.tick = function()
  {
    if(Math.random() < 0.01)
    {
      
      var e = new BU_Enemy(game,Math.floor(Math.random()*game.numFloors));
      game.enemies.push(e);
      game.ticker.register(e);
      game.drawer.register(e);
    }
  }
}

var BU_Enemy = function(game, floor)
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


var BU_BulbFactory = function(game)
{
  var self = this;

  self.produce = function()
  {
    var s = new BU_Bulb(game,game.player.floor);
    game.bulbs.push(s);
    game.ticker.register(s);
    game.drawer.register(s);
  }
}

var BU_Bulb = function(game, floor)
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
    game.bulbs.splice(game.bulbs.indexOf(self),1);
    game.ticker.unregister(self);
    game.drawer.unregister(self);
  }
}

