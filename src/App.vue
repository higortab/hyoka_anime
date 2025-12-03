<script setup>

</script>

<template>
  <header>
  <div class="img">
    <a href="/"><img src="/HEADER/logo.png" alt="" style="width: 30%; height: auto;"></a>
  </div>
  <div class="nav">
    <nav>
      <router-link to="/">Home</router-link>
      <router-link to="/filmes">Filmes</router-link>
      <router-link to="/tv">Programas de TV</router-link>
    </nav>
  </div>

  <div class="relative">
        <input
          type="text"
          placeholder="Pesquisar"
          v-model="searchQuery"
        />
  </div>
  </header>
  <main>
    <router-view />
  </main>

  <footer>
    <img src="/HEADER/logoBlack.png" alt="" style="width: 10%; height: auto;">
    <p>&copy; Todos os direitos reservados</p>
    <div>

    </div>
  </footer>
</template>

<style scoped>
header {
  height: 8%;
  display: flex;
  background-color: black;
  color: #fff;
  font-size: 110%;
  padding: 1% 3%;
  justify-content: space-between;
}


div.nav {
  display: flex;
  margin-right: 8% ;
}

div.relative {
  align-items: center;
  margin-top: 1%;
  margin-right: 2%;
}

nav {
  column-gap: 2rem;
  display: flex;
  align-items: center;
}

nav a {
  text-decoration: none;
  color: white;
  font-family: 'Michroma';
}

nav a.router-link-exact-active {
  color: #EE4646;
  font-weight: bold;
}

input {
  height: 70%;
  width: 120%;
  background-color: black;
  color: #EE4646;
  border-color: #EE4646;
  font-family: 'Michroma';
  border-radius: 22px;
  padding: 3%;
}

div {
  align-items: center;
}


footer {
  background-color: #EE4646;
  padding: 5%;
  display: flex;
  justify-content: space-between;
  align-items: center;
}


</style>
