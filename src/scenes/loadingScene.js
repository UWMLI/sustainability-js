var LoadingScene = function(game, stage)
{
  var self = this;

  var physical_rect    = {x:0,y:0,w:stage.dispCanv.canvas.width,h:stage.dispCanv.canvas.height};
  var theoretical_rect = {x:0,y:0,w:stage.drawCanv.canvas.width,h:stage.drawCanv.canvas.height};
  var pad;
  var barw;
  var progress;
  var canv = stage.drawCanv;

  var imagesloaded = 0;
  var img_srcs = [];
  var images = [];

  var imageLoaded = function()
  {
    imagesloaded++;
  };

  self.ready = function()
  {
    pad = 20;
    barw = (canv.canvas.width-(2*pad));
    progress = 0;
    canv.context.fillStyle = "#000000";
    canv.context.fillText(".",0,0);// funky way to encourage any custom font to load

    //put strings in 'img_srcs' as separate array to get "static" count

    //win
    img_srcs.push("assets/win_building.png");
    img_srcs.push("assets/win_closed.png");
    img_srcs.push("assets/win_drawn.png");
    img_srcs.push("assets/win_moon.png");
    img_srcs.push("assets/win_open.png");
    img_srcs.push("assets/win_sky.png");
    img_srcs.push("assets/win_sun.png");
    //bike
      //keys
    img_srcs.push("assets/bike_hand_open.png");
    img_srcs.push("assets/bike_hand_hit.png");
    img_srcs.push("assets/bike_hand_closed.png");
    img_srcs.push("assets/bike_keys.png");
    img_srcs.push("assets/bike_smack.png");
    img_srcs.push("assets/bike_fail.png");
      //pump
    img_srcs.push("assets/bike_pump_base.png");
    img_srcs.push("assets/bike_pump_handle.png");
      //card
    img_srcs.push("assets/bike_card.png");
    img_srcs.push("assets/bike_dull_square.png");
    img_srcs.push("assets/bike_glow_square.png");
    img_srcs.push("assets/bike_bike.png");
    img_srcs.push("assets/bike_gas.png");
      //helmet
    img_srcs.push("assets/bike_helmet.png");
    img_srcs.push("assets/bike_ace.png");
    img_srcs.push("assets/bike_bible.png");
    img_srcs.push("assets/bike_bowl.png");
    img_srcs.push("assets/bike_hamster.png");
    img_srcs.push("assets/bike_pizza.png");
    img_srcs.push("assets/bike_salt.png");
    img_srcs.push("assets/bike_mask.png");
    img_srcs.push("assets/bike_excuse_helmet.png");
    //misc
    img_srcs.push("assets/man.png");
    img_srcs.push("assets/back1.png");
    img_srcs.push("assets/back2.png");
    for(var i = 0; i < img_srcs.length; i++)
    {
      images[i] = new Image();
      images[i].onload = imageLoaded; 
      images[i].src = img_srcs[i];
    }
    imageLoaded(); //call once to prevent 0/0 != 100% bug
  };

  self.tick = function()
  {
    if(progress <= imagesloaded/(img_srcs.length+1)) progress += 0.5;
    if(progress >= 1.0) game.nextScene();
  };

  self.draw = function()
  {
    canv.context.fillRect(pad,canv.canvas.height/2,progress*barw,1);
    canv.context.strokeRect(pad-1,(canv.canvas.height/2)-1,barw+2,3);
  };

  self.cleanup = function()
  {
    progress = 0;
    imagesloaded = 0;
    images = [];//just used them to cache assets in browser; let garbage collector handle 'em.
    canv.context.fillStyle = "#FFFFFF";
    canv.context.fillRect(0,0,canv.canvas.width,canv.canvas.height);
  };
};
