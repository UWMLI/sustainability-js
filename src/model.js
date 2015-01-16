var Model = function()
{
  var self = this;

  self.item_ids  = [];
  self.item_qtys = [];

  for(var i = 0; i < game_meta.length; i++)
  {
    self.item_ids[i] = game_meta[i].item_id;
    self.item_qtys[i] = 0;
  }

  self.fetchSync = function(syncCompleteCallback)
  {
    var bogusEndOfQueueId = 99999999; //Used to flag the end of the queue
    ARIS.didUpdateItemQty = function(updatedItemId, qty)
    {
      if(updatedItemId == bogusEndOfQueueId) syncCompleteCallback(); //All initial requests have completed; ARIS state is known.
      for(var i = 0; i < self.item_ids.length; i++) if(self.item_ids[i] == updatedItemId) self.item_qtys[i] = qty;
    }

    for(var i = 0; i < self.item_ids.length; i++) ARIS.getItemCount(self.item_ids[i]);
    ARIS.getItemCount(bogusEndOfQueueId);
  }
};

