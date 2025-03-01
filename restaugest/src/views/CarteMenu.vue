<template>
    <div class="menu-view">
      <h1>Carte du Restaurant</h1>
      <div class="menu-category" v-for="(items, category) in categorizedMenu" :key="category">
        <h2>{{ category }}</h2>
        <ul>
          <li v-for="item in items" :key="item.id">
            <span>{{ item.nom }} - {{ item.prix }} FCFA</span>
            <button @click="ajouterALaCommande(item)">Ajouter</button>
          </li>
        </ul>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'CarteMenu',

    data() {
      return {
        menu: [
          { id: 1, nom: "Salade César", categorie: "Entrée", prix: 3000 },
          { id: 2, nom: "Poulet Rôti", categorie: "Plat", prix: 7000 },
          { id: 3, nom: "Coca-Cola", categorie: "Boisson", prix: 1000 },
          { id: 4, nom: "Tarte aux pommes", categorie: "Dessert", prix: 2500 },
        ],
        commande: [], // Liste des articles ajoutés à la commande
      };
    },
    computed: {
      categorizedMenu() {
        return this.menu.reduce((categories, item) => {
          if (!categories[item.categorie]) categories[item.categorie] = [];
          categories[item.categorie].push(item);
          return categories;
        }, {});
      },
    },
    methods: {
      ajouterALaCommande(item) {
        this.commande.push({ ...item, quantite: 1 });
      },
    },
  };
  </script>
  
  <style>
  .menu-view {
    font-family: Arial, sans-serif;
    padding: 20px;
  }
  .menu-category {
    margin-bottom: 20px;
  }
  button {
    margin-left: 10px;
    padding: 5px 10px;
  }
  </style>
  