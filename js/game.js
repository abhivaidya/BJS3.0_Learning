/// <reference path = "../lib/babylon.d.ts"/>
var Game = (function () {
    function Game(canvasElement) {
        var _this = this;
        this.tick = 0;
        BABYLON.Engine.ShadersRepository = "shaders/";
        var canvas = document.getElementById(canvasElement);
        this.engine = new BABYLON.Engine(canvas, true);
        this.engine.enableOfflineSupport = BABYLON.Database;
        this.engine.enableOfflineSupport.IDBStorageEnabled = false;
        this.assets = [];
        this.scene = null;
        window.addEventListener("resize", function () {
            _this.engine.resize();
        });
        this.initScene();
    }
    Game.prototype.initScene = function () {
        this.scene = new BABYLON.Scene(this.engine);
        this.scene.fogMode = BABYLON.Scene.FOGMODE_EXP2;
        this.scene.fogDensity = 0.003;
        this.scene.fogColor = new BABYLON.Color3(0.8, 0.83, 0.8);
        var camera = new BABYLON.FreeCamera('FreeCam', new BABYLON.Vector3(-50, 55, -60), this.scene);
        camera.attachControl(this.engine.getRenderingCanvas());
        camera.keysUp.push(87); // "w"
        camera.keysDown.push(83); // "s"
        camera.keysLeft.push(65); // "a"
        camera.keysRight.push(68); // "d"
        camera.setTarget(BABYLON.Vector3.Zero());
        var light = new BABYLON.DirectionalLight("dir", new BABYLON.Vector3(1, -1, -2), this.scene);
        light.position = new BABYLON.Vector3(-300, 300, 600);
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
            _this.showAxis(15);
            _this.engine.runRenderLoop(function () {
                _this.scene.render();
                _this._runGame();
            });
        });
    };
    Game.prototype._init = function () {
        //this.scene.debugLayer.show();
        this.ground = BABYLON.Mesh.CreateGround("ground", 500, 500, 2, this.scene, true);
        var groundMaterial = new BABYLON.StandardMaterial("groundMat", this.scene);
        this.ground.material = groundMaterial;
        groundMaterial.diffuseColor = BABYLON.Color3.FromInts(193, 181, 151);
        groundMaterial.specularColor = BABYLON.Color3.Black();
        this.skybox = BABYLON.Mesh.CreateSphere("skyBox", 10, 500, this.scene);
        var shader = new BABYLON.ShaderMaterial("gradient", this.scene, "gradient", {});
        shader.setFloat("offset", 0);
        shader.setFloat("exponent", 0.6);
        shader.setColor3("topColor", BABYLON.Color3.FromInts(0, 119, 255));
        shader.setColor3("bottomColor", BABYLON.Color3.FromInts(240, 240, 255));
        shader.backFaceCulling = false;
        this.skybox.material = shader;
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
    };
    Game.prototype.showAxis = function (size) {
        var axisX = BABYLON.Mesh.CreateLines("axisX", [
            BABYLON.Vector3.Zero(), new BABYLON.Vector3(size, 0, 0), new BABYLON.Vector3(size * 0.95, 0.05 * size, 0),
            new BABYLON.Vector3(size, 0, 0), new BABYLON.Vector3(size * 0.95, -0.05 * size, 0)
        ], this.scene);
        axisX.color = new BABYLON.Color3(1, 0, 0);
        var xChar = this.makeTextPlane("X", "red", size / 10);
        xChar.position = new BABYLON.Vector3(0.9 * size, 0.05 * size, 0);
        var axisY = BABYLON.Mesh.CreateLines("axisY", [
            BABYLON.Vector3.Zero(), new BABYLON.Vector3(0, size, 0), new BABYLON.Vector3(-0.05 * size, size * 0.95, 0),
            new BABYLON.Vector3(0, size, 0), new BABYLON.Vector3(0.05 * size, size * 0.95, 0)
        ], this.scene);
        axisY.color = new BABYLON.Color3(0, 1, 0);
        var yChar = this.makeTextPlane("Y", "green", size / 10);
        yChar.position = new BABYLON.Vector3(0, 0.9 * size, -0.05 * size);
        var axisZ = BABYLON.Mesh.CreateLines("axisZ", [
            BABYLON.Vector3.Zero(), new BABYLON.Vector3(0, 0, size), new BABYLON.Vector3(0, -0.05 * size, size * 0.95),
            new BABYLON.Vector3(0, 0, size), new BABYLON.Vector3(0, 0.05 * size, size * 0.95)
        ], this.scene);
        axisZ.color = new BABYLON.Color3(0, 0, 1);
        var zChar = this.makeTextPlane("Z", "blue", size / 10);
        zChar.position = new BABYLON.Vector3(0, 0.05 * size, 0.9 * size);
    };
    Game.prototype.makeTextPlane = function (text, color, size) {
        var dynamicTexture = new BABYLON.DynamicTexture("DynamicTexture", 50, this.scene, true);
        dynamicTexture.hasAlpha = true;
        dynamicTexture.drawText(text, 5, 40, "bold 36px Arial", color, "transparent", true);
        var plane = BABYLON.MeshBuilder.CreatePlane("TextPlane", { size: size }, this.scene);
        plane.material = new BABYLON.StandardMaterial("TextPlaneMaterial", this.scene);
        plane.material.backFaceCulling = false;
        plane.material.specularColor = new BABYLON.Color3(0, 0, 0);
        plane.material.diffuseTexture = dynamicTexture;
        return plane;
    };
    return Game;
}());
Game.SELF = 0;
Game.CLONE = 1;
Game.INSTANCE = 2;
window.addEventListener("DOMContentLoaded", function () {
    new Game('renderCanvas');
});
