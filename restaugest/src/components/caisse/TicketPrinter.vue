<template>
    <div class="ticket-printer">
      <!-- Aperçu du ticket -->
      <div class="preview-section">
        <div class="preview-header">
          <h3>Aperçu du ticket</h3>
          <div class="preview-actions">
            <button 
              class="btn-icon"
              @click="changeFormat"
              title="Changer le format"
            >
              <i class="fas fa-expand-alt"></i>
            </button>
            <button 
              class="btn-icon"
              @click="print"
              title="Imprimer"
            >
              <i class="fas fa-print"></i>
            </button>
          </div>
        </div>
  
        <div 
          class="ticket-preview"
          :class="format"
          ref="ticketPreview"
        >
          <!-- En-tête du ticket -->
          <div class="ticket-header">
            <img 
              :src="restaurantLogo" 
              alt="Logo"
              class="restaurant-logo"
            >
            <h1 class="restaurant-name">{{ restaurantInfo.nom }}</h1>
            <div class="restaurant-info">
              <p>{{ restaurantInfo.adresse }}</p>
              <p>Tél: {{ restaurantInfo.telephone }}</p>
            </div>
          </div>
  
          <!-- Informations du ticket -->
          <div class="ticket-info">
            <div class="ticket-ref">
              <h2>Ticket #{{ ticket.reference }}</h2>
              <div class="qr-code">
                <qrcode-vue :value="ticket.reference" :size="80" level="H" />
              </div>
            </div>
            <div class="ticket-details">
              <div class="detail-row">
                <span>Date:</span>
                <span>{{ formatDateTime(ticket.created_at) }}</span>
              </div>
              <div class="detail-row">
                <span>Table:</span>
                <span>{{ ticket.table.nom }} ({{ ticket.table.salle.nom }})</span>
              </div>
              <div class="detail-row">
                <span>Serveur:</span>
                <span>{{ ticket.serveur.nom }}</span>
              </div>
            </div>
          </div>
  
          <!-- Articles -->
          <div class="ticket-items">
            <table>
              <thead>
                <tr>
                  <th>Qté</th>
                  <th>Article</th>
                  <th>P.U.</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in ticket.items" :key="item.id">
                  <td>{{ item.quantite }}</td>
                  <td>{{ item.designation }}</td>
                  <td>{{ formatPrice(item.prix) }}</td>
                  <td>{{ formatPrice(item.prix * item.quantite) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
  
          <!-- Totaux -->
          <div class="ticket-totals">
            <div class="total-row">
              <span>Sous-total:</span>
              <span>{{ formatPrice(sousTotal) }}</span>
            </div>
            <div v-if="ticket.remise" class="total-row remise">
              <span>Remise ({{ ticket.remise }}%):</span>
              <span>-{{ formatPrice(montantRemise) }}</span>
            </div>
            <div class="total-row grand-total">
              <span>Total:</span>
              <span>{{ formatPrice(total) }}</span>
            </div>
          </div>
  
          <!-- Paiement -->
          <div v-if="ticket.paiement" class="ticket-payment">
            <div class="payment-row">
              <span>Mode de paiement:</span>
              <span>{{ ticket.paiement.mode }}</span>
            </div>
            <div class="payment-row">
              <span>Montant reçu:</span>
              <span>{{ formatPrice(ticket.paiement.montant_recu) }}</span>
            </div>
            <div class="payment-row">
              <span>Monnaie rendue:</span>
              <span>{{ formatPrice(ticket.paiement.monnaie) }}</span>
            </div>
          </div>
  
          <!-- Avoir utilisé -->
          <div v-if="ticket.avoir_utilise" class="ticket-avoir">
            <div class="avoir-info">
              <span>Avoir utilisé:</span>
              <span>#{{ ticket.avoir_utilise.reference }}</span>
            </div>
            <div class="avoir-montant">
              <span>Montant:</span>
              <span>-{{ formatPrice(ticket.avoir_utilise.montant) }}</span>
            </div>
          </div>
  
          <!-- Pied de ticket -->
          <div class="ticket-footer">
            <p class="message">{{ restaurantInfo.message_ticket }}</p>
            <p class="legal">{{ restaurantInfo.mentions_legales }}</p>
            <barcode 
              :value="ticket.reference"
              :options="barcodeOptions"
            />
          </div>
        </div>
      </div>
  
      <!-- Options d'impression -->
      <div class="print-options">
        <div class="option-group">
          <h4>Format</h4>
          <div class="format-options">
            <button 
              v-for="fmt in formats"
              :key="fmt.value"
              class="format-btn"
              :class="{ active: format === fmt.value }"
              @click="format = fmt.value"
            >
              <i :class="fmt.icon"></i>
              {{ fmt.label }}
            </button>
          </div>
        </div>
  
        <div class="option-group">
          <h4>Copies</h4>
          <div class="copies-selector">
            <button 
              class="btn-quantity"
              @click="decrementCopies"
            >
              <i class="fas fa-minus"></i>
            </button>
            <input 
              type="number"
              v-model.number="copies"
              min="1"
              max="5"
            >
            <button 
              class="btn-quantity"
              @click="incrementCopies"
            >
              <i class="fas fa-plus"></i>
            </button>
          </div>
        </div>
  
        <div class="option-group">
          <h4>Options</h4>
          <div class="print-checkboxes">
            <label class="checkbox-label">
              <input 
                type="checkbox"
                v-model="options.includeLogo"
              >
              Inclure le logo
            </label>
            <label class="checkbox-label">
              <input 
                type="checkbox"
                v-model="options.includeQR"
              >
              Inclure QR code
            </label>
            <label class="checkbox-label">
              <input 
                type="checkbox"
                v-model="options.includeBarcode"
              >
              Inclure code-barres
            </label>
          </div>
        </div>
  
        <div class="print-actions">
          <button 
            class="btn-secondary"
            @click="previewPDF"
          >
            <i class="fas fa-file-pdf"></i>
            Aperçu PDF
          </button>
          <button 
            class="btn-primary"
            @click="print"
          >
            <i class="fas fa-print"></i>
            Imprimer
          </button>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import { ref, computed } from 'vue';
  import { useStore } from 'vuex';
  import QrcodeVue from 'qrcode.vue';
  import Barcode from '@/components/common/Barcode.vue';
  import { jsPDF } from 'jspdf';
  import html2canvas from 'html2canvas';
  
  export default {
    name: 'TicketPrinter',
  
    components: {
      QrcodeVue,
      Barcode
    },
  
    props: {
      ticket: {
        type: Object,
        required: true
      }
    },
  
    setup(props) {
      const store = useStore();
      const ticketPreview = ref(null);
  
      // État
      const format = ref('standard');
      const copies = ref(1);
      const options = ref({
        includeLogo: true,
        includeQR: true,
        includeBarcode: true
      });
  
      // Données de référence
      const formats = [
        { value: 'standard', label: 'Standard', icon: 'fas fa-receipt' },
        { value: 'compact', label: 'Compact', icon: 'fas fa-compress-alt' },
        { value: 'large', label: 'Large', icon: 'fas fa-expand-alt' }
      ];
  
      const restaurantInfo = ref({
        nom: 'Restaurant Name',
        adresse: '123 Street Name, City',
        telephone: '+123 456 789',
        message_ticket: 'Merci de votre visite !',
        mentions_legales: 'TVA XX.XX% - SIRET XXXXXXXXX'
      });
  
      const restaurantLogo = ref('/img/logo.png');
  
      const barcodeOptions = {
        format: 'CODE128',
        width: 2,
        height: 50,
        displayValue: true
      };
  
      // Computed
      const sousTotal = computed(() => {
        return props.ticket.items.reduce((total, item) => {
          return total + (item.prix * item.quantite);
        }, 0);
      });
  
      const montantRemise = computed(() => {
        if (!props.ticket.remise) return 0;
        return (sousTotal.value * props.ticket.remise) / 100;
      });
  
      const total = computed(() => {
        return sousTotal.value - montantRemise.value;
      });
  
      // Méthodes
      const changeFormat = () => {
        const currentIndex = formats.findIndex(f => f.value === format.value);
        const nextIndex = (currentIndex + 1) % formats.length;
        format.value = formats[nextIndex].value;
      };
  
      const incrementCopies = () => {
        if (copies.value < 5) copies.value++;
      };
  
      const decrementCopies = () => {
        if (copies.value > 1) copies.value--;
      };
  
      const previewPDF = async () => {
        try {
          const canvas = await html2canvas(ticketPreview.value);
          const imgData = canvas.toDataURL('image/png');
          
          const pdf = new jsPDF({
            unit: 'mm',
            format: format.value === 'compact' ? [80, 297] : 'a4'
          });
  
          const imgProps = pdf.getImageProperties(imgData);
          const pdfWidth = pdf.internal.pageSize.getWidth();
          const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
          
          pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
          pdf.save(`ticket_${props.ticket.reference}.pdf`);
        } catch (error) {
          store.dispatch('showNotification', {
            type: 'error',
            message: 'Erreur lors de la génération du PDF'
          });
        }
      };
  
      const print = async () => {
        try {
          const response = await api.post(`/tickets/${props.ticket.id}/print`, {
            format: format.value,
            copies: copies.value,
            options: options.value
          });
  
          store.dispatch('showNotification', {
            type: 'success',
            message: 'Ticket envoyé à l\'impression'
          });
        } catch (error) {
          store.dispatch('showNotification', {
            type: 'error',
            message: 'Erreur lors de l\'impression'
          });
        }
      };
  
      const formatPrice = (price) => {
        return new Intl.NumberFormat('fr-FR', {
          style: 'currency',
          currency: 'XOF'
        }).format(price);
      };
  
      const formatDateTime = (date) => {
        return new Date(date).toLocaleString('fr-FR', {
          dateStyle: 'medium',
          timeStyle: 'short'
        });
      };
  
      return {
        format,
        copies,
        options,
        formats,
        restaurantInfo,
        restaurantLogo,
        barcodeOptions,
        ticketPreview,
        sousTotal,
        montantRemise,
        total,
        changeFormat,
        incrementCopies,
        decrementCopies,
        previewPDF,
        print,
        formatPrice,
        formatDateTime
      };
    }
  };
  </script>
  
  <style scoped>
  .ticket-printer {
    display: grid;
    grid-template-columns: 1fr 300px;
    gap: 2rem;
    padding: 2rem;
    height: 100%;
  }
  
  .preview-section {
    background: white;
    border-radius: 12px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }
  
  .preview-header {
    padding: 1rem;
    border-bottom: 1px solid #dee2e6;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .preview-actions {
    display: flex;
    gap: 0.5rem;
  }
  
  .btn-icon {
    padding: 0.5rem;
    border: none;
    border-radius: 4px;
    background: #f8f9fa;
    color: #6c757d;
    cursor: pointer;
  }
  
  .ticket-preview {
    flex: 1;
    overflow-y: auto;
    padding: 2rem;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }
  
  .ticket-preview.compact {
    width: 80mm;
    margin: 0 auto;
    font-size: 0.875rem;
  }
  
  .ticket-preview.large {
    max-width: 210mm;
    margin: 0 auto;
    font-size: 1.125rem;
  }
  
  .restaurant-logo {
    max-width: 150px;
    height: auto;
    margin: 0 auto 1rem;
    display: block;
  }
  
  .restaurant-name {
    text-align: center;
    font-size: 1.5rem;
    margin: 0 0 0.5rem;
  }
  
  .restaurant-info {
    text-align: center;
    color: #6c757d;
  }
  
  .restaurant-info p {
    margin: 0;
  }
  
  .ticket-info {
    border-top: 1px dashed #dee2e6;
    border-bottom: 1px dashed #dee2e6;
    padding: 1rem 0;
  }
  
  .ticket-ref {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }
  
  .ticket-ref h2 {
    margin: 0;
  }
  
  .ticket-details {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .detail-row {
    display: flex;
    justify-content: space-between;
  }
  
  .ticket-items table {
    width: 100%;
    border-collapse: collapse;
  }
  
  .ticket-items th,
  .ticket-items td {
    padding: 0.5rem;
    text-align: left;
  }
  
  .ticket-items th:last-child,
  .ticket-items td:last-child {
    text-align: right;
  }
  
  .ticket-totals {
    border-top: 1px dashed #dee2e6;
    padding-top: 1rem;
  }
  
  .total-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.5rem;
  }
  
  .total-row.remise {
    color: #dc3545;
  }
  
  .total-row.grand-total {
    font-size: 1.25rem;
    font-weight: 500;
    border-top: 1px solid #dee2e6;
    padding-top: 0.5rem;
    margin-top: 0.5rem;
  }
  
  .ticket-payment,
  .ticket-avoir {
    background: #f8f9fa;
    border-radius: 8px;
    padding: 1rem;
  }
  
  .payment-row,
  .avoir-info,
  .avoir-montant {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.5rem;
  }
  
  .ticket-footer {
    text-align: center;
    border-top: 1px dashed #dee2e6;
    padding-top: 1rem;
  }
  
  .message {
    font-weight: 500;
    margin-bottom: 0.5rem;
  }
  
  .legal {
    font-size: 0.875rem;
    color: #6c757d;
    margin-bottom: 1rem;
  }
  
  .print-options {
    background: white;
    border-radius: 12px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }
  
  .option-group h4 {
    margin: 0 0 1rem;
  }
  
  .format-options {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.5rem;
  }
  
  .format-btn {
    padding: 0.75rem;
    border: 1px solid #dee2e6;
    border-radius: 8px;
    background: white;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
  }
  
  .format-btn.active {
    border-color: #ff6600;
    background: #fff5eb;
    color: #ff6600;
  }
  
  .copies-selector {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  .btn-quantity {
    padding: 0.5rem;
    border: 1px solid #dee2e6;
    border-radius: 4px;
    background: white;
    cursor: pointer;
  }
  
  .copies-selector input {
    width: 60px;
    padding: 0.5rem;
    border: 1px solid #dee2e6;
    border-radius: 4px;
    text-align: center;
  }
  
  .print-checkboxes {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .checkbox-label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
  }
  
  .print-actions {
    margin-top: auto;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .btn-primary,
  .btn-secondary {
    padding: 0.75rem;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
  }
  
  .btn-primary {
    background: #ff6600;
    color: white;
  }
  
  .btn-secondary {
    background: #f8f9fa;
    color: #6c757d;
  }
  
  /* Responsive */
  @media (max-width: 1200px) {
    .ticket-printer {
      grid-template-columns: 1fr;
    }
  
    .print-options {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    }
  }
  
  @media print {
    .preview-header,
    .print-options {
      display: none;
    }
  
    .ticket-printer {
      display: block;
      padding: 0;
    }
  
    .preview-section {
      box-shadow: none;
    }
  }
  </style>
  