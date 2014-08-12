var LoadingScene = function(game, canv)
{
  var pad;
  var barw;
  var progress;

  var imagesloaded = 0;
  var imagesrc = ["assets/man.png"];
  var images = [];

  var imageLoaded = function()
  {
    imagesloaded++;
  };

  this.ready = function()
  {
    pad = 20;
    barw = (canv.canvas.width-(2*pad));
    progress = 0;
    //canv.context.fillStyle = "#000000";
    //canv.context.font = "20px vg_font";
    //canv.context.fillText(".",0,0);// funky way to encourage the custom font to load

    for(var i = 0; i < imagesrc.length; i++)
    {
      images[i] = new Image();
      images[i].onload = imageLoaded; 
      images[i].src = imagesrc[i]; 
    }
  };

  this.tick = function()
  {
    if(progress <= imagesloaded/imagesrc.length) progress += 0.01;
    if(progress >= 1.0) game.nextScene();
  };

  this.draw = function()
  {
    canv.context.fillRect(pad,canv.canvas.height/2,progress*barw,1);
    canv.context.strokeRect(pad-1,(canv.canvas.height/2)-1,barw+2,3);
  };

  this.cleanup = function()
  {
    progress = 0;
    imagesloaded = 0;
    images = [];//just used them to cache assets in browser; let garbage collector handle 'em.
    canv.context.fillStyle = "#FFFFFF";
    canv.context.fillRect(0,0,canv.canvas.width,canv.canvas.height);
  };
};
