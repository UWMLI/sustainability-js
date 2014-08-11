var Game = function(GamePlayScene)
{
  var self = this;

  var stage = new Stage();
  var scenes = [new NullScene(self, stage.drawCanv), new LoadingScene(self, stage.drawCanv), new GamePlayScene(self, stage.drawCanv)];
  var currentScene = 0;

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

