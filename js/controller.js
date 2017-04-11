var Controller = (function () {
    function Controller(minion) {
        var _this = this;
        this.skeleton = null;
        this._animations = {};
        this._direction = new BABYLON.Vector3(0, 0, 0);
        this._destination = null;
        this._lastDistance = Number.POSITIVE_INFINITY;
        this.destinations = [];
        this.speed = 1;
        this.animationSpeedMultiplier = 1;
        this.isMoving = false;
        this._minion = minion;
        this.findSkeleton();
        this._minion.getScene().registerBeforeRender(function () {
            _this._move();
        });
    }
    Controller.prototype.addDestination = function (value, data) {
        this.destinations.push({ position: value, data: data });
        return this;
    };
    Controller.prototype._moveToNextDestination = function () {
        this._destination = this.destinations.shift();
        this._lastDistance = Number.POSITIVE_INFINITY;
        this.isMoving = true;
        this._direction = this._destination.position.subtract(this._minion.position);
        this._direction.normalize();
        this.lookAt(this._destination.position);
    };
    Controller.prototype.lookAt = function (value) {
        var dv = value.subtract(this._minion.position);
        var yaw = -Math.atan2(dv.z, dv.x) - Math.PI / 2;
        this._minion.rotation.y = yaw;
    };
    Controller.prototype.findSkeleton = function () {
        this._minion.getScene().stopAnimation(this._minion);
        if (this._minion.skeleton) {
            this.skeleton = this._minion.skeleton;
            this._minion.getScene().stopAnimation(this.skeleton);
            this.skeleton.enableBlending(0.08);
        }
    };
    Controller.prototype.start = function () {
        if (this.destinations.length >= 1) {
            this._moveToNextDestination();
        }
    };
    Controller.prototype.stop = function () {
        this.destinations = [];
        this.pause();
    };
    Controller.prototype.pause = function () {
        this.isMoving = false;
    };
    Controller.prototype.resume = function () {
        this.isMoving = true;
    };
    Controller.prototype._move = function () {
        if (this.isMoving && this._destination) {
            var distance = BABYLON.Vector3.Distance(this._minion.position, this._destination.position);
            if (distance < Controller.Epsilon || distance > this._lastDistance) {
                this._minion.position.copyFrom(this._destination.position);
                if (this.atEachDestination) {
                    this.atEachDestination(this._destination.data);
                }
                this.isMoving = false;
                if (this.destinations.length == 0) {
                    if (this.atFinalDestination) {
                        this.atFinalDestination(this._destination.data);
                    }
                }
                else {
                    this._moveToNextDestination();
                }
            }
            else {
                this._lastDistance = distance;
                var delta = this._direction.scale(this._minion.getScene().getAnimationRatio() * this.speed);
                this._minion.position.addInPlace(delta);
            }
        }
    };
    Controller.prototype.addAnimation = function (name, from, to) {
        if (this.skeleton) {
            this.skeleton.createAnimationRange(name, from, to);
        }
        else {
            this._animations[name] = { from: from, to: to };
        }
    };
    Controller.prototype.playAnimation = function (name, loop, speed) {
        if (speed === void 0) { speed = 1; }
        if (this.skeleton) {
            this.skeleton.beginAnimation(name, loop, speed * this.animationSpeedMultiplier);
        }
        else {
            var animation = this._animations[name];
            this._minion.getScene().beginAnimation(this._minion, animation.from, animation.to, loop, speed * this.animationSpeedMultiplier);
        }
    };
    return Controller;
}());
Controller.Epsilon = 0.1;
//# sourceMappingURL=controller.js.map