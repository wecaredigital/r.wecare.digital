<template>
  <div class="columns is-mobile">
    <!-- Mobile Menu Toggle -->
    <div class="mobile-menu-toggle is-hidden-tablet">
      <button class="hamburger-btn" @click="showSidebar = !showSidebar">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="3" y1="8" x2="21" y2="8"></line>
          <line x1="3" y1="16" x2="21" y2="16"></line>
        </svg>
      </button>
    </div>

    <!-- Sidebar -->
    <div class="column is-12-mobile is-2-tablet is-narrow sidebar-folders" 
         :class="{ 'is-hidden-mobile': !showSidebar }">
      <aside class="menu">
        <div class="menu-header">
          <button class="mobile-close is-hidden-tablet" @click="showSidebar = false">
            <span>✕</span>
          </button>
        </div>
        
        <!-- All Links Button -->
        <ul class="menu-list">
          <li>
            <button :class="['folder-btn', { 'is-active': selectedFolder === '' }]" @click="selectFolder('')">
              <span class="folder-name">
                <svg class="folder-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="8" y1="6" x2="21" y2="6"></line>
                  <line x1="8" y1="12" x2="21" y2="12"></line>
                  <line x1="8" y1="18" x2="21" y2="18"></line>
                  <line x1="3" y1="6" x2="3.01" y2="6"></line>
                  <line x1="3" y1="12" x2="3.01" y2="12"></line>
                  <line x1="3" y1="18" x2="3.01" y2="18"></line>
                </svg>
                All Links
              </span>
              <span class="folder-count">{{ storeLinks.length }}</span>
            </button>
          </li>
        </ul>

        <!-- Folders Dropdown -->
        <div class="folders-section">
          <button class="folder-dropdown-toggle" @click="foldersExpanded = !foldersExpanded">
            <span class="folder-name">
              <svg class="folder-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
              </svg>
              Folders
            </span>
            <svg class="chevron-icon" :class="{ 'expanded': foldersExpanded }" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>
          
          <ul class="menu-list folder-list" v-show="foldersExpanded">
            <li v-for="folder in folderList" :key="folder">
              <button :class="['folder-btn folder-item', { 'is-active': selectedFolder === folder }]" @click="selectFolder(folder)">
                <span class="folder-name">
                  <svg class="folder-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                  </svg>
                  {{ folder }}
                </span>
                <span class="folder-count">{{ getFolderCount(folder) }}</span>
              </button>
            </li>
          </ul>
        </div>

        <!-- Sign Out Button -->
        <ul class="menu-list signout-section">
          <li>
            <button @click="logout" class="folder-btn btn-signout">
              <span>Sign Out</span>
            </button>
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
      <div class="header-card mb-5">
        <div class="columns is-multiline is-mobile is-vcentered">
          <div class="column is-12-mobile is-6-tablet is-4-desktop">
            <h1 class="brand-title">WECARE.DIGITAL</h1>
            <p class="link-count">
              <svg class="data-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
              </svg>
              Total links: {{ filteredLinks.length }}
            </p>
          </div>
          <div class="column is-12-mobile is-6-tablet is-4-desktop">
            <div class="field">
              <div class="control">
                <input class="input search-input" 
                       v-model="searchTerm" 
                       type="text" 
                       placeholder="Search" 
                       @input="onSearchInput" />
              </div>
            </div>
          </div>
          <div class="column is-12-mobile is-6-tablet is-2-desktop">
            <button class="button is-fullwidth btn-standard btn-refresh" @click="forceRefresh" :class="{ 'is-loading': refreshing }">
              <span class="is-hidden-mobile">Refresh</span>
              <span class="is-hidden-tablet">Refresh</span>
            </button>
          </div>
          <div class="column is-12-mobile is-6-tablet is-2-desktop">
            <button class="button is-fullwidth btn-standard btn-create" @click="toggleModal('create')">
              <span>Create Link</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Pagination above table -->
      <nav class="pagination is-centered mb-4" v-if="totalPages > 1">
        <button class="pagination-previous btn-standard" 
           :disabled="currentPage === 1" 
           @click="previousPage"
           :class="{ 'is-disabled': currentPage === 1 }">
          <span>Previous</span>
        </button>
        <button class="pagination-next btn-standard" 
           :disabled="currentPage === totalPages" 
           @click="nextPage"
           :class="{ 'is-disabled': currentPage === totalPages }">
          <span>Next</span>
        </button>
        <ul class="pagination-list">
          <!-- First page -->
          <li v-if="currentPage > 3">
            <button class="pagination-link btn-standard" @click="goToPage(1)">1</button>
          </li>
          <li v-if="currentPage > 4">
            <span class="pagination-ellipsis">&hellip;</span>
          </li>
          
          <!-- Pages around current -->
          <li v-for="page in visiblePages" :key="page">
            <button class="pagination-link btn-standard" 
               :class="{ 'is-current': currentPage === page }"
               @click="goToPage(page)">{{ page }}</button>
          </li>
          
          <!-- Last page -->
          <li v-if="currentPage < totalPages - 3">
            <span class="pagination-ellipsis">&hellip;</span>
          </li>
          <li v-if="currentPage < totalPages - 2">
            <button class="pagination-link btn-standard" @click="goToPage(totalPages)">{{ totalPages }}</button>
          </li>
        </ul>
        
        <!-- Page info -->
        <div class="pagination-info">
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
              <button class="btn-copy" @click="copyShort(link.id)">📋</button>
            </td>
            <td class="wrap-text">
              <a :href="link.url" target="_blank">{{ link.url }}</a>
              <button class="btn-copy" @click="copy(link.url)">📋</button>
            </td>
            <td>{{ link.folder }}</td>
            <td>{{ link.remark }}</td>
            <td class="action-buttons">
              <button class="btn-action" @click="editLink(link)" title="Edit link">
                <i class="fas fa-pen"></i>
              </button>
              <button class="btn-action" @click="deleteLink(link.id)" title="Delete link">
                <i class="fas fa-trash-alt"></i>
              </button>
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
                <p v-if="idExists && !isEditMode" class="help is-error">This ID is already in use. Please enter a unique ID.</p>
              </div>

              <div class="field">
                <label class="label">URL</label>
                <input class="input" v-model="model.url" type="url" required />
                <p v-if="model.url && !isValidUrl(model.url)" class="help is-error">This URL isn't valid. Please enter a complete URL starting with http:// or https://</p>
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
                  <button class="btn-standard" type="submit"
                    :disabled="!model.id || !model.url || (!isEditMode && idExists) || !isValidUrl(model.url)">
                    {{ isEditMode ? 'Update' : 'Create' }}
                  </button>
                </div>
                <div class="control">
                  <button class="btn-standard" type="button" @click="toggleModal()">Cancel</button>
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

// Helper to get user email from JWT token
// Each user sees only their own links
function getOwnerEmail() {
  const token = window.localStorage.getItem("cognitoIdentityToken");
  if (!token || token === 'null') return null;
  
  try {
    // JWT format: header.payload.signature
    const payload = token.split('.')[1];
    const decoded = JSON.parse(atob(payload));
    return decoded.email || null;
  } catch (err) {
    console.error('Error decoding token:', err);
    return null;
  }
}

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
      refreshing: false,
      foldersExpanded: true
    };
  },
  computed: {
    storeLinks() {
      // Direct reference to store links for reactivity
      return this.$store.state.links;
    },
    folderList() {
      const folders = this.storeLinks.map(l => l.folder || "").filter(Boolean);
      return [...new Set(folders)].sort();
    },
    filteredLinks() {
      let arr = this.storeLinks;
      
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
  
  mounted() {
    // Set browser title
    document.title = 'WECARE.DIGITAL';
  },
  
  watch: {
    storeLinks: {
      handler(newLinks) {
        console.log('Store links changed! New count:', newLinks.length);
        console.log('Filtered links:', this.filteredLinks.length);
        console.log('Paginated links:', this.paginatedLinks.length);
      },
      deep: true
    }
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

      const ownerEmail = getOwnerEmail();
      if (!ownerEmail) {
        this.errorMsg = "Unable to get owner email. Please sign in again.";
        setTimeout(() => (this.errorMsg = null), 5000);
        return;
      }

      const payload = { 
        ...this.model, 
        owner: ownerEmail,
        timestamp: getISTTimestamp()
      };

      try {
        const token = window.localStorage.getItem("cognitoIdentityToken");
        
        const response = await fetch("https://xbj96ig388.execute-api.ap-south-1.amazonaws.com/Prod/app", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token
          },
          body: JSON.stringify(payload)
        });
        if (response.ok) {
          console.log('Link created successfully:', payload.id);
          this.toggleModal();
          this.successMsg = `Link created: r.wecare.digital/${payload.id}`;
          setTimeout(() => (this.successMsg = null), 5000);
          
          // Fetch links immediately to get the saved data
          console.log('Fetching links after creation...');
          await this.fetchLinks();
          console.log('Links fetched, store now has:', this.$store.state.links.length);
        } else {
          const errorText = await response.text();
          let errorMsg = "";
          try {
            const error = JSON.parse(errorText);
            errorMsg = error.message || errorText || response.statusText;
          } catch (e) {
            errorMsg = errorText || response.statusText;
          }
          
          if (response.status === 403) {
            this.errorMsg = "Session expired. Please sign out and sign in again.";
          } else {
            this.errorMsg = `Failed to create link: ${errorMsg}`;
          }
          setTimeout(() => (this.errorMsg = null), 5000);
        }
      } catch (err) {
        this.errorMsg = "Network error. Please check your connection.";
        setTimeout(() => (this.errorMsg = null), 5000);
        console.error(err);
      }
    },
    async updateLink() {
      const ownerEmail = getOwnerEmail();
      if (!ownerEmail) {
        this.errorMsg = "Unable to get owner email. Please sign in again.";
        setTimeout(() => (this.errorMsg = null), 5000);
        return;
      }

      const payload = { 
        ...this.model, 
        owner: ownerEmail,
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
          
          console.log('fetchLinks response:', data);
          
          // API Gateway response mapping template returns a direct array format:
          // [ { "id": "...", "url": "...", "timestamp": "...", "owner": "...", "remark": "..." }, ... ]
          let linksArray = [];
          
          if (Array.isArray(data)) {
            // Direct array format from API Gateway mapping template (CORRECT FORMAT)
            console.log('Using direct array format, count:', data.length);
            linksArray = data;
          } else if (data && data.Items && Array.isArray(data.Items)) {
            // DynamoDB raw format (fallback)
            console.log('Using data.Items format, count:', data.Items.length);
            linksArray = data.Items;
          } else if (data && data.body) {
            // Lambda proxy format (fallback)
            const bodyData = typeof data.body === 'string' ? JSON.parse(data.body) : data.body;
            if (Array.isArray(bodyData)) {
              console.log('Using bodyData array format, count:', bodyData.length);
              linksArray = bodyData;
            } else if (bodyData && bodyData.Items && Array.isArray(bodyData.Items)) {
              console.log('Using bodyData.Items format, count:', bodyData.Items.length);
              linksArray = bodyData.Items;
            }
          } else if (data && typeof data === 'object' && !Array.isArray(data)) {
            // Single object (fallback)
            console.log('Single object, converting to array');
            linksArray = [data];
          }
          
          console.log('Committing to store:', linksArray.length, 'links');
          
          // Debug: Log first item to verify folder and remark
          if (linksArray.length > 0) {
            console.log('Sample link data:', linksArray[0]);
            console.log('Has folder?', 'folder' in linksArray[0], 'Value:', linksArray[0].folder);
            console.log('Has remark?', 'remark' in linksArray[0], 'Value:', linksArray[0].remark);
          }
          
          this.$store.commit("hydrateLinks", linksArray);
          console.log('Store now has:', this.$store.state.links.length, 'links');
          
        } else {
          if (response.status === 401 || response.status === 403) {
            console.error('Authentication error - token may be expired');
            this.errorMsg = "Session expired. Please sign out and sign in again.";
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

    async forceRefresh() {
      this.refreshing = true;
      
      try {
        // Clear current links first
        this.$store.commit("drainLinks");
        
        // Wait a moment then fetch
        await new Promise(resolve => setTimeout(resolve, 500));
        await this.fetchLinks();
        
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
      }
    },
    
    getFolderCount(folder) {
      return this.storeLinks.filter(link => (link.folder || "") === folder).length;
    }
}
}
</script>

<style scoped>
/* ===== GLOBAL THEME ===== */
* {
  font-family: 'Helvetica Light', 'Helvetica Neue', Helvetica, Arial, sans-serif;
  font-size: 14px;
  font-weight: 300;
}

/* Mobile Menu Toggle */
.mobile-menu-toggle {
  position: fixed;
  top: 20px;
  left: 15px;
  z-index: 1000;
  background: transparent;
  border: none;
  padding: 0;
}

.hamburger-btn {
  background: transparent;
  border: none;
  padding: 0.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.hamburger-btn svg {
  width: 24px;
  height: 24px;
  stroke: #000000;
  stroke-width: 2;
}

/* ===== SIDEBAR ===== */
.sidebar-folders {
  height: 100vh;
  position: relative;
  padding: 1.5rem 1rem;
  background: #FFFFFF;
  border-right: 1px solid #FFFFFF;
}

.mobile-close {
  background: #000000;
  color: #FFFFFF;
  border: 1px solid #000000;
  border-radius: 30px;
  padding: 0.5rem 1rem;
  cursor: pointer;
  margin-left: auto;
}

.menu-header {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-bottom: 1rem;
}

.menu-label {
  color: #000000;
  font-size: 14px;
  font-weight: 300;
  margin-bottom: 1rem;
}

/* Folders Dropdown */
.folders-section {
  margin-bottom: 1rem;
}

.folder-dropdown-toggle {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  background: #000000;
  color: #FFFFFF;
  border: 1px solid #000000;
  border-radius: 30px;
  padding: 0.75rem 1.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 14px;
  font-weight: 300;
  margin-bottom: 0.5rem;
}

.folder-dropdown-toggle:hover {
  opacity: 0.8;
}

.chevron-icon {
  width: 16px;
  height: 16px;
  stroke: currentColor;
  transition: transform 0.2s ease;
}

.chevron-icon.expanded {
  transform: rotate(180deg);
}

.folder-list {
  padding-left: 0.5rem;
}

.folder-item {
  font-size: 13px;
  padding: 0.6rem 1rem;
}

/* Folder Buttons */
.menu-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.menu-list li {
  margin-bottom: 0.5rem;
}

.folder-btn {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  background: #000000;
  color: #FFFFFF;
  border: 1px solid #000000;
  border-radius: 30px;
  padding: 0.75rem 1.25rem;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 14px;
  font-weight: 300;
}

.folder-btn:hover {
  opacity: 0.8;
}

.folder-btn.is-active {
  background: #FFFFFF;
  color: #000000;
  border: 1px solid #000000;
}

.folder-name {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.folder-icon {
  width: 16px;
  height: 16px;
  stroke: currentColor;
  flex-shrink: 0;
  stroke-width: 1.5;
}

.folder-count {
  font-size: 14px;
  margin-left: auto;
  padding-left: 1rem;
}

/* Sign Out Button - Primary Style */
.signout-section {
  margin-top: 2rem;
}

.btn-signout {
  background: #000000 !important;
  color: #FFFFFF !important;
  border: 1px solid #000000 !important;
}

.btn-signout:hover {
  opacity: 0.8 !important;
}

/* ===== DASHBOARD MAIN AREA ===== */
.dashboard {
  padding: 2rem;
  background: #FFFFFF;
  min-height: 100vh;
}

/* ===== HEADER CARD ===== */
.header-card {
  background: #FFFFFF;
  border: none;
  padding: 1.5rem 0;
  margin-bottom: 1.5rem;
}

.brand-title {
  color: #000000;
  font-size: 16px;
  font-weight: 300;
  margin-bottom: 0.5rem;
}

.link-count {
  color: #000000;
  font-size: 14px;
  font-weight: 300;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.data-icon {
  width: 16px;
  height: 16px;
  stroke: #000000;
  stroke-width: 1.5;
}

/* ===== SEARCH BAR ===== */
.search-input {
  background: #FFFFFF !important;
  color: #000000 !important;
  border: 1px solid #000000 !important;
  border-radius: 30px !important;
  padding: 0.75rem 1.25rem !important;
  font-size: 14px !important;
  font-weight: 300 !important;
  width: 100%;
}

.search-input::placeholder {
  color: #666666;
  font-size: 14px;
  font-weight: 300;
}

.search-input:focus {
  outline: none;
  border-color: #000000 !important;
  box-shadow: none !important;
}

/* ===== STANDARD BUTTONS ===== */
.btn-standard {
  background: #000000;
  color: #FFFFFF;
  border: 1px solid #000000;
  border-radius: 30px;
  padding: 0.75rem 1.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 14px;
  font-weight: 300;
}

.btn-standard:hover:not(:disabled) {
  opacity: 0.8;
}

.btn-standard:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-standard.is-disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}

/* ===== TABLE STYLES ===== */
.table-container {
  background: #FFFFFF;
  border: 1px solid #000000;
  overflow: hidden;
  margin-bottom: 2rem;
}

.table {
  width: 100%;
  background: #FFFFFF;
  border-collapse: collapse;
  margin: 0;
}

.table thead th {
  background: #FFFFFF;
  color: #000000;
  border-bottom: 1px solid #000000;
  padding: 1rem;
  text-align: left;
  font-size: 14px;
  font-weight: 300;
}

.table tbody td {
  background: #FFFFFF;
  color: #000000;
  border-bottom: 1px solid #000000;
  padding: 1rem;
  font-size: 14px;
  font-weight: 300;
}

.table tbody tr:last-child td {
  border-bottom: none;
}

.table tbody tr:hover {
  background: #F5F5F5;
}

.wrap-text {
  word-break: break-word;
  white-space: normal;
  max-width: 300px;
}

.table a {
  color: #000000;
  text-decoration: underline;
}

.table a:hover {
  opacity: 0.7;
}

/* ===== ACTION BUTTONS (ICON BUTTONS) ===== */
.action-buttons {
  white-space: nowrap;
  display: flex;
  gap: 1rem;
  align-items: center;
}

.btn-action {
  background: transparent;
  color: #000000;
  border: 1px solid #000000;
  border-radius: 30px;
  padding: 0.25rem 0.5rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 16px;
  line-height: 1;
  min-width: 32px;
  min-height: 32px;
}

.btn-action:hover {
  opacity: 0.6;
}

.btn-action i {
  font-size: 16px;
  display: block;
  line-height: 1;
}

/* Copy Button */
.btn-copy {
  background: #FFFFFF;
  color: #000000;
  border: 1px solid #000000;
  border-radius: 30px;
  padding: 0.25rem 0.75rem;
  cursor: pointer;
  margin-left: 0.5rem;
  font-size: 14px;
  transition: all 0.2s ease;
}

.btn-copy:hover {
  background: #000000;
  color: #FFFFFF;
}

/* ===== PAGINATION ===== */
.pagination {
  background: #FFFFFF;
  border: 1px solid #FFFFFF;
  padding: 1.5rem;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 2rem;
}

.pagination-list {
  display: flex;
  list-style: none;
  gap: 0.5rem;
  margin: 0;
  padding: 0;
}

.pagination-link {
  background: #000000;
  color: #FFFFFF;
  border: 1px solid #000000;
  border-radius: 30px;
  padding: 0.5rem 1rem;
  cursor: pointer;
  font-size: 14px;
  font-weight: 300;
  min-width: 40px;
  text-align: center;
}

.pagination-link:hover:not(.is-current) {
  opacity: 0.8;
}

.pagination-link.is-current {
  background: #FFFFFF;
  color: #000000;
  border: 1px solid #000000;
}

.pagination-previous,
.pagination-next {
  background: #000000;
  color: #FFFFFF;
  border: 1px solid #000000;
  border-radius: 30px;
  padding: 0.5rem 1rem;
  cursor: pointer;
  font-size: 14px;
  font-weight: 300;
}

.pagination-previous:hover:not(:disabled),
.pagination-next:hover:not(:disabled) {
  opacity: 0.8;
}

.pagination-ellipsis {
  padding: 0.5rem;
  color: #000000;
  font-size: 14px;
}

.pagination-info {
  width: 100%;
  text-align: center;
  margin-top: 1rem;
  color: #000000;
  font-size: 14px;
  font-weight: 300;
  background: #FFFFFF;
  border: 1px solid #FFFFFF;
  padding: 0.75rem;
}

/* ===== MODAL ===== */
.modal-background {
  background-color: rgba(0, 0, 0, 0.5);
}

.modal-content .box {
  background: #FFFFFF;
  border: 1px solid #000000;
  padding: 2rem;
}

.modal-content .box .subtitle {
  color: #000000;
  font-size: 16px;
  font-weight: 300;
  margin-bottom: 1.5rem;
}

.modal-content .label {
  color: #000000;
  font-size: 14px;
  font-weight: 300;
  margin-bottom: 0.5rem;
}

.modal-content .input {
  background: #FFFFFF;
  color: #000000;
  border: 1px solid #000000;
  border-radius: 30px;
  padding: 0.75rem 1.25rem;
  font-size: 14px;
  font-weight: 300;
  width: 100%;
}

.modal-content .input:focus {
  outline: none;
  border-color: #000000;
  box-shadow: none;
}

.modal-content .input:read-only {
  background: #F5F5F5;
}

.modal-content .help {
  font-size: 14px;
  margin-top: 0.25rem;
}

.modal-content .help.is-error {
  color: #008000;
  font-family: "Helvetica", Arial, sans-serif;
  font-size: 14px;
}

.modal-content .field {
  margin-bottom: 1.5rem;
}

.modal-content .field.is-grouped {
  display: flex;
  gap: 1rem;
}

/* ===== NOTIFICATIONS ===== */
.notification {
  background: #FFFFFF;
  border: 1px solid #000000;
  padding: 1rem;
  margin-bottom: 1rem;
  position: relative;
  font-size: 14px;
  font-weight: 300;
}

.notification.is-success {
  border-color: #00AA00;
  color: #00AA00;
}

.notification.is-danger {
  border-color: #FF0000;
  color: #FF0000;
}

.notification .delete {
  position: absolute;
  right: 0.5rem;
  top: 0.5rem;
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 20px;
}

/* ===== MOBILE RESPONSIVENESS ===== */
@media screen and (max-width: 768px) {
  .sidebar-folders {
    position: fixed;
    top: 0;
    left: 0;
    width: 280px;
    z-index: 999;
    background: #F7F7F7;
    border-right: 1px solid #FFFFFF;
    box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
    transform: translateX(-100%);
    transition: transform 0.3s ease;
    padding-left: 20px;
    padding-right: 20px;
  }
  
  .sidebar-folders:not(.is-hidden-mobile) {
    transform: translateX(0);
  }
  
  .dashboard {
    padding: 1rem;
  }
  
  .header-card {
    padding: 1rem;
  }
  
  .brand-title {
    font-size: 14px;
  }
  
  .table-container {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }
  
  .table {
    min-width: 600px;
  }
  
  .wrap-text {
    max-width: 150px;
  }
  
  .pagination {
    padding: 1rem;
  }
  
  .pagination-list {
    flex-wrap: wrap;
  }
}

@media screen and (max-width: 480px) {
  .dashboard {
    padding: 0.5rem;
  }
  
  .header-card {
    padding: 0.75rem;
  }
  
  .table {
    min-width: 500px;
  }
  
  .wrap-text {
    max-width: 120px;
  }
  
  .btn-standard {
    padding: 0.5rem 1rem;
    font-size: 14px;
  }
  
  .folder-btn {
    padding: 0.5rem 1rem;
    font-size: 14px;
  }
}
</style>
