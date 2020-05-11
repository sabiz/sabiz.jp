<script>
  import './Markdown.scss'
  import Loading from './Loading.svelte'
  import marked from 'marked'
  import { dom, library } from '@fortawesome/fontawesome-svg-core'
  import { faTwitter, faGithub } from '@fortawesome/free-brands-svg-icons'
  import { faEnvelope } from '@fortawesome/free-solid-svg-icons'
  library.add(faTwitter, faGithub, faEnvelope)
  dom.watch()

  export let markdownUrl

  const getContent = async () => {
    try {
      const resp = await fetch(markdownUrl, { cache: 'no-store' })
      if (!resp.ok) {
        console.log(resp)
        throw new Error('Response is  not ok')
      }
      return await resp.text()
    } catch (err) {
      console.error(err)
      return 'Content get failed...'
    }
  }

  let content
  getContent().then((dat) => {
    content = marked(dat)
  })

</script>

<div class="mkd">
{#if content}
  {@html content}
{:else}
  <Loading />
{/if}
</div>

