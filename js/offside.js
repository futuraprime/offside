(function() {
  function recalculatePositions() {

  }

  function Team() {
    this.players = [];
  }
  Team.prototype.addPlayer = function() {

  };

  function Player(field) {
    this.representation = field.circle(0,0,this.radius);
    this.representation.drag(this.onMove.bind(this));
  }
  Player.prototype.radius = 10;
  Player.prototype.onMove = function(evt) {
    console.log('moving!', arguments);
    recalculatePositions();
  };


  var s = Snap('#interactive');

  var p = new Player(s);

}).call(this);
