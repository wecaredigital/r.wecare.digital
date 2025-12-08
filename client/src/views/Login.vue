<template>
  <div class="login-page">
    <div class="login-container">
      <button 
        class="signin-button" 
        @click="signIn"
        :disabled="loading"
      >
        {{ loading ? 'SIGNING IN...' : 'SIGN IN' }}
      </button>
    </div>
  </div>
</template>

<script>
const clientId = process.env.VUE_APP_CLIENT_ID;
const authDomain = process.env.VUE_APP_AUTH_DOMAIN;
const redUrl = window.location.origin;

export default {
  name: 'Login',
  data() {
    return {
      loading: false
    };
  },
  methods: {
    signIn() {
      this.loading = true;
      const loginUrl = `${authDomain}/login?response_type=code&client_id=${clientId}&redirect_uri=${redUrl}`;
      window.location.href = loginUrl;
    }
  }
};
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  width: 100vw;
  background-color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0;
  padding: 0;
}

.login-container {
  display: flex;
  align-items: center;
  justify-content: center;
}

.signin-button {
  background-color: #000000;
  color: #ffffff;
  border: none;
  border-radius: 30px;
  padding: 16px 48px;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 1px;
  cursor: pointer;
  transition: all 0.3s ease;
  outline: none;
  min-width: 160px;
  text-align: center;
}

.signin-button:hover {
  background-color: #333333;
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
}

.signin-button:active {
  transform: translateY(0);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.signin-button:disabled {
  background-color: #666666;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* Remove any default margins/padding from body when this page is active */
body {
  margin: 0;
  padding: 0;
}
</style>