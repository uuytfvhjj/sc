// 分子对称性与群论基础动画
document.addEventListener('DOMContentLoaded', function() {
    // 全局变量
    let scene, camera, renderer, controls;
    let moleculeGroup, originalMolecule, operationMolecule, symmetryElements;
    let currentMolecule = 'h2o';
    let currentOperation = 'identity';
    let rotationAxis = 2; // C₂旋转
    let isAnimating = true;
    let animationId;
    let showOriginal = true;
    let showOperation = true;
    let showSymmetryElements = false;
    
    // 分子数据结构
    const molecules = {
        h2o: {
            name: '水分子 (H₂O)',
            pointGroup: 'C₂ᵥ',
            symmetryOps: 'E, C₂, σᵥ, σᵥ\'',
            atoms: [
                { element: 'O', x: 0, y: 0, z: 0, color: 0xFF3333 },
                { element: 'H', x: 0.757, y: 0.586, z: 0, color: 0xFFFFFF },
                { element: 'H', x: -0.757, y: 0.586, z: 0, color: 0xFFFFFF }
            ],
            bonds: [
                { atom1: 0, atom2: 1 },
                { atom1: 0, atom2: 2 }
            ],
            symmetryElements: {
                rotationAxes: [{ axis: [0, 1, 0], order: 2, position: [0, 0, 0] }],
                reflectionPlanes: [
                    { normal: [1, 0, 0], position: [0, 0, 0] }, // xz平面
                    { normal: [0, 0, 1], position: [0, 0, 0] }  // xy平面
                ],
                inversionCenter: null
            }
        },
        nh3: {
            name: '氨分子 (NH₃)',
            pointGroup: 'C₃ᵥ',
            symmetryOps: 'E, C₃, C₃², σᵥ, σᵥ\', σᵥ\'\'',
            atoms: [
                { element: 'N', x: 0, y: 0, z: 0, color: 0x3050F8 },
                { element: 'H', x: 0, y: 0, z: 1.0, color: 0xFFFFFF },
                { element: 'H', x: 0.94, y: 0, z: -0.33, color: 0xFFFFFF },
                { element: 'H', x: -0.47, y: 0.82, z: -0.33, color: 0xFFFFFF }
            ],
            bonds: [
                { atom1: 0, atom2: 1 },
                { atom1: 0, atom2: 2 },
                { atom1: 0, atom2: 3 }
            ],
            symmetryElements: {
                rotationAxes: [{ axis: [0, 1, 0], order: 3, position: [0, 0, 0] }],
                reflectionPlanes: [
                    { normal: [1, 0, 0], position: [0, 0, 0] },
                    { normal: [-0.5, 0.866, 0], position: [0, 0, 0] },
                    { normal: [-0.5, -0.866, 0], position: [0, 0, 0] }
                ],
                inversionCenter: null
            }
        },
        ch4: {
            name: '甲烷 (CH₄)',
            pointGroup: 'T₄',
            symmetryOps: 'E, 8C₃, 3C₂, 6S₄, 6σ',
            atoms: [
                { element: 'C', x: 0, y: 0, z: 0, color: 0x333333 },
                { element: 'H', x: 0.63, y: 0.63, z: 0.63, color: 0xFFFFFF },
                { element: 'H', x: -0.63, y: -0.63, z: 0.63, color: 0xFFFFFF },
                { element: 'H', x: 0.63, y: -0.63, z: -0.63, color: 0xFFFFFF },
                { element: 'H', x: -0.63, y: 0.63, z: -0.63, color: 0xFFFFFF }
            ],
            bonds: [
                { atom1: 0, atom2: 1 },
                { atom1: 0, atom2: 2 },
                { atom1: 0, atom2: 3 },
                { atom1: 0, atom2: 4 }
            ],
            symmetryElements: {
                rotationAxes: [
                    { axis: [1, 1, 1], order: 3, position: [0, 0, 0] },
                    { axis: [1, -1, 1], order: 3, position: [0, 0, 0] },
                    { axis: [-1, 1, 1], order: 3, position: [0, 0, 0] },
                    { axis: [1, 1, -1], order: 3, position: [0, 0, 0] },
                    { axis: [1, 0, 0], order: 2, position: [0, 0, 0] },
                    { axis: [0, 1, 0], order: 2, position: [0, 0, 0] },
                    { axis: [0, 0, 1], order: 2, position: [0, 0, 0] }
                ],
                reflectionPlanes: [
                    { normal: [1, 1, 0], position: [0, 0, 0] },
                    { normal: [1, -1, 0], position: [0, 0, 0] },
                    { normal: [1, 0, 1], position: [0, 0, 0] },
                    { normal: [1, 0, -1], position: [0, 0, 0] },
                    { normal: [0, 1, 1], position: [0, 0, 0] },
                    { normal: [0, 1, -1], position: [0, 0, 0] }
                ],
                inversionCenter: { position: [0, 0, 0] }
            }
        },
        bf3: {
            name: '三氟化硼 (BF₃)',
            pointGroup: 'D₃ₕ',
            symmetryOps: 'E, 2C₃, 3C₂, σₕ, 2S₃, 3σᵥ',
            atoms: [
                { element: 'B', x: 0, y: 0, z: 0, color: 0xFF9933 },
                { element: 'F', x: 1.3, y: 0, z: 0, color: 0x90E050 },
                { element: 'F', x: -0.65, y: 1.126, z: 0, color: 0x90E050 },
                { element: 'F', x: -0.65, y: -1.126, z: 0, color: 0x90E050 }
            ],
            bonds: [
                { atom1: 0, atom2: 1 },
                { atom1: 0, atom2: 2 },
                { atom1: 0, atom2: 3 }
            ],
            symmetryElements: {
                rotationAxes: [
                    { axis: [0, 0, 1], order: 3, position: [0, 0, 0] },
                    { axis: [1, 0, 0], order: 2, position: [0, 0, 0] },
                    { axis: [-0.5, 0.866, 0], order: 2, position: [0, 0, 0] },
                    { axis: [-0.5, -0.866, 0], order: 2, position: [0, 0, 0] }
                ],
                reflectionPlanes: [
                    { normal: [0, 0, 1], position: [0, 0, 0] }, // 水平面
                    { normal: [1, 0, 0], position: [0, 0, 0] },
                    { normal: [-0.5, 0.866, 0], position: [0, 0, 0] },
                    { normal: [-0.5, -0.866, 0], position: [0, 0, 0] }
                ],
                inversionCenter: null
            }
        }
    };
    
    // 初始化Three.js场景
    function init() {
        // 创建场景
        scene = new THREE.Scene();
        scene.background = new THREE.Color(0x051923);
        
        // 创建相机
        camera = new THREE.PerspectiveCamera(45, 
            document.getElementById('molecule-container').offsetWidth / 
            document.getElementById('molecule-container').offsetHeight, 
            0.1, 1000);
        camera.position.set(5, 5, 5);
        
        // 创建渲染器
        const container = document.getElementById('molecule-container');
        renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(container.offsetWidth, container.offsetHeight);
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        container.appendChild(renderer.domElement);
        
        // 添加轨道控制器
        controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.minDistance = 2;
        controls.maxDistance = 20;
        
        // 添加光源
        const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
        scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 10, 5);
        directionalLight.castShadow = true;
        scene.add(directionalLight);
        
        // 添加坐标轴
        const axesHelper = new THREE.AxesHelper(3);
        scene.add(axesHelper);
        
        // 初始化分子组
        moleculeGroup = new THREE.Group();
        scene.add(moleculeGroup);
        
        symmetryElements = new THREE.Group();
        scene.add(symmetryElements);
        
        // 加载初始分子
        loadMolecule(currentMolecule);
        
        // 开始动画循环
        animate();
        
        // 窗口大小调整事件
        window.addEventListener('resize', onWindowResize);
    }
    
    // 加载分子
    function loadMolecule(moleculeKey) {
        // 清除现有分子
        while(moleculeGroup.children.length > 0) {
            moleculeGroup.remove(moleculeGroup.children[0]);
        }
        
        while(symmetryElements.children.length > 0) {
            symmetryElements.remove(symmetryElements.children[0]);
        }
        
        const molecule = molecules[moleculeKey];
        
        // 创建原子和键
        const atomMeshes = [];
        const bondMeshes = [];
        
        // 创建原子
        molecule.atoms.forEach((atom, index) => {
            const geometry = new THREE.SphereGeometry(0.3, 32, 32);
            const material = new THREE.MeshPhongMaterial({ color: atom.color });
            const sphere = new THREE.Mesh(geometry, material);
            sphere.position.set(atom.x, atom.y, atom.z);
            sphere.castShadow = true;
            moleculeGroup.add(sphere);
            atomMeshes.push(sphere);
            
            // 添加原子标签
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.width = 64;
            canvas.height = 64;
            
            context.fillStyle = '#000000';
            context.fillRect(0, 0, 64, 64);
            
            context.font = 'bold 40px Arial';
            context.fillStyle = getElementColor(atom.element);
            context.textAlign = 'center';
            context.textBaseline = 'middle';
            context.fillText(atom.element, 32, 32);
            
            const texture = new THREE.CanvasTexture(canvas);
            const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
            const sprite = new THREE.Sprite(spriteMaterial);
            sprite.position.set(atom.x, atom.y + 0.5, atom.z);
            sprite.scale.set(1, 1, 1);
            moleculeGroup.add(sprite);
        });
        
        // 创建键
        molecule.bonds.forEach(bond => {
            const atom1 = molecule.atoms[bond.atom1];
            const atom2 = molecule.atoms[bond.atom2];
            
            const start = new THREE.Vector3(atom1.x, atom1.y, atom1.z);
            const end = new THREE.Vector3(atom2.x, atom2.y, atom2.z);
            
            const direction = new THREE.Vector3().subVectors(end, start);
            const length = direction.length();
            
            const geometry = new THREE.CylinderGeometry(0.1, 0.1, length, 8);
            geometry.rotateZ(Math.PI / 2);
            
            const material = new THREE.MeshPhongMaterial({ color: 0xCCCCCC });
            const cylinder = new THREE.Mesh(geometry, material);
            
            cylinder.position.copy(start).add(direction.multiplyScalar(0.5));
            cylinder.lookAt(end);
            
            cylinder.castShadow = true;
            moleculeGroup.add(cylinder);
            bondMeshes.push(cylinder);
        });
        
        // 更新点群信息
        updatePointGroupInfo(moleculeKey);
        
        // 保存原始分子引用
        originalMolecule = moleculeGroup.clone();
        
        // 应用当前对称操作
        applySymmetryOperation();
    }
    
    // 获取元素颜色
    function getElementColor(element) {
        switch(element) {
            case 'H': return '#FFFFFF';
            case 'C': return '#333333';
            case 'O': return '#FF3333';
            case 'N': return '#3050F8';
            case 'B': return '#FF9933';
            case 'F': return '#90E050';
            default: return '#AAAAAA';
        }
    }
    
    // 应用对称操作
    function applySymmetryOperation() {
        // 清除操作分子
        if (operationMolecule) {
            moleculeGroup.remove(operationMolecule);
        }
        
        // 显示/隐藏原始分子
        originalMolecule.visible = showOriginal;
        
        // 如果不显示操作，则返回
        if (!showOperation || currentOperation === 'identity') {
            return;
        }
        
        // 创建操作分子的副本
        operationMolecule = originalMolecule.clone();
        
        // 根据当前操作变换分子
        const molecule = molecules[currentMolecule];
        
        switch(currentOperation) {
            case 'rotation':
                applyRotation(operationMolecule);
                break;
            case 'reflection':
                applyReflection(operationMolecule);
                break;
            case 'inversion':
                applyInversion(operationMolecule);
                break;
            case 'improper-rotation':
                applyImproperRotation(operationMolecule);
                break;
        }
        
        // 设置操作分子的颜色为半透明
        operationMolecule.traverse(child => {
            if (child.isMesh) {
                child.material = child.material.clone();
                child.material.transparent = true;
                child.material.opacity = 0.7;
            }
        });
        
        moleculeGroup.add(operationMolecule);
        
        // 显示对称元素
        if (showSymmetryElements) {
            showSymmetryElementsFunc();
        }
    }
    
    // 应用旋转操作
    function applyRotation(moleculeGroup) {
        const angle = (2 * Math.PI) / rotationAxis;
        moleculeGroup.rotateY(angle);
    }
    
    // 应用反射操作
    function applyReflection(moleculeGroup) {
        // 反射相对于XY平面
        moleculeGroup.traverse(child => {
            if (child.isMesh && child.geometry) {
                // 对于反射，我们只需在Z轴上取反
                child.position.z = -child.position.z;
                
                // 对于某些类型的分子，可能需要调整方向
                if (child.geometry.type === 'CylinderGeometry') {
                    child.lookAt(new THREE.Vector3(
                        child.position.x,
                        child.position.y,
                        -child.position.z
                    ));
                }
            }
        });
    }
    
    // 应用反演操作
    function applyInversion(moleculeGroup) {
        moleculeGroup.traverse(child => {
            if (child.isMesh) {
                child.position.x = -child.position.x;
                child.position.y = -child.position.y;
                child.position.z = -child.position.z;
            }
        });
    }
    
    // 应用旋转反射操作
    function applyImproperRotation(moleculeGroup) {
        // 先旋转
        const angle = (2 * Math.PI) / rotationAxis;
        moleculeGroup.rotateY(angle);
        
        // 然后反射（相对于XY平面）
        moleculeGroup.traverse(child => {
            if (child.isMesh) {
                child.position.z = -child.position.z;
            }
        });
    }
    
    // 显示对称元素
    function showSymmetryElementsFunc() {
        // 清除现有对称元素
        while(symmetryElements.children.length > 0) {
            symmetryElements.remove(symmetryElements.children[0]);
        }
        
        const molecule = molecules[currentMolecule];
        const elements = molecule.symmetryElements;
        
        // 显示旋转轴
        if (elements.rotationAxes) {
            elements.rotationAxes.forEach(axis => {
                const color = axis.order === 2 ? 0xFF6B6B : 
                             axis.order === 3 ? 0x4ECDC4 : 
                             axis.order === 4 ? 0xFFD166 : 0x9D4EDD;
                
                const cylinderGeometry = new THREE.CylinderGeometry(0.05, 0.05, 4, 8);
                const cylinderMaterial = new THREE.MeshBasicMaterial({ color: color, transparent: true, opacity: 0.7 });
                const cylinder = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
                
                // 将圆柱体对齐到旋转轴方向
                const direction = new THREE.Vector3(axis.axis[0], axis.axis[1], axis.axis[2]).normalize();
                cylinder.position.set(axis.position[0], axis.position[1], axis.position[2]);
                cylinder.lookAt(new THREE.Vector3(
                    axis.position[0] + direction.x,
                    axis.position[1] + direction.y,
                    axis.position[2] + direction.z
                ));
                
                symmetryElements.add(cylinder);
                
                // 添加标签
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                canvas.width = 128;
                canvas.height = 64;
                
                context.fillStyle = 'rgba(0, 0, 0, 0.7)';
                context.fillRect(0, 0, 128, 64);
                
                context.font = 'bold 24px Arial';
                context.fillStyle = '#FFFFFF';
                context.textAlign = 'center';
                context.textBaseline = 'middle';
                context.fillText(`C${axis.order}`, 64, 32);
                
                const texture = new THREE.CanvasTexture(canvas);
                const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
                const sprite = new THREE.Sprite(spriteMaterial);
                sprite.position.set(
                    axis.position[0] + direction.x * 2.2,
                    axis.position[1] + direction.y * 2.2,
                    axis.position[2] + direction.z * 2.2
                );
                sprite.scale.set(2, 1, 1);
                symmetryElements.add(sprite);
            });
        }
        
        // 显示反射面
        if (elements.reflectionPlanes) {
            elements.reflectionPlanes.forEach((plane, index) => {
                const planeGeometry = new THREE.PlaneGeometry(4, 4);
                const planeMaterial = new THREE.MeshBasicMaterial({ 
                    color: 0x4ECDC4, 
                    side: THREE.DoubleSide, 
                    transparent: true, 
                    opacity: 0.2 
                });
                const planeMesh = new THREE.Mesh(planeGeometry, planeMaterial);
                
                planeMesh.position.set(plane.position[0], plane.position[1], plane.position[2]);
                
                // 将平面对齐到法线方向
                const normal = new THREE.Vector3(plane.normal[0], plane.normal[1], plane.normal[2]).normalize();
                planeMesh.lookAt(new THREE.Vector3(
                    plane.position[0] + normal.x,
                    plane.position[1] + normal.y,
                    plane.position[2] + normal.z
                ));
                
                symmetryElements.add(planeMesh);
                
                // 添加标签
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                canvas.width = 128;
                canvas.height = 64;
                
                context.fillStyle = 'rgba(0, 0, 0, 0.7)';
                context.fillRect(0, 0, 128, 64);
                
                context.font = 'bold 24px Arial';
                context.fillStyle = '#FFFFFF';
                context.textAlign = 'center';
                context.textBaseline = 'middle';
                context.fillText(`σ${index === 0 ? 'ₕ' : 'ᵥ'}`, 64, 32);
                
                const texture = new THREE.CanvasTexture(canvas);
                const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
                const sprite = new THREE.Sprite(spriteMaterial);
                sprite.position.set(
                    plane.position[0] + normal.x * 2.2,
                    plane.position[1] + normal.y * 2.2,
                    plane.position[2] + normal.z * 2.2
                );
                sprite.scale.set(2, 1, 1);
                symmetryElements.add(sprite);
            });
        }
        
        // 显示反演中心
        if (elements.inversionCenter) {
            const sphereGeometry = new THREE.SphereGeometry(0.2, 16, 16);
            const sphereMaterial = new THREE.MeshBasicMaterial({ color: 0xFFD166 });
            const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
            sphere.position.set(
                elements.inversionCenter.position[0],
                elements.inversionCenter.position[1],
                elements.inversionCenter.position[2]
            );
            symmetryElements.add(sphere);
            
            // 添加标签
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.width = 128;
            canvas.height = 64;
            
            context.fillStyle = 'rgba(0, 0, 0, 0.7)';
            context.fillRect(0, 0, 128, 64);
            
            context.font = 'bold 24px Arial';
            context.fillStyle = '#FFFFFF';
            context.textAlign = 'center';
            context.textBaseline = 'middle';
            context.fillText('i', 64, 32);
            
            const texture = new THREE.CanvasTexture(canvas);
            const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
            const sprite = new THREE.Sprite(spriteMaterial);
            sprite.position.set(
                elements.inversionCenter.position[0],
                elements.inversionCenter.position[1] + 1,
                elements.inversionCenter.position[2]
            );
            sprite.scale.set(2, 1, 1);
            symmetryElements.add(sprite);
        }
    }
    
    // 更新点群信息
    function updatePointGroupInfo(moleculeKey) {
        const molecule = molecules[moleculeKey];
        document.getElementById('point-group-info').innerHTML = `
            <p>当前分子: <span class="symmetry-element">${molecule.name}</span></p>
            <p>点群: <span class="point-group">${molecule.pointGroup}</span></p>
            <p>对称操作: <span id="symmetry-operations">${molecule.symmetryOps}</span></p>
        `;
        
        // 更新理论内容
        updateTheoryContent(moleculeKey);
    }
    
    // 更新理论内容
    function updateTheoryContent(moleculeKey) {
        const molecule = molecules[moleculeKey];
        let theoryText = '';
        
        switch(moleculeKey) {
            case 'h2o':
                theoryText = `
                    <p><span class="symmetry-element">水分子 (H₂O)</span>属于<span class="point-group">C₂ᵥ点群</span>。它有一个C₂旋转轴（沿着O-H键角平分线）和两个垂直的反射面（σᵥ和σᵥ'）。</p>
                    <p>水分子没有反演中心，因此它是极性分子，具有永久偶极矩。其振动模式可以通过群论分析得到：3N-6=3个振动模式，均具有红外活性。</p>
                `;
                break;
            case 'nh3':
                theoryText = `
                    <p><span class="symmetry-element">氨分子 (NH₃)</span>属于<span class="point-group">C₃ᵥ点群</span>。它有一个C₃旋转轴（通过N原子垂直于H₃平面）和三个垂直反射面（每个包含N原子和一个H原子）。</p>
                    <p>氨分子具有锥形结构，没有反演中心，因此是极性分子。其对称性决定了它具有一对简并的振动模式。</p>
                `;
                break;
            case 'ch4':
                theoryText = `
                    <p><span class="symmetry-element">甲烷 (CH₄)</span>属于<span class="point-group">T₄点群</span>（四面体点群）。它具有4个C₃轴（每个通过一个C-H键）、3个C₂轴和6个反射面。</p>
                    <p>甲烷具有高度的对称性，没有永久偶极矩。其振动模式包括：两个具有T₂对称性的三重简并模式和具有A₁对称性的非简并模式。</p>
                `;
                break;
            case 'bf3':
                theoryText = `
                    <p><span class="symmetry-element">三氟化硼 (BF₃)</span>属于<span class="point-group">D₃ₕ点群</span>。它具有一个C₃主轴、三个C₂轴、一个水平反射面(σₕ)和三个垂直反射面(σᵥ)。</p>
                    <p>BF₃是平面三角形分子，具有反演中心吗？实际上，D₃ₕ点群包含反演操作吗？仔细分析发现D₃ₕ点群包含S₃轴，但不包含单独的反演中心。</p>
                `;
                break;
            default:
                theoryText = `<p>选择分子以查看其对称性和群论分析。</p>`;
        }
        
        document.getElementById('theory-content').innerHTML = `
            <p><span class="symmetry-element">分子对称性</span>是指分子经过某种操作后，其构型与原始构型不可区分的性质。这些操作称为对称操作，所有对称操作的集合构成一个<span class="point-group">点群</span>。</p>
            ${theoryText}
            <p>通过分析分子的对称性，我们可以确定其点群，进而预测分子的许多物理和化学性质，如极性、光学活性和振动模式等。</p>
        `;
    }
    
    // 动画循环
    function animate() {
        animationId = requestAnimationFrame(animate);
        
        if (isAnimating) {
            // 缓慢旋转分子组
            moleculeGroup.rotation.y += 0.005;
            
            // 如果显示对称元素，也旋转它们
            if (showSymmetryElements) {
                symmetryElements.rotation.y += 0.005;
            }
        }
        
        controls.update();
        renderer.render(scene, camera);
    }
    
    // 窗口大小调整处理
    function onWindowResize() {
        const container = document.getElementById('molecule-container');
        camera.aspect = container.offsetWidth / container.offsetHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.offsetWidth, container.offsetHeight);
    }
    
    // 初始化UI事件监听
    function initUI() {
        // 分子选择按钮
        document.querySelectorAll('.molecule-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                document.querySelectorAll('.molecule-btn').forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                currentMolecule = this.getAttribute('data-molecule');
                loadMolecule(currentMolecule);
            });
        });
        
        // 对称操作按钮
        document.querySelectorAll('.symmetry-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                document.querySelectorAll('.symmetry-btn').forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                currentOperation = this.getAttribute('data-operation');
                applySymmetryOperation();
            });
        });
        
        // 旋转滑块
        const rotationSlider = document.getElementById('rotation-slider');
        const rotationValue = document.getElementById('rotation-value');
        
        rotationSlider.addEventListener('input', function() {
            rotationAxis = parseInt(this.value);
            const angle = 360 / rotationAxis;
            rotationValue.textContent = `C${rotationAxis} (${angle}°)`;
            applySymmetryOperation();
        });
        
        // 复选框
        document.getElementById('show-original').addEventListener('change', function() {
            showOriginal = this.checked;
            applySymmetryOperation();
        });
        
        document.getElementById('show-operation').addEventListener('change', function() {
            showOperation = this.checked;
            applySymmetryOperation();
        });
        
        // 操作按钮
        document.getElementById('apply-operation').addEventListener('click', function() {
            applySymmetryOperation();
        });
        
        document.getElementById('reset-view').addEventListener('click', function() {
            controls.reset();
            camera.position.set(5, 5, 5);
            controls.update();
        });
        
        document.getElementById('toggle-animation').addEventListener('click', function() {
            isAnimating = !isAnimating;
            const icon = this.querySelector('i');
            if (isAnimating) {
                icon.className = 'fas fa-pause';
                this.innerHTML = '<i class="fas fa-pause"></i> 暂停动画';
            } else {
                icon.className = 'fas fa-play';
                this.innerHTML = '<i class="fas fa-play"></i> 播放动画';
            }
        });
        
        document.getElementById('show-elements').addEventListener('click', function() {
            showSymmetryElements = !showSymmetryElements;
            symmetryElements.visible = showSymmetryElements;
            
            if (showSymmetryElements) {
                showSymmetryElementsFunc();
                this.innerHTML = '<i class="fas fa-eye-slash"></i> 隐藏对称元素';
            } else {
                this.innerHTML = '<i class="fas fa-draw-polygon"></i> 显示对称元素';
            }
        });
    }
    
    // 初始化应用
    init();
    initUI();
});