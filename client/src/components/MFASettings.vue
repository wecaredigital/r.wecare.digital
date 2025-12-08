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
          <h4 class="title is-6">MFA Setup:</h4>
          <p>Two-factor authentication will enhance your account security by requiring a second form of verification when logging in.</p>
          <div class="mt-3">
            <button class="button" @click="enableMFA" :disabled="loading">
              <span v-if="!loading">Enable MFA</span>
              <span v-else>Setting up...</span>
            </button>
          </div>
        </div>

        <!-- MFA Setup Notice -->
        <div v-if="showSetup" class="notification is-info is-light">
          <p><strong>MFA Setup:</strong> Two-factor authentication setup will be available in a future update. 
          This feature is currently under development.</p>
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
    enableMFA() {
      this.loading = true;
      
      // Simulate MFA enablement
      setTimeout(() => {
        this.showSetup = false;
        this.mfaEnabled = true;
        this.$emit('success', 'MFA feature will be available in a future update.');
        this.loading = false;
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