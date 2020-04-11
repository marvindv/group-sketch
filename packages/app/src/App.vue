<template>
  <div id="app">
    <div id="nav"></div>
    <router-view />
  </div>
</template>

<style lang="scss">
#app {
  // From https://gist.github.com/don1138/5761014
  font-family: Impact, Haettenschweiler, "Franklin Gothic Bold", Charcoal,
    "Helvetica Inserat", "Bitstream Vera Sans Bold", "Arial Black", sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}

#nav {
  padding: 30px;

  a {
    font-weight: bold;
    color: #2c3e50;

    &.router-link-exact-active {
      color: #42b983;
    }
  }
}
</style>
