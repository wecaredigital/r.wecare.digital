<template>
  <div class="mfa-verification">
    <div class="modal is-active">
      <div class="modal-background"></div>
      <div class="modal-card">
        <header class="modal-card-head">
          <p class="modal-card-title">Two-Factor Authentication</p>
        </header>
        <section class="modal-card-body">
          <p class="mb-4">Enter the 6-digit code from your authenticator app:</p>
          
          <div class="field">
            <div class="control">
              <input 
                class="input is-large has-text-centered" 
                type="text" 
                v-model="code" 
                placeholder="000000"
                maxlength="6"
                autofocus
                @keyup.enter="verify"
                style="letter-spacing: 0.5em; font-size: 2em;"
              />
            </div>
          </div>

          <div v-if="errorMessage" class="notification is-danger mt-4">
            {{ errorMessage }}
          </div>
        </section>
        <footer class="modal-card-foot">
          <button 
            class="button is-success" 
            @click="verify"
            :disabled="code.length !== 6 || loading"
          >
            <span v-if="!loading">Verify</span>
            <span v-else>Verifying...</span>
          </button>
          <button class="button" @click="cancel">Cancel</button>
        </footer>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MFAVerification',
  data() {
    return {
      code: '',
      loading: false,
      errorMessage: ''
    };
  },
  methods: {
    async verify() {
      if (this.code.length !== 6) return;
      
      this.loading = true;
      this.errorMessage = '';
      
      try {
        this.$emit('verify', this.code);
      } catch (error) {
        this.errorMessage = 'Invalid code. Please try again.';
      } finally {
        this.loading = false;
      }
    },
    cancel() {
      this.$emit('cancel');
    }
  }
};
</script>

<style scoped>
.mfa-verification {
  z-index: 1000;
}
</style>
