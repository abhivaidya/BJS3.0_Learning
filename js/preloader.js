var Preloader = (function () {
    function Preloader(game) {
        this._loader = null;
        this._3dAssetList = ['Brown_Cliff_01',
            'Brown_Cliff_Bottom_01',
            'Brown_Cliff_Bottom_Corner_01',
            'Brown_Cliff_Bottom_Corner_Green_Top_01',
            'Brown_Cliff_Bottom_Green_Top_01',
            'Brown_Cliff_Corner_01',
            'Brown_Cliff_Corner_Green_Top_01',
            'Brown_Cliff_End_01',
            'Brown_Cliff_End_Green_Top_01',
            'Brown_Cliff_Green_Top_01',
            'Brown_Cliff_Top_01',
            'Brown_Cliff_Top_Corner_01',
        ];
        this._game = game;
        this._scene = this._game.scene;
        this._loader = new BABYLON.AssetsManager(this._scene);
        this._loader.useDefaultLoadingScreen = false;
        this._loader.onFinish = this._onFinish.bind(this);
    }
    Preloader.prototype.loadAssets = function () {
        for (var asset in this._3dAssetList) {
            this._addMesh('', this._3dAssetList[asset], 'obj');
        }
        this._loader.load();
    };
    Preloader.prototype._onFinish = function () {
        this.callback();
    };
    Preloader.prototype._addMesh = function (folder, name, extension) {
        if (name) {
            var task = this._loader.addMeshTask(name, '', "assets/3d/" + folder + "/", name + "." + extension);
        }
        else {
            var task = this._loader.addMeshTask(folder, '', "assets/3d/" + folder + "/", folder + "." + extension);
        }
        task.onSuccess = this._addMeshAssetToGame.bind(this);
    };
    Preloader.prototype._addMeshAssetToGame = function (t) {
        this._game.assets[t.name] = [];
        //console.group();
        for (var _i = 0, _a = t.loadedMeshes; _i < _a.length; _i++) {
            var m = _a[_i];
            m.convertToFlatShadedMesh();
            m.setEnabled(false);
            this._game.assets[t.name].push(m);
            //console.log(`%c Loaded : ${m.name}`, 'background: #333; color: #bada55');
        }
        console.log("%c Finished : " + t.name, 'background: #333; color: #bada55');
        //console.groupEnd();
    };
    return Preloader;
}());
