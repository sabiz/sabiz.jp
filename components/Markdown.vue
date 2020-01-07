<template>
  <div v-html="content" class="marked"></div>
</template>

<script>
import marked from 'marked'
import hljs from 'highlightjs'

const contentMd = require('@/assets/content.md')

export default {
  computed: {
    content: () => {
      return marked(contentMd.default)
    }
  },
  created: () => {
    marked.setOptions({
      breaks: true,
      langPrefix: '',
      highlight: (code, lang) => {
        return hljs.highlightAuto(code, [lang]).value
      }
    })
  }
}
</script>

<style lang="scss">
@import '@/assets/variables.scss';

.marked {
  background: $background;
  width: 100vw;
}

.marked * {
  color: $color;
  font-size: large;
}

.marked > #sabizjp {
  font-size: xx-large;
  margin-bottom: 24px;
}

.marked > #sabizjp::before {
  content: '';
  display: inline-block;
  width: 64px;
  height: 64px;
  background-image: url('/logo.png');
  background-size: contain;
  vertical-align: middle;
  margin-right: 24px;
}

.marked > h2 {
  font-size: x-large;
  width: 100%;
  margin-bottom: 16px;
  background: linear-gradient(transparent 75%, $primary 0%);
}
</style>
