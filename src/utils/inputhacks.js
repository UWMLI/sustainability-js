var platform = "PC";

function addOffsetToEvt(evt)
{
  if(evt.offsetX != undefined) return;
  evt.offsetX = evt.layerX-evt.originalTarget.offsetLeft;
  evt.offsetY = evt.layerY-evt.originalTarget.offsetTop;
}

