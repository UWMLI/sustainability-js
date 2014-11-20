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
  var scenes = [new NullScene(self, stage), new LoadingScene(self, stage), new WindowScene(self, stage)];
  var currentScene = 0;

  var physicalRect    = { x:0, y:0, w:self.physical_width,    h:self.physical_height};
  var theoreticalRect = { x:0, y:0, w:self.theoretical_width, h:self.theoretical_height};

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
    stage.draw(); //blits from offscreen canvas to on screen one
  };

  self.nextScene = function()
  {
    scenes[currentScene].cleanup();
    currentScene++;
    scenes[currentScene].ready();
  };
};

