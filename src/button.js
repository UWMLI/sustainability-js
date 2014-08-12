//hack for browser compatibility
function addOffsetToEvt(evt)
{
  if(evt.offsetX != undefined) return;
  evt.offsetX = evt.layerX-evt.originalTarget.offsetLeft;
  evt.offsetY = evt.layerY-evt.originalTarget.offsetTop;
}

var ButtonHandler = function()
{
  var self = this;

  var buttons = [];
  self.register = function(button) { buttons.push(button); }
  self.unregister = function(button) { buttons.splice(buttons.indexOf(button),1); }
  self.clear = function() { buttons = []; }

  var callbackQueue = [];

  function click(evt)
  {
    addOffsetToEvt(evt);
    for(var i = 0; i < buttons.length; i++)
    {
      if(
        evt.offsetX >= buttons[i].x &&
        evt.offsetX <= buttons[i].x+buttons[i].w &&
        evt.offsetY >= buttons[i].y &&
        evt.offsetY <= buttons[i].y+buttons[i].h
      )
        callbackQueue.push(buttons[i].callback);
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

var Button = function(args)
{
  var self = this;

  self.x = args.x ? args.x : 0;
  self.y = args.y ? args.y : 0;
  self.w = args.w ? args.w : 0;
  self.h = args.h ? args.h : 0;
  self.callback = args.callback ? args.callback : function(){};
}

