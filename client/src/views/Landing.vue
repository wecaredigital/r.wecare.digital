<template>
  <div class="landing-page">
    <div class="landing-container">
      <a :href="signUpUrl" class="get-started-button">
        Get Started
      </a>
    </div>
  </div>
</template>

<script>
const clientId = process.env.VUE_APP_CLIENT_ID;
const authDomain = process.env.VUE_APP_AUTH_DOMAIN;
const redUrl = window.location.origin;

export default {
  name: 'Landing',
  data() {
    return {
      signUpUrl: `${authDomain}/signup?response_type=code&client_id=${clientId}&redirect_uri=${redUrl}`,
      logInUrl: `${authDomain}/login?response_type=code&client_id=${clientId}&redirect_uri=${redUrl}`
    };
  }
};
</script>

<style scoped>
.landing-page {
  min-height: 100vh;
  width: 100vw;
  background-color: #ffffff;
  margin: 0;
  padding: 0;
}

.landing-container {
  min-height: 100vh;
  width: 100vw;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0;
  padding: 0;
}

.get-started-button {
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
  text-decoration: none;
  display: inline-block;
}

.get-started-button:hover {
  background-color: #333333;
  color: #ffffff;
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
  text-decoration: none;
}

.get-started-button:active {
  transform: translateY(0);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.get-started-button:focus {
  outline: 2px solid #000000;
  outline-offset: 2px;
}

/* Remove any default margins/padding from body when this page is active */
body {
  margin: 0;
  padding: 0;
}
</style>
