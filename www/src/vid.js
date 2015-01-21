var Vid = function(container, source, stamps, callback)
{
  var self = this;

  self.container = container;
  self.source    = source;
  self.stamps    = stamps;
  self.callback  = callback;

  self.video = document.createElement('video');
  self.video.style.width = container.style.width;
  self.video.style.height = container.style.height;
  var dom_src = document.createElement('source');
  dom_src.src = self.source;
  dom_src.type = "video/"+self.source.substring(self.source.indexOf('.')+1); //oh god so error prone
  self.video.appendChild(dom_src);
  self.video.controls = false;
  self.video.loop = false;

  self.onended = function()
  {
    self.container.removeChild(self.video);

    self.video = undefined;
    self.callback();
  }
  self.video.onended = self.onended;

  self.load = function()
  {
    self.video.load();
  }

  self.play = function()
  {
    self.container.appendChild(self.video);
    self.video.play();
  }

  self.stop = function()
  {
    self.video.pause();
    self.onended();
  }

  self.next = function()
  {
    var i = 0;
    while(i < self.stamps.length && self.video.currentTime >= self.stamps[i])
      i++;
    if(i == self.stamps.length) self.stop();
    else
      self.video.currentTime = self.stamps[i];
  }


}
