<template>
  <div>
    <!-- src/components/base/BaseFormWrapper.vue
 -->
    <p>essai !</p>
  </div>
</template>

<script>
export default {
  data() {
    return {
      message: 'Bonjour, monde !',
    }
  },
  methods: {
    // Composant pour afficher les informations du profil utilisateur.

    greet() {
      console.info(this.message)
    },
  },
}

/*
Composant pour afficher les informations du profil utilisateur.

*/
</script>

<style scoped>
/* Composant pour afficher les informations du profil utilisateur.
 */
p {
  color: blue;
}
class="text-red-500"
</style>
