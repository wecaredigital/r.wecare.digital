<template>
  <div class="landing-page">
    <!-- Hero Section -->
    <section class="hero is-fullheight-with-navbar">
      <div class="hero-body">
        <div class="container has-text-centered">
          <div class="columns is-vcentered">
            <div class="column is-6-desktop is-offset-3-desktop">
              <div class="landing-content">
                <div class="logo-section mb-5">
                  <span class="icon-large">🔗</span>
                  <h1 class="title is-1 is-size-2-mobile has-text-weight-bold mt-4">
                    WECARE.DIGITAL
                  </h1>
                  <p class="subtitle is-4 is-size-5-mobile has-text-grey">
                    Shorten, Share, and Manage Your URLs
                  </p>
                </div>

                <div class="features-grid mb-6">
                  <div class="feature-item">
                    <span class="icon is-large has-text-info">
                      <i class="fas fa-bolt"></i>
                    </span>
                    <p class="has-text-weight-semibold">Lightning Fast</p>
                    <p class="is-size-7 has-text-grey">Instant URL shortening</p>
                  </div>
                  <div class="feature-item">
                    <span class="icon is-large has-text-success">
                      <i class="fas fa-shield-alt"></i>
                    </span>
                    <p class="has-text-weight-semibold">Secure & Private</p>
                    <p class="is-size-7 has-text-grey">Your data is protected</p>
                  </div>
                  <div class="feature-item">
                    <span class="icon is-large has-text-warning">
                      <i class="fas fa-chart-line"></i>
                    </span>
                    <p class="has-text-weight-semibold">Easy Management</p>
                    <p class="is-size-7 has-text-grey">Organize with folders</p>
                  </div>
                </div>

                <div class="buttons is-centered">
                  <a :href="signUpUrl" class="button is-primary is-large is-rounded">
                    <span class="icon">
                      <i class="fas fa-user-plus"></i>
                    </span>
                    <span>Get Started</span>
                  </a>
                  <router-link to="/login" class="button is-light is-large is-rounded">
                    <span class="icon">
                      <i class="fas fa-sign-in-alt"></i>
                    </span>
                    <span>Sign In</span>
                  </router-link>
                </div>

                <p class="is-size-7 has-text-grey mt-5">
                  Powered by AWS • Secure • Scalable • Fast
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="section features-section">
      <div class="container">
        <h2 class="title is-3 has-text-centered mb-6">Why Choose WECARE.DIGITAL?</h2>
        <div class="columns is-multiline">
          <div class="column is-4-desktop is-12-mobile">
            <div class="box feature-box">
              <div class="has-text-centered mb-4">
                <span class="icon is-large has-text-primary">
                  <i class="fas fa-link fa-2x"></i>
                </span>
              </div>
              <h3 class="title is-5 has-text-centered">Custom Short Links</h3>
              <p class="has-text-centered has-text-grey">
                Create memorable, branded short URLs that are easy to share and remember.
              </p>
            </div>
          </div>
          <div class="column is-4-desktop is-12-mobile">
            <div class="box feature-box">
              <div class="has-text-centered mb-4">
                <span class="icon is-large has-text-info">
                  <i class="fas fa-folder fa-2x"></i>
                </span>
              </div>
              <h3 class="title is-5 has-text-centered">Organize with Folders</h3>
              <p class="has-text-centered has-text-grey">
                Keep your links organized with folders and tags for easy management.
              </p>
            </div>
          </div>
          <div class="column is-4-desktop is-12-mobile">
            <div class="box feature-box">
              <div class="has-text-centered mb-4">
                <span class="icon is-large has-text-success">
                  <i class="fas fa-search fa-2x"></i>
                </span>
              </div>
              <h3 class="title is-5 has-text-centered">Powerful Search</h3>
              <p class="has-text-centered has-text-grey">
                Quickly find any link with our advanced search functionality.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="section cta-section has-background-primary">
      <div class="container has-text-centered">
        <h2 class="title is-3 has-text-white mb-4">Ready to Get Started?</h2>
        <p class="subtitle is-5 has-text-white mb-5">
          Join thousands of users managing their URLs efficiently
        </p>
        <a :href="signUpUrl" class="button is-white is-large is-rounded">
          <span class="icon">
            <i class="fas fa-rocket"></i>
          </span>
          <span>Create Free Account</span>
        </a>
      </div>
    </section>

    <!-- Footer -->
    <footer class="footer">
      <div class="content has-text-centered">
        <p class="has-text-grey">
          <strong>WECARE.DIGITAL</strong> - URL Shortener Platform
        </p>
        <p class="is-size-7 has-text-grey">
          © 2025 WECARE.DIGITAL. All rights reserved.
        </p>
      </div>
    </footer>
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
}

.hero {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.landing-content {
  animation: fadeInUp 0.8s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.icon-large {
  font-size: 5rem;
  display: inline-block;
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.title, .subtitle {
  color: white !important;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
  margin: 3rem 0;
}

@media screen and (max-width: 768px) {
  .features-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
}

.feature-item {
  text-align: center;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  backdrop-filter: blur(10px);
  transition: transform 0.3s ease;
}

.feature-item:hover {
  transform: translateY(-5px);
}

.feature-item p {
  color: white;
  margin-top: 0.5rem;
}

.features-section {
  padding: 5rem 1.5rem;
  background: #f8f9fa;
}

.feature-box {
  height: 100%;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  border: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.feature-box:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
}

.cta-section {
  padding: 5rem 1.5rem;
}

.footer {
  background: #2c3e50;
  padding: 2rem 1.5rem;
}

.footer p {
  color: #95a5a6;
}

.footer strong {
  color: white;
}

.button.is-rounded {
  padding-left: 2rem;
  padding-right: 2rem;
}

.button.is-large {
  font-size: 1.1rem;
}
</style>
