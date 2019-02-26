const Advertisement = require("./models/").Advertisement;

module.exports = {

//#1
  getAllAdvertisements(callback){
    return Advertisement.all()

//#2
    .then((advertisements) => {
      callback(null, advertisements);
    })
    .catch((err) => {
      callback(err);
    })
  },
  getAdvertisement(id, callback){
    return Advertisement.findById(id)
    .then((advertisement) => {
      callback(null, advertisement);
    })
    .catch((err) => {
      callback(err);
    })
  },

  addAdvertisement(newAd, callback){
     return Advertisement.create({
       title: newAdvertisement.title,
       description: newAdvertisement.description
     })
     .then((advertisement) => {
       callback(null, advertisement);
     })
     .catch((err) => {
       callback(err);
     })
   },
   deleteAdvertisement(id, callback){
   return Advertisement.destroy({
     where: {id}
   })
   .then((advertisement) => {
     callback(null, advertisement);
   })
   .catch((err) => {
     callback(err);
   })
 },
 updateTopic(id, updatedAdvertisement, callback){
    return Advertisement.findById(id)
    .then((advertisement) => {
      if(!advertisement){
        return callback("Advertisement not found");
      }

//#1
      advertisement.update(updatedAdvertisement, {
        fields: Object.keys(updatedAdvertisement)
      })
      .then(() => {
        callback(null, advertisement);
      })
      .catch((err) => {
        callback(err);
      });
    });
  }
}
