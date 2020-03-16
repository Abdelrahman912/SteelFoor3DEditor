(function () {
    //#region  Shared variables
    let scene, camera, renderer;
    let previousTime, deltaTime;
    let grid, axes;
    let orbitControls;
    let directionalLight;
    let lightposition = [5, 5, 5];
    //#endregion
    function init() {
        //#region 1- Creating Scene
        scene = new THREE.Scene();

        //#endregion
        //#region 2-Creating  perspective camera
        camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 50000); //2-Creating camera
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
        //#region Light
        directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(lightposition[0], lightposition[1], lightposition[2]);
        scene.add(directionalLight);
        //#endregion


        //#region Creating Grids
        grid = new THREE.GridHelper(50, 20, 0x000000, 0xffffff);
        scene.add(grid);
        axes = new THREE.AxesHelper(500);
        scene.add(axes);

        let myGrid = new Grid(scene, 50, 60, 4, 5);
        //#endregion
        //#region Orbit controls
        orbitControls = new THREE.OrbitControls(camera, renderer.domElement); //renderer.domElement is the canvas

        //#endregion

        //#region Drawing Beams
        //let solid = new Solid(scene, null, null, new THREE.Vector3(0, -Math.PI / 2, 0), null);
        let beam = new ISection(scene, null, null, 60);
        let beam2 = new ISection(scene, null, new THREE.Vector3(50, 0, 0), 60);
        let beam3 = new ISection(scene, null, new THREE.Vector3(50, 0, 60), 60)

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