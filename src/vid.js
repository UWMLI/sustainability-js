var Vid = function(container, source, stamps, callback)
{
  var self = this;

  self.container = container;
  self.source    = source;
  self.stamps    = stamps;
  self.callback  = callback;

  var dom_vid = document.createElement('video');
  dom_vid.style.width = container.style.width;
  dom_vid.style.height = container.style.height;
  dom_src = document.createElement('source');
  dom_src.src = self.source;
  dom_src.type = "video/"+self.source.substring(self.source.indexOf('.')+1); //oh god so error prone


  dom_vid.appendChild(dom_src);
  dom_vid.controls = false;
  dom_vid.loop = false;

  self.onended = function()
  {
    self.container.removeChild(dom_vid);

    dom_vid = undefined;
    self.callback();
  }
  dom_vid.onended = self.onended;

  self.load = function()
  {
    dom_vid.load();
  }

  self.play = function()
  {
    self.container.appendChild(dom_vid);
    dom_vid.play();
  }

  self.stop = function()
  {
    dom_vid.pause();
    self.onended();
  }

  self.next = function()
  {
    var i = 0;
    while(i < self.stamps.length && dom_vid.currentTime >= self.stamps[i])
      i++;
    if(i == self.stamps.length) self.stop();
    else
      dom_vid.currentTime = self.stamps[i];
  }


}
