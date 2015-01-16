var platform = "MOBILE"; //"PC" or "MOBILE"
var debug = false;
var using_aris = false;

var parseURLParams = function(url)
{
  var gameId = 0;
  var playerId = 0;
  var webPageId = 0;
  var gameType = "";
  var platform = "MOBILE";
  var debug = false;
  var using_aris = false;

  var vars = window.location.search.substring(1).split("&");
  for (var i=0;i<vars.length;i++)
  {
    var pair = vars[i].split("=");
    console.log(pair[0]);
    if(pair[0].toLowerCase() == "gameid")    gameId     = parseInt(pair[1].replace('/',''));
    if(pair[0].toLowerCase() == "playerid")  playerId   = parseInt(pair[1].replace('/',''));
    if(pair[0].toLowerCase() == "webpageid") webPageId  = parseint(pair[1].replace('/',''));
    if(pair[0].toLowerCase() == "gametype")  gameType   = pair[1].replace('/','').toLowerCase();
    if(pair[0].toLowerCase() == "platform")  platform   = pair[1].replace('/','').toUpperCase();
    if(pair[0].toLowerCase() == "debug")     debug      = (pair[1].replace('/','').toLowerCase() == "true");
    if(pair[0].toLowerCase() == "aris")      using_aris = (pair[1].replace('/','').toLowerCase() == "true");
  }

  return {"gameId":0,"playerId":0,"webPageId":0,"gameType":gameType,"platform":platform,"debug":debug,"aris":using_aris};
};

