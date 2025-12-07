<template>
  <div class="mfa-setup">
    <div class="box">
      <h2 class="title is-4">Enable Two-Factor Authentication (TOTP)</h2>
      
      <div v-if="!mfaEnabled && !setupInProgress">
        <p class="mb-4">
          Secure your account with Time-based One-Time Password (TOTP) authentication.
          You'll need an authenticator app like Google Authenticator, Authy, or Microsoft Authenticator.
        </p>
        <button class="button is-primary" @click="startMFASetup" :disabled="loading">
          <span v-if="!loading">Enable MFA</span>
          <span v-else>Loading...</span>
        </button>
      </div>

      <div v-if="setupInProgress && !mfaEnabled">
        <div class="content">
          <p class="mb-4">Scan this QR code with your authenticator app:</p>
          
          <div class="has-text-centered mb-4">
            <canvas ref="qrCanvas"></canvas>
          </div>

          <p class="mb-2"><strong>Or enter this secret key manually:</strong></p>
          <div class="field has-addons mb-4">
            <div class="control is-expanded">
              <input class="input" type="text" :value="secretCode" readonly />
            </div>
            <div class="control">
              <button class="button is-info" @click="copySecret">
                Copy
              </button>
            </div>
          </div>

          <p class="mb-3">Enter the 6-digit code from your authenticator app to verify:</p>
          <div class="field has-addons">
            <div class="control is-expanded">
              <input 
                class="input" 
                type="text" 
                v-model="verificationCode" 
                placeholder="000000"
                maxlength="6"
                @keyup.enter="verifyMFASetup"
              />
            </div>
            <div class="control">
              <button 
                class="button is-success" 
                @click="verifyMFASetup"
                :disabled="verificationCode.length !== 6 || loading"
              >
                Verify
              </button>
            </div>
          </div>
          
          <button class="button is-text mt-3" @click="cancelSetup">
            Cancel
          </button>
        </div>
      </div>

      <div v-if="mfaEnabled">
        <article class="message is-success">
          <div class="message-body">
            <strong>✓ MFA is enabled</strong> - Your account is protected with two-factor authentication.
          </div>
        </article>
        <button class="button is-danger" @click="disableMFA" :disabled="loading">
          <span v-if="!loading">Disable MFA</span>
          <span v-else>Processing...</span>
        </button>
      </div>

      <div v-if="errorMessage" class="notification is-danger mt-4">
        {{ errorMessage }}
      </div>

      <div v-if="successMessage" class="notification is-success mt-4">
        {{ successMessage }}
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import QRCode from 'qrcode';

export default {
  name: 'MFASetup',
  data() {
    return {
      mfaEnabled: false,
      setupInProgress: false,
      secretCode: '',
      qrCodeUrl: '',
      verificationCode: '',
      loading: false,
      errorMessage: '',
      successMessage: ''
    };
  },
  mounted() {
    this.checkMFAStatus();
  },
  methods: {
    async checkMFAStatus() {
      try {
        const token = localStorage.getItem('cognitoIdentityToken');
        const response = await axios.get(
          `${process.env.VUE_APP_API_ROOT}/app/mfa/status`,
          {
            headers: { Authorization: token }
          }
        );
        this.mfaEnabled = response.data.mfaEnabled;
      } catch (error) {
        console.error('Error checking MFA status:', error);
      }
    },
    async startMFASetup() {
      this.loading = true;
      this.errorMessage = '';
      
      try {
        const token = localStorage.getItem('cognitoIdentityToken');
        const response = await axios.post(
          `${process.env.VUE_APP_API_ROOT}/app/mfa/setup`,
          {},
          {
            headers: { Authorization: token }
          }
        );
        
        this.secretCode = response.data.secretCode;
        this.qrCodeUrl = response.data.qrCodeUrl;
        this.setupInProgress = true;
        
        this.$nextTick(() => {
          this.generateQRCode();
        });
      } catch (error) {
        this.errorMessage = 'Failed to start MFA setup. Please try again.';
        console.error('Error starting MFA setup:', error);
      } finally {
        this.loading = false;
      }
    },
    async generateQRCode() {
      try {
        await QRCode.toCanvas(this.$refs.qrCanvas, this.qrCodeUrl, {
          width: 256,
          margin: 2
        });
      } catch (error) {
        console.error('Error generating QR code:', error);
      }
    },
    async verifyMFASetup() {
      this.loading = true;
      this.errorMessage = '';
      
      try {
        const token = localStorage.getItem('cognitoIdentityToken');
        await axios.post(
          `${process.env.VUE_APP_API_ROOT}/app/mfa/verify`,
          {
            code: this.verificationCode,
            secretCode: this.secretCode
          },
          {
            headers: { Authorization: token }
          }
        );
        
        this.mfaEnabled = true;
        this.setupInProgress = false;
        this.successMessage = 'MFA has been successfully enabled!';
        this.verificationCode = '';
        
        setTimeout(() => {
          this.successMessage = '';
        }, 5000);
      } catch (error) {
        this.errorMessage = 'Invalid verification code. Please try again.';
        console.error('Error verifying MFA:', error);
      } finally {
        this.loading = false;
      }
    },
    async disableMFA() {
      if (!confirm('Are you sure you want to disable MFA? This will make your account less secure.')) {
        return;
      }
      
      this.loading = true;
      this.errorMessage = '';
      
      try {
        const token = localStorage.getItem('cognitoIdentityToken');
        await axios.post(
          `${process.env.VUE_APP_API_ROOT}/app/mfa/disable`,
          {},
          {
            headers: { Authorization: token }
          }
        );
        
        this.mfaEnabled = false;
        this.successMessage = 'MFA has been disabled.';
        
        setTimeout(() => {
          this.successMessage = '';
        }, 5000);
      } catch (error) {
        this.errorMessage = 'Failed to disable MFA. Please try again.';
        console.error('Error disabling MFA:', error);
      } finally {
        this.loading = false;
      }
    },
    cancelSetup() {
      this.setupInProgress = false;
      this.secretCode = '';
      this.qrCodeUrl = '';
      this.verificationCode = '';
      this.errorMessage = '';
    },
    copySecret() {
      navigator.clipboard.writeText(this.secretCode);
      this.successMessage = 'Secret key copied to clipboard!';
      setTimeout(() => {
        this.successMessage = '';
      }, 3000);
    }
  }
};
</script>

<style scoped>
.mfa-setup {
  max-width: 600px;
  margin: 0 auto;
}

canvas {
  border: 1px solid #dbdbdb;
  border-radius: 4px;
}
</style>
