//
//NOTE-
//Floor 0 = top floor
//Bulb 0 = left bulb
//

var BulbScene = function(game, stage)
{
  var self = this;
  self.stage = stage;

  var physical_rect    = {x:0,y:0,w:stage.dispCanv.canvas.width,h:stage.dispCanv.canvas.height};
  var theoretical_rect = {x:0,y:0,w:stage.drawCanv.canvas.width,h:stage.drawCanv.canvas.height};
  self.ticker;
  self.clicker;
  self.drawer;
  self.assetter;
  self.particler;

  self.house;
  self.nodes;
  self.player;
  self.bulbs;
  self.janitors;

  self.numFloors = 5;
  self.bulbsPerFloor = 5;

  self.ready = function()
  {
    self.ticker = new Ticker({});
    self.clicker = new Clicker({source:stage.dispCanv.canvas,physical_rect:physical_rect,theoretical_rect:theoretical_rect});
    self.drawer = new Drawer({source:stage.drawCanv});
    self.assetter = new Assetter({});
    self.particler = new Particler({});

    self.house = new BU_House(self);
    self.nodes = [];
    self.bulbs = [];
    for(var i = 0; i < self.numFloors; i++)
    {
      for(var j = 0; j < self.bulbsPerFloor; j++)
      {
        self.nodes[(i*(self.bulbsPerFloor+1))+j] = new BU_Node(self,j,i);
        self.bulbs[(i* self.bulbsPerFloor)   +j] = new BU_Bulb(self,self.node(j,i));
        self.bulb(j,i).setType("BAD");
        self.bulb(j,i).energy = Math.round(Math.random()*100);
      }
      self.nodes[(i*(self.bulbsPerFloor+1))+self.bulbsPerFloor] = new BU_Node(self,self.bulbsPerFloor,i); //create extra node (for elevator)
    }

    self.player = new BU_Dude(self, 0, "GOOD");

    self.janitors = [];
    self.janitors.push(new BU_Dude(self, 0, "BAD"));
    self.janitors.push(new BU_Dude(self, self.numFloors-1, "BAD"));

    self.drawer.register(self.house);
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
    self.drawer.register(self.particler);
    self.ticker.register(self.particler);
  };

  self.tick = function()
  {
    self.clicker.flush();
    self.ticker.flush();
    for(var i = 0; i < self.janitors.length; i++)
    {
      if(self.janitors[i].state != 2)
        self.janitors[i].goalNode = self.bestGoalFromNode(self.nodeNearest(self.janitors[i].x+(self.janitors[i].w/2),self.janitors[i].y+(self.janitors[i].h/2)));
    }
  };

  var ispent = 0;
  var theyspent = 0;
  self.draw = function()
  {
    self.drawer.flush();
    self.stage.drawCanv.context.font = "30px Georgia";
    self.stage.drawCanv.context.fillStyle = "#000000";
    self.stage.drawCanv.context.fillText("You spent:$"+Math.round(ispent*100)/100,25,25);
    self.stage.drawCanv.context.fillText("They spent:$"+Math.round(theyspent*100)/100,300,25);
  };

  self.cleanup = function()
  {
  };

  self.node = function(x,y) //fetch by index
  {
    return self.nodes[(y*(self.bulbsPerFloor+1))+x];
  }
  self.nodeNearest = function(pix_x,pix_y) //fetch by pixel position
  {
    var x = Math.floor((pix_x-self.house.x-self.house.x_padding)/(self.house.w/(self.bulbsPerFloor+1)));
    var y = Math.floor((pix_y-self.house.y-self.house.y_padding)/(self.house.h/self.numFloors));
    if(x > self.bulbsPerFloor) x = self.bulbsPerFloor;
    return self.node(x,y);
  }
  self.bulb = function(x,y)
  {
    return self.bulbs[(y*self.bulbsPerFloor)+x];
  }
  self.bulbAt = function(node)
  {
    return self.bulb(node.n_x,node.n_y);
  }
  self.bestGoalFromNode = function(node)
  {
    var bestNode;
    var bestScore = 10000000; //terrible
    for(var i = 0; i < self.bulbs.length; i++)
    {
      if(self.bulbs[i].type == "BURNT_GOOD" || self.bulbs[i].type == "BURNT_BAD" || self.bulbs[i].type == "NONE")
      {
        var n = self.bulbs[i].node;
        var score = bestScore+1; //less is better
        if(node.n_y == n.n_y)
          score = Math.abs(n.n_x - node.n_x);
        else
          score = ((self.bulbsPerFloor+1)-node.n_x) + Math.abs(n.n_y - node.n_y) + ((self.bulbsPerFloor+1)-n.n_x);
        if(score < bestScore) { bestScore = score; bestNode = n; }
      }
    }
    if(!bestNode) bestNode = node;
    return bestNode;
  }

  self.bulbClicked = function(bulb)
  {
    if(self.player.state == 0 || self.player.state == 1)
      self.player.goalNode = bulb.node;
  }

  self.bulbChanged = function(bulb)
  {
    //don't register particle here- sometimes change bulb programatically (init)
    //self.particler.register(new BU_PriceParticle(bulb.x,bulb.y,"$"+bulb.dollarsPer,"#000000",0));
  }

  self.purchaseBulb = function(bulb)
  {
    if(bulb.type == "BAD") theyspent += bulb.dollarsPer;
    if(bulb.type == "GOOD") ispent += bulb.dollarsPer;
    self.particler.register(new BU_PriceParticle(bulb.x+(bulb.w/2),bulb.y+(bulb.h/2),"$"+bulb.dollarsPer,30,"#000000",0));
  }

  var dollarsPerEnergy = 0.01;
  self.purchaseEnergy = function(bulb)
  {
    if(bulb.type == "BAD")  theyspent += (bulb.energyPer*dollarsPerEnergy);
    if(bulb.type == "GOOD") ispent += (bulb.energyPer*dollarsPerEnergy);
    self.particler.register(new BU_PriceParticle(bulb.x+(bulb.w/2),bulb.y+(bulb.h/2),"$"+(bulb.energyPer*dollarsPerEnergy),20,"#000000",(bulb.node.n_x+bulb.node.n_y)/20));
  }
};

var BU_House = function(game)
{
  var self = this;
  self.x = 100;
  self.y = 100;
  self.h = game.stage.drawCanv.canvas.height-200;
  self.w = game.stage.drawCanv.canvas.width-200;
  self.x_padding = 50;
  self.y_padding = 50;
  self.draw = function(canv)
  {
    canv.context.strokeStyle = "#00FF00";
    canv.context.strokeRect(self.x,self.y,self.w,self.h);
  }
}

//standardize grid positions
var BU_Node = function(game,x,y)
{
  var self = this;

  self.n_x = x;
  self.n_y = y;

  self.x = game.house.x+game.house.x_padding+(x*(game.house.w/(game.bulbsPerFloor+1)));
  self.y = game.house.y+game.house.y_padding+(y*(game.house.h/game.numFloors));
}

var BU_Dude = function(game, floor, bulb)
{
  var self = this;

  self.floor = floor;
  self.w = 100;
  self.h = 100;
  self.x = game.node(0,floor).x-(self.w/2);
  self.y = game.node(0,floor).y-(self.h/2);
  self.goalNode = game.node(0,floor);
  self.img = game.assetter.asset("man.png");

  self.state = 0; //0 = waiting; 1 = walking; 2 = changing
  self.changeTimer = 0;
  self.maxChangeTimer = 200;

  var epsillon = 1; //<- ridiculous
  self.eq = function(a,b) { return Math.abs(a-b) < epsillon; }
  self.less = function(a,b) { return a < (b-epsillon); }
  self.great = function(a,b) { return a > (b+epsillon); }
  self.tick = function()
  {
    if(self.state == 0 || self.state == 1) //should move to goal
    {
      if(self.floor != self.goalNode.n_y) //not on goal floor
      {
        if(self.less(self.x+(self.w/2), game.node(game.bulbsPerFloor,self.floor).x)) self.x++; //left of elevator
        else { self.floor = self.goalNode.n_y; self.y = self.goalNode.y-(self.h/2); } //at elevator
      }
      else //on goal floor
      {
             if(self.less( self.x+(self.w/2), self.goalNode.x)) self.x++; //left of goal
        else if(self.great(self.x+(self.w/2), self.goalNode.x)) self.x--; //right of goal
        else //at goal
        {
          var b = game.bulbAt(self.goalNode);
          if(b.type == "BURNT_GOOD" || b.type == "BURNT_BAD" || b.type == "NONE")
          {
            self.state = 2;
            self.changeTimer = 200;
            b.setType("CHANGING");
          }
        }
      }
    }
    else
    {
      self.changeTimer--;
      if(self.changeTimer <= 0)
      {
        game.bulbAt(self.goalNode).setType(bulb);
        game.purchaseBulb(game.bulbAt(self.goalNode));
        self.state = 0;
      }
    }
  }

  self.draw = function(canv)
  {
    canv.context.drawImage(self.img,self.x,self.y,self.w,self.h);
    canv.context.strokeStyle = "#00FF00";
    canv.context.strokeRect(self.x,self.y,self.w,self.h);
    if(self.state == 2) //changing
    {
      canv.context.fillStyle = "#00FF00";
      canv.context.fillRect(self.x,self.y+20,((self.maxChangeTimer-self.changeTimer)/self.maxChangeTimer)*self.w,10);
    }
  }
}

var BU_Bulb = function(game,node)
{
  var self = this;

  self.ticksPerTick = 100;
  self.ticksTilTick = self.ticksPerTick;

  self.node = node;
  self.w = 50;
  self.h = 50;
  self.x = self.node.x-(self.w/2);
  self.y = self.node.y-(self.h/2);

  self.img = game.assetter.asset("man.png");

  self.type = "NONE";
  self.dollarsPer = 0.0;
  self.energyPer = 0.0;
  self.light = 0.0;
  self.maxEnergy = 0; //prevent divide-by-0
  self.energy = self.maxEnergy;

  self.setType = function(type)
  {
    switch(type)
    {
      case "BAD":
        self.type = type;
        self.dollarsPer = 3;
        self.energyPer = 3.0;
        self.light = 0.25;
        self.maxEnergy = 100.0;
        self.energy = self.maxEnergy;
        self.img = game.assetter.asset("man.png");
        break;
      case "GOOD":
        self.type = type;
        self.dollarsPer = 15;
        self.energyPer = 0.2; // 1/3-1/30 less energy (1/15)
        self.light = 0.35;
        self.maxEnergy = 1500.0; //lasts 50x longer
        self.energy = self.maxEnergy;
        self.img = game.assetter.asset("man.png");
        break;
      case "BURNT_BAD":
        self.type = type;
        self.dollarsPer = 0.0;
        self.energyPer = 0.0;
        self.light = 0.0;
        self.maxEnergy = 0;
        self.energy = self.maxEnergy;
        self.img = game.assetter.asset("man.png");
        break;
      case "BURNT_GOOD":
        self.type = type;
        self.dollarsPer = 0.0;
        self.energyPer = 0.0;
        self.light = 0.0;
        self.maxEnergy = 0;
        self.energy = self.maxEnergy;
        self.img = game.assetter.asset("man.png");
        break;
      case "CHANGING":
        self.type = type;
        self.dollarsPer = 0.0;
        self.energyPer = 0.0;
        self.light = 0.0;
        self.maxEnergy = 0;
        self.energy = self.maxEnergy;
        self.img = game.assetter.asset("man.png");
        break;
      case "NONE":
      default:
        self.type = type;
        self.dollarsPer = 0.0;
        self.energyPer = 0.0;
        self.light = 0.0;
        self.maxEnergy = 0;
        self.energy = self.maxEnergy;
        self.img = game.assetter.asset("man.png");
        break;
    }
    game.bulbChanged(self);
  }

  self.click = function()
  {
    game.bulbClicked(self);
  }

  self.tick = function()
  {
    self.ticksTilTick--;
    if(self.ticksTilTick <= 0)
    {
      self.ticksTilTick = self.ticksPerTick;
      self.energy -= self.energyPer;
      if(self.energy > 0)
      {
        game.purchaseEnergy(self);
      }
      else if(self.maxEnergy > 0) self.setType("BURNT_"+self.type);
    }
  }

  self.draw = function(canv)
  {
    canv.context.drawImage(self.img,self.x,self.y,self.w,self.h);
    switch(self.type)
    {
      case "NONE":       canv.context.strokeStyle = "#FFFFFF"; break;
      case "CHANGING":   canv.context.strokeStyle = "#000000"; break;
      case "GOOD":       canv.context.strokeStyle = "#00FF00"; break;
      case "BURNT_GOOD": canv.context.strokeStyle = "#005500"; break;
      case "BAD":        canv.context.strokeStyle = "#FF0000"; break;
      case "BURNT_BAD":  canv.context.strokeStyle = "#550000"; break;
    }
    canv.context.strokeRect(self.x,self.y,self.w,self.h);

    if(self.type == "GOOD" || self.type == "BAD")
    {
      canv.context.fillStyle = "#00FF00";
      canv.context.fillRect(self.x,self.y+((1-(self.energy/self.maxEnergy))*self.h),10,(self.energy/self.maxEnergy)*self.h);
    }
  }
}

var BU_PriceParticle = function(x,y,text,size,color,delay)
{
  var self = this;
  self.x = x;
  self.sy = y;
  self.y = y;
  self.ey = y-50;
  self.t = -delay;
  self.text = text;
  self.size = size;
  self.c = color;
  self.tick = function()
  {
    self.t += 0.01;
    self.y = self.y+(self.ey-self.y)/50;
    return self.t < 1;
  }
  self.draw = function(canv)
  {
    if(self.t < 0) return;
    canv.context.globalAlpha = 1-(self.t*self.t*self.t);
    canv.context.font = self.size+"px Georgia";
    canv.context.fillStyle = self.c;
    canv.context.fillText(self.text,self.x-25,self.y);
    canv.context.globalAlpha = 1.0;
  }
}



