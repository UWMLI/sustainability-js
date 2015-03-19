var Aud = function(source)
{
  //var PLAT="IOS";
  var PLAT="ANDROID";

  var self = this;
  self.stopped = false;

  if(PLAT == "IOS")
  {
    self.audio = new Audio(source);
    self.audio.controls = false;
    self.audio.loop = true;

    self.load = function()
    {
      self.audio.load();
    }

    self.play = function()
    {
      self.audio.play();
    }

    self.stop = function()
    {
      self.stopped = true;
      self.audio.pause();
    }
  }

  if(PLAT == "ANDROID")
  {
    function getPhoneGapPath() {
      var path = window.location.pathname;
      path = path.substr( path, path.length - 10 );
      return 'file://' + path;
    };

    self.audio = new Media(getPhoneGapPath()+source,null,null,
      function(status)
      {
        if(!self.stopped && status == Media.MEDIA_STOPPED)
          self.audio.play();
      }
    );

    self.load = function()
    {
    }

    self.play = function()
    {
      self.audio.play();
    }

    self.stop = function()
    {
      self.stopped = true;
      self.audio.pause();
      self.audio.release();
    }
  }
}
