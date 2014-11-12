var platform = "MOBILE"; //"MOBILE" or "PC"
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
  if(evt.offsetX != undefined)
  {
    evt.philX = evt.offsetX;
    evt.philY = evt.offsetY;
  }
  else if(evt.touches != undefined)
  {
    evt.philX = evt.touches[0].pageX - evt.touches[0].target.offsetLeft;
    evt.philY = evt.touches[0].pageY - evt.touches[0].target.offsetTop;
  }
  else
  {
    evt.philX = evt.layerX-evt.originalTarget.offsetLeft;
    evt.philY = evt.layerY-evt.originalTarget.offsetTop;
  }

  evt.philX = (evt.philX/actualWidthOfStuff)*theoreticalWidthOfStuff;
  evt.philY = (evt.philY/actualHeightOfStuff)*theoreticalHeightOfStuff;
}
function hackInputs()
{
  window.addEventListener('touchstart', function(e){ e.preventDefault() }); //prevent browser from doing anything funny
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

