var RB_Player = function(game)
{
  var self = this;
  self.floor = 0;

  var man = new Image();
  man.src = "assets/man.png";

  self.tick = function()
  {

  }

  self.draw = function(canv)
  {
    canv.context.drawImage(man,10,(game.numFloors-self.floor)*100);
  }
}

