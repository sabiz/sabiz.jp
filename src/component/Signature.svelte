<script>
import * as THREE from 'three'
import { onMount } from 'svelte'
import { createEnvironment, createShaderMesh } from './Signature'
import postVert from '../shader/post.vert'
import postFrag from '../shader/post.frag'

let box
let time
let postMesh
let env
onMount(() => {
  const elementWrapper = document.querySelector('.signature-wrapper')
  const elementCanvas = document.querySelector('.signature')
  elementCanvas.width = elementWrapper.clientWidth
  elementCanvas.height = elementWrapper.clientHeight
  env = createEnvironment(elementCanvas)
  /* PlaneGeometry(ENV.width, ENV.height, 100, 100);// */
  const geometry = new THREE.BoxGeometry(350, 350, 350, 25, 25, 25)
  const material = new THREE.MeshNormalMaterial()
  material.wireframe = true
  box = new THREE.Mesh(geometry, material)
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

  postMesh = createShaderMesh(env, postUniforms, postVert, postFrag)
  env.post.scene.add(postMesh)
  tick()
})

const tick = () => {
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
</script>


<div>
  <div class="signature-wrapper">
    <canvas class="signature"></canvas>
  </div>
</div>

<style lang="scss">
  .signature-wrapper {
    width: 50vw;
    height: 50vw/(16/9);
  }
</style>
