(function () {
    //#region  Shared variables
    let scene, camera, renderer;
    let previousTime, deltaTime;
    let grid, axes;
    let orbitControls;
    let directionalLight;
    let lightposition = [5, 5, 5];
    let coordX , coordZ , nodes , myGrid;
    let mainBeams , secondaryBeams;
    //#endregion

    function init() {
        //#region 1- Creating Scene
        scene = new THREE.Scene();
        //#endregion

        //#region 2-Creating  perspective camera
        camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 50000); //2-Creating camera
        camera.position.z = 70;
        camera.position.y = 35;
        camera.position.x = 0;
        camera.lookAt(scene.position); //looks at origin(0,0,0)
        //#endregion


        //#region Creating renderer
        renderer = new THREE.WebGLRenderer({ antialias: true });
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
        // grid = new THREE.GridHelper(1000, 20, 0x0000ff, 0x00ffff);
        // scene.add(grid);
        axes = new THREE.AxesHelper(1);

        scene.add(axes);

        //Grid(scene, spaceX, spaceZ, numberInX, numberInZ)
        $('#exampleModal').modal('show');
        //#endregion

        
        //#region Orbit controls
        orbitControls = new THREE.OrbitControls(camera, renderer.domElement); //renderer.domElement is the canvas
        //#endregion

        //#region Drawing Beams
        // let solid = new Solid(scene, null, null, new THREE.Vector3(Math.PI / 2, 0, 0), null);
        // new ISection(scene, null, new THREE.Vector3(0, 0, 0), 60);
        // new ISection(scene, null, new THREE.Vector3(0, 0, 60), 60);
        // new ISection(scene, null, new THREE.Vector3(0, 0, 60 * 2), 60);
        // new ISection(scene, null, new THREE.Vector3(0, 0, 60 * 3), 60);
        // new ISection(scene, null, new THREE.Vector3(50, 0, 0), 60);
        // new ISection(scene, null, new THREE.Vector3(50, 0, 60), 60);
        // new ISection(scene, null, new THREE.Vector3(50, 0, 60 * 2), 60);
        // new ISection(scene, null, new THREE.Vector3(50, 0, 60 * 3), 60);
        // mainBeams.beams[0].rotate(new THREE.Vector3(0, -Math.PI / 2), 0);
        //#endregion


    }

    $('#createGrids').click(function () {
        $('#exampleModal').modal('hide');
        coordX = $('#spaceX').val().split(',').map(s => parseInt(s));
        coordZ = $('#spaceZ').val().split(',').map(s => parseInt(s));
        coordX.unshift(0);
        coordZ.unshift(0);
        if(myGrid){ //Check if it is editing or creating
            scene.remove(nodes)
            scene.remove(myGrid.linesInX)
            scene.remove(myGrid.linesInZ)
        }
        myGrid = new Grid(scene, coordX, coordZ, coordX.length, coordZ.length);
        nodes = createNodes(scene ,coordX , coordZ);
        mainBeams = createMainBeams(scene, myGrid ,new Section(0.4,0.2,0.01,0.02));
        secondaryBeams = createSecondaryBeams(scene, myGrid ,new Section(0.18,0.09,0.01,0.02));
        //secondaryBeams = new MainBeams(scene , myGrid);
        camera.lookAt(0.5*coordX.reduce(sum, 0) , 0 , 0.5*coordZ.reduce(sum, 0))
    })

    //Edit the grids and nodes after creation
    window.editGrids = function () {
        $('#spaceX').val(coordX.join())
        $('#spaceZ').val(coordZ.join())
        $('#exampleModal').modal('show');
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