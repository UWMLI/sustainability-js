//hack for browser compatibility
function addOffsetToEvt(evt)
{
  if(evt.offsetX != undefined) return;
  evt.offsetX = evt.layerX-evt.originalTarget.offsetLeft;
  evt.offsetY = evt.layerY-evt.originalTarget.offsetTop;
}

var Clicker = function()
{
  var self = this;

  var clickables = [];
  var callbackQueue = [];
  self.register = function(clickable) { clickables.push(clickable); }
  self.unregister = function(clickable) { clickables.splice(clickables.indexOf(clickable),1); }
  self.clear = function() { clickables = []; }

  function click(evt)
  {
    addOffsetToEvt(evt);
    for(var i = 0; i < clickables.length; i++)
    {
      if(
        evt.offsetX >= clickables[i].x &&
        evt.offsetX <= clickables[i].x+clickables[i].w &&
        evt.offsetY >= clickables[i].y &&
        evt.offsetY <= clickables[i].y+clickables[i].h
      )
        callbackQueue.push(clickables[i].callback);
    }
  }
  self.flush = function()
  {
    for(var i = 0; i < callbackQueue.length; i++)
      callbackQueue[i]();
    callbackQueue = [];
  }

  document.getElementById("stage_container").addEventListener('click', click, false);
}

//example clickable- just needs x,y,w,h and callback
var Clickable = function(args)
{
  var self = this;

  self.x = args.x ? args.x : 0;
  self.y = args.y ? args.y : 0;
  self.w = args.w ? args.w : 0;
  self.h = args.h ? args.h : 0;
  self.callback = args.callback ? args.callback : function(){};

  //nice for debugging purposes
  self.draw = function(canv)
  {
    canv.context.strokeStyle = "#00FF00";
    canv.context.strokeRect(self.x,self.y,self.w,self.h);
  }
}

