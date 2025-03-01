<template>
    <div class="modal d-flex justify-content-center align-items-center">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h2 class="modal-title">Déclarer un fond de caisse</h2>
            <button type="button" class="btn-close" @click="$emit('close')"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="declarerFonds">
              <table class="table table-bordered">
                <thead>
                  <tr>
                    <th>Coupure</th>
                    <th>Quantité</th>
                    <th>Devise</th>
                    <th>Montant</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(fond, index) in fonds" :key="index">
                    <td><input type="number" v-model="fond.coupure" class="form-control" required></td>
                    <td><input type="number" v-model="fond.quantite" class="form-control" required></td>
                    <td><input type="text" v-model="fond.devise" class="form-control" required></td>
                    <td>{{ fond.coupure * fond.quantite }}</td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr>
                    <td colspan="3">Total</td>
                    <td>{{ total }}</td>
                  </tr>
                </tfoot>
              </table>
              <button type="submit" class="btn btn-primary mt-3">Valider</button>
              <button type="button" class="btn btn-secondary mt-3" @click="$emit('close')">Annuler</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'FondsModal',
    data() {
      return {
        fonds: [
          { coupure: 10000, quantite: 0, devise: 'XOF' },
          { coupure: 5000, quantite: 0, devise: 'XOF' },
          { coupure: 2000, quantite: 0, devise: 'XOF' },
          { coupure: 1000, quantite: 0, devise: 'XOF' },
          { coupure: 500, quantite: 0, devise: 'XOF' },
          { coupure: 200, quantite: 0, devise: 'XOF' },
          { coupure: 100, quantite: 0, devise: 'XOF' },
          { coupure: 50, quantite: 0, devise: 'XOF' },
          { coupure: 25, quantite: 0, devise: 'XOF' },
          { coupure: 10, quantite: 0, devise: 'XOF' },
          { coupure: 5, quantite: 0, devise: 'XOF' },
        ],
      };
    },
    computed: {
      total() {
        return this.fonds.reduce((sum, fond) => sum + fond.coupure * fond.quantite, 0);
      },
    },
    methods: {
      declarerFonds() {
        // Logique de déclaration des fonds
        alert('Fonds de caisse déclarés avec succès.');
        this.$emit('close');
      },
    },
  };
  </script>
  
  <style scoped>
  .modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
  }
  .modal-content {
    padding: 20px;
  }
  </style>
  