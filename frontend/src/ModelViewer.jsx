import React, {useEffect, useRef} from 'react'
import { useNavigate } from 'react-router-dom'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

export default function ModelViewer({ data, showFullscreenBtn = true }) {
  const mountRef = useRef(null)
  const navigate = useNavigate()   // for fullscreen button

  useEffect(()=>{
    const mount = mountRef.current
    if(!mount) return

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x061322)

    const renderer = new THREE.WebGLRenderer({antialias:true, alpha:true})
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setSize(mount.clientWidth, mount.clientHeight)
    renderer.shadowMap.enabled = true
    mount.appendChild(renderer.domElement)

    const camera = new THREE.PerspectiveCamera(45, mount.clientWidth / mount.clientHeight, 0.1, 1000)
    camera.position.set(0, 60, 160)

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.06
    controls.minDistance = 40
    controls.maxDistance = 400

    // lights
    const hemi = new THREE.HemisphereLight(0xffffff, 0x444444, 0.6)
    hemi.position.set(0, 200, 0)
    scene.add(hemi)

    const dir = new THREE.DirectionalLight(0xffffff, 0.8)
    dir.position.set(100, 200, 100)
    dir.castShadow = true
    scene.add(dir)

    // ground
    const groundGeo = new THREE.PlaneGeometry(500, 500)
    const groundMat = new THREE.MeshStandardMaterial({color:0x071522, roughness:0.9, metalness:0})
    const ground = new THREE.Mesh(groundGeo, groundMat)
    ground.rotation.x = -Math.PI/2
    ground.position.y = -1
    ground.receiveShadow = true
    scene.add(ground)

    // ====== floor plan geometry from backend ======
    if (data) {
      const scale = 0.15
      const wallHeight = 30

      data.points.forEach((box, i) => {
        const type = data.classes[i]?.name
        if (!type) return

        const width = Math.max(1, (box.x2 - box.x1) * scale)
        const depth = Math.max(1, (box.y2 - box.y1) * scale)
        const x = ((box.x1 + box.x2) * 0.5 - data.Width * 0.5) * scale
        const z = ((box.y1 + box.y2) * 0.5 - data.Height * 0.5) * scale

        let material
        if (type === "wall") material = new THREE.MeshStandardMaterial({color:0xbfc0c0, roughness:0.6})
        else if (type === "door") material = new THREE.MeshStandardMaterial({color:0x8b5a2b, roughness:0.5})
        else if (type === "window") material = new THREE.MeshStandardMaterial({color:0x4fc3f7, transparent:true, opacity:0.55})
        else return

        const mesh = new THREE.Mesh(new THREE.BoxGeometry(width, wallHeight, depth), material)
        mesh.position.set(x, wallHeight/2, z)
        mesh.castShadow = true
        mesh.receiveShadow = true
        scene.add(mesh)
      })
    }

    // animation
    let frameId
    function animate(){
      frameId = requestAnimationFrame(animate)
      controls.update()
      renderer.render(scene, camera)
    }

    function handleResize(){
      const w = mount.clientWidth
      const h = mount.clientHeight
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    }

    window.addEventListener('resize', handleResize)
    animate()

    return ()=>{
      cancelAnimationFrame(frameId)
      window.removeEventListener('resize', handleResize)
      controls.dispose()
      renderer.dispose()
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement)
    }
  },[data])

  return (
  <div style={{ 
    width: '100%', 
    height: showFullscreenBtn ? '420px' : '100%', 
    position: 'relative',
    margin: 0,
    padding: 0
  }}>
    {data?.averageDoor === 0 && (
      <div className="warning-box" style={{ position: 'absolute', top: 0, left: 0, zIndex: 10 }}>
        No doors detected - model generated without door openings
      </div>
    )}
    <div
      className="model-viewer"
      ref={mountRef}
      style={{ 
        width: '100%', 
        height: '100%',
        margin: 0,
        padding: 0
      }}
    />
    {showFullscreenBtn && (
      <button
        onClick={() => navigate('/model-fullscreen')}
        style={{
          position: 'absolute',
          top: 20,
          right: 20,
          zIndex: 10,
          background: 'rgba(0,0,0,0.6)',
          color: 'white',
          border: '1px solid rgba(255,255,255,0.2)',
          borderRadius: 8,
          padding: '8px 16px',
          fontSize: 14,
          cursor: 'pointer',
          backdropFilter: 'blur(4px)',
          transition: 'all 0.2s ease'
        }}
        onMouseEnter={(e) => e.target.style.background = 'rgba(0,0,0,0.8)'}
        onMouseLeave={(e) => e.target.style.background = 'rgba(0,0,0,0.6)'}
      >
        ⛶ Fullscreen
      </button>
    )}
  </div>
)
}



// import React, {useEffect, useRef} from 'react'
// import * as THREE from 'three'
// import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

// export default function ModelViewer({ data }){
//   const mountRef = useRef(null)

//   useEffect(()=>{
//     const mount = mountRef.current
//     if(!mount) return

//     const scene = new THREE.Scene()
//     scene.background = new THREE.Color(0x061322)

//     const renderer = new THREE.WebGLRenderer({antialias:true, alpha:true})
//     renderer.setPixelRatio(window.devicePixelRatio)
//     renderer.setSize(mount.clientWidth, mount.clientHeight)
//     renderer.shadowMap.enabled = true
//     mount.appendChild(renderer.domElement)

//     const camera = new THREE.PerspectiveCamera(45, mount.clientWidth / mount.clientHeight, 0.1, 1000)
//     camera.position.set(0, 60, 160)

//     const controls = new OrbitControls(camera, renderer.domElement)
//     controls.enableDamping = true
//     controls.dampingFactor = 0.06
//     controls.minDistance = 40
//     controls.maxDistance = 400

//     // lights
//     const hemi = new THREE.HemisphereLight(0xffffff, 0x444444, 0.6)
//     hemi.position.set(0, 200, 0)
//     scene.add(hemi)

//     const dir = new THREE.DirectionalLight(0xffffff, 0.8)
//     dir.position.set(100, 200, 100)
//     dir.castShadow = true
//     scene.add(dir)

//     // ground
//     const groundGeo = new THREE.PlaneGeometry(500, 500)
//     const groundMat = new THREE.MeshStandardMaterial({color:0x071522, roughness:0.9, metalness:0})
//     const ground = new THREE.Mesh(groundGeo, groundMat)
//     ground.rotation.x = -Math.PI/2
//     ground.position.y = -1
//     ground.receiveShadow = true
//     scene.add(ground)

    

//    //(NEW) ====== floor plan geometry from backend ======
// if (data) {
//   const scale = 0.15;      // controls overall size
//   const wallHeight = 30;   // Y extrusion

//   data.points.forEach((box, i) => {
//     const type = data.classes[i]?.name;
//     if (!type) return;

//     const width = Math.max(1, (box.x2 - box.x1) * scale);
//     const depth = Math.max(1, (box.y2 - box.y1) * scale);

//     // center layout around origin
//     const x = ((box.x1 + box.x2) * 0.5 - data.Width * 0.5) * scale;
//     const z = ((box.y1 + box.y2) * 0.5 - data.Height * 0.5) * scale;

//     let material;

//     if (type === "wall") {
//       material = new THREE.MeshStandardMaterial({
//         color: 0xbfc0c0,
//         roughness: 0.6,
//       });
//     } else if (type === "door") {
//       material = new THREE.MeshStandardMaterial({
//         color: 0x8b5a2b,
//         roughness: 0.5,
//       });
//     } else if (type === "window") {
//       material = new THREE.MeshStandardMaterial({
//         color: 0x4fc3f7,
//         transparent: true,
//         opacity: 0.55,
//       });
//     } else {
//       return;
//     }

//     const mesh = new THREE.Mesh(
//       new THREE.BoxGeometry(width, wallHeight, depth),
//       material
//     );

//     mesh.position.set(x, wallHeight / 2, z);
//     mesh.castShadow = true;
//     mesh.receiveShadow = true;
//     scene.add(mesh);
//   });
// }




//     // subtle animation for demo
//     let frameId
//     function animate(){
//       frameId = requestAnimationFrame(animate)
//       // keep rendering to support OrbitControls damping; no auto-animations
//       controls.update()
//       renderer.render(scene, camera)
//     }

//     function handleResize(){
//       const w = mount.clientWidth
//       const h = mount.clientHeight
//       camera.aspect = w / h
//       camera.updateProjectionMatrix()
//       renderer.setSize(w, h)
//     }

//     window.addEventListener('resize', handleResize)
//     animate()

//     return ()=>{
//       cancelAnimationFrame(frameId)
//       window.removeEventListener('resize', handleResize)
//       controls.dispose()
//       renderer.dispose()
//       mount.removeChild(renderer.domElement)
//     }
//   },[data])

// return (
//     <div style={{ width: '100%', height: '420px', position: 'relative' }}>
//       {data?.averageDoor === 0 && (
//         <div className="warning-box" style={{ position: 'absolute', top: 0, left: 0, zIndex: 10 }}>
//           No doors detected - model generated without door openings
//         </div>
//       )}
//       <div
//         className="model-viewer"
//         ref={mountRef}
//         style={{ width: '100%', height: '100%' }}
//       />
//     </div>
//   );
// }
