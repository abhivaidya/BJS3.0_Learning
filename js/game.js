var Game = (function () {
    function Game(canvasElement) {
        var _this = this;
        var canvas = document.getElementById(canvasElement);
        this.engine = new BABYLON.Engine(canvas, true);
        this.engine.enableOfflineSupport = false;
        this.assets = [];
        this.scene = null;
        window.addEventListener("resize", function () {
            _this.engine.resize();
        });
        this.initScene();
    }
    Game.prototype.initScene = function () {
        this.scene = new BABYLON.Scene(this.engine);
        var camera = new BABYLON.FreeCamera('FreeCam', new BABYLON.Vector3(-50, 55, -60), this.scene);
        camera.keysUp.push(87);
        camera.keysDown.push(83);
        camera.keysLeft.push(65);
        camera.keysRight.push(68);
        camera.setTarget(BABYLON.Vector3.Zero());
        var light = new BABYLON.DirectionalLight('dirLight', new BABYLON.Vector3(-10, -10, -10), this.scene);
        var loader = new Preloader(this);
        loader.callback = this.run.bind(this);
        loader.loadAssets();
    };
    Game.prototype.run = function () {
        var _this = this;
        this.scene.executeWhenReady(function () {
            var loader = document.querySelector("#splashscreen");
            loader.style.display = "none";
            _this._init();
            _this.engine.runRenderLoop(function () {
                _this.scene.render();
            });
            _this._runGame();
        });
    };
    Game.prototype._init = function () {
        this.scene.debugLayer.show();
        this.prepWorld();
        this.addPlayer();
    };
    Game.prototype.addPlayer = function () {
        var player = BABYLON.MeshBuilder.CreateBox("player", { width: 2, height: 4, depth: 2 }, this.scene);
        player.position.y = 1;
        this._controller = new Controller(player);
        this._controller.speed = 0.5;
        this.shadowGenerator.getShadowMap().renderList.push(player);
    };
    Game.prototype.prepWorld = function (assetToUse) {
        if (assetToUse === void 0) { assetToUse = null; }
        var ground1 = BABYLON.MeshBuilder.CreateGround("ground", { width: 200, height: 200, subdivisions: 2, updatable: false }, this.scene);
        var groundMat = new BABYLON.StandardMaterial("groundMat", this.scene);
        ground1.material = groundMat;
        groundMat.specularColor = BABYLON.Color3.Black();
        ground1.receiveShadows = true;
        this.shadowGenerator = new BABYLON.ShadowGenerator(1024, this.scene.getLightByID('dirLight'));
        this.shadowGenerator.setDarkness(0.5);
        this.shadowGenerator.useBlurVarianceShadowMap = true;
        this.shadowGenerator.bias = 0.0001;
        this.shadowGenerator.blurScale = 2;
    };
    Game.prototype.createAsset = function (name, mode) {
        if (mode === void 0) { mode = Game.SELF; }
        var res = [];
        for (var _i = 0, _a = this.assets[name]; _i < _a.length; _i++) {
            var mesh = _a[_i];
            switch (mode) {
                case Game.SELF:
                    mesh.setEnabled(true);
                    res.push(mesh);
                    break;
                case Game.CLONE:
                    res.push(mesh.clone());
                    break;
                case Game.INSTANCE:
                    res.push(mesh.createInstance());
                    break;
            }
        }
        return res;
    };
    Game.prototype._runGame = function () {
        var _this = this;
        this.scene.onPointerDown = function (evt, pr) {
            if (pr.hit) {
                var destination = pr.pickedPoint.clone();
                destination.y = 0;
                _this._controller.addDestination(destination);
                _this._controller.start();
            }
        };
    };
    return Game;
}());
Game.SELF = 0;
Game.CLONE = 1;
Game.INSTANCE = 2;
window.addEventListener("DOMContentLoaded", function () {
    new Game('renderCanvas');
});
//# sourceMappingURL=game.js.map