/// <reference path = "../lib/babylon.d.ts"/>
var Game = /** @class */ (function () {
    function Game(canvasElement) {
        var _this = this;
        this.tick = 0;
        BABYLON.Engine.ShadersRepository = "shaders/";
        var canvas = document.getElementById(canvasElement);
        this.engine = new BABYLON.Engine(canvas, true);
        this.engine.enableOfflineSupport = false;
        // this.engine.enableOfflineSupport.IDBStorageEnabled = false;
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
        var camera = new BABYLON.FreeCamera('FreeCam', new BABYLON.Vector3(0, 100, -60), this.scene);
        camera.attachControl(this.engine.getRenderingCanvas());
        camera.keysUp.push(87); // "w"
        camera.keysDown.push(83); // "s"
        camera.keysLeft.push(65); // "a"
        camera.keysRight.push(68); // "d"
        camera.setTarget(BABYLON.Vector3.Zero());
        var light = new BABYLON.DirectionalLight("dir", new BABYLON.Vector3(0, -1, 1), this.scene);
        light.position = new BABYLON.Vector3(0, 100, 0);
        light.intensity = 2;
        // light.diffuse = BABYLON.Color3.FromInts(255, 245, 0);
        // let hLight = new BABYLON.HemisphericLight("hLight", new BABYLON.Vector3(0, 100, 0), this.scene);
        // hLight.intensity = 2;
        this.shadowGenerator = new BABYLON.ShadowGenerator(1024, light);
        this.shadowGenerator.usePoissonSampling = true;
        this.shadowGenerator.setDarkness(0.5);
        this.shadowGenerator.bias = 0.0001;
        this.shadowGenerator.blurScale = 2;
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
        // this.scene.debugLayer.show();
        this.skybox = BABYLON.Mesh.CreateSphere("skyBox", 10, 500, this.scene);
        var shader = new BABYLON.ShaderMaterial("gradient", this.scene, "gradient", {});
        shader.setFloat("offset", 0);
        shader.setFloat("exponent", 0.6);
        shader.setColor3("topColor", BABYLON.Color3.FromInts(0, 119, 255));
        shader.setColor3("bottomColor", BABYLON.Color3.FromInts(240, 240, 255));
        shader.backFaceCulling = false;
        this.skybox.material = shader;
        this.skybox.isPickable = false;
        this.ground = this.createAsset('terrain-grass');
        this.ground.position.x = 0;
        this.ground.position.y = 0.9;
        this.ground.scaling.set(10, 1, 10);
        this.ground.isPickable = true;
        // this.ground.position.set(50, -1, -5)
        // this.planet1 = this.createAsset('gas-station', Game.CLONE);
        // this.planet1.position.x = 0;
        // this.shadowGenerator.getShadowMap().renderList.push(this.planet1);
        // // this.planet1.rotation.z = Math.PI/8;
        // (this.planet1.material as BABYLON.StandardMaterial).specularColor = BABYLON.Color3.Black();
        // console.log(this.createAsset('gas-station'));
        // this.planet2 = BABYLON.Mesh.MergeMeshes(this.createAsset('bedBunk'));
        // this.planet2.position.x = 20;
        // (this.planet2.material as BABYLON.StandardMaterial).diffuseColor = BABYLON.Color3.Black();
        // this.planet3 = this.createAsset('Roof_Inner_Corner_Red_01')[0];
        // this.planet3.position.x = 30;
        // this.shadowGenerator.getShadowMap().renderList.push();
        var zombie = this.createAsset('Zombie_Cylinder');
        var zombieScaling = 1;
        zombie.scaling = new BABYLON.Vector3(zombieScaling, zombieScaling, zombieScaling);
        zombie.position.y = 2;
        this._controller = new Controller(zombie);
        this._controller.speed = 1;
        // this._controller.animationSpeedMultiplier = 2.9;
        this._controller.addAnimation('crawl', 164, 312);
        this._controller.addAnimation('walk', 521, 640);
        this._controller.addAnimation('idle', 320, 486);
        this._controller.addAnimation('bite', 0, 151);
        this._controller.playAnimation('bite', true);
        this.shadowGenerator.getShadowMap().renderList.push(zombie);
        var player = this.createAsset('Human_Mesh');
        var playerScaling = 0.9;
        player.scaling = new BABYLON.Vector3(playerScaling, playerScaling, playerScaling);
        player.position.y = 2;
        this._playerController = new Controller(player);
        this._playerController.speed = 1;
        // this._playerController.animationSpeedMultiplier = 2.9;
        this._playerController.addAnimation('death', 40, 145);
        this._playerController.addAnimation('idle', 150, 450);
        this._playerController.addAnimation('jump', 451, 488);
        this._playerController.addAnimation('punch', 500, 529);
        this._playerController.addAnimation('run', 540, 557);
        this._playerController.playAnimation('idle', true);
        this.shadowGenerator.getShadowMap().renderList.push(player);
    };
    Game.prototype.createAsset = function (name, mode, newName) {
        if (mode === void 0) { mode = Game.SELF; }
        if (newName === void 0) { newName = ''; }
        var mesh = this.scene.getMeshByName(name);
        var res = null;
        switch (mode) {
            case Game.SELF:
                res = mesh;
                mesh.setEnabled(true);
                break;
            case Game.CLONE:
                res = mesh.clone(newName);
                break;
            case Game.INSTANCE:
                res = mesh.createInstance(newName);
                break;
        }
        return res;
    };
    Game.prototype._runGame = function () {
        this.scene.onPointerDown = function (evt, pickResult) {
            var that = this;
            if (pickResult.hit) {
                var destination = pickResult.pickedPoint.clone();
                destination.y = 0;
                console.log(pickResult);
                this._playerController.addDestination(destination);
                this._playerController.start();
            }
        };
        var fpsLabel = document.getElementById("fpsLabel");
        fpsLabel.innerHTML = this.engine.getFps().toFixed() + " fps";
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
    Game.SELF = 0;
    Game.CLONE = 1;
    Game.INSTANCE = 2;
    return Game;
}());
window.addEventListener("DOMContentLoaded", function () {
    new Game('renderCanvas');
});
