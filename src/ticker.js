var Ticker = function()
{
  var self = this;

  var tickables = [];
  self.register = function(tickable) { tickables.push(tickable); }
  self.unregister = function(tickable) { tickables.splice(tickables.indexOf(tickable),1); }
  self.clear = function() { tickables = []; }

  self.flush = function()
  {
    for(var i = 0; i < tickables.length; i++)
      tickables[i].tick();
  }
}

//example tickable- just needs tick function
var Tickable = function(args)
{
  var self = this;

  self.tick = function()
  {
    //?
  }
}

