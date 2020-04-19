<script>
import * as THREE from 'three'
import { onMount } from 'svelte'
import { createEnvironment, createShaderMesh } from './Signature'
import baseVert from '../shader/base.vert'
import baseFrag from '../shader/base.frag'
import postVert from '../shader/post.vert'
import postFrag from '../shader/post.frag'

let time
let postMesh
let baseMesh
let env
onMount(() => {
  const elementWrapper = document.querySelector('.signature-wrapper')
  const elementCanvas = document.querySelector('.signature')
  elementCanvas.width = elementWrapper.clientWidth
  elementCanvas.height = elementWrapper.clientHeight
  env = createEnvironment(elementCanvas)
  baseMesh = createShaderMesh(env, {
    uTime: {
      type: 'f',
      value: time
    },
    uResolution: {
      type: 'vec2',
      value: new THREE.Vector2(env.width, env.height)
    }
  }, baseVert, baseFrag)
  env.base.scene.add(baseMesh)

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
  render()
})

const render = () => {
  time = env.clock.getElapsedTime()
  baseMesh.material.uniforms.uTime.value = time
  postMesh.material.uniforms.uTime.value = time
  // env.renderer.setRenderTarget(env.base.renderTarget)
  env.renderer.render(env.base.scene, env.base.camera)
  // env.renderer.setRenderTarget(null)
  // env.renderer.render(env.post.scene, env.post.camera)
  requestAnimationFrame(render)
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
