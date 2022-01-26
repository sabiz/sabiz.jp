<script>
  import './Markdown.scss'
  import Loading from './Loading.svelte'
  import { marked } from 'marked'

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

