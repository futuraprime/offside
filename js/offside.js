(function() {
  function Pitch(field, scale) {
    scale = scale || 1;
    function scaleValue(v) {
      v = v || 0;
      return v * scale;
    }

    // these are the dimensions of the Maracana
    // all lengths in feet
    var l = this.length = scaleValue(344);
    var w = this.width = scaleValue(223);

    var g = this.group = field.group();
    g.attr({
      transform : 'translate(50,50)'
    });

    var padding = 20;
    var lineAttrs = {
      fill : 'none',
      stroke : '#fff',
      'stroke-width' : 1.5,
      'stroke-linecap' : 'square'
    };
    var spotAttrs = {
      fill : '#fff',
      stroke : 'none',
      r : 4
    };
    var pitchColor = '#337331';

    this.background = field.rect(-padding,-padding,l+padding*2,w+padding*2);
    this.background.attr({
      fill : pitchColor
    });
    g.add(this.background);

    this.leftGoalLine = field.line(0,0,0,w).attr(lineAttrs);
    this.rightGoalLine = field.line(l,0,l,w).attr(lineAttrs);
    this.topLine = field.line(0,0,l,0).attr(lineAttrs);
    this.bottomLine = field.line(0,w,l,w).attr(lineAttrs);
    this.centerLine = field.line(l/2,0,l/2,w).attr(lineAttrs);
    this.centerCircle = field.circle(l/2,w/2,30).attr(lineAttrs);
    this.centerSpot = field.circle(l/2,w/2,5).attr(spotAttrs);

    g.add(
      this.leftGoalLine,
      this.rightGoalLine,
      this.topLine,
      this.bottomLine,
      this.centerLine,
      this.centerCircle,
      this.centerSpot
    );

    function positionBoxToSide(right, length) {
      if(length < 0) {
        return right ? l : scaleValue(length);
      }
      return right ? l - scaleValue(length) : 0;
    }
    function centerCircleToSide(right, dL) {
      return right ? l - scaleValue(dL) : scaleValue(dL);
    }
    function centerOnWidth(width) {
      return (w - scaleValue(width)) / 2;
    }
    function sideBoxCircle(right,cx,r) {
      return field.circle(
        centerCircleToSide(right, cx),
        centerOnWidth(),
        scaleValue(r)
      );
    }
    function sideBoxRect(right,length,width) {
      return field.rect(
        positionBoxToSide(right, length),
        centerOnWidth(width),
        scaleValue(Math.abs(length)),
        scaleValue(width)
      );
    }

    function drawSideBox(right) {
      var penaltyCircle = sideBoxCircle(right, 36, 30).attr(lineAttrs);
      // filling this one to hide most of the penalty circle
      var penaltyBox = sideBoxRect(right, 54, 132).attr(lineAttrs).attr({fill:pitchColor});
      var penaltySpot = sideBoxCircle(right, 36,2).attr(spotAttrs);
      var goalBox = sideBoxRect(right, 18, 60).attr(lineAttrs);
      var goal = sideBoxRect(right,-8,24).attr(lineAttrs);

      g.add(
        penaltyCircle,
        penaltyBox,
        penaltySpot,
        goalBox,
        goal
      );
    }

    drawSideBox(false);
    drawSideBox(true);
  }

  function recalculatePositions() {

  }

  function Team(field, color) {
    this.field = field;
    this.color = color;
    this.players = [];
  }
  Team.prototype.addPlayer = function(n) {
    n = n || 1;
    for(var i=0;i<n;++i) {
      this.players.push(new Player(this.field, this.color));
    }
  };

  function Player(field, color) {
    this.x = 100;
    this.y = 100;
    this.representation = field.circle(this.x,this.y,this.radius);
    this.representation.attr({
      fill : color || '#353131',
      stroke : 'transparent',
      'stroke-width' : this.clickRadius - this.radius
    });
    this.representation.drag(
      this.onMove, this.onStart, this.onEnd,
      this, this, this
    );
  }
  Player.prototype.radius = 6;
  Player.prototype.clickRadius = 25;

  // we're doing a kinda sneaky trick here, so we use (fast) transforms
  // to move the dot around, but then actually move the dot to its final
  // position when we're done
  Player.prototype.onMove = function(dx, dy) {
    this.x = this.moveStartX + dx;
    this.y = this.moveStartY + dy;
    this.representation.attr({
      transform : 'translate('+dx+','+dy+')'
    });
    recalculatePositions();
  };
  Player.prototype.onStart = function() {
    this.moveStartX = this.x;
    this.moveStartY = this.y;
  };
  Player.prototype.onEnd = function() {
    this.representation.attr({
      transform : '',
      cx : this.x,
      cy : this.y
    });
  };

  var s = Snap('#interactive');

  var pitch = new Pitch(s, 1.5);

  var offense = new Team(s, '#B13631');
  offense.addPlayer(5);
  var defense = new Team(s, '#00477A');
  defense.addPlayer(5);

  // var p = new Player(s);

}).call(this);
