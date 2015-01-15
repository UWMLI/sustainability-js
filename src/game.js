var Game = function(init)
{
  var default_init =
  {
    width:640,
    height:320,
    physical_width:640,    //optional
    physical_height:320,   //optional
    theoretical_width:640, //optional
    theoretical_height:320,//optional
    container:"stage_container"
  }

  var self = this;

  //odd chunk to prevent initdefaults form overriding rectmapping behavior if not specified
  if(init.hasOwnProperty('width')  && !init.hasOwnProperty('physical_width'))     init.physical_width  = init.width;
  if(init.hasOwnProperty('height') && !init.hasOwnProperty('physical_height'))    init.physical_height = init.height;
  if(init.hasOwnProperty('width')  && !init.hasOwnProperty('theoretical_width'))  init.theoretical_width  = init.width;
  if(init.hasOwnProperty('height') && !init.hasOwnProperty('theoretical_height')) init.theoretical_height = init.height;
  doMapInitDefaults(init,init,default_init); //map defaults onto init, NOT self ('game.width', etc... is stored on stage)

  var stage = new Stage({
    width:init.width,
    height:init.height,
    physical_width:init.physical_width,
    physical_height:init.physical_height,
    theoretical_width:init.theoretical_width,
    theoretical_height:init.theoretical_height,
    container:init.container
  });
  var scenes = [new NullScene(self, stage), new LoadingScene(self, stage), new IntroScene(self, stage)];
  var currentScene = 0;

  var physicalRect    = { x:0, y:0, w:init.physical_width,    h:init.physical_height};
  var theoreticalRect = { x:0, y:0, w:init.theoretical_width, h:init.theoretical_height};

  /*
  DEBUG CODE
  */
  /*
  self.clicker = new Clicker({source:stage.dispCanv.canvas,physical_rect:physicalRect,theoretical_rect:theoreticalRect});
  self.drawer = new Drawer({source:stage.drawCanv});
  var BB = function(game)
  {
    var self = this;
    self.x = init.theoretical_width-100-20;
    self.y = 20;
    self.w = 100;
    self.h = 100;

    self.draw = function(canv)
    {
      canv.context.strokeRect(self.x,self.y,self.w,self.h);
    }
    self.click = function()
    {
      game.setScene(MainScene);
    }
  }
  self.backBtn = new BB(self);
  self.clicker.register(self.backBtn);
  self.drawer.register(self.backBtn);
  */
  /*
  DEBUG CODE
  */

  self.setMainScene = function(Scene)
  {
    scenes[2] = new Scene(self, stage);
  }

  self.begin = function()
  {
    self.nextScene();
    tick();
  };

  var tick = function()
  {
    requestAnimFrame(tick,stage.dispCanv.canvas);
    stage.clear();
    scenes[currentScene].tick();
    scenes[currentScene].draw();
    //DEBUG CODE
    //self.clicker.flush();
    //self.drawer.flush();
    //DEBUG CODE
    stage.draw(); //blits from offscreen canvas to on screen one
  };

  self.nextScene = function()
  {
    scenes[currentScene].cleanup();
    currentScene++;
    scenes[currentScene].ready();
  };

  self.setScene = function(Scene)
  {
    scenes[currentScene].cleanup();
    scenes[currentScene] = new Scene(self, stage);
    scenes[currentScene].ready();
  }

  var vidCallback;
  var vdiv;
  var vid;
  self.playVid = function(source, stamps, callback)
  {
    vidCallback = callback;
    vdiv = document.getElementById("vid_div");
    vid = new Vid(vdiv, source, stamps, self.vidEnded);
    vdiv.style.display = "block";
    vid.load();
    vid.play();
  }
  self.vidEnded = function()
  {
    vdiv.style.display = "none";
    vidCallback();
    vid = undefined;
  }
  self.vidTouched = function()
  {
    if(vid) vid.next();
  }
  if(platform == "PC")          document.getElementById("vid_div").addEventListener('mousedown', self.vidTouched, false);
  else if(platform == "MOBILE") document.getElementById("vid_div").addEventListener('touchstart', self.vidTouched, false);
};

