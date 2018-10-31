"use strict";

module.exports = function(entity, req) {
  // console.log(req.decode.role);
  if (req.method === "POST") {
    if (entity.createBy == undefined) {
      if (req.decode != undefined) {
          entity.createBy = req.decode.userName;
      } 
    }
    entity.createDate = new Date();
  }

  if (entity.modifyBy != undefined) {
      if (req.decode != undefined) {
          entity.modifyBy = req.decode.userName;
      }
  }
  entity.modifyDate = new Date();
};
