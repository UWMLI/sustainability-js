var TestScene = function(game, stage)
{
  var self = this;

  var physical_rect    = {x:0,y:0,w:stage.dispCanv.canvas.width,h:stage.dispCanv.canvas.height};
  var theoretical_rect = {x:0,y:0,w:stage.drawCanv.canvas.width,h:stage.drawCanv.canvas.height};
  var assetter;
  var dbugger; //'debugger' is a keyword... (why.)
  var drawer;
  var ticker;
  var clicker;
  var hoverer;
  var dragger;
  var flicker;
  var presser;

  var spacer =
  {
    cur_x:0,
    cur_y:0,
    x_pad:10,
    y_pad:10,
    space_h:function(o)
    {
      this.cur_x += this.x_pad;
      o.x = this.cur_x;
      o.y = this.cur_y;
      this.cur_x += o.w;
    },
    space_v:function(o)
    {
      this.cur_y += this.y_pad;
      o.x = this.cur_x;
      o.y = this.cur_y;
      this.cur_y += o.h;
    },
    pad_x:function()
    {
      this.cur_x += this.x_pad;
    },
    pad_y:function()
    {
      this.cur_y += this.y_pad;
    }
  };
  spacer.pad_x();

  var clicktest =
  {
    x:0,
    y:0,
    w:20,
    h:20,
    click:function(evt){dbugger.log("clicktest:"+evt.doX+","+evt.doY);},
    draw:function(canv){canv.context.strokeStyle="#00FF00";canv.context.strokeRect(this.x,this.y,this.w,this.h);}
  };
  spacer.space_v(clicktest);

  var hovertest =
  {
    x:0,
    y:0,
    w:20,
    h:20,
    hover:function(evt){dbugger.log("hovertest:"+evt.doX+","+evt.doY);},
    unhover:function(evt){dbugger.log("unhovertest:"+evt.doX+","+evt.doY);},
    draw:function(canv){canv.context.strokeStyle="#00FF00";canv.context.strokeRect(this.x,this.y,this.w,this.h);}
  };
  spacer.space_v(hovertest);

  var dragtest =
  {
    x:0,
    y:0,
    w:20,
    h:20,
    dragStart:function(evt){dbugger.log("dragtest:"+evt.doX+","+evt.doY);},
    drag:function(evt){dbugger.log("dragtest:"+evt.doX+","+evt.doY);},
    dragFinish:function(evt){dbugger.log("dragtest:"+evt.doX+","+evt.doY);},
    draw:function(canv){canv.context.strokeStyle="#00FF00";canv.context.strokeRect(this.x,this.y,this.w,this.h);}
  };
  spacer.space_v(dragtest);

  var flicktest =
  {
    x:0,
    y:0,
    w:20,
    h:20,
    flickStart:function(evt){dbugger.log("flicktest:"+evt.doX+","+evt.doY);},
    flicking:function(evt){dbugger.log("flicktest:"+evt.doX+","+evt.doY);},
    flick:function(evt){dbugger.log("flicktest:"+evt.doX+","+evt.doY);},
    draw:function(canv){canv.context.strokeStyle="#00FF00";canv.context.strokeRect(this.x,this.y,this.w,this.h);}
  };
  spacer.space_v(flicktest);

  var presstest =
  {
    x:0,
    y:0,
    w:20,
    h:20,
    press:function(evt){dbugger.log("presstest:"+evt.doX+","+evt.doY);},
    unpress:function(evt){dbugger.log("unpresstest:"+evt.doX+","+evt.doY);},
    draw:function(canv){canv.context.strokeStyle="#00FF00";canv.context.strokeRect(this.x,this.y,this.w,this.h);}
  };
  spacer.space_v(presstest);


  self.ready = function()
  {
    assetter = new Assetter({});
    dbugger = new Debugger({source:document.getElementById("debug_div")});
    ticker = new Ticker({});
    drawer = new Drawer({source:stage.drawCanv});

    clicker = new Clicker({source:stage.dispCanv.canvas,physical_rect:physical_rect,theoretical_rect:theoretical_rect});
    clicker.register(clicktest);
    drawer.register(clicktest);

    hoverer = new Hoverer({source:stage.dispCanv.canvas,physical_rect:physical_rect,theoretical_rect:theoretical_rect});
    hoverer.register(hovertest);
    drawer.register(hovertest);

    dragger = new Dragger({source:stage.dispCanv.canvas,physical_rect:physical_rect,theoretical_rect:theoretical_rect});
    dragger.register(dragtest);
    drawer.register(dragtest);

    flicker = new Flicker({source:stage.dispCanv.canvas,physical_rect:physical_rect,theoretical_rect:theoretical_rect});
    flicker.register(flicktest);
    drawer.register(flicktest);

    presser = new Presser({source:stage.dispCanv.canvas,physical_rect:physical_rect,theoretical_rect:theoretical_rect});
    presser.register(presstest);
    drawer.register(presstest);
  };

  self.tick = function()
  {
    clicker.flush();
    hoverer.flush();
    dragger.flush();
    flicker.flush();
    presser.flush();
    ticker.flush();
  };

  self.draw = function()
  {
    drawer.flush();
  };

  self.cleanup = function()
  {
  };

};

