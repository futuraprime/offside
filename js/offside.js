// (function() {
  function Pitch(field, scale, offset) {
    scale = scale || 1;
    offset = this.offset = offset || 50;
    function scaleValue(v) {
      v = v || 0;
      return v * scale;
    }
    this.scaleValue = scaleValue;

    this.field = field;

    // these are the dimensions of the Maracana
    // all lengths in feet
    var l = this.length = scaleValue(344);
    var w = this.width = scaleValue(223);

    var g = this.group = field.group();
    g.attr({
      transform : 'translate('+offset+','+offset+')'
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

  function Team(pitch, side, color, stroke) {
    this.pitch = pitch;
    this.side = side;
    this.field = pitch.field;
    this.color = color;
    this.stroke = stroke || '#fff';
    this.players = [];
  }
  Team.prototype.addPlayer = function(n) {
    n = n || 1;
    for(var i=0;i<n;++i) {
      this.players.push(i === 0 ? new Goalkeeper(this) : new Player(this));
    }
  };
  // positions should be an array of 2-item arrays [x,y]
  Team.prototype.repositionPlayers = function(positions) {
    var i,l;

    if(positions === 'random') {
      positions = [];
      for(i=0,l=this.players.length;i<l;++i) {
        positions.push([
          Math.random() * this.pitch.length + this.pitch.offset,
          Math.random() * this.pitch.width + this.pitch.offset
        ]);
      }
    }
    for(i=0,l=positions.length;i<l;++i) {
      this.players[i].animate({
        cx : positions[i][0],
        cy : positions[i][1]
      }, 300, mina.easeout);
    }
  };
  Team.prototype.freezePositions = function() {
    var positions = [];
    for(var i=0,l=this.players.length;i<l;++i) {
      positions.push([
        this.players[i].x,
        this.players[i].y
      ]);
    }
    return positions;
  };
  // this supplies the position of offside assuming this team
  // is defending the left goal
  Team.prototype.getOffsidePosition = function() {
    var leftPositions = _.pluck(this.players, 'x');
    return _.sortBy(leftPositions)[1];
  };
  Team.prototype.markOffsidePosition = function(left) {
    for(var i=0,l=this.players.length;i<l;++i) {
      this.players[i].representation.attr({
        // fill : this.players[i].x < left ? '#B13631' : this.color,
        stroke : this.players[i].x < left ? '#821B0D' : this.stroke,
        'stroke-width' : this.players[i].x < left ? 5 : 1.5
      });
    }
  };

  function Player() {
    this.initialize.apply(this, arguments);
  }
  Player.prototype.initialize = function(team) {
    this.team = team;
    var field = team.field;
    var color = team.color;
    this.x = Math.random() * team.pitch.length + team.pitch.offset;
    this.y = Math.random() * team.pitch.width + team.pitch.offset;
    this.group = field.group();
    this.representation = field.circle(this.x,this.y,this.radius);
    this.representation.attr({
      fill : color || '#821B0D',
      stroke : this.team.stroke,
      'stroke-width' : 1.5
    });
    this.clickable = field.circle(this.x,this.y,this.clickRadius).attr({
      // fill : 'rgba(255,255,255,0.3)'
      fill : 'transparent'
    });
    this.group.add(this.representation, this.clickable);
    this.group.drag(
      this.onMove, this.onStart, this.onEnd,
      this, this, this
    );
  };
  Player.prototype.radius = 7;
  Player.prototype.clickRadius = 21;

  Player.prototype.position = function(x,y) {
    this.x = x;
    this.y = y;
    var newCenter = { cx : this.x, cy : this.y };
    this.representation.attr(newCenter);
    this.clickable.attr(newCenter);
  };
  Player.prototype.animate = function(attr, duration, easing, callback) {
    this.representation.animate.call(this.representation, attr, duration, easing);
    this.clickable.animate.call(this.clickable, attr, duration, easing);
    if(attr.cx) { this.x = attr.cx; }
    if(attr.cy) { this.y = attr.cy; }
  };

  // we're doing a kinda sneaky trick here, so we use (fast) transforms
  // to move the dot around, but then actually move the dot to its final
  // position when we're done
  Player.prototype.onMove = function(dx, dy) {
    this.x = this.moveStartX + dx;
    this.y = this.moveStartY + dy;
    this.group.attr({
      transform : 'translate('+dx+','+dy+')'
    });
    calculateOffsides();
  };
  Player.prototype.onStart = function() {
    this.moveStartX = this.x;
    this.moveStartY = this.y;
  };
  Player.prototype.onEnd = function() {
    this.group.attr({
      transform : ''
    });
    var newCenter = {
      cx : this.x,
      cy : this.y
    };
    this.representation.attr(newCenter);
    this.clickable.attr(newCenter);
  };


  function Goalkeeper() {
    this.initialize.apply(this, arguments);
  }
  Goalkeeper.prototype = Object.create(Player.prototype);
  Goalkeeper.prototype.initialize = function(team) {
    var pitch = team.pitch;
    Player.prototype.initialize.apply(this, arguments);
    // goalkeepers default to their goals
    this.position(
      (team.side === 'right' ? pitch.length : 0) + pitch.offset,
      pitch.width / 2 + pitch.offset
    );
  };

  var field = Snap('#interactive');

  var pitch = new Pitch(field, 1.5);

  var offense = new Team(pitch, 'right', '#E6E5E5', '#111');
  offense.addPlayer(11);
  var defense = new Team(pitch, 'left', '#00477A');
  defense.addPlayer(11);


  // and finally
  function calculateOffsides() {
    var offside = defense.getOffsidePosition();
    offense.markOffsidePosition(offside);
  }
  calculateOffsides();

// }).call(this);
