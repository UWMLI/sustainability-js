//Wrapper for "high performance" drawing (really, just pseudo double-buffering)
var Stage = function(init)
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
  doMapInitDefaults(self,init,default_init);

  self.drawCanv = new Canv({width:self.theoretical_width, height:self.theoretical_height});
  self.dispCanv = new Canv({width:self.physical_width,    height:self.physical_height});

  self.draw = function()
  {
    self.drawCanv.blitTo(self.dispCanv);
  };

  self.clear = function()
  {
    self.drawCanv.clear();
    self.dispCanv.clear();
  };

  document.getElementById(self.container).appendChild(self.dispCanv.canvas);
};

