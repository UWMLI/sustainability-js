var Model = function()
{
  var self = this;

  self.gameId = 0;
  self.playerId = 0;
  self.webPageId = 0;

  self.item_ids  = [];
  self.item_qtys = [];

  self.fetchSync = function(syncCompleteCallback)
  {
    var params = ARIS.parseURLParams(document.URL);
    self.gameId    = parseInt(params.gameId);
    self.playerId  = parseInt(params.playerId);
    self.webPageId = parseInt(params.webPageId);
    self.gameType  = params.gameType;

    var bogusEndOfQueueId = 99999999; //Used to flag the end of the queue
    ARIS.didUpdateItemQty = function(updatedItemId, qty)
    {
      if(updatedItemId == bogusEndOfQueueId) syncCompleteCallback(); //All initial requests have completed; ARIS state is known.
      for(var i = 0; i < self.item_ids.length; i++) if(self.item_ids[i] == updatedItemId) item_qtys[i] = qty;
    }

    for(var i = 0; i < self.item_ids.length; i++) ARIS.getItemCount(self.item_ids[i]);
    ARIS.getItemCount(bogusEndOfQueueId); 
  }
};

