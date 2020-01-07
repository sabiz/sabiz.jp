<template>
  <v-footer :color="themeColor" absolute app>
    <v-spacer></v-spacer>
    <span>&copy; 2013 sabiz.jp</span>
    <v-spacer></v-spacer>
  </v-footer>
</template>

<script>
import variables from '@/assets/variables.scss'

export default {
  data() {
    return {
      themeColor: variables.primary
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/variables.scss';

.header-title {
  font-size: 2.5rem;
  color: $secondary;
}
</style>
