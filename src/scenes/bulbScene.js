//
//NOTE-
//Floor 0 = top floor
//Bulb 0 = left bulb
//

var BU_Constants = //global for ease of access
{
  BULB_NONE:             0,
  BULB_CHANGING:         1,
  BULB_INCANDESCENT_ON:  2,
  BULB_INCANDESCENT_OUT: 3,
  BULB_LED_ON:           4,
  BULB_LED_OUT:          5,

  out_index: [0,1,3,3,5,5], //type to set on burnout

  cost:      [0,0,  1.25,0,   35,0], //dollars
  energy_w:  [0,0,    60,0,   10,0], //watts (j/s)
  energy_jh: [0,0,216000,0,36000,0], //j/h
  lifespan:  [0,0,  1200,0,50000,0], //hours

  electricity_cost:0.00000003, //$/j
  hours_per_tick:0.5, //hours... duh
};
var BU_c = BU_Constants; //for terseness

var BulbScene = function(game, stage)
{
  var self = this;
  self.stage = stage;

  //try to inject as much intro stuff as possible here
  self.viewing = 0; //0- intro, 1- gameplay, 2- outro

  self.intro_vid_src = "assets/sample.webm";
  self.intro_vid_stamps = [];
  self.outro_vid_src = "assets/sample.webm";
  self.outro_vid_stamps = [];

  self.beginGame = function()
  {
    self.viewing = 1;
    self.clicker.unregister(self.beginButton);

    // register all gameplay stuff
    for(var i = 0; i < self.bulbs.length; i++)
    {
      self.presser.register(self.bulbs[i]);
      self.ticker.register(self.bulbs[i]);
    }
    self.ticker.register(self.player); //register player before janitor to prioritize player in changing bulbs
    for(var i = 0; i < self.janitors.length; i++)
      self.ticker.register(self.janitors[i]);
    self.ticker.register(self.particler);
    // end register
  }

  self.endGame = function()
  {
    self.viewing = 2;
    game.playVid(self.outro_vid_src, self.outro_vid_stamps, function(){game.setScene(MainScene);});
  }

  self.beginButton = self.beginButton = new Clickable( { "x":0, "y":0, "w":stage.drawCanv.canvas.width, "h":stage.drawCanv.canvas.height, "click":self.beginGame });

  //end intro stuff


  var physical_rect    = {x:0,y:0,w:stage.dispCanv.canvas.width,h:stage.dispCanv.canvas.height};
  var theoretical_rect = {x:0,y:0,w:stage.drawCanv.canvas.width,h:stage.drawCanv.canvas.height};
  self.ticker;
  self.clicker;
  self.presser;
  self.drawer;
  self.assetter;
  self.particler;

  self.house;
  self.nodes;
  self.player;
  self.bulbs;
  self.janitors;

  self.selector;

  self.theySpendGraph;
  self.iSpendGraph;
  self.spendGraphMarkings;

  self.hours = 0;
  self.numbulbs = 0;
  self.ispent = 0;
  self.theyspent = 0;

  self.ready = function()
  {
    self.ticker = new Ticker({});
    self.clicker = new Clicker({source:stage.dispCanv.canvas,physical_rect:physical_rect,theoretical_rect:theoretical_rect});
    self.presser = new Presser({source:stage.dispCanv.canvas,physical_rect:physical_rect,theoretical_rect:theoretical_rect});
    self.drawer = new Drawer({source:stage.drawCanv});
    self.assetter = new Assetter({});
    self.particler = new Particler({});

    self.house = new BU_House(self);
    self.nodes = [];
    self.bulbs = [];
    for(var i = 0; i < self.house.numFloors; i++)
    {
      for(var j = 0; j < self.house.bulbsPerFloor; j++)
      {
        self.nodes[(i*(self.house.bulbsPerFloor+1))+j] = new BU_Node(self,j,i);
        self.bulbs[(i* self.house.bulbsPerFloor)   +j] = new BU_Bulb(self,self.node(j,i));
        self.bulb(j,i).setType(BU_c.BULB_INCANDESCENT_ON);
        self.bulb(j,i).hours_left = Math.round(Math.random()*BU_c.lifespan[self.bulb(j,i).type]);
      }
      self.nodes[(i*(self.house.bulbsPerFloor+1))+self.house.bulbsPerFloor] = new BU_Node(self,self.house.bulbsPerFloor,i); //create extra node (for elevator)
    }
    self.bulb(0,0).hours_left = 1; //let first bulb run out so player immediately can replace it

    self.player = new BU_Dude(self, 0, BU_c.BULB_LED_ON);

    self.janitors = [];
    for(var i = 1; i < self.house.numFloors; i++) //i starts at 1 (player on 0)
      self.janitors.push(new BU_Dude(self, i, BU_c.BULB_INCANDESCENT_ON));

    self.selector = new BU_Selector(self);

    self.iSpendGraph         = new BU_Graph(50,150,stage.drawCanv.canvas.width-100,stage.drawCanv.canvas.width-100,"#00FF00",self);
    self.theySpendGraph      = new BU_Graph(50,150,stage.drawCanv.canvas.width-100,stage.drawCanv.canvas.width-100,"#FF0000",self);
    self.spendGraphMarkings  = new SpendGraphMarkings(self);

    self.drawer.register(self.house);
    for(var i = 0; i < self.bulbs.length; i++)
      self.drawer.register(self.bulbs[i]);

    self.drawer.register(self.selector);

    for(var i = 0; i < self.janitors.length; i++)
      self.drawer.register(self.janitors[i]);

    self.drawer.register(self.player);
    self.drawer.register(self.particler);

    game.playVid(self.intro_vid_src, self.intro_vid_stamps, function(){console.log("whaaat");self.clicker.register(self.beginButton)});
  };

  self.tick = function()
  {
    for(var z = 0; z < 2; z++)
    {
      self.hours += BU_c.hours_per_tick;

      //rates
      //control 0.123   $/h @ infnty w/ 4 janitors
      //recoup  (0.123) $/h @ 13653h w/ 3 jan, 1 player
      //halve   (0.06)  $/h @ 26398h w/ 3 jan, 1 player
      //lowest  (0.05)  $/h @ 37000h w/ 3 jan, 1 player
      self.theyspent += 0.123*BU_c.hours_per_tick; //$0.11 experimentally determined to be rate of spending w/ 2 janitors, no player

      self.clicker.flush();
      self.presser.flush();
      if(self.viewing == 1) self.ticker.flush();
      for(var i = 0; i < self.janitors.length; i++)
      {
        if(self.janitors[i].state != 2)
          self.janitors[i].goalNode = self.bestGoalFromNode(self.nodeNearestDude(self.janitors[i]));
      }

      if(self.player.state == 0 && self.selector.lastNode) self.player.goalNode = self.selector.lastNode;

      self.iSpendGraph.register(self.ispent);
      self.theySpendGraph.register(self.theyspent);

      if(self.theySpendGraph.high > self.iSpendGraph.high) self.iSpendGraph.high = self.theySpendGraph.high;
      else                                                 self.theySpendGraph.high = self.iSpendGraph.high;
    }
  };

  self.trunc = function(v,t)
  {
    var x = Math.round(v*t)/t;
    if(!isFinite(x)) return 0;
    return x;
  }

  self.savings;
  self.savingstick = 0;
  self.saved = 0;
  self.savedinc = 0;
  self.draw = function()
  {
    self.drawer.flush();
    self.stage.drawCanv.context.font = "30px comic_font";
    self.stage.drawCanv.context.fillStyle = "#000000";

    /*
    if(self.savingstick %100 == 0)
    {
      self.savings = self.theyspent-self.ispent;
      self.savingstick = 0;
    }
    self.savingstick++;
    */

    var savingsx = 200;
    var savingsy = 100;
    self.savedinc+=13;
    if(self.savedinc > self.saved)  self.savedinc = self.saved;
    else if(self.savedinc%6 == 0) self.particler.register(new BU_PriceParticle(savingsx+150+Math.random()*70,savingsy+Math.random()*20,"$",30,"#00AA00",0));

    //self.stage.drawCanv.context.strokeStyle = "#000000";
    //self.stage.drawCanv.context.lineWidth = 2;
    self.stage.drawCanv.context.fillText("Savings:$"+self.trunc(self.savedinc,100),savingsx,savingsy);
    //self.stage.drawCanv.context.fillText("Savings:$"+self.trunc(self.savings,100),200,50);
    //self.stage.drawCanv.context.fillText("Days:"+Math.round(self.hours/24),200,30);
    //self.stage.drawCanv.context.fillText("Bulbs:"+self.numbulbs,200,60);
    //self.stage.drawCanv.context.fillText("Bulbs/day:"+(self.numbulbs/Math.round(self.hours/24)),200,90);
    //self.stage.drawCanv.context.fillText("Spend:$"+self.trunc(self.ispent,100),100,80);
    //self.stage.drawCanv.context.fillText("Rate:$"+(self.ispent)/self.hours, 100,110);

    if(self.viewing == 0)
    {
      self.stage.drawCanv.context.fillStyle = "rgba(0,0,0,0.8)";
      self.stage.drawCanv.context.fillRect(0,0,self.stage.drawCanv.canvas.width,self.stage.drawCanv.canvas.height);
      self.stage.drawCanv.context.fillStyle = "#FFFFFF";
      self.stage.drawCanv.context.font = "30px comic_font";
      self.stage.drawCanv.context.fillText("Swap in LED lights before the",50,300);
      self.stage.drawCanv.context.fillText("maintenance workers put in   ",50,340);
      self.stage.drawCanv.context.fillText("more incandescents.          ",50,380);
      self.stage.drawCanv.context.fillText("Each LED will save $500 over ",50,440);
      self.stage.drawCanv.context.fillText("its lifetime.                ",50,480);
      self.stage.drawCanv.context.fillText("Save $7500 to win!           ",50,540);
      self.stage.drawCanv.context.fillText("(Touch Anywhere to Begin)",self.stage.drawCanv.canvas.width-480,self.stage.drawCanv.canvas.height-30);
    }
  };

  self.cleanup = function()
  {
    self.ticker.clear();
    self.clicker.clear();
    self.presser.clear();
    self.drawer.clear();
    self.assetter.clear();
    self.particler.clear();

    self.ticker.detach();
    self.clicker.detach();
    self.presser.detach();
    self.drawer.detach();
    self.assetter.detach();
    self.particler.detach();
  };

  self.node = function(x,y) //fetch by index
  {
    return self.nodes[(y*(self.house.bulbsPerFloor+1))+x];
  }
  self.nodeNearest = function(pix_x,pix_y) //fetch by pixel position
  {
    pix_x -= (self.house.x+self.house.x_l);
    pix_y -= (self.house.y+self.house.y_t);
    pix_x /= self.house.bulb_w;
    pix_y /= self.house.floor_h;
    pix_x = Math.floor(pix_x);
    pix_y = Math.floor(pix_y);

    return self.node(pix_x,pix_y);
  }
  self.nodeNearestDude = function(dude)
  {
    return self.nodeNearest(dude.x+(dude.w/2),dude.y+(dude.h/2)); //center of dude
  }
  self.bulb = function(x,y)
  {
    return self.bulbs[(y*self.house.bulbsPerFloor)+x];
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
      if(self.bulbs[i].type == BU_c.BULB_LED_OUT || self.bulbs[i].type == BU_c.BULB_INCANDESCENT_OUT || self.bulbs[i].type == BU_c.BULB_NONE)
      {
        var n = self.bulbs[i].node;
        var score = bestScore+1; //less is better
        if(node.n_y == n.n_y)
          score = Math.abs(n.n_x - node.n_x);
        else
          score = ((self.house.bulbsPerFloor+1)-node.n_x) + Math.abs(n.n_y - node.n_y) + ((self.house.bulbsPerFloor+1)-n.n_x);
        if(score < bestScore) { bestScore = score; bestNode = n; }
      }
    }
    if(!bestNode) bestNode = node;
    return bestNode;
  }

  self.bulbClicked = function(bulb)
  {
    self.selector.setNode(bulb.node);
    if(self.player.state == 0 || self.player.state == 1)
      self.player.goalNode = bulb.node;
  }

  self.bulbChanged = function(bulb)
  {
  }

  self.purchaseBulb = function(bulb)
  {
    self.ispent += BU_c.cost[bulb.type];
    if(bulb.type == BU_c.BULB_LED_ON) self.saved += 500;
    if(self.saved > 7500) self.endGame();
    self.numbulbs++;
    //self.particler.register(new BU_PriceParticle(bulb.x+(bulb.w/2),bulb.y+(bulb.h/4),"$"+BU_c.cost[bulb.type],30,"#00AA00",0));
  }

  self.purchaseEnergy = function(bulb, hours)
  {
    var energy = (Math.round((BU_c.energy_jh[bulb.type]*hours)*100)/100)/3600000;
    var cost = Math.round((BU_c.energy_jh[bulb.type]*hours*BU_c.electricity_cost)*100)/100;
    self.ispent += cost;
    //self.particler.register(new BU_PriceParticle(bulb.x+(bulb.w/2),bulb.y+(bulb.h/4),energy+" kWh",20,"#00FFFF",(bulb.node.n_x+bulb.node.n_y)/20));
    //self.particler.register(new BU_PriceParticle(bulb.x+(bulb.w/2),bulb.y+(bulb.h/4),"$"+cost,20,"#00AA00",(bulb.node.n_x+bulb.node.n_y)/20+0.8));
  }
};


var BU_Selector = function(game)
{
  var self = this;

  self.w = 50;
  self.h = 50;
  self.x;
  self.y;
  self.lastNode;

  self.img = game.assetter.asset("bulb_select.png");

  self.setNode = function(node)
  {
    self.lastNode = node;
    self.x = node.x-self.w/2;
    self.y = node.y+self.h/4;
  }

  self.draw = function(canv)
  {
    if(self.lastNode)
      canv.context.drawImage(self.img,self.x,self.y,self.w,self.h);
  }
}

var BU_House = function(game)
{
  var self = this;
  self.x = 0;
  self.y = 0;
  self.h = game.stage.drawCanv.canvas.height;
  self.w = game.stage.drawCanv.canvas.width;
  self.x_l = 65;
  self.x_r = 65;
  self.y_t = 150;
  self.y_b = 130;

  self.numFloors = 4
  self.bulbsPerFloor = 5;

  self.bulb_w = (self.w-(self.x_r+self.x_l))/(self.bulbsPerFloor+1);
  self.floor_h = (self.h-(self.y_t+self.y_b))/self.numFloors;

  self.img = game.assetter.asset("bulb_bg.png");

  self.draw = function(canv)
  {
    canv.context.drawImage(self.img,self.x,self.y,self.w,self.h);
    canv.context.strokeRect(self.x+self.x_l,self.y+self.y_t,self.w-(self.x_l+self.x_r),self.h-(self.y_l+self.y_b));
  }
}


//standardize grid positions
var BU_Node = function(game,x,y)
{
  var self = this;

  self.n_x = x;
  self.n_y = y;

  self.x = game.house.x+game.house.x_r+self.n_x*game.house.bulb_w+(game.house.bulb_w/2);
  self.y = game.house.y+game.house.y_t+self.n_y*game.house.floor_h;
}

var BU_Dude = function(game, floor, bulb)
{
  var self = this;

  self.floor = floor;
  self.w = 120;
  self.h = 120;
  self.x = game.node(0,floor).x-(self.w/2);
  self.yoffset = 30;
  self.y = game.node(0,floor).y;
  self.goalNode = game.node(0,floor);

  self.walk_img_0_l;
  self.walk_img_1_l;
  self.walk_img_0_r;
  self.walk_img_1_r;
  self.change_img;

  if(bulb == BU_c.BULB_INCANDESCENT_ON)
  {
    self.walk_img_0_r = game.assetter.asset("bulb_janitor_walk_0_r.png");
    self.walk_img_1_r = game.assetter.asset("bulb_janitor_walk_1_r.png");
    self.walk_img_0_l = game.assetter.asset("bulb_janitor_walk_0_l.png");
    self.walk_img_1_l = game.assetter.asset("bulb_janitor_walk_1_l.png");
    self.change_img = game.assetter.asset("bulb_janitor_change.png");
  }
  else
  {
    self.walk_img_0_r = game.assetter.asset("bulb_player_walk_0_r.png");
    self.walk_img_1_r = game.assetter.asset("bulb_player_walk_1_r.png");
    self.walk_img_0_l = game.assetter.asset("bulb_player_walk_0_l.png");
    self.walk_img_1_l = game.assetter.asset("bulb_player_walk_1_l.png");
    self.change_img = game.assetter.asset("bulb_player_change.png");
  }

  self.state = 0; //0 = waiting; 1 = walking; 2 = changing
  self.changeTimer = 0;
  self.maxChangeTimer = 200;
  self.animTimer = Math.round(Math.random()*100);

  var epsillon = 1; //<- ridiculous
  self.eq = function(a,b) { return Math.abs(a-b) < epsillon; }
  self.less = function(a,b) { return a < (b-epsillon); }
  self.great = function(a,b) { return a > (b+epsillon); }

  self.lastwalked;
  self.tick = function()
  {
    self.animTimer = (self.animTimer+1)%100;
    if(self.state == 0 || self.state == 1) //should move to goal
    {
      if(self.floor != self.goalNode.n_y) //not on goal floor
      {
        if(self.less(self.x+(self.w/2), game.node(game.house.bulbsPerFloor,self.floor).x)) { self.x++; self.lastwalked = 1; } //left of elevator
        else { self.floor = self.goalNode.n_y; self.y = self.goalNode.y; } //at elevator
        self.state = 1;
      }
      else //on goal floor
      {
        self.state = 1;
             if(self.less( self.x+(self.w/2), self.goalNode.x)) { self.x++; self.lastwalked = 1; } //left of goal
        else if(self.great(self.x+(self.w/2), self.goalNode.x)) { self.x--; self.lastwalked = -1; } //right of goal
        else //at goal
        {
          self.state = 0;
          var b = game.bulbAt(self.goalNode);
          if(b && (b.type == BU_c.BULB_LED_OUT || b.type == BU_c.BULB_INCANDESCENT_OUT || b.type == BU_c.BULB_NONE))
          {
            self.state = 2;
            self.changeTimer = 200;
            b.setType(BU_c.BULB_CHANGING);
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
    if(self.state == 0 || self.state == 1) //waiting || walking
    {
      if(self.state == 0) self.animTimer--; //lol

      if(self.lastwalked < 0)
      {
        if(self.animTimer < 50)
          canv.context.drawImage(self.walk_img_0_l,self.x,self.y+self.yoffset,self.w,self.h);
        else
          canv.context.drawImage(self.walk_img_1_l,self.x,self.y+self.yoffset,self.w,self.h);
      }
      else
      {
        if(self.animTimer < 50)
          canv.context.drawImage(self.walk_img_0_r,self.x,self.y+self.yoffset,self.w,self.h);
        else
          canv.context.drawImage(self.walk_img_1_r,self.x,self.y+self.yoffset,self.w,self.h);
      }
    }
    else if(self.state == 2) //changing
    {
      canv.context.drawImage(self.change_img,self.x,self.y+self.yoffset,self.w,self.h);

      if(bulb == BU_c.BULB_LED_ON) canv.context.fillStyle = "#00FF00";
      else                         canv.context.fillStyle = "#FF0000";
      canv.context.fillRect(self.x+self.w/4,self.y,((self.maxChangeTimer-self.changeTimer)/self.maxChangeTimer)*self.w/2,10);
    }
  }
}

var BU_Bulb = function(game,node)
{
  var self = this;

  self.ticksPerPurchase = 400;
  self.ticksTilPurchase = self.ticksPerPurchase;

  self.node = node;
  self.w = 75;
  self.h = 200;
  self.x = self.node.x-(self.w/2);
  self.y = self.node.y;

  self.img = game.assetter.asset("bulb_bulb.png");
  self.glow_img = game.assetter.asset("bulb_glow_blue.png");

  self.type = BU_c.BULB_NONE;
  self.hours_left = BU_c.lifespan[self.type];

  self.setType = function(type)
  {
    self.type = type;
    self.hours_left = BU_c.lifespan[self.type];
    switch(type)
    {
      case BU_c.BULB_NONE:             self.img = game.assetter.asset("bulb_bulb.png"); self.glow_img = game.assetter.asset("null.png");             break;
      case BU_c.BULB_CHANGING:         self.img = game.assetter.asset("bulb_bulb.png"); self.glow_img = game.assetter.asset("null.png");             break;
      case BU_c.BULB_INCANDESCENT_ON:  self.img = game.assetter.asset("bulb_bulb.png"); self.glow_img = game.assetter.asset("bulb_glow_yellow.png"); break;
      case BU_c.BULB_INCANDESCENT_OUT: self.img = game.assetter.asset("bulb_bulb.png"); self.glow_img = game.assetter.asset("null.png");             break;
      case BU_c.BULB_LED_ON:           self.img = game.assetter.asset("bulb_bulb.png"); self.glow_img = game.assetter.asset("bulb_glow_blue.png");   break;
      case BU_c.BULB_LED_OUT:          self.img = game.assetter.asset("bulb_bulb.png"); self.glow_img = game.assetter.asset("null.png");             break;
    }
    game.bulbChanged(self);
  }

  self.press = function()
  {
    game.bulbClicked(self);
  }
  self.unpress = function() {}

  self.click = function()
  {
    game.bulbClicked(self);
  }


  self.tick = function()
  {
    self.hours_left -= BU_c.hours_per_tick;
    self.ticksTilPurchase--;
    if(self.ticksTilPurchase <= 0)
    {
      if(self.hours_left > 0)
        game.purchaseEnergy(self,BU_c.hours_per_tick*self.ticksPerPurchase);
      self.ticksTilPurchase = self.ticksPerPurchase;
    }
    if(self.hours_left <= 0) self.setType(BU_c.out_index[self.type]);
  }

  self.draw = function(canv)
  {
    canv.context.drawImage(self.img,self.x+self.w/3,self.y,self.w/3,self.h/4);
    if(self.hours_left > 20 || Math.random() < 0.95) canv.context.drawImage(self.glow_img,self.x-self.w/2,self.y-(self.h/8),self.w*2,self.h);

    if(self.hours_left > 0)
    {
      canv.context.strokeStyle = "#00FFFF"
      canv.context.lineWidth = 5;
      canv.context.beginPath();
      canv.context.arc(
      self.x+self.w/2,
      self.y+self.h*(7/40),
      self.w/3,
      3*Math.PI/2,
      (3*(Math.PI/2)+((BU_c.lifespan[self.type]-self.hours_left)/BU_c.lifespan[self.type])*(2*Math.PI))%(2*Math.PI),
      true);
      canv.context.stroke();
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
    self.t += 0.005;
    if(self.t > 0) self.y = self.y+(self.ey-self.y)/50;
    return self.t < 1;
  }
  self.draw = function(canv)
  {
    if(self.t < 0) return;
    canv.context.globalAlpha = 1-(self.t*self.t*self.t);
    canv.context.font = self.size+"px comic_font";
    canv.context.fillStyle = self.c;
    canv.context.fillText(self.text,self.x-25,self.y);
    canv.context.globalAlpha = 1.0;
  }
}

var BU_Graph = function(x,y,w,h,color,game)
{
  var self = this;

  self.x = x;
  self.y = y;
  self.w = w;
  self.h = h;
  self.color = color;

  var pts = [];
  var ptLens = [];
  var totalPts = 0;
  self.high = 1.0;
  self.low = 0.0;

  self.register = function(pt)
  {
    if(isNaN(pt) || !isFinite(pt)) pt = 0;
    if(pt > self.high) self.high = pt;
    if(pt < self.low) self.low = pt;

    if(pt == pts[pts.length-1]) ptLens[ptLens.length-1]++;
    else
    {
      pts.push(pt);
      ptLens.push(1);
    }
    totalPts++;
  }

  self.draw = function(canv)
  {
    if(totalPts == 0) return;
    if(self.lastCompressed+1000 < totalPts) self.compress(50);

    canv.context.lineWidth = 5;
    canv.context.strokeStyle = self.color;
    canv.context.fillRect(self.x,self.y+20,((self.maxChangeTimer-self.changeTimer)/self.maxChangeTimer)*self.w,10);
    canv.context.beginPath();
    canv.context.moveTo(self.x,self.y+self.h);
    var ptsIn = 0;
    for(var i = 0; i < totalPts; i++)
    {
      canv.context.lineTo(self.x+(ptsIn/totalPts)*self.w, self.y+self.h-((pts[i]-self.low)/(self.high-self.low))*self.h);
      ptsIn += ptLens[i]-1;
      if(ptLens[i] > 1) canv.context.lineTo(self.x+(ptsIn/totalPts)*self.w, self.y+self.h-((pts[i]-self.low)/(self.high-self.low))*self.h);
      ptsIn++;
    }
    canv.context.stroke();
    canv.context.closePath();
  }

  self.lastCompressed = 0;
  self.compress = function(numpts) //more like "throw away a ton of data"
  {
    var oldpts = pts;
    var oldptLens = ptLens;
    var oldtotalPts = totalPts;

    var sampleDist = totalPts/numpts;
    var sampleI = 0;
    var sampleJ = 0;
    var ptsTraversed = 0;

    var ptsAtNextSample = 0;
    var ptsAtLeftInRun = oldptLens[0];

    pts = [];
    ptLens = [];
    totalPts = 0;

    self.register(pts[0]);
    while(totalPts < numpts)
    {
      ptsAtNextSample = Math.floor((totalPts+1)*sampleDist);
      while(ptsTraversed < ptsAtNextSample)
      {
        ptsAtLeftInRun = ptsTraversed+(oldptLens[sampleI]-sampleJ);

        if(ptsAtNextSample > ptsAtLeftInRun)
        {
          ptsTraversed += (oldptLens[sampleI]-sampleJ);
          sampleJ = 0;
          sampleI++;
        }
        else if(ptsAtNextSample == ptsAtLeftInRun)
        {
          ptsTraversed += (oldptLens[sampleI]-sampleJ);
          self.register(oldpts[sampleI]);
          sampleJ = 0;
          sampleI++;
        }
        else //ptsAtNextSample < ptsAtLeftInRun
        {
          sampleJ      += ptsAtNextSample - ptsTraversed;
          ptsTraversed += ptsAtNextSample - ptsTraversed;
          self.register(oldpts[sampleI]);
        }
      }
    }

    //re pad out so new contributions aren't super heavily weighted
    var newtotalPts = 0;
    for(var i = 0; i < ptLens.length; i++)
    {
      ptLens[i] *= oldtotalPts/numpts;
      newtotalPts += ptLens[i];
    }
    totalPts = newtotalPts;
    self.lastCompressed = newtotalPts;
  }
}

var BU_CircGraph = function(x,y,w,h,color,game)
{
  var self = this;

  self.x = x;
  self.y = y;
  self.w = w;
  self.h = h;
  self.color = color;

  var pts = [];
  var nPts = 0;
  var start = 0;
  self.high = 1.0;
  self.low = 0.0;

  self.register = function(pt)
  {
    if(isNaN(pt) || !isFinite(pt)) pt = 0;

    if(pt > self.high) self.high = pt;
    if(pt < self.low) self.low = pt;

    self.high = pts[0];
    for(var i = 1; i < nPts; i++)
      if(pts[i] > self.high) self.high = pts[i];

    if(nPts < 1000)
    {
      pts.push(pt);
      nPts++;
    }
    else
    {
      pts[start] = pt;
      start = (start+1)%nPts;
    }
  }

  self.draw = function(canv)
  {
    if(nPts == 0) return;
    canv.context.lineWidth = 5;
    canv.context.strokeStyle = self.color;
    canv.context.fillRect(self.x,self.y+20,((self.maxChangeTimer-self.changeTimer)/self.maxChangeTimer)*self.w,10);
    canv.context.beginPath();
    canv.context.moveTo(self.x,self.y+self.h);
    var ptsIn = 0;
    for(var i = 0; i < nPts; i++)
      canv.context.lineTo(self.x+(i/nPts)*self.w, self.y+self.h-((pts[(start+i)%1000]-self.low)/(self.high-self.low))*self.h);
    canv.context.stroke();
    canv.context.strokeStyle = "#000000";
    canv.context.strokeRect(self.x,self.y,self.w,self.h);
    canv.context.closePath();
  }
}

var SpendGraphMarkings = function(game)
{
  var self = this;
  self.draw = function(canv)
  {
    canv.context.font = "30px comic_font";
    canv.context.fillStyle = "#000000";
    canv.context.fillText("Total Spending",game.stage.drawCanv.canvas.width/2-200,game.stage.drawCanv.canvas.height-250);
    canv.context.fillText("$"+game.trunc(game.iSpendGraph.high,100),0,150);
    canv.context.fillText("$0",0,700);
  }
}

