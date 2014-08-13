var Flicker = function()
{
  var self = this;

  var flickables = [];
  var flicking = [];
  var callbackQueue = [];
  var evtQueue = [];
  self.register = function(flickable) { flickables.push(flickable); }
  self.unregister = function(flickable) { flickables.splice(flickables.indexOf(flickable),1); }
  self.clear = function() { flickables = []; }

  function begin(evt)
  {
    addOffsetToEvt(evt);
    for(var i = 0; i < flickables.length; i++)
    {
      if(
        evt.offsetX >= flickables[i].x &&
        evt.offsetX <= flickables[i].x+flickables[i].w &&
        evt.offsetY >= flickables[i].y &&
        evt.offsetY <= flickables[i].y+flickables[i].h
      )
      {
        flicking.push(flickables[i]);
        callbackQueue.push(flickables[i].flickStart);
        evtQueue.push(evt);
      }
    }
  }
  function drag(evt)
  {
    addOffsetToEvt(evt);
    for(var i = 0; i < flicking.length; i++)
    {
      callbackQueue.push(flicking[i].flicking);
      evtQueue.push(evt);
    }
  }
  function end(evt)
  {
    flicking = []; //clear all currently flicking
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
    document.getElementById("stage_container").addEventListener('mousemove', drag,  false);
    document.getElementById("stage_container").addEventListener('mouseup',   end,   false);
  }
  else if(platform == "MOBILE")
  {
    document.getElementById("stage_container").addEventListener('touchstart', begin, false);
    document.getElementById("stage_container").addEventListener('touchmove',  drag,  false);
    document.getElementById("stage_container").addEventListener('touchend',   end,   false);
  }
}

//example flickable- just needs x,y,w,h,r and flickStart, flicking, and flick callback
var Flickable = function(args)
{
  var self = this;

  self.flicked = false;

  self.startX = 0;
  self.startY = 0;
  self.vec = {"x":0,"y":0};

  self.x = args.x ? args.x : 0;
  self.y = args.y ? args.y : 0;
  self.w = args.w ? args.w : 0;
  self.h = args.h ? args.h : 0;
  self.r = args.r ? args.r : 0;
  self.flickStart = args.flickStart ? args.flickStart : function(evt){ self.startX = evt.offsetX; self.startY = evt.offsetY; self.flicked = false; };
  self.flicking   = args.flicking   ? args.flicking   : function(evt){ if(self.flicked) return; self.vec.x = (evt.offsetX-self.startX); self.vec.y = (evt.offsetY-self.startY); if(Math.sqrt((self.vec.x*self.vec.x)+(self.vec.y*self.vec.y)) >= self.r) { self.flick(self.vec); self.flicked = true; }};
  self.flick      = args.flick      ? args.flick      : function(vec){};

  //nice for debugging purposes
  self.draw = function(canv)
  {
    canv.context.strokeStyle = "#00FF00";
    canv.context.strokeRect(self.x,self.y,self.w,self.h);
  }
}

