var Dragger = function()
{
  var self = this;

  var draggables = [];
  var dragging = [];
  var callbackQueue = [];
  var evtQueue = [];
  self.register = function(draggable) { draggables.push(draggable); }
  self.unregister = function(draggable) { draggables.splice(draggables.indexOf(draggable),1); }
  self.clear = function() { draggables = []; }

  function begin(evt)
  {
    debugLog("BeginDrag");
    addOffsetToEvt(evt);
    for(var i = 0; i < draggables.length; i++)
    {
      if(
        evt.philX >= draggables[i].x &&
        evt.philX <= draggables[i].x+draggables[i].w &&
        evt.philY >= draggables[i].y &&
        evt.philY <= draggables[i].y+draggables[i].h
      )
      {
        dragging.push(draggables[i]);
        callbackQueue.push(draggables[i].dragStart);
        evtQueue.push(evt);
      }
    }
  }
  function drag(evt)
  {
    debugLog("Drag");
    addOffsetToEvt(evt);
    for(var i = 0; i < dragging.length; i++)
    {
      callbackQueue.push(dragging[i].drag);
      evtQueue.push(evt);
    }
  }
  function end(evt)
  {
    debugLog("EndDrag");
    addOffsetToEvt(evt);
    for(var i = 0; i < dragging.length; i++)
    {
      callbackQueue.push(dragging[i].dragFinish);
      evtQueue.push(evt);
    }
    dragging = [];
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

//example draggable- just needs x,y,w,h and dragStart, drag, and dragFinish callback
var Draggable = function(args)
{
  var self = this;

  //nice in smooth dragging
  self.offX = 0;
  self.offY = 0;

  self.x = args.x ? args.x : 0;
  self.y = args.y ? args.y : 0;
  self.w = args.w ? args.w : 0;
  self.h = args.h ? args.h : 0;
  self.dragStart  = args.dragStart  ? args.dragStart  : function(evt){ self.offX = self.x+(self.w/2)-evt.philX; self.offY = self.y+(self.h/2)-evt.philY; };
  self.drag       = args.drag       ? args.drag       : function(evt){ self.x = evt.philX-(self.w/2)+self.offX; self.y = evt.philY-(self.h/2)+self.offY; };
  self.dragFinish = args.dragFinish ? args.dragFinish : function(){};

  //nice for debugging purposes
  self.draw = function(canv)
  {
    canv.context.strokeStyle = "#00FF00";
    canv.context.strokeRect(self.x,self.y,self.w,self.h);
  }
}

