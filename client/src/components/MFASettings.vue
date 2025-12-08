<template>
  <div class="mfa-settings">
    <div class="box">
      <h3 class="title is-5 mb-4">
        <span class="icon-text">
          <span class="icon has-text-warning">
            <i class="fas fa-shield-alt"></i>
          </span>
          <span>Two-Factor Authentication</span>
        </span>
      </h3>

      <div class="content">
        <p class="mb-4">
          Secure your account with two-factor authentication using an authenticator app like 
          Google Authenticator, Authy, or Microsoft Authenticator.
        </p>

        <!-- MFA Status -->
        <div class="field">
          <div class="control">
            <label class="checkbox">
              <input type="checkbox" v-model="mfaEnabled" @change="toggleMFA" :disabled="loading">
              <strong class="ml-2">Enable Two-Factor Authentication</strong>
            </label>
          </div>
          <p class="help" v-if="mfaEnabled">
            <span class="icon has-text-success">
              <i class="fas fa-check-circle"></i>
            </span>
            MFA is enabled and protecting your account
          </p>
          <p class="help" v-else>
            <span class="icon has-text-grey">
              <i class="fas fa-exclamation-triangle"></i>
            </span>
            Your account is protected with password authentication only
          </p>
        </div>

        <!-- Setup Instructions -->
        <div v-if="showSetup" class="notification is-info is-light">
          <h4 class="title is-6">Setup Instructions:</h4>
          <ol>
            <li>Download an authenticator app (Google Authenticator, Authy, etc.)</li>
            <li>Scan the QR code below or enter the secret key manually</li>
            <li>Enter the 6-digit code from your app to verify</li>
          </ol>
        </div>

        <!-- QR Code Section -->
        <div v-if="showSetup" class="has-text-centered mb-4">
          <div class="qr-placeholder">
            <div class="box has-background-light">
              <span class="icon is-large has-text-grey">
                <i class="fas fa-qrcode fa-3x"></i>
              </span>
              <p class="mt-2 has-text-grey">QR Code would appear here</p>
              <p class="is-size-7 has-text-grey">Secret: DEMO-SECRET-KEY-123</p>
            </div>
          </div>
        </div>

        <!-- Verification -->
        <div v-if="showSetup" class="field has-addons">
          <div class="control is-expanded">
            <input class="input" 
                   type="text" 
                   v-model="verificationCode" 
                   placeholder="Enter 6-digit code"
                   maxlength="6">
          </div>
          <div class="control">
            <button class="button is-success" 
                    @click="verifyCode"
                    :disabled="verificationCode.length !== 6 || loading">
              <span v-if="!loading">Verify</span>
              <span v-else>Verifying...</span>
            </button>
          </div>
        </div>



        <!-- Actions -->
        <div class="field is-grouped mt-4">
          <div class="control" v-if="showSetup">
            <button class="button is-light" @click="cancelSetup">Cancel</button>
          </div>
          <div class="control" v-if="mfaEnabled && !showSetup">
            <button class="button is-danger is-outlined" @click="disableMFA">
              <span class="icon">
                <i class="fas fa-times"></i>
              </span>
              <span>Disable MFA</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MFASettings',
  data() {
    return {
      mfaEnabled: false,
      showSetup: false,
      verificationCode: '',
      loading: false
    };
  },
  methods: {
    toggleMFA() {
      if (this.mfaEnabled) {
        this.showSetup = true;
      } else {
        this.disableMFA();
      }
    },
    verifyCode() {
      this.loading = true;
      
      // Simulate verification
      setTimeout(() => {
        if (this.verificationCode === '123456') {
          this.showSetup = false;
          this.mfaEnabled = true;
          this.$emit('success', 'MFA enabled successfully!');
        } else {
          this.$emit('error', 'Invalid verification code. Try 123456 for demo.');
          this.mfaEnabled = false;
        }
        this.loading = false;
        this.verificationCode = '';
      }, 1000);
    },
    disableMFA() {
      if (confirm('Are you sure you want to disable MFA? This will make your account less secure.')) {
        this.mfaEnabled = false;
        this.showSetup = false;
        this.$emit('success', 'MFA disabled successfully.');
      } else {
        this.mfaEnabled = true; // Revert checkbox
      }
    },
    cancelSetup() {
      this.showSetup = false;
      this.mfaEnabled = false;
      this.verificationCode = '';
    }
  }
};
</script>

<style scoped>
.qr-placeholder {
  max-width: 200px;
  margin: 0 auto;
}

.icon-text {
  align-items: center;
}

.help {
  display: flex;
  align-items: center;
  margin-top: 0.5rem;
}

.help .icon {
  margin-right: 0.25rem;
}
</style>