/// <reference path = "../lib/babylon.d.ts"/>
var Game = (function () {
    function Game(canvasElement) {
        var _this = this;
        var canvas = document.getElementById(canvasElement);
        this.engine = new BABYLON.Engine(canvas, true);
        //this.engine.enableOfflineSupport = false;
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
        camera.attachControl(this.engine.getRenderingCanvas());
        camera.keysUp.push(87); // "w"
        camera.keysDown.push(83); // "s"
        camera.keysLeft.push(65); // "a"
        camera.keysRight.push(68); // "d"
        camera.setTarget(BABYLON.Vector3.Zero());
        var light = new BABYLON.DirectionalLight('dirLight', new BABYLON.Vector3(-10, -10, -10), this.scene);
        //light.intensity = 1.5;
        //light.diffuse = BABYLON.Color3.FromInts(255, 245, 0);
        var loader = new Preloader(this);
        loader.callback = this.run.bind(this);
        loader.loadAssets();
    };
    Game.prototype.run = function () {
        var _this = this;
        this.scene.executeWhenReady(function () {
            // Remove loader
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
        //this.scene.debugLayer.show();
        var ground = BABYLON.Mesh.CreateGround("ground", 100, 100, 2, this.scene);
        var groundMaterial = new BABYLON.StandardMaterial("groundMat", this.scene);
        ground.material = groundMaterial;
        groundMaterial.specularColor = BABYLON.Color3.Black();
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
        this.scene.onPointerDown = function (evt, pr) {
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
