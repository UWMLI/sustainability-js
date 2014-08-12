var RB_Player = function(game)
{
  var self = this;
  self.floor = 0;

  var man = new Image();
  man.src = "assets/man.png";

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
    canv.context.drawImage(man,10,(game.numFloors-self.floor)*100);
  }
}

