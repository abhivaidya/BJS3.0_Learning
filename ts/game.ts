/// <reference path = "../lib/babylon.d.ts"/>

class Game
{
    private engine: BABYLON.Engine;
    public assets: Array<BABYLON.AbstractMesh>;
    public scene: BABYLON.Scene;

    public static SELF : number = 0;
    public static CLONE : number = 1;
    public static INSTANCE : number = 2;

    private shadowGenerator;
    private player;

    private _controller : Controller;

    constructor(canvasElement:string)
    {
        let canvas: HTMLCanvasElement = <HTMLCanvasElement>document.getElementById(canvasElement);
        this.engine = new BABYLON.Engine(canvas, true);
        this.engine.enableOfflineSupport = false;

        this.assets = [];
        this.scene = null;

        window.addEventListener("resize", () => {
            this.engine.resize();
        });

        this.initScene();
    }

    private initScene()
    {
        this.scene = new BABYLON.Scene(this.engine);

        let camera = new BABYLON.FreeCamera('FreeCam', new BABYLON.Vector3(-50, 55, -60), this.scene);
        //camera.attachControl(this.engine.getRenderingCanvas());
        camera.keysUp.push(87); // "w"
	    camera.keysDown.push(83); // "s"
	    camera.keysLeft.push(65); // "a"
	    camera.keysRight.push(68); // "d"
        camera.setTarget(BABYLON.Vector3.Zero());

        let light = new BABYLON.DirectionalLight('dirLight', new BABYLON.Vector3(-10, -10, -10), this.scene);
        //light.intensity = 1.5;
        //light.diffuse = BABYLON.Color3.FromInts(255, 245, 0);

        let loader = new Preloader(this);
        loader.callback = this.run.bind(this);
        loader.loadAssets();
    }

    private run()
    {
        this.scene.executeWhenReady(() => {

            // Remove loader
            var loader = <HTMLElement> document.querySelector("#splashscreen");
            loader.style.display = "none";

            this._init();

            this.engine.runRenderLoop(() => {
                this.scene.render();
            });

            this._runGame();
        });
    }

    private _init ()
    {
        this.scene.debugLayer.show();

        this.prepWorld();
        this.addPlayer();
    }

    private addPlayer()
    {
        let player = BABYLON.MeshBuilder.CreateBox("player", {width:2, height:4, depth:2}, this.scene);
        player.position.y = 1;

        // add controller
        this._controller = new Controller(player);
        this._controller.speed = 0.5;

        this.shadowGenerator.getShadowMap().renderList.push(player);
    }

    private prepWorld(assetToUse:Array<BABYLON.Mesh> = null)
    {
        let ground1 = BABYLON.MeshBuilder.CreateGround("ground", {width:200, height:200, subdivisions:2, updatable:false}, this.scene);
        let groundMat = new BABYLON.StandardMaterial("groundMat", this.scene);
        ground1.material = groundMat;
        groundMat.specularColor = BABYLON.Color3.Black();
        //groundMat.wireframe = true;
        ground1.receiveShadows = true;

        this.shadowGenerator = new BABYLON.ShadowGenerator(1024, <BABYLON.DirectionalLight>this.scene.getLightByID('dirLight'));
        this.shadowGenerator.setDarkness(0.5);
        this.shadowGenerator.useBlurVarianceShadowMap = true;
        this.shadowGenerator.bias = 0.0001;
        this.shadowGenerator.blurScale = 2;
    }

    public createAsset(name:string, mode:number = Game.SELF) : Array<BABYLON.AbstractMesh>
    {
        let res : Array<BABYLON.AbstractMesh> = [];

        for (let mesh of this.assets[name])
        {
            switch (mode)
            {
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
    }

    private _runGame()
    {
        this.scene.onPointerDown = (evt, pr) => {
            if (pr.hit)
            {
                let destination = pr.pickedPoint.clone();
                destination.y = 0;
                this._controller.addDestination(destination);
                this._controller.start();
            }
        };
    }
}

window.addEventListener("DOMContentLoaded", () => {
    new Game('renderCanvas');
});
