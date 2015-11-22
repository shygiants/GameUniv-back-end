function ErrorThrower(err, status) {
  this.err = err;
  this.status = status;
}

ErrorThrower.prototype.throw = function(res) {
  res.status(this.status);
  res.json({ error: this.err });
};

ErrorThrower.prototype.getStatusCode = function() {
  return this.status;
};

module.exports = ErrorThrower;
