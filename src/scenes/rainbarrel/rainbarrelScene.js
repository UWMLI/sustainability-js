var RainBarrelScene = function(game, canv)
{
  var self = this;

  self.ticker;
  self.clicker;
  self.drawer;

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

    self.player = new RB_Player(self);
    self.buttons = [];
    self.enemies = [];
    self.sweaters = [];

    self.enemyFactory = new RB_EnemyFactory(self);

    self.buttons.push(new Clickable({"x":0,"y":100,"w":100,"h":100,"callback":function(){self.player.floor = 4;}}));
    self.buttons.push(new Clickable({"x":0,"y":200,"w":100,"h":100,"callback":function(){self.player.floor = 3;}}));
    self.buttons.push(new Clickable({"x":0,"y":300,"w":100,"h":100,"callback":function(){self.player.floor = 2;}}));
    self.buttons.push(new Clickable({"x":0,"y":400,"w":100,"h":100,"callback":function(){self.player.floor = 1;}}));
    self.buttons.push(new Clickable({"x":0,"y":500,"w":100,"h":100,"callback":function(){self.player.floor = 0;}}));
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

var RB_EnemyFactory = function(game)
{
  var self = this;

  self.tick = function()
  {
    if(Math.random() < 0.01)
    {
      
      var E = new RB_Enemy(game,Math.floor(Math.random()*game.numFloors));
      game.enemies.push(E);
      game.ticker.register(E);
      game.drawer.register(E);
    }
  }
}

var RB_Enemy = function(game, floor)
{
  var self = this;

  self.floor = floor;
  self.x = 1000;
  self.y = (game.numFloors-self.floor)*100;

  //switch asset, and don't actually load new image for every entity
  var man = new Image();
  man.src = "assets/man.png";

  self.tick = function()
  {
    self.x--;
    if(self.x < -20)
    {
      game.enemies.splice(game.enemies.indexOf(self),1);
      game.ticker.unregister(self);
      game.drawer.unregister(self);
    }
  }

  self.draw = function(canv)
  {
    canv.context.drawImage(man,self.x,self.y,50,50);
  }
}

