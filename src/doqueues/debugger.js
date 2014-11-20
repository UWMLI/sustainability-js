var Debugger = function(init)
{
  var default_init =
  {
    history:10,
    source:document.createElement('div')
  }

  var self = this;
  doMapInitDefaults(self,init,default_init);

  var log = [];
  var cells = [];
  for(var i = 0; i < self.history; i++)
  {
    cells[i] = document.createElement('div');
    self.source.appendChild(cells[i]);
  }

  self.log = function(txt)
  {
    log.push(txt);
    if(debug)
    {
      var l = log.length;
      for(var i = 0; i < cells.length; i++)
      {
        if(l > 0) cells[i].innerHTML = log[l-1];
        else      cells[i].innerHTML = "";
        l--;
      }
    }
  }
}

