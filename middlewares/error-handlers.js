module.exports = {
  finalHandler: function(err, req, res, next) {
    console.log(err);
    err.throw(res);
  }
};
