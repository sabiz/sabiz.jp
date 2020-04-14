<script>
import Signature from './Signature.svelte'
import Markdown from './Markdown.svelte'
</script>

<main>
  <Signature />
  <div class="space"/>
  <Markdown markdownUrl='/content.md'/>
  <div class="space"/>
  <span class="copyright">(c) 2013 sAbIz</span>
</main>

<style type="scss">

main {
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  margin-top: 1rem;
  margin-left: auto;
  margin-right: auto;
  width: 50vw;
}

.space {
  margin-bottom: 3rem;
}

.copyright {
  font-size: x-small;
  margin-bottom: 1rem;
}

</style>
