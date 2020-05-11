//https://threejsfundamentals.org/threejs/lessons/threejs-picking.html

(function () {
    //#region  Shared variables
    let camera, renderer;
    let previousTime, deltaTime;
    let grid, axes;
    let orbitControls;
    let directionalLight;
    let lightposition = [5, 5, 5];
    let coordX, coordZ, nodes, myGrid;
    let mainBeams, secondaryBeams;
    let canvas;
    const pickPosition = { x: 0, y: 0 };
    const pickHelper = new GPUPickHelper();
    window.id = 0, window.idToObject = [];
    window.draw = false , drawingPoints = [];
    clearPickPosition();
    //#endregion

    window.pickingScene = new THREE.Scene();
    pickingScene.background = new THREE.Color(0);

    function init() {
        //#region 1- Creating Scene
        window.scene = new THREE.Scene();
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
        canvas = renderer.domElement;
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
    }

    $('#createGrids').click(function () {
        $('#exampleModal').modal('hide');
        coordX = $('#spaceX').val().split(',').map(s => parseInt(s));
        coordZ = $('#spaceZ').val().split(',').map(s => parseInt(s));
        coordX.unshift(0);
        coordZ.unshift(0);
        let editGrids = false;
        if (myGrid) { //Check if it is editing or creating
            scene.remove(nodes);
            scene.remove(myGrid.linesInX);
            scene.remove(myGrid.linesInZ);
            editGrids = true;
        }
        myGrid = new Grid(scene, coordX, coordZ, coordX.length, coordZ.length);
        nodes = createNodes(scene, pickingScene, coordX, coordZ);
        if (!editGrids) {
            mainBeams = createMainBeams(scene, pickingScene, myGrid, new Section(0.4, 0.2, 0.01, 0.02));
            secondaryBeams = createSecondaryBeams(scene, pickingScene, myGrid, new Section(0.18, 0.09, 0.01, 0.02));
        }
    })

    //Edit the grids and nodes after creation
    window.editGrids = function () {
        $('#spaceX').val(coordX.join());
        $('#spaceZ').val(coordZ.join());
        $('#exampleModal').modal('show');
    }

    function update() {

    }


    function getCanvasRelativePosition(event) {
        const rect = canvas.getBoundingClientRect();
        return {
            x: (event.clientX - rect.left) * canvas.width / rect.width,
            y: (event.clientY - rect.top) * canvas.height / rect.height,
        };
    }

    function setPickPosition(event) {
        const pos = getCanvasRelativePosition(event);
        pickPosition.x = pos.x;
        pickPosition.y = pos.y;
    }

    function clearPickPosition() {
        // unlike the mouse which always has a position
        // if the user stops touching the screen we want
        // to stop picking. For now we just pick a value
        // unlikely to pick something
        pickPosition.x = -100000;
        pickPosition.y = -100000;
    }

    function loop(time) {
        time = time / 1000;
        deltaTime = time - previousTime;
        previousTime = time;
        // pickHelper.pick(pickPosition , scene, camera, time);
        requestAnimationFrame(loop);
        update();
        pickHelper.pick(pickPosition, renderer, pickingScene, camera);
        renderer.render(scene, camera);
    }

    init();
    loop(0);

    canvas.addEventListener('mousemove', function () {
        setPickPosition(event);
        pickHelper.pick(pickPosition, renderer, pickingScene, camera);
    });

    canvas.addEventListener('mouseout', clearPickPosition);
    canvas.addEventListener('mouseleave', clearPickPosition);
    canvas.addEventListener('click', function (event) {
        setPickPosition(event);
        pickHelper.select(pickPosition, renderer, pickingScene, camera);
        if(draw)
        {
            if(pickHelper.selectedObject && pickHelper.selectedObject.geometry instanceof THREE.SphereGeometry){
                drawingPoints.push(pickHelper.selectedObject.position)
                pickHelper.selectedObject = null;
                if(drawingPoints.length === 2){
                    drawBeamByTwoPoints(drawingPoints[0],drawingPoints[1]);
                    drawingPoints = [];
                }
            }
        }
    });

    window.addEventListener('keyup', function (event) {
        //if (pickHelper.selectedObject) {
            switch (event.key) {
                case 'Delete':
                    scene.remove(pickHelper.selectedObject);
                    pickingScene.remove(pickHelper.selectedObject.userData.picking)
                    nodes.nodeGroup.remove(pickHelper.selectedObject);
                    break;

                case 'm':
                    pickHelper.selectedObject.translateX(parseFloat($('#x').val()) || 0);
                    pickHelper.selectedObject.translateY(parseFloat($('#y').val()) || 0);
                    pickHelper.selectedObject.translateZ(parseFloat($('#z').val()) || 0);
                    pickHelper.selectedObject.userData.picking.position.copy(pickHelper.selectedObject.position)
                    break;
                case 'c':
                    if (pickHelper.selectedObject.geometry instanceof THREE.ExtrudeGeometry) {
                        let beam = new Beam(pickHelper.selectedObject.userData.beam.section.section, 
                            pickHelper.selectedObject.userData.beam.span, pickHelper.selectedObject.position.clone(), 
                            pickHelper.selectedObject.rotation.clone(), pickHelper.selectedObject.material.clone(), ++id);
                        beam.section.mesh.translateX(parseFloat($('#x').val()) || 0);
                        beam.section.mesh.translateY(parseFloat($('#y').val()) || 0);
                        beam.section.mesh.translateZ(parseFloat($('#z').val()) || 0);
                        scene.add(beam.section.mesh)
                        idToObject[id] = beam.section.mesh;
                        let pickingBeam = new PickingBeam(beam, id);
                        pickingScene.add(pickingBeam.mesh);
                        
                    }
                    else{
                        let node = new Node(pickHelper.selectedObject.position , ++id);
                        node.mesh.translateX(parseFloat($('#x').val()) || 0);
                        node.mesh.translateY(parseFloat($('#y').val()) || 0);
                        node.mesh.translateZ(parseFloat($('#z').val()) || 0);
                        nodes.nodeGroup.add(node.mesh);
                        nodes.push(node);
                        idToObject[id] = node.mesh;
                        let pickingNode = new PickingNode(node , id);
                        pickingScene.add(pickingNode.mesh);
                    }
                    
                    break;

                case 'd':
                        draw = draw ? false : true;
                    break;
            }
        //}
    });
})();