var SweaterScene = function(game, stage)
{
  var self = this;
  self.stage = stage;

  var physical_rect    = {x:0,y:0,w:stage.dispCanv.canvas.width,h:stage.dispCanv.canvas.height};
  var theoretical_rect = {x:0,y:0,w:stage.drawCanv.canvas.width,h:stage.drawCanv.canvas.height};
  self.ticker;
  self.clicker;
  self.drawer;
  self.assetter;

  self.house;
  self.player;
  self.buttons;
  self.enemies;
  self.sweaters;

  self.enemyFactory;
  self.sweaterFactory;

  self.numFloors = 5;

  self.sweatersThrown  = []; for(var i = 0; i < self.numFloors; i++) self.sweatersThrown[i]  = 0;
  self.enemiesAttacked = []; for(var i = 0; i < self.numFloors; i++) self.enemiesAttacked[i]      = 0;
  self.enemiesDefeated = []; for(var i = 0; i < self.numFloors; i++) self.enemiesDefeated[i] = 0;
  self.enemiesWon      = []; for(var i = 0; i < self.numFloors; i++) self.enemiesWon[i]      = 0;

  self.ready = function()
  {
    self.ticker = new Ticker({});
    self.clicker = new Clicker({source:stage.dispCanv.canvas,physical_rect:physical_rect,theoretical_rect:theoretical_rect});
    self.drawer = new Drawer({source:stage.drawCanv});
    self.assetter = new Assetter({});

    self.house = new SW_House(self);
    self.player = new SW_Player(self);
    self.buttons = [];
    self.enemies = [];
    self.sweaters = [];

    self.enemyFactory = new SW_EnemyFactory(self);
    self.sweaterFactory = new SW_SweaterFactory(self);

    //verbose, I know
    self.buttons.push(new Clickable({"x":self.house.x,"y":self.house.y+(self.house.h/self.numFloors)*0,"w":self.house.w,"h":self.house.h/self.numFloors,"click":function(){self.player.setFloor(4);}}));
    self.buttons.push(new Clickable({"x":self.house.x,"y":self.house.y+(self.house.h/self.numFloors)*1,"w":self.house.w,"h":self.house.h/self.numFloors,"click":function(){self.player.setFloor(3);}}));
    self.buttons.push(new Clickable({"x":self.house.x,"y":self.house.y+(self.house.h/self.numFloors)*2,"w":self.house.w,"h":self.house.h/self.numFloors,"click":function(){self.player.setFloor(2);}}));
    self.buttons.push(new Clickable({"x":self.house.x,"y":self.house.y+(self.house.h/self.numFloors)*3,"w":self.house.w,"h":self.house.h/self.numFloors,"click":function(){self.player.setFloor(1);}}));
    self.buttons.push(new Clickable({"x":self.house.x,"y":self.house.y+(self.house.h/self.numFloors)*4,"w":self.house.w,"h":self.house.h/self.numFloors,"click":function(){self.player.setFloor(0);}}));
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

  self.sweaterProduced = function(floor) { self.sweatersThrown[floor]++; }
  self.enemyProduced   = function(floor) { self.enemiesAttacked[floor]++; }
  self.enemyVictory    = function(floor) { self.enemiesWon[floor]++; }
  self.enemyFail       = function(floor) { self.enemiesDefeated[floor]++; }

};

var SW_House = function(game)
{
  var self = this;
  self.x = 100;
  self.y = 200;
  self.w = game.stage.drawCanv.canvas.width;
  self.h = game.stage.drawCanv.canvas.height-400;
}

var SW_Player = function(game)
{
  var self = this;
  self.floor = 0;
  //helper func
  function yForFloor(floor) { return game.house.y+(game.house.h/game.numFloors)*((game.numFloors-1)-self.floor); }

  self.x = game.house.x;
  self.y = yForFloor(0);
  self.w = 100;
  self.h = 100;

  self.img = game.assetter.asset("man.png");
  self.charge = 100;

  self.setFloor = function(floor)
  {
    self.floor = floor;
    if(self.charge >= 100)
    {
      game.sweaterFactory.produce();
      self.charge = 0;
    }
  }

  self.tick = function()
  {
    self.charge += 4;
    if(self.charge > 100) self.charge = 100;
  }

  self.draw = function(canv)
  {
    canv.context.drawImage(self.img,self.x,yForFloor(self.floor),self.w,self.h);
    canv.context.fillStyle = "#00FF00";
    canv.context.fillRect(self.x,yForFloor(self.floor)+self.h-((self.charge/100)*self.h),20,(self.charge/100)*self.h);
  }
}

var SW_EnemyFactory = function(game)
{
  var self = this;

  self.tick = function()
  {
    if(Math.random() < 0.01)
    {
      var floor = Math.floor(Math.random()*game.numFloors);
      game.enemyProduced(floor);
      var e = new SW_Enemy(game,floor);
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
  self.y = game.house.y+(game.house.h/game.numFloors)*((game.numFloors-1)-self.floor);
  self.w = 50;
  self.h = 50;

  self.speed = 8;

  self.img = game.assetter.asset("man.png");

  self.tick = function()
  {
    self.x -= self.speed;
    if(self.x < 100)
    {
      game.enemyVictory(self.floor);
      self.kill();
    }
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
    game.sweaterProduced(game.player.floor);
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
  self.x = 90;
  self.y = game.house.y+(game.house.h/game.numFloors)*((game.numFloors-1)-self.floor)+20;
  self.w = 50;
  self.h = 50;

  self.speed = 8;

  self.img = game.assetter.asset("man.png");

  self.tick = function()
  {
    self.x += self.speed;
    if(self.x > 1000) self.kill();

    //collision resolution. could/should go in a collision handler. #umad
    for(var i = 0; i < game.enemies.length; i++)
    {
      if(self.floor == game.enemies[i].floor && self.x + (self.w/2) > game.enemies[i].x && self.x + (self.w/2) < game.enemies[i].x + game.enemies[i].w)
      {
        game.enemyFail(self.floor);
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

