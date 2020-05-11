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

  const MARKER_START_WORDS = '@START_WORDS@'
  const MARKER_END_WORDS = '@END_WORDS@'
  const replaceSkill = (html) => {
    const markerStartPos = html.indexOf(MARKER_START_WORDS)
    const markerEndPos = html.indexOf(MARKER_END_WORDS)
    const words = html.substring(markerStartPos + MARKER_START_WORDS.length, markerEndPos)
    const wordArray = words.split(',').map((v) => v.replace('\n', ''))
    let wordsResult = '<div class="words">'
    wordsResult += wordArray.reduce((acc, v, i) => {
      return acc + '<span>' + v + '</span>'
    }, '')
    wordsResult += '</div>'
    const before = html.substring(0, markerStartPos)
    const after = html.substring(markerEndPos + MARKER_END_WORDS.length)
    return before + wordsResult + after
  }

  let content
  getContent().then((dat) => {
    content = replaceSkill(marked(dat))
  })

</script>

<div class="mkd">
{#if content}
  {@html content}
{:else}
  <Loading />
{/if}
</div>

