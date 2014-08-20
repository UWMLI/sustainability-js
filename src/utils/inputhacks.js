var platform = "PC";
var debug = false;

var theoreticalWidthOfStuff = 640;
var theoreticalHeightOfStuff = 1008;
var actualWidthOfStuff = 640;
var actualHeightOfStuff = 1008;

function debugLog(txt)
{
  if(debug)
  document.getElementById('debug').innerHTML = txt+"<br />"+document.getElementById('debug').innerHTML;
}
function addOffsetToEvt(evt)
{
  if(evt.offsetX == undefined)
  {
    evt.philX = evt.layerX-evt.originalTarget.offsetLeft;
    evt.philY = evt.layerY-evt.originalTarget.offsetTop;
  }
  else
  {
    evt.philX = evt.offsetX;
    evt.philY = evt.offsetY;
  }

  evt.philX = (evt.philX/actualWidthOfStuff)*theoreticalWidthOfStuff;
  evt.philY = (evt.philY/actualHeightOfStuff)*theoreticalHeightOfStuff;
}
function hackInputs()
{
  actualWidthOfStuff = window.innerWidth;
  actualHeightOfStuff = window.innerHeight;
  document.getElementById("dabody").style.width = actualWidthOfStuff+"px";
  document.getElementById("dabody").style.height = actualHeightOfStuff+"px";
  document.getElementById("debug").style.width = actualWidthOfStuff+"px";
  document.getElementById("debug").style.height = actualHeightOfStuff+"px";
  document.getElementById("stage_container").style.width = actualWidthOfStuff+"px";
  document.getElementById("stage_container").style.height = actualHeightOfStuff+"px";
  var children = document.getElementById("stage_container").childNodes;
  for(var i = 0; i < children.length; i++)
  {
    children[i].style.width = actualWidthOfStuff+"px";
    children[i].style.height = actualHeightOfStuff+"px";
  }
}

