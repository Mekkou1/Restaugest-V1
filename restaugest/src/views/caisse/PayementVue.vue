<template>
  <div class="payement-container">
    <div class="form-group">
      <label>Devise :</label>
      <select v-model="devise">
        <option>XOF</option>
      </select>
    </div>
    <div class="form-group">
      <label>Mode Paiement :</label>
      <select v-model="modePaiement">
        <option>Espèces</option>
        <option>Carte Bancaire</option>
      </select>
    </div>
    <div class="form-group">
      <label>Montant Reçu :</label>
      <input type="number" v-model.number="montantRecu" @input="calculerRendu">
    </div>
    <div class="form-group">
      <label>Remise :</label>
      <input type="number" v-model.number="remise" @input="calculerRemise"> %
    </div>
    <div class="info">
      <p><strong>Num Ticket :</strong> {{ numeroTicket }}</p>
    </div>
    <div class="totals">
      <div class="total-item">
        <label>Solde Veille :</label>
        <input type="text" v-model="soldeVeille" disabled>
      </div>
      <div class="total-item">
        <label>Solde Jour :</label>
        <input type="text" v-model="soldeJour" disabled>
      </div>
    </div>
    <table class="table">
      <thead>
        <tr>
          <th>Ref</th>
          <th>Désignation</th>
          <th>Prix unitaire</th>
          <th>Quantité</th>
          <th>Montant</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>E001</td>
          <td>Salade César</td>
          <td>3 000</td>
          <td>1</td>
          <td>3 000</td>
        </tr>
      </tbody>
    </table>
    <div class="totals">
      <div class="total-item">
        <label>Remise :</label>
        <input type="text" v-model="montantRemise" disabled>
      </div>
      <div class="total-item">
        <label>Total :</label>
        <input type="text" v-model="totalAPayer" disabled>
      </div>
      <div class="total-item">
        <label>Reçu :</label>
        <input type="text" v-model="montantRecu" disabled>
      </div>
      <div class="total-item">
        <label>Rendu :</label>
        <input type="text" v-model="rendu" disabled>
      </div>
    </div>
    <div class="buttons">
      <button @click="retour">Retour</button>
      <button @click="validerPaiement">Valider</button>
    </div>
    <div v-if="avoirNecessaire" class="avoir-message">
      <p>Problème de monnaie détecté, un avoir a été généré.</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PayementVue',
  props: ['ticket'],
  data() {
    return {
      devise: 'XOF',
      modePaiement: 'Espèces',
      montantRecu: 0,
      remise: 0,
      montantRemise: 0,
      totalBrut: this.ticket ? this.ticket.total : 0,
      totalAPayer: this.ticket ? this.ticket.total : 0,
      rendu: 0,
      numeroTicket: this.ticket ? this.ticket.numTicket : '',
      soldeVeille: '0 FCFA',
      soldeJour: '93 800 FCFA',
      avoirNecessaire: false,
    };
  },
  methods: {
    calculerRemise() {
      this.montantRemise = (this.totalBrut * this.remise) / 100;
      this.totalAPayer = this.totalBrut - this.montantRemise;
      this.calculerRendu();
    },
    calculerRendu() {
      this.rendu = this.montantRecu - this.totalAPayer;
      this.avoirNecessaire = this.rendu < 0;
    },
    retour() {
      this.$router.push('/caisse');
    },
    validerPaiement() {
      if (this.avoirNecessaire) {
        alert('Problème de monnaie détecté, un avoir a été généré.');
      } else {
        alert('Paiement validé avec succès !');
      }
    },
  },
};
</script>

<style scoped>
.payement-container {
  background-color: #ff6600;
  padding: 20px;
  color: black;
}
.form-group {
  margin-bottom: 10px;
}
.table {
  width: 100%;
  margin-top: 10px;
  border-collapse: collapse;
}
.table th, .table td {
  border: 1px solid black;
  padding: 5px;
  text-align: center;
}
.totals {
  margin-top: 10px;
}
.total-item {
  margin-bottom: 5px;
}
.buttons {
  margin-top: 10px;
  display: flex;
  justify-content: space-between;
}
.avoir-message {
  background-color: red;
  color: white;
  padding: 10px;
  margin-top: 10px;
}
</style>
