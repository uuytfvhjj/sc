// 第1章：原子结构动画
document.addEventListener('DOMContentLoaded', function() {
    // 获取canvas元素
    const canvas = document.getElementById('moleculeCanvas');
    
    // 创建Three.js场景
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a2e);
    
    // 创建相机
    const camera = new THREE.PerspectiveCamera(
        75,
        canvas.clientWidth / canvas.clientHeight,
        0.1,
        1000
    );
    camera.position.z = 10;
    
    // 创建渲染器
    const renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: true
    });
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    
    // 添加光源
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);
    
    // 创建原子模型组
    const atomGroup = new THREE.Group();
    
    // 创建原子核
    function createNucleus() {
        const geometry = new THREE.SphereGeometry(1, 32, 32);
        const material = new THREE.MeshPhongMaterial({ 
            color: 0xe74c3c,
            shininess: 100
        });
        return new THREE.Mesh(geometry, material);
    }
    
    // 创建电子
    function createElectron() {
        const geometry = new THREE.SphereGeometry(0.2, 16, 16);
        const material = new THREE.MeshPhongMaterial({ 
            color: 0x3498db,
            shininess: 100
        });
        return new THREE.Mesh(geometry, material);
    }
    
    // 创建s轨道（球形）
    function createSOrbital() {
        const geometry = new THREE.SphereGeometry(3, 32, 32);
        const material = new THREE.MeshPhongMaterial({
            color: 0x2ecc71,
            transparent: true,
            opacity: 0.3,
            wireframe: true
        });
        return new THREE.Mesh(geometry, material);
    }
    
    // 创建p轨道（哑铃形）
    function createPOrbital() {
        const group = new THREE.Group();
        
        // 创建两个球形部分
        const sphereGeometry = new THREE.SphereGeometry(1.5, 16, 16);
        const sphereMaterial = new THREE.MeshPhongMaterial({
            color: 0x9b59b6,
            transparent: true,
            opacity: 0.3,
            wireframe: true
        });
        
        const sphere1 = new THREE.Mesh(sphereGeometry, sphereMaterial);
        sphere1.position.x = 2.5;
        
        const sphere2 = new THREE.Mesh(sphereGeometry, sphereMaterial);
        sphere2.position.x = -2.5;
        
        group.add(sphere1, sphere2);
        return group;
    }
    
    // 创建氢原子模型
    function createHydrogenAtom() {
        const group = new THREE.Group();
        
        // 原子核
        const nucleus = createNucleus();
        group.add(nucleus);
        
        // 电子（在1s轨道）
        const electron = createElectron();
        electron.position.set(3, 0, 0);
        group.add(electron);
        
        // 1s轨道
        const sOrbital = createSOrbital();
        group.add(sOrbital);
        
        // 保存电子引用以便动画
        group.userData = { electron: electron };
        
        return group;
    }
    
    // 创建氦原子模型
    function createHeliumAtom() {
        const group = new THREE.Group();
        
        // 原子核
        const nucleus = createNucleus();
        nucleus.scale.set(1.2, 1.2, 1.2);
        group.add(nucleus);
        
        // 两个电子（在1s轨道，自旋相反）
        const electron1 = createElectron();
        electron1.position.set(3, 2, 0);
        
        const electron2 = createElectron();
        electron2.position.set(3, -2, 0);
        
        group.add(electron1, electron2);
        
        // 1s轨道
        const sOrbital = createSOrbital();
        group.add(sOrbital);
        
        group.userData = { 
            electron1: electron1,
            electron2: electron2
        };
        
        return group;
    }
    
    // 创建当前模型
    let currentModel = 'hydrogen';
    let atomModel = createHydrogenAtom();
    scene.add(atomModel);
    
    // 动画控制变量
    let autoRotation = true;
    let rotationSpeed = 0.01;
    let electronAngle = 0;
    
    // 控制面板功能
    const rotationSpeedInput = document.getElementById('rotationSpeed');
    const speedValue = document.getElementById('speedValue');
    const toggleRotationBtn = document.getElementById('toggleRotation');
    const resetViewBtn = document.getElementById('resetView');
    const changeModelBtn = document.getElementById('changeModel');
    
    // 旋转速度控制
    if (rotationSpeedInput) {
        rotationSpeedInput.addEventListener('input', (e) => {
            rotationSpeed = e.target.value / 5000;
            const speedText = e.target.value < 50 ? '慢速' : 
                            e.target.value < 150 ? '正常速度' : '快速';
            speedValue.textContent = speedText;
        });
    }
    
    // 切换旋转状态
    if (toggleRotationBtn) {
        toggleRotationBtn.addEventListener('click', () => {
            autoRotation = !autoRotation;
            toggleRotationBtn.innerHTML = autoRotation ? 
                '<i class="fas fa-pause"></i> 暂停旋转' : 
                '<i class="fas fa-play"></i> 开始旋转';
        });
    }
    
    // 重置视图
    if (resetViewBtn) {
        resetViewBtn.addEventListener('click', () => {
            atomModel.rotation.set(0, 0, 0);
            camera.position.set(0, 0, 10);
            camera.lookAt(0, 0, 0);
        });
    }
    
    // 切换原子模型
    if (changeModelBtn) {
        changeModelBtn.addEventListener('click', () => {
            scene.remove(atomModel);
            
            if (currentModel === 'hydrogen') {
                atomModel = createHeliumAtom();
                currentModel = 'helium';
                changeModelBtn.innerHTML = '<i class="fas fa-exchange-alt"></i> 切换到氢原子';
            } else {
                atomModel = createHydrogenAtom();
                currentModel = 'hydrogen';
                changeModelBtn.innerHTML = '<i class="fas fa-exchange-alt"></i> 切换到氦原子';
            }
            
            scene.add(atomModel);
        });
    }
    
    // 鼠标控制
    let isMouseDown = false;
    let previousMousePosition = { x: 0, y: 0 };
    
    canvas.addEventListener('mousedown', (e) => {
        isMouseDown = true;
        previousMousePosition = { x: e.clientX, y: e.clientY };
    });
    
    canvas.addEventListener('mouseup', () => {
        isMouseDown = false;
    });
    
    canvas.addEventListener('mousemove', (e) => {
        if (!isMouseDown) return;
        
        const deltaX = e.clientX - previousMousePosition.x;
        const deltaY = e.clientY - previousMousePosition.y;
        
        atomModel.rotation.y += deltaX * 0.01;
        atomModel.rotation.x += deltaY * 0.01;
        
        previousMousePosition = { x: e.clientX, y: e.clientY };
    });
    
    // 鼠标滚轮缩放
    canvas.addEventListener('wheel', (e) => {
        e.preventDefault();
        camera.position.z += e.deltaY * 0.01;
        camera.position.z = Math.max(3, Math.min(20, camera.position.z));
    });
    
    // 动画循环
    function animate() {
        requestAnimationFrame(animate);
        
        // 自动旋转
        if (autoRotation) {
            atomModel.rotation.y += rotationSpeed;
        }
        
        // 电子运动动画
        electronAngle += 0.05;
        
        if (atomModel.userData.electron) {
            const electron = atomModel.userData.electron;
            const radius = 3;
            electron.position.x = Math.cos(electronAngle) * radius;
            electron.position.z = Math.sin(electronAngle) * radius;
        }
        
        if (atomModel.userData.electron1 && atomModel.userData.electron2) {
            const radius = 3;
            const height = 2;
            
            atomModel.userData.electron1.position.x = Math.cos(electronAngle) * radius;
            atomModel.userData.electron1.position.z = Math.sin(electronAngle) * radius;
            atomModel.userData.electron1.position.y = height;
            
            atomModel.userData.electron2.position.x = Math.cos(electronAngle + Math.PI) * radius;
            atomModel.userData.electron2.position.z = Math.sin(electronAngle + Math.PI) * radius;
            atomModel.userData.electron2.position.y = -height;
        }
        
        renderer.render(scene, camera);
    }
    
    // 开始动画
    animate();
    
    // 窗口大小调整
    window.addEventListener('resize', () => {
        camera.aspect = canvas.clientWidth / canvas.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    });
});