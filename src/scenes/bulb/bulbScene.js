//
//NOTE-
//Floor 0 = top floor
//Bulb 0 = left bulb
//

var BulbScene = function(game, canv)
{
  var self = this;

  self.ticker;
  self.clicker;
  self.drawer;
  self.assetter;

  self.player;
  self.bulbs;
  self.janitors;

  self.floorHeight = 500;
  self.floorWidth = 500;
  self.houseOffX = 100;
  self.houseOffY = 100;
  self.numFloors = 5;
  self.bulbsPerFloor = 5;

  self.ready = function()
  {
    self.ticker = new Ticker();
    self.clicker = new Clicker();
    self.drawer = new Drawer(canv);
    self.assetter = new Assetter();

    self.player = new BU_Player(self, 0);

    self.bulbs = [];
    self.nullBulb = new BU_Bulb(self,0,0);
    for(var i = 0; i < self.numFloors; i++)
      for(var j = 0; j < self.bulbsPerFloor; j++)
        self.bulbs.push(new BU_Bulb(self, i, j));

    self.janitors = [];
    self.janitors.push(new BU_Janitor(self, 0));
    self.janitors.push(new BU_Janitor(self, self.numFloors-1));

    for(var i = 0; i < self.bulbs.length; i++)
    {
      self.clicker.register(self.bulbs[i]);
      self.ticker.register(self.bulbs[i]);
      self.drawer.register(self.bulbs[i]);
    }
    for(var i = 0; i < self.janitors.length; i++)
    {
      self.ticker.register(self.janitors[i]);
      self.drawer.register(self.janitors[i]);
    }

    self.ticker.register(self.player);
    self.drawer.register(self.player);
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

  self.spend = function()
  {
  }

  self.bulbAt = function(node)
  {
    for(var i = 0; i < self.bulbs.length; i++)
    {
      if(self.bulbs[i].node.n_y == node.n_y && self.bulbs[i].node.n_x == node.n_x)
        return self.bulbs[i];
    }
    return self.nullBulb;
  }

  self.injectNearestGoalIntoNode = function(fromNode,node)
  {
    var bestNode;
    var bestScore = 10000000; //terrible
    for(var i = 0; i < self.bulbs.length; i++)
    {
      if(!(self.bulbs[i].type == "BURNT_GOOD" || self.bulbs[i].type == "BURNT_BAD" || self.bulbs[i].type == "NONE")) continue;
      var score = Math.abs(self.bulbs[i].node.n_y - fromNode.n_y)*(10*self.bulbsPerFloor)+Math.abs(self.bulbs[i].node.n_x - fromNode.n_x);
      if(score < bestScore) { bestScore = score; bestNode = self.bulbs[i].node; }
    }
    if(!bestNode) return;
    node.configure(bestNode.n_x,bestNode.n_y);
  }
};

//standardize grid positions, origin top left
var BU_Node = function(game)
{
  var self = this;

  //allow node re-use (per-frame allocs blow in js)
  self.configure = function(x,y)
  {
    self.n_x = x;
    self.n_y = y;

    self.x = game.houseOffX+(x*(game.floorWidth/game.bulbsPerFloor+1));
    self.y = game.houseOffY+(y*(game.floorHeight/game.numFloors+1));
    self.w = 0;
    self.h = 0;
    return self;
  }
  self.becomeNodeNearest = function(x,y)
  {
    var nx = Math.round((x-game.houseOffX)/(game.floorWidth/game.bulbsPerFloor+1));
    var ny = Math.round((y-game.houseOffY)/(game.floorHeight/game.numFloors+1));
    return self.configure(nx,ny);
  }
  self.configure(0,0);
}

var BU_Player = function(game, floor)
{
  //almost identical to janitor
  var self = this;

  var node = new BU_Node(game); //for re-use throughout lifetime

  self.floor = floor;
  self.w = 100;
  self.h = 100;
  node.configure(0,floor);
  self.x = node.x-(self.w/2);
  self.y = node.y-(self.h/2);
  self.goalNode = new BU_Node(game);
  self.img = game.assetter.asset("assets/man.png");

  self.tick = function()
  {
    if(self.floor != self.goalNode.n_y)
    {
      node.configure(game.bulbsPerFloor,self.floor);
      if(self.x+(self.w/2) < node.x) self.x++;
      else { self.floor = self.goalNode.n_y; self.y = self.goalNode.y-(self.h/2); }
    }
    else
    {
      if(self.x+(self.w/2) < self.goalNode.x) self.x++;
      else if(self.x+(self.w/2) > self.goalNode.x) self.x--;
      else game.bulbAt(self.goalNode).setType("GOOD");
    }
  }

  self.draw = function(canv)
  {
    canv.context.drawImage(self.img,self.x,self.y,self.w,self.h);
  }
}

var BU_Janitor = function(game, floor)
{
  var self = this;

  var node = new BU_Node(game); //for re-use throughout lifetime

  self.floor = floor;
  self.w = 100;
  self.h = 100;
  node.configure(0,floor);
  self.x = node.x-(self.w/2);
  self.y = node.y-(self.h/2);
  self.goalNode = new BU_Node(game);
  self.lastNode = new BU_Node(game);
  self.img = game.assetter.asset("assets/man.png");

  self.tick = function()
  {
    game.injectNearestGoalIntoNode(self.lastNode.becomeNodeNearest(self.x+(self.w/2),self.y+(self.h/2)), self.goalNode);
    if(self.floor != self.goalNode.n_y)
    {
      node.configure(game.bulbsPerFloor,self.floor);
      if(self.x+(self.w/2) < node.x) self.x++;
      else { self.floor = self.goalNode.n_y; self.y = self.goalNode.y-(self.h/2); }
    }
    else
    {
      if(self.x+(self.w/2) < self.goalNode.x) self.x++;
      else if(self.x+(self.w/2) > self.goalNode.x) self.x--;
      else game.bulbAt(self.goalNode).setType("BAD");
    }
  }

  self.draw = function(canv)
  {
    canv.context.drawImage(self.img,self.x,self.y,self.w,self.h);
  }

}

var BU_Bulb = function(game, floor, bulb)
{
  var self = this;

  self.ticksPerTick = 100;
  self.ticksTilTick = self.ticksPerTick;

  self.node = new BU_Node(game); //for re-use throughout lifetime
  self.w = 20;
  self.h = 20;
  self.node.configure(bulb,floor);
  self.x = self.node.x-(self.w/2);
  self.y = self.node.y-(self.h/2);

  self.img = game.assetter.asset("assets/man.png");

  self.type = "NONE";
  self.dollarPer = 0.0;
  self.energyPer = 0.0;
  self.light = 0.0;
  self.energy = 100.0; //never run out

  self.setType = function(type)
  {
    switch(type)
    {
      case "BAD":
        self.type = type;
        self.dollarPer = 0.25;
        self.energyPer = 5.0;
        self.light = 0.25;
        self.energy = 100.0;
        self.img = game.assetter.asset("assets/man.png");
        break;
      case "BURNT_BAD":
        self.type = type;
        self.dollarPer = 0.0;
        self.energyPer = 0.0;
        self.light = 0.0;
        self.energy = 100.0;
        self.img = game.assetter.asset("assets/man.png");
        break;
      case "GOOD":
        self.type = type;
        self.dollarPer = 0.15;
        self.energyPer = 3.0;
        self.light = 0.35;
        self.energy = 100.0;
        self.img = game.assetter.asset("assets/man.png");
        break;
      case "BURNT_GOOD":
        self.type = type;
        self.dollarPer = 0.0;
        self.energyPer = 0.0;
        self.light = 0.0;
        self.energy = 100.0;
        self.img = game.assetter.asset("assets/man.png");
        break;
      case "NONE":
      default:
        self.type = type;
        self.dollarPer = 0.0;
        self.energyPer = 0.0;
        self.light = 0.0;
        self.energy = 100.0;
        self.img = game.assetter.asset("assets/man.png");
        break;
    }
  }

  self.click = function()
  {
    game.player.bulbClicked(self.node);
  }

  self.tick = function()
  {
    self.ticksTilTick--;
    if(self.ticksTilTick <= 0)
    {
      self.ticksTilTick = self.ticksPerTick;
      self.energy -= self.energyPer;
      game.spend(self.dollarPer);
      if(self.energy <= 0) self.setType("BURNT_"+self.type);
    }
  }

  self.draw = function(canv)
  {
    canv.context.drawImage(self.img,self.x,self.y,self.w,self.h);
    switch(self.type)
    {
      case "NONE": canv.context.strokeStyle = "#000000"; break;
      case "GOOD": canv.context.strokeStyle = "#00FF00"; break;
      case "BURNT_GOOD": canv.context.strokeStyle = "#005500"; break;
      case "BAD": canv.context.strokeStyle = "#FF0000"; break;
      case "BURNT_BAD": canv.context.strokeStyle = "#550000"; break;
    }
    canv.context.strokeRect(self.x,self.y,self.w,self.h);
  }
}

