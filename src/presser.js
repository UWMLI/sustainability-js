var Presser = function()
{
  var self = this;

  var pressables = [];
  var pressing = [];
  var callbackQueue = [];
  var evtQueue = [];
  var down = false;
  self.register = function(pressable) { pressables.push(pressable); }
  self.unregister = function(pressable) { pressables.splice(pressables.indexOf(pressable),1); }
  self.clear = function() { pressables = []; }



  function begin(evt)
  {
    down = true;
    press(evt);
  }
  function press(evt)
  {
    if(!down) return;

    addOffsetToEvt(evt);
    var alreadypressing;
    for(var i = 0; i < pressables.length; i++)
    {
      if(
        evt.offsetX >= pressables[i].x &&
        evt.offsetX <= pressables[i].x+pressables[i].w &&
        evt.offsetY >= pressables[i].y &&
        evt.offsetY <= pressables[i].y+pressables[i].h
      )
      {
        alreadypressing = false;
        for(var j = 0; j < pressing.length; j++)
          if(pressables[i] == pressing[j]) alreadypressing = true;
        if(!alreadypressing)
        {
          pressing.push(pressables[i]);
          callbackQueue.push(pressables[i].press);
          evtQueue.push(evt);
        }
      }
    }

    for(var i = 0; i < pressing.length; i++)
    {
      if(
        evt.offsetX < pressing[i].x ||
        evt.offsetX > pressing[i].x+pressing[i].w ||
        evt.offsetY < pressing[i].y ||
        evt.offsetY > pressing[i].y+pressing[i].h
      )
      {
        pressing.splice(i,1);
        i--;
      }
    }
  }
  function end(evt)
  {
    down = false;
    pressing = [];
  }
  self.flush = function()
  {
    for(var i = 0; i < callbackQueue.length; i++)
      callbackQueue[i](evtQueue[i]);
    callbackQueue = [];
    evtQueue = [];
  }

  if(platform == "PC")
  {
    document.getElementById("stage_container").addEventListener('mousedown', begin, false);
    document.getElementById("stage_container").addEventListener('mousemove', press, false);
    document.getElementById("stage_container").addEventListener('mouseup',   end,   false);
  }
  else if(platform == "MOBILE")
  {
    document.getElementById("stage_container").addEventListener('touchstart', begin, false);
    document.getElementById("stage_container").addEventListener('touchmove',  press, false);
    document.getElementById("stage_container").addEventListener('touchend',   end,   false);
  }
}

//example pressable- just needs x,y,w,h and press callback
var Pressable = function(args)
{
  var self = this;

  self.x = args.x ? args.x : 0;
  self.y = args.y ? args.y : 0;
  self.w = args.w ? args.w : 0;
  self.h = args.h ? args.h : 0;
  self.press  = args.press  ? args.press  : function(evt){ };

  //nice for debugging purposes
  self.draw = function(canv)
  {
    canv.context.strokeStyle = "#00FF00";
    canv.context.strokeRect(self.x,self.y,self.w,self.h);
  }
}

