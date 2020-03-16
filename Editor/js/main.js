(function () {
    //#region  Shared variables
    let scene, camera, renderer;
    let previousTime, deltaTime;
    let grid, axes;
    let orbitControls;
    //#endregion
    function init() {
        //#region 1- Creating Scene
        scene = new THREE.Scene();

        //#endregion
        //#region 2-Creating  perspective camera
        camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000); //2-Creating camera
        camera.position.z = 20;
        camera.position.y = 10;
        camera.position.x = 0;
        camera.lookAt(scene.position); //looks at origin(0,0,0)
        //#endregion
        //#region Creating renderer
        renderer = new THREE.WebGLRenderer({
            antialias: true
        });
        renderer.setClearColor(0xdddddd); //setting color of canvas
        renderer.setSize(window.innerWidth, window.innerHeight); //setting width and height of canvas
        document.body.appendChild(renderer.domElement); //append canvas tag to html

        //#endregion

        //#region Creating Grids
        grid = new THREE.GridHelper(20, 20, 0x000000, 0xffffff);
        scene.add(grid);
        axes = new THREE.AxesHelper(10);
        scene.add(axes);

        let myGrid = new Grid(scene, 20, 10, 4, 5);
        //#endregion
        //#region Orbit controls
        orbitControls = new THREE.OrbitControls(camera, renderer.domElement); //renderer.domElement is the canvas

        //#endregion
    }

    function update() {

    }

    function loop(time) {
        time = time / 1000;
        deltaTime = time - previousTime;
        previousTime = time;

        requestAnimationFrame(loop);
        update();
        renderer.render(scene, camera);

    }

    init();
    loop(0);
})();


function Grid(scene, spaceX, spaceZ, numberInX, numberInZ) {
    let shift = 5 / 2;
    this.lineLengthInX = spaceX * (numberInX - 1) + 5;
    this.lineLengthInZ = spaceZ * (numberInZ - 1) + 5;
    this.linesInX = [];
    this.linesInZ = [];
    let accumlateSpaceX = 0;
    let accumlateSpaceZ = 0;

    for (let i = 0; i < numberInX; i++) {
        this.linesInX[i] = new Line(scene, new THREE.Vector3(accumlateSpaceX, 0, -shift), new THREE.Vector3(0, 0, 1), this.lineLengthInZ);
        accumlateSpaceX += spaceX;
    }
    for (let i = 0; i < numberInZ; i++) {

        this.linesInZ[i] = new Line(scene, new THREE.Vector3(-shift, 0, accumlateSpaceZ), new THREE.Vector3(1, 0, 0), this.lineLengthInX);
        accumlateSpaceZ += spaceZ;
    }


}

function Line(scene, startPoint, direction, length) {
    this.startPoint = startPoint || new THREE.Vector3(0, 0, 0);
    this.direction = direction || new THREE.Vector3(1, 0, 0);
    this.length = length || 1000;
    this.endPoint = new THREE.Vector3(this.startPoint.x + this.length * this.direction.x, this.startPoint.y + this.length * this.direction.y, this.startPoint.z + this.length * this.direction.z);
    this.material = new THREE.LineDashedMaterial({
        color: 0xff33ff,
        gapSize: 10,
        dashSize: 3,
        scale: 1
    });
    this.geometry = new THREE.BufferGeometry().setFromPoints([this.startPoint, this.endPoint]);
    this.line = new THREE.Line(this.geometry, this.material);
    scene.add(this.line);
}