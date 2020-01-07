<template>
  <div class="signature-wrapper mx-auto">
    <canvas class="signature"></canvas>
  </div>
</template>

<script>
import * as THREE from 'three'
import postVert from '@/assets/shader/post.vert'
import postFrag from '@/assets/shader/post.frag'

const RESOLUTION = 32

const createEnvironment = (canvas) => {
  const width = canvas.width
  const height = canvas.height
  const aspect = width / height
  const clock = new THREE.Clock()

  // Renderer -----------------------------------------------------------------
  const renderer = new THREE.WebGLRenderer({ canvas })
  renderer.setClearColor('#ffffff')
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setSize(width, height)

  // Base Scene ---------------------------------------------------------------
  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(45, aspect, 1, 10000)
  camera.position.set(0, 0, +1000)
  const light = new THREE.AmbientLight('#ffffff')
  scene.add(light)
  const renderTarget = new THREE.WebGLRenderTarget(width, height)

  // Post Scene ---------------------------------------------------------------
  const postScene = new THREE.Scene()
  const postCamera = new THREE.PerspectiveCamera(45, aspect, 1, 10000)
  postCamera.position.set(0, 0, +1000)

  return {
    renderer,
    width,
    height,
    aspect,
    clock,
    base: {
      scene,
      camera,
      light,
      renderTarget
    },
    post: {
      scene: postScene,
      camera: postCamera
    }
  }
}

const createShaderMesh = (env, uniform, vertex, fragment) => {
  const geometry = new THREE.PlaneGeometry(
    env.width,
    env.height,
    RESOLUTION * env.aspect,
    RESOLUTION * env.aspect
  )
  const material = new THREE.ShaderMaterial({
    uniforms: uniform,
    vertexShader: vertex,
    fragmentShader: fragment
  })
  return new THREE.Mesh(geometry, material)
}

export default {
  mounted: () => {
    const elementWrapper = document.querySelector('.signature-wrapper')
    const elementCanvas = document.querySelector('.signature')
    elementCanvas.width = elementWrapper.clientWidth
    elementCanvas.height = elementWrapper.clientHeight
    const env = createEnvironment(elementCanvas)
    let time = 0.0
    // TODO temp -----------------------------
    /* PlaneGeometry(ENV.width, ENV.height, 100, 100);// */
    const geometry = new THREE.BoxGeometry(350, 350, 350, 25, 25, 25)
    const material = new THREE.MeshNormalMaterial()
    material.wireframe = true
    const box = new THREE.Mesh(geometry, material)
    env.base.scene.add(box)

    const postUniforms = {
      uTex: {
        type: 't',
        value: env.base.renderTarget
      },
      uTime: {
        type: 'f',
        value: time
      },
      uResolution: {
        type: 'vec2',
        value: new THREE.Vector2(env.width, env.height)
      }
    }

    const postMesh = createShaderMesh(env, postUniforms, postVert, postFrag)
    env.post.scene.add(postMesh)

    tick()

    function tick() {
      box.rotation.y += 0.005
      box.rotation.x += 0.005
      box.rotation.z += 0.005
      time = env.clock.getElapsedTime()
      postMesh.material.uniforms.uTime.value = time
      env.renderer.setRenderTarget(env.base.renderTarget)
      env.renderer.render(env.base.scene, env.base.camera)
      env.renderer.setRenderTarget(null)
      env.renderer.render(env.post.scene, env.post.camera)
      requestAnimationFrame(tick)
    }
    // TODO temp -----------------------------
  }
}
</script>

<style lang="scss">
.signature-wrapper {
  width: 100vw;
  height: 100vh;
  margin-bottom: 16px;
}
</style>
