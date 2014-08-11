var Stage = function()
{
  var width = document.getElementById("stage_container").offsetWidth;
  var height = document.getElementById("stage_container").offsetHeight;

  this.drawCanv = new Canv(width,height);
  this.drawCanv.context.fillStyle = "#000000";
  this.drawCanv.context.strokeStyle = "#000000";
  this.drawCanv.context.font = "12px vg_font";
  this.dispCanv = new Canv(width,height);
  this.dispCanv.canvas.style.border = "1px solid black";

  this.draw = function()
  {
    this.drawCanv.blitTo(this.dispCanv);
  };

  this.clear = function()
  {
    this.drawCanv.clear();
    this.dispCanv.clear();
  };

  document.getElementById("stage_container").appendChild(this.dispCanv.canvas);
};

