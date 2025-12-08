<template>
  <div class="columns is-mobile">
    <!-- Mobile Menu Toggle -->
    <div class="mobile-menu-toggle is-hidden-tablet">
      <button class="button is-white" @click="showSidebar = !showSidebar">
        <span class="icon">
          <i class="fas fa-bars"></i>
        </span>
      </button>
    </div>

    <!-- Sidebar -->
    <div class="column is-12-mobile is-2-tablet is-narrow sidebar-folders" 
         :class="{ 'is-hidden-mobile': !showSidebar }">
      <aside class="menu">
        <p class="menu-label">
          <span>Folders</span>
          <button class="button is-small is-white is-hidden-tablet mobile-close" @click="showSidebar = false">
            <span class="icon is-small">
              <i class="fas fa-times"></i>
            </span>
          </button>
        </p>
        <ul class="menu-list">
          <li>
            <a :class="{ 'is-active': selectedFolder === '' }" @click="selectFolder('')" href="#">
              <span class="icon"><i class="fas fa-folder-open"></i></span>
              <span>All Links</span>
            </a>
          </li>
          <li v-for="folder in folderList" :key="folder">
            <a :class="{ 'is-active': selectedFolder === folder }" @click="selectFolder(folder)" href="#">
              <span class="icon"><i class="fas fa-folder"></i></span>
              <span>{{ folder }}</span>
            </a>
          </li>
        </ul>
        


        <!-- Account Section -->
        <p class="menu-label mt-5">Account</p>
        <ul class="menu-list">
          <li>
            <a @click="logout" href="#" class="logout-link">
              <span class="icon"><i class="fas fa-sign-out-alt"></i></span>
              <span>Sign Out</span>
            </a>
          </li>
        </ul>
      </aside>
    </div>

    <!-- Main Content -->
    <div class="column dashboard">
      <!-- Success/Error Notifications -->
      <div v-if="successMsg" class="notification is-success is-light mb-4">
        <button class="delete" @click="successMsg = null"></button>
        <strong>Success!</strong> {{ successMsg }}
      </div>
      <div v-if="errorMsg" class="notification is-danger is-light mb-4">
        <button class="delete" @click="errorMsg = null"></button>
        <strong>Error:</strong> {{ errorMsg }}
      </div>



      <!-- Header Section -->
      <div class="columns is-multiline is-mobile mb-4">
        <div class="column is-12-mobile is-6-tablet is-4-desktop">
          <h1 class="title is-size-4-mobile is-size-3-tablet">
            <span class="icon-text">
              <span class="icon"><i class="fas fa-link"></i></span>
              <span>My Links</span>
            </span>
          </h1>
          <p class="subtitle is-6 has-text-grey">{{ filteredLinks.length }} link{{ filteredLinks.length !== 1 ? 's' : '' }}</p>
        </div>
        <div class="column is-12-mobile is-6-tablet is-4-desktop">
          <div class="field">
            <div class="control">
              <input class="input" 
                     v-model="searchTerm" 
                     type="text" 
                     placeholder="Type to search links..." 
                     @input="onSearchInput" />
            </div>
          </div>
        </div>
        <div class="column is-12-mobile is-6-tablet is-2-desktop">
          <button class="button is-fullwidth" @click="forceRefresh" :class="{ 'is-loading': refreshing }">
            <span class="icon">
              <i class="fas fa-sync-alt"></i>
            </span>
            <span class="is-hidden-mobile">Refresh</span>
          </button>
        </div>


        <div class="column is-12-mobile is-6-tablet is-2-desktop">
          <button class="button is-fullwidth" @click="toggleModal('create')">
            <span class="icon">
              <i class="fas fa-plus"></i>
            </span>
            <span>Create Link</span>
          </button>
        </div>
      </div>

      <!-- Pagination above table -->
      <nav class="pagination is-centered mb-4" v-if="totalPages > 1">
        <a class="pagination-previous" 
           :disabled="currentPage === 1" 
           @click="previousPage"
           :class="{ 'is-disabled': currentPage === 1 }">
          <span class="icon is-small">
            <i class="fas fa-chevron-left"></i>
          </span>
          <span class="is-hidden-mobile">Previous</span>
        </a>
        <a class="pagination-next" 
           :disabled="currentPage === totalPages" 
           @click="nextPage"
           :class="{ 'is-disabled': currentPage === totalPages }">
          <span class="is-hidden-mobile">Next</span>
          <span class="icon is-small">
            <i class="fas fa-chevron-right"></i>
          </span>
        </a>
        <ul class="pagination-list">
          <!-- First page -->
          <li v-if="currentPage > 3">
            <a class="pagination-link" @click="goToPage(1)">1</a>
          </li>
          <li v-if="currentPage > 4">
            <span class="pagination-ellipsis">&hellip;</span>
          </li>
          
          <!-- Pages around current -->
          <li v-for="page in visiblePages" :key="page">
            <a class="pagination-link" 
               :class="{ 'is-current': currentPage === page }"
               @click="goToPage(page)">{{ page }}</a>
          </li>
          
          <!-- Last page -->
          <li v-if="currentPage < totalPages - 3">
            <span class="pagination-ellipsis">&hellip;</span>
          </li>
          <li v-if="currentPage < totalPages - 2">
            <a class="pagination-link" @click="goToPage(totalPages)">{{ totalPages }}</a>
          </li>
        </ul>
        
        <!-- Page info -->
        <div class="pagination-info has-text-grey is-size-7 mt-2">
          Showing {{ startItem }}-{{ endItem }} of {{ filteredLinks.length }} links
        </div>
      </nav>
      <!-- Links Table -->
      <div class="table-container">
        <table class="table is-fullwidth is-striped">
        <thead>
          <tr>
            <th>#</th>
            <th>ID</th>
            <th>URL</th>
            <th>Folder</th>
            <th>Remark</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(link, idx) in paginatedLinks" :key="link.id">
            <td>{{ idx + 1 + (currentPage - 1) * pageSize }}</td>
            <td>
              {{ link.id }}
              <button class="button is-small is-white ml-2" @click="copyShort(link.id)">📋</button>
            </td>
            <td class="wrap-text">
              <a :href="link.url" target="_blank">{{ link.url }}</a>
              <button class="button is-small is-white ml-2" @click="copy(link.url)">📋</button>
            </td>
            <td>{{ link.folder }}</td>
            <td>{{ link.remark }}</td>
            <td>
              <button class="button is-small" @click="editLink(link)">Edit</button>
              <button class="button is-small is-danger" @click="deleteLink(link.id)">Delete</button>
            </td>
          </tr>
        </tbody>
        </table>
      </div>

      <!-- Modal -->
      <div v-if="modalIsActive" class="modal is-active">
        <div class="modal-background" @click="toggleModal()"></div>
        <div class="modal-content">
          <div class="box">
            <h2 class="subtitle">{{ isEditMode ? 'Edit Shortcut' : 'New Shortcut' }}</h2>
            <form @submit.prevent="createLink">
              <div class="field">
                <label class="label">ID</label>
                <input class="input" v-model="model.id" :readonly="isEditMode" required />
                <p v-if="idExists && !isEditMode" class="help is-danger">This ID already exists.</p>
              </div>

              <div class="field">
                <label class="label">URL</label>
                <input class="input" v-model="model.url" type="url" required />
                <p v-if="model.url && !isValidUrl(model.url)" class="help is-danger">Invalid URL.</p>
              </div>

              <div class="field">
                <label class="label">Folder</label>
                <input class="input" v-model="model.folder" />
              </div>

              <div class="field">
                <label class="label">Remark</label>
                <input class="input" v-model="model.remark" />
              </div>

              <div class="field is-grouped">
                <div class="control">
                  <button class="button" type="submit"
                    :disabled="!model.id || !model.url || (!isEditMode && idExists) || !isValidUrl(model.url)">
                    {{ isEditMode ? 'Update' : 'Create' }}
                  </button>
                </div>
                <div class="control">
                  <button class="button is-light" type="button" @click="toggleModal()">Cancel</button>
                </div>
              </div>
            </form>
          </div>
        </div>
        <button class="modal-close is-large" @click="toggleModal()" aria-label="close"></button>
      </div>
    </div>
  </div>
</template>

<script>


// Set Cognito Vars for logout
const clientId = process.env.VUE_APP_CLIENT_ID;
const authDomain = process.env.VUE_APP_AUTH_DOMAIN;
const redUrl = window.location.origin;

// Helper to generate IST timestamp in "YYYY-MM-DD HH:mm:ss +0530"
function getISTTimestamp() {
  const now = new Date();
  // IST is UTC+5:30, so add that offset to current UTC time
  const offset = 5.5 * 60; // in minutes
  const istTime = new Date(now.getTime() + (offset + now.getTimezoneOffset()) * 60000);
  const pad = n => n < 10 ? '0' + n : n;
  return istTime.getFullYear() + '-' +
         pad(istTime.getMonth() + 1) + '-' +
         pad(istTime.getDate()) + ' ' +
         pad(istTime.getHours()) + ':' +
         pad(istTime.getMinutes()) + ':' +
         pad(istTime.getSeconds()) +
         ' +0530';
}

export default {
  data() {
    return {
      searchTerm: "",
      modalIsActive: false,
      model: { id: "", url: "", folder: "", remark: "" },
      isEditMode: false,
      selectedFolder: "",
      currentPage: 1,
      pageSize: 20,
      successMsg: null,
      errorMsg: null,
      showSidebar: false,
      refreshing: false
    };
  },
  computed: {
    folderList() {
      const folders = this.$store.state.links.map(l => l.folder || "").filter(Boolean);
      return [...new Set(folders)].sort();
    },
    filteredLinks() {
      let arr = this.$store.state.links;
      
      // Apply folder filter first
      if (this.selectedFolder) {
        arr = arr.filter(link => (link.folder || "") === this.selectedFolder);
      }
      
      // Apply search filter with optimized search
      if (this.searchTerm && this.searchTerm.trim()) {
        const term = this.searchTerm.toLowerCase().trim();
        arr = arr.filter(link => {
          // Fast string matching - check most common fields first
          return (
            link.id.toLowerCase().includes(term) ||
            (link.url && link.url.toLowerCase().includes(term)) ||
            (link.folder && link.folder.toLowerCase().includes(term)) ||
            (link.remark && link.remark.toLowerCase().includes(term))
          );
        });
      }
      
      return arr;
    },
    paginatedLinks() {
      const start = (this.currentPage - 1) * this.pageSize;
      return this.filteredLinks.slice(start, start + this.pageSize);
    },
    totalPages() {
      return Math.ceil(this.filteredLinks.length / this.pageSize);
    },
    visiblePages() {
      const pages = [];
      const start = Math.max(1, this.currentPage - 2);
      const end = Math.min(this.totalPages, this.currentPage + 2);
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      return pages;
    },
    startItem() {
      return (this.currentPage - 1) * this.pageSize + 1;
    },
    endItem() {
      return Math.min(this.currentPage * this.pageSize, this.filteredLinks.length);
    },
    idExists() {
      if (!this.model.id || this.isEditMode) return false;
      return this.$store.state.links.some(link => link.id === this.model.id);
    }
  },
  created() {
    this.fetchLinks();
  },

  methods: {
    toggleModal(mode) {
      this.modalIsActive = !this.modalIsActive;
      if (!this.modalIsActive) this.model = { id: "", url: "", folder: "", remark: "" };
      this.isEditMode = (mode === 'edit');
    },
    isValidUrl(url) {
      try {
        const u = new URL(url);
        return u.protocol === "http:" || u.protocol === "https:";
      } catch {
        return false;
      }
    },
    copy(text) {
      navigator.clipboard.writeText(text).then(() => {
        this.successMsg = "Link copied to clipboard";
        setTimeout(() => (this.successMsg = null), 3000);
      }).catch(() => {
        this.errorMsg = "Failed to copy link";
        setTimeout(() => (this.errorMsg = null), 3000);
      });
    },
    copyShort(id) {
      const shortUrl = `https://r.wecare.digital/${id}`;
      navigator.clipboard.writeText(shortUrl).then(() => {
        this.successMsg = `Short link copied: r.wecare.digital/${id}`;
        setTimeout(() => (this.successMsg = null), 3000);
      }).catch(() => {
        this.errorMsg = "Failed to copy short link";
        setTimeout(() => (this.errorMsg = null), 3000);
      });
    },
    async createLink() {
      // Safe trim for all fields
      this.model.id = (this.model.id || '').trim();
      this.model.url = (this.model.url || '').trim();
      this.model.folder = (this.model.folder || '').trim();
      this.model.remark = (this.model.remark || '').trim();

      if (!this.model.id || !this.model.url) {
        alert("ID and URL cannot be empty.");
        return;
      }

      if (this.isEditMode) {
        await this.updateLink();
        return;
      }

      // Check for duplicate ID in local store first (faster and no API call)
      if (this.$store.state.links.some(link => link.id === this.model.id)) {
        this.errorMsg = `ID "${this.model.id}" already exists. Please choose a different ID.`;
        setTimeout(() => (this.errorMsg = null), 5000);
        return;
      }

      const payload = { 
        ...this.model, 
        owner: "r@wecare.digital",
        timestamp: getISTTimestamp()
      };

      try {
        const token = window.localStorage.getItem("cognitoIdentityToken");
        console.log('Creating link with token:', token ? 'Token exists' : 'No token');
        
        const response = await fetch("https://xbj96ig388.execute-api.ap-south-1.amazonaws.com/Prod/app", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token
          },
          body: JSON.stringify(payload)
        });
        if (response.ok) {
          // Add to store immediately
          this.$store.commit("addLink", payload);
          this.toggleModal();
          this.successMsg = `Link created: r.wecare.digital/${payload.id}`;
          setTimeout(() => (this.successMsg = null), 5000);
          
          // Simple refresh after creation
          setTimeout(() => {
            this.fetchLinks();
          }, 1000);
        } else {
          if (response.status === 403) {
            this.errorMsg = "Session expired. Please refresh the page and try again.";
            setTimeout(() => {
              window.location.reload();
            }, 2000);
          } else {
            const errorText = await response.text();
            let errorMsg = "";
            try {
              const error = JSON.parse(errorText);
              errorMsg = error.message || errorText || response.statusText;
            } catch (e) {
              errorMsg = errorText || response.statusText;
            }
            this.errorMsg = `Failed to create link: ${errorMsg}`;
            setTimeout(() => (this.errorMsg = null), 5000);
          }
        }
      } catch (err) {
        this.errorMsg = "Network error. Please check your connection.";
        setTimeout(() => (this.errorMsg = null), 5000);
        console.error(err);
      }
    },
    async updateLink() {
      const payload = { 
        ...this.model, 
        owner: "r@wecare.digital",
        timestamp: getISTTimestamp()
      };

      try {
        const response = await fetch(`https://xbj96ig388.execute-api.ap-south-1.amazonaws.com/Prod/app/${this.model.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: window.localStorage.getItem("cognitoIdentityToken")
          },
          body: JSON.stringify(payload)
        });
        if (response.ok) {
          // Update in store
          const linkIndex = this.$store.state.links.findIndex(l => l.id === this.model.id);
          if (linkIndex > -1) {
            this.$store.commit("updateLink", { link: payload, ind: linkIndex });
          }
          this.toggleModal();
          this.successMsg = `Link updated: r.wecare.digital/${payload.id}`;
          setTimeout(() => (this.successMsg = null), 5000);
          
          // Refresh the links from server to ensure consistency
          setTimeout(() => {
            this.fetchLinks();
          }, 1000);
        } else {
          const errorText = await response.text();
          let errorMsg = "";
          try {
            const error = JSON.parse(errorText);
            errorMsg = error.message || errorText || response.statusText;
          } catch (e) {
            errorMsg = errorText || response.statusText;
          }
          this.errorMsg = `Failed to update link: ${errorMsg}`;
          setTimeout(() => (this.errorMsg = null), 5000);
        }
      } catch (err) {
        this.errorMsg = "Network error. Please check your connection.";
        setTimeout(() => (this.errorMsg = null), 5000);
        console.error(err);
      }
    },
    async deleteLink(id) {
      id = (id || '').trim();
      if (!id) {
        alert("Invalid ID.");
        return;
      }
      if (!confirm("Are you sure you want to delete this link?")) return;
      try {
        const response = await fetch(`https://xbj96ig388.execute-api.ap-south-1.amazonaws.com/Prod/app/${id}`, {
          method: "DELETE",
          headers: {
            Authorization: window.localStorage.getItem("cognitoIdentityToken")
          }
        });
        if (response.ok) {
          const ind = this.$store.state.links.findIndex(l => l.id === id);
          if (ind > -1) this.$store.commit("removeLink", ind);
          this.successMsg = "Link deleted successfully";
          setTimeout(() => (this.successMsg = null), 3000);
        } else {
          const errorText = await response.text();
          let errorMsg = "";
          try {
            const error = JSON.parse(errorText);
            errorMsg = error.message || errorText || response.statusText;
          } catch (e) {
            errorMsg = errorText || response.statusText;
          }
          this.errorMsg = `Failed to delete link: ${errorMsg}`;
          setTimeout(() => (this.errorMsg = null), 5000);
        }
      } catch (err) {
        this.errorMsg = "Network error while deleting. Please try again.";
        setTimeout(() => (this.errorMsg = null), 5000);
        console.error(err);
      }
    },
    editLink(link) {
      this.model = { ...link };
      this.toggleModal('edit');
    },
    selectFolder(folder) {
      this.selectedFolder = folder;
      this.currentPage = 1;
      // Close sidebar on mobile after selection
      if (window.innerWidth <= 768) {
        this.showSidebar = false;
      }
    },

    goToPage(n) {
      this.currentPage = n;
      // Scroll to top on page change
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    previousPage() {
      if (this.currentPage > 1) {
        this.currentPage--;
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    },
    nextPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage++;
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    },
    async fetchLinks() {
      try {
        const token = window.localStorage.getItem("cognitoIdentityToken");
        
        console.log('fetchLinks - Token check:', token ? 'Token exists' : 'No token', 'Length:', token?.length);
        
        if (!token || token === 'null') {
          this.errorMsg = "Please sign in to view your links.";
          setTimeout(() => (this.errorMsg = null), 5000);
          return;
        }
        
        const response = await fetch("https://xbj96ig388.execute-api.ap-south-1.amazonaws.com/Prod/app", {
          method: "GET",
          headers: {
            "Authorization": token,
            "Content-Type": "application/json"
          }
        });
        
        console.log('fetchLinks response status:', response.status);
        
        if (response.ok) {
          const data = await response.json();
          
          console.log('=== FETCH LINKS DEBUG ===');
          console.log('Raw response data:', data);
          console.log('Data type:', typeof data);
          console.log('Is array:', Array.isArray(data));
          if (data) {
            console.log('Data keys:', Object.keys(data));
            if (data.Items) {
              console.log('Items found:', data.Items.length);
              console.log('First item:', data.Items[0]);
            }
          }
          
          // Handle DynamoDB Query API response format
          // According to AWS DynamoDB API docs, Query returns: { Items: [...], Count: n, ScannedCount: n }
          let linksArray = [];
          
          if (data && data.Items && Array.isArray(data.Items)) {
            console.log('✅ Using data.Items format');
            linksArray = data.Items;
          } else if (Array.isArray(data)) {
            console.log('✅ Using direct array format');
            linksArray = data;
          } else if (data && data.body) {
            console.log('✅ Checking data.body format');
            const bodyData = typeof data.body === 'string' ? JSON.parse(data.body) : data.body;
            if (bodyData && bodyData.Items && Array.isArray(bodyData.Items)) {
              console.log('✅ Using bodyData.Items format');
              linksArray = bodyData.Items;
            } else if (Array.isArray(bodyData)) {
              console.log('✅ Using bodyData array format');
              linksArray = bodyData;
            }
          } else if (data && typeof data === 'object' && !Array.isArray(data)) {
            console.log('⚠️ Single object, converting to array');
            linksArray = [data];
          }
          
          console.log('Final linksArray:', linksArray);
          console.log('Links count:', linksArray.length);
          console.log('=== END DEBUG ===');
          
          this.$store.commit("hydrateLinks", linksArray);
          
        } else {
          if (response.status === 401 || response.status === 403) {
            console.error('Authentication error - attempting page reload to refresh token');
            this.errorMsg = "Session expired. Refreshing...";
            setTimeout(() => {
              window.location.reload();
            }, 1500);
          } else if (response.status === 404) {
            this.$store.commit("hydrateLinks", []);
          } else {
            this.errorMsg = `Failed to load links. Please try refreshing.`;
          }
          setTimeout(() => (this.errorMsg = null), 5000);
        }
      } catch (err) {
        this.$store.commit("drainLinks");
        this.errorMsg = "Network error. Please check your connection.";
        setTimeout(() => (this.errorMsg = null), 5000);
      }
    },
    logout() {
      localStorage.setItem("cognitoIdentityToken", null);
      localStorage.setItem("cognitoRefreshToken", null);
      const logOutUrl = `${authDomain}/logout?client_id=${clientId}&logout_uri=${redUrl}`;
      window.location.href = logOutUrl;
    },
    onSearchInput() {
      // Reset to first page when searching
      this.currentPage = 1;
    },
    async checkIdExists(id) {
      try {
        const token = window.localStorage.getItem("cognitoIdentityToken");
        console.log('Checking ID exists with token:', token ? 'Token exists' : 'No token');
        
        const response = await fetch(`https://xbj96ig388.execute-api.ap-south-1.amazonaws.com/Prod/app/${id}`, {
          method: "GET",
          headers: {
            Authorization: token
          }
        });
        
        console.log('checkIdExists response status:', response.status);
        
        if (response.status === 403) {
          console.error('403 Forbidden - Token might be expired or invalid');
          this.errorMsg = "Authentication error. Please refresh the page and try again.";
          setTimeout(() => (this.errorMsg = null), 5000);
          return false;
        }
        
        return response.ok; // If 200, ID exists; if 404, ID doesn't exist
      } catch (err) {
        console.error('checkIdExists error:', err);
        return false; // On error, allow creation
      }
    },
    async forceRefresh() {
      this.refreshing = true;
      console.log('Force refresh started...');
      
      try {
        // Clear current links first
        this.$store.commit("drainLinks");
        console.log('Links drained from store');
        
        // Wait a moment then fetch
        await new Promise(resolve => setTimeout(resolve, 500));
        await this.fetchLinks();
        
        console.log('After fetchLinks, store has:', this.$store.state.links.length, 'links');
        
        this.successMsg = `Refreshed! Found ${this.$store.state.links.length} links.`;
        setTimeout(() => (this.successMsg = null), 3000);
        
        // Force Vue to update
        this.$forceUpdate();
        
      } catch (err) {
        console.error("Force refresh failed:", err);
        this.errorMsg = "Refresh failed. Please try again.";
        setTimeout(() => (this.errorMsg = null), 3000);
      } finally {
        this.refreshing = false;
        console.log('Force refresh completed');
      }
    }
}
}
</script>

<style scoped>
/* Mobile Menu Toggle */
.mobile-menu-toggle {
  position: fixed;
  top: 20px;
  left: 15px;
  z-index: 1000;
  background: white;
  border-radius: 20px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  padding: 0.5rem;
}

/* Sidebar */
.sidebar-folders {
  height: 100vh;
  position: relative;
  padding: 1rem;
  background-color: #fafafa;
}

.mobile-close {
  float: right;
}

.menu-label {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.menu-list a {
  display: flex;
  align-items: center;
  gap: 8px;
}

.menu-list .icon {
  width: 16px;
  min-width: 16px;
}

/* Dashboard */
.dashboard {
  padding: 2rem;
  background-color: #f8f9fa;
  min-height: 100vh;
}

/* Table Styles - Enhanced with rounded corners */
.table {
  border-collapse: separate;
  border-spacing: 0;
  width: 100%;
  background: white;
  margin-bottom: 0;
}

.wrap-text {
  word-break: break-word;
  white-space: normal;
  max-width: 200px;
}

.wrap-text {
  word-break: break-word;
  white-space: normal;
  max-width: 200px;
}

/* Pagination Styles */
.pagination-info {
  text-align: center;
  margin-top: 1rem;
  padding: 0.75rem;
  background-color: #f8f9fa;
  border-radius: 15px;
  border: 2px solid #e9ecef;
  font-weight: 500;
}

.pagination-link.is-disabled,
.pagination-previous.is-disabled,
.pagination-next.is-disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}

/* Mobile Responsiveness */
@media screen and (max-width: 768px) {
  .sidebar-folders {
    position: fixed;
    top: 0;
    left: 0;
    width: 300px;
    z-index: 999;
    background: #fafafa;
    box-shadow: 4px 0 20px rgba(0,0,0,0.15);
    transform: translateX(-100%);
    transition: transform 0.3s ease;
    border-radius: 0 30px 30px 0;
  }
  
  .sidebar-folders:not(.is-hidden-mobile) {
    transform: translateX(0);
  }
  
  .dashboard {
    padding: 0.5rem;
    margin-top: 0;
  }
  
  .table-container {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }
  
  .table {
    min-width: 600px;
  }
  
  .table th,
  .table td {
    padding: 0.5rem;
    font-size: 0.875rem;
  }
  
  .wrap-text {
    max-width: 150px;
  }
  
  .button.is-small {
    font-size: 0.75rem;
    padding: 0.25rem 0.5rem;
  }
  
  /* Mobile pagination */
  .pagination-list {
    flex-wrap: wrap;
    justify-content: center;
  }
  
  .pagination-list li {
    margin: 0.125rem;
  }
  
  .pagination-link {
    min-width: 2.5rem;
    height: 2.5rem;
  }
  
  /* Hide some pagination elements on very small screens */
  .pagination-ellipsis {
    display: none;
  }
}

@media screen and (max-width: 480px) {
  .table {
    min-width: 500px;
  }
  
  .wrap-text {
    max-width: 120px;
  }
  
  .dashboard {
    padding: 0.25rem;
  }
  
  /* Stack columns on very small screens */
  .columns.is-mobile .column {
    padding: 0.25rem;
  }
  
  /* Smaller buttons on mobile */
  .button {
    font-size: 0.875rem;
  }
  
  .title.is-size-4-mobile {
    font-size: 1.25rem !important;
  }
  
  /* Mobile-friendly pagination */
  .pagination {
    flex-wrap: wrap;
  }
  
  .pagination-previous,
  .pagination-next {
    margin-bottom: 0.5rem;
  }
}

/* Logout link styling */
.logout-link {
  color: #e53e3e !important;
}

.logout-link:hover {
  background-color: #fed7d7 !important;
  color: #c53030 !important;
}

.logout-link .icon {
  color: #e53e3e !important;
}

.logout-link:hover .icon {
  color: #c53030 !important;
}

/* Fast search input styling */
.input[placeholder*="search"] {
  transition: all 0.2s ease !important;
  border: 2px solid #e2e8f0 !important;
}

.input[placeholder*="search"]:focus {
  border-color: #000000 !important;
  box-shadow: 0 0 0 0.125em rgba(0, 0, 0, 0.25) !important;
  transform: scale(1.02) !important;
}

.input[placeholder*="search"]:not(:placeholder-shown) {
  border-color: #48c774 !important;
  background-color: #f0fff4 !important;
}
</style>
