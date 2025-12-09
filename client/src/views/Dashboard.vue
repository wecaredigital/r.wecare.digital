<template>
  <div class="columns is-mobile">
    <!-- Mobile Menu Toggle -->
    <div class="mobile-menu-toggle is-hidden-tablet">
      <button class="hamburger-btn" @click="showSidebar = !showSidebar" :aria-label="showSidebar ? 'Close navigation menu' : 'Open navigation menu'">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
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
            <button :class="['folder-btn', { 'is-active': selectedFolder === '' }]" @click="selectFolder('')" aria-label="View all links">
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
              <span class="folder-count-badge">{{ storeLinks.length }}</span>
            </button>
          </li>
        </ul>

        <!-- Folders Dropdown -->
        <div class="folders-section" ref="foldersDropdown">
          <button class="folder-dropdown-toggle" @click="toggleFoldersDropdown" aria-label="Toggle folders list" aria-expanded="foldersExpanded">
            <span class="folder-name">
              <svg class="folder-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
              </svg>
              Folders
            </span>
            <svg class="chevron-icon" :class="{ 'expanded': foldersExpanded }" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>
          
          <div class="folder-dropdown-content" v-show="foldersExpanded">
            <div class="folder-search-wrapper">
              <input 
                class="folder-search-input" 
                v-model="folderSearchTerm" 
                type="text" 
                placeholder="Search folders..." 
                @click.stop
                @keydown.esc="closeFoldersDropdown"
              />
            </div>
            
            <!-- Empty state: No folders exist -->
            <div v-if="folderList.length === 0" class="empty-state">
              <svg class="empty-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
              </svg>
              <p class="empty-text">No folders yet</p>
              <p class="empty-subtext">Create a link with a folder to get started</p>
            </div>
            
            <!-- Empty state: No search results -->
            <div v-else-if="filteredFolderList.length === 0" class="empty-state">
              <svg class="empty-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <p class="empty-text">No folders found</p>
              <p class="empty-subtext">Try a different search term</p>
            </div>
            
            <!-- Folder list -->
            <ul v-else class="folder-dropdown-list">
              <li v-for="folder in filteredFolderList" :key="folder" 
                  :class="['folder-dropdown-item', { 'is-active': selectedFolder === folder }]" 
                  @click="selectFolder(folder)">
                <span class="folder-name">
                  <svg class="folder-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                  </svg>
                  {{ folder }}
                </span>
                <span class="folder-count-badge">{{ getFolderCount(folder) }}</span>
              </li>
            </ul>
          </div>
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
    <div class="column dashboard" @click="handleDashboardClick">
      <!-- Toast Notifications Container -->
      <div class="toast-container">
        <transition-group name="toast">
          <div v-for="notification in notifications" :key="notification.id" 
               :class="['toast-notification', `toast-${notification.type}`]">
            <div class="toast-content">
              <svg v-if="notification.type === 'success'" class="toast-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              <svg v-else class="toast-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              <span class="toast-message">{{ notification.message }}</span>
            </div>
            <button class="toast-close" @click="removeNotification(notification.id)">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
            <div class="toast-progress" :style="{ animationDuration: notification.duration + 'ms' }"></div>
          </div>
        </transition-group>
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
              <div class="control has-icons-right">
                <input class="input search-input" 
                       v-model="searchTerm" 
                       type="text" 
                       placeholder="Search links..." 
                       @input="onSearchInput" />
                <button v-if="searchTerm" class="clear-search-btn" @click="clearSearch" title="Clear search">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
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
      <div class="pagination-wrapper" v-if="totalPages > 1">
        <nav class="pagination is-centered mb-4">
          <button class="pagination-previous btn-standard" 
             :disabled="currentPage === 1" 
             @click="previousPage"
             :class="{ 'is-disabled': currentPage === 1 }"
             aria-label="Go to previous page">
            <span>Previous</span>
          </button>
          <button class="pagination-next btn-standard" 
             :disabled="currentPage === totalPages" 
             @click="nextPage"
             :class="{ 'is-disabled': currentPage === totalPages }"
             aria-label="Go to next page">
            <span>Next</span>
          </button>
          <ul class="pagination-list">
            <!-- First page -->
            <li v-if="currentPage > 3">
              <button class="pagination-link btn-standard" @click="goToPage(1)" aria-label="Go to page 1">1</button>
            </li>
            <li v-if="currentPage > 4">
              <span class="pagination-ellipsis">&hellip;</span>
            </li>
            
            <!-- Pages around current -->
            <li v-for="page in visiblePages" :key="page">
              <button class="pagination-link btn-standard" 
                 :class="{ 'is-current': currentPage === page }"
                 @click="goToPage(page)"
                 :aria-label="`Go to page ${page}`"
                 :aria-current="currentPage === page ? 'page' : null">{{ page }}</button>
            </li>
            
            <!-- Last page -->
            <li v-if="currentPage < totalPages - 3">
              <span class="pagination-ellipsis">&hellip;</span>
            </li>
            <li v-if="currentPage < totalPages - 2">
              <button class="pagination-link btn-standard" @click="goToPage(totalPages)" :aria-label="`Go to page ${totalPages}`">{{ totalPages }}</button>
            </li>
          </ul>
          
          <!-- Page info on the right -->
          <div class="pagination-info">
            Showing {{ startItem }}-{{ endItem }} of {{ filteredLinks.length }} links
          </div>
        </nav>
      </div>

      
      <!-- Loading State -->
      <div v-if="isLoading" class="loading-container">
        <div class="loading-spinner"></div>
        <p class="loading-text">Loading links...</p>
      </div>
      
      <!-- Empty State: No links at all -->
      <div v-else-if="storeLinks.length === 0" class="empty-state-large">
        <svg class="empty-icon-large" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
        </svg>
        <h2 class="empty-title">No links yet</h2>
        <p class="empty-description">Create your first short link to get started</p>
        <button class="btn-standard" @click="toggleModal('create')">Create Link</button>
      </div>
      
      <!-- Empty State: No search/filter results -->
      <div v-else-if="filteredLinks.length === 0" class="empty-state-large">
        <svg class="empty-icon-large" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <h2 class="empty-title">No links found</h2>
        <p class="empty-description">Try adjusting your search or filter</p>
        <button class="btn-standard" @click="clearFilters">Clear Filters</button>
      </div>
      
      <!-- Links Table -->
      <div v-else class="table-container">
        <table class="table is-fullwidth is-striped">
        <thead class="sticky-header">
          <tr>
            <th>#</th>
            <th class="sortable" @click="sortBy('id')">
              ID
              <span class="sort-icon" v-if="sortColumn === 'id'">
                <svg v-if="sortDirection === 'asc'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="18 15 12 9 6 15"></polyline>
                </svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </span>
            </th>
            <th class="sortable" @click="sortBy('url')">
              URL
              <span class="sort-icon" v-if="sortColumn === 'url'">
                <svg v-if="sortDirection === 'asc'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="18 15 12 9 6 15"></polyline>
                </svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </span>
            </th>
            <th class="sortable" @click="sortBy('folder')">
              Folder
              <span class="sort-icon" v-if="sortColumn === 'folder'">
                <svg v-if="sortDirection === 'asc'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="18 15 12 9 6 15"></polyline>
                </svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </span>
            </th>
            <th>Remark</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(link, idx) in paginatedLinks" :key="link.id">
            <td>{{ idx + 1 + (currentPage - 1) * pageSize }}</td>
            <td>
              {{ link.id }}
              <button class="btn-copy" @click="copyShort(link.id)" title="Copy short link" aria-label="Copy short link">
                <i class="fas fa-link" aria-hidden="true"></i>
              </button>
            </td>
            <td class="wrap-text">
              <a :href="link.url" target="_blank">{{ link.url }}</a>
              <button class="btn-copy" @click="copy(link.url)" title="Copy URL" aria-label="Copy URL">
                <i class="fas fa-link" aria-hidden="true"></i>
              </button>
            </td>
            <td>{{ link.folder }}</td>
            <td>{{ link.remark }}</td>
            <td class="action-buttons">
              <button class="btn-action" @click="editLink(link)" title="Edit link" aria-label="Edit link">
                <i class="fas fa-pen" aria-hidden="true"></i>
              </button>
              <button class="btn-action" @click="deleteLink(link.id)" title="Delete link" aria-label="Delete link">
                <i class="fas fa-times" aria-hidden="true"></i>
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

              <div class="field folder-autocomplete-field" ref="folderAutocomplete">
                <label class="label">Folder</label>
                <input 
                  class="input" 
                  v-model="model.folder" 
                  @input="onFolderInput"
                  @focus="showFolderSuggestions = true"
                  @keydown.down.prevent="navigateSuggestions(1)"
                  @keydown.up.prevent="navigateSuggestions(-1)"
                  @keydown.enter.prevent="selectSuggestion"
                  @keydown.esc="showFolderSuggestions = false"
                  placeholder="Enter folder name or select existing"
                  autocomplete="off"
                />
                <div v-if="showFolderSuggestions && filteredFolderSuggestions.length > 0" class="folder-suggestions">
                  <div 
                    v-for="(folder, index) in filteredFolderSuggestions" 
                    :key="folder"
                    :class="['folder-suggestion-item', { 'is-highlighted': index === selectedSuggestionIndex }]"
                    @click="selectFolderSuggestion(folder)"
                    @mouseenter="selectedSuggestionIndex = index"
                  >
                    <svg class="suggestion-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                    </svg>
                    {{ folder }}
                    <span class="suggestion-count">{{ getFolderCount(folder) }}</span>
                  </div>
                </div>
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
      showSidebar: false,
      refreshing: false,
      foldersExpanded: true,
      folderSearchTerm: "",
      isLoading: false,
      searchDebounceTimer: null,
      notifications: [],
      notificationIdCounter: 0,
      showFolderSuggestions: false,
      selectedSuggestionIndex: -1,
      sortColumn: null,
      sortDirection: 'asc'
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
    filteredFolderList() {
      if (!this.folderSearchTerm || !this.folderSearchTerm.trim()) {
        return this.folderList;
      }
      const term = this.folderSearchTerm.toLowerCase().trim();
      return this.folderList.filter(folder => 
        folder.toLowerCase().includes(term)
      );
    },
    filteredFolderSuggestions() {
      if (!this.model.folder || !this.model.folder.trim()) {
        return this.folderList.slice(0, 5); // Show top 5 folders
      }
      const term = this.model.folder.toLowerCase().trim();
      return this.folderList.filter(folder => 
        folder.toLowerCase().includes(term)
      ).slice(0, 5);
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
      
      // Apply sorting
      if (this.sortColumn) {
        arr = [...arr].sort((a, b) => {
          let aVal = a[this.sortColumn] || '';
          let bVal = b[this.sortColumn] || '';
          
          // Convert to lowercase for case-insensitive sorting
          if (typeof aVal === 'string') aVal = aVal.toLowerCase();
          if (typeof bVal === 'string') bVal = bVal.toLowerCase();
          
          if (aVal < bVal) return this.sortDirection === 'asc' ? -1 : 1;
          if (aVal > bVal) return this.sortDirection === 'asc' ? 1 : -1;
          return 0;
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
    
    // Add click outside listener
    document.addEventListener('click', this.handleClickOutside);
    
    // Add escape key listener
    document.addEventListener('keydown', this.handleEscapeKey);
    
    // Add keyboard shortcuts listener
    document.addEventListener('keydown', this.handleKeyboardShortcuts);
  },
  
  beforeUnmount() {
    // Clean up event listeners
    document.removeEventListener('click', this.handleClickOutside);
    document.removeEventListener('keydown', this.handleEscapeKey);
    document.removeEventListener('keydown', this.handleKeyboardShortcuts);
    
    // Clear debounce timer
    if (this.searchDebounceTimer) {
      clearTimeout(this.searchDebounceTimer);
    }
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
        this.addNotification("Link copied to clipboard", "success", 3000);
      }).catch(() => {
        this.addNotification("Failed to copy link", "error", 3000);
      });
    },
    copyShort(id) {
      const shortUrl = `https://r.wecare.digital/${id}`;
      navigator.clipboard.writeText(shortUrl).then(() => {
        this.addNotification(`Short link copied: r.wecare.digital/${id}`, "success", 3000);
      }).catch(() => {
        this.addNotification("Failed to copy short link", "error", 3000);
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
        this.addNotification(`ID "${this.model.id}" already exists. Please choose a different ID.`, "error");
        return;
      }

      const ownerEmail = getOwnerEmail();
      if (!ownerEmail) {
        this.addNotification("Unable to get owner email. Please sign in again.", "error");
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
          this.addNotification(`Link created: r.wecare.digital/${payload.id}`, "success");
          
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
            this.addNotification("Session expired. Please sign out and sign in again.", "error");
          } else {
            this.addNotification(`Failed to create link: ${errorMsg}`, "error");
          }
        }
      } catch (err) {
        this.addNotification("Network error. Please check your connection.", "error");
        console.error(err);
      }
    },
    async updateLink() {
      const ownerEmail = getOwnerEmail();
      if (!ownerEmail) {
        this.addNotification("Unable to get owner email. Please sign in again.", "error");
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
          this.addNotification(`Link updated: r.wecare.digital/${payload.id}`, "success");
          
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
          this.addNotification(`Failed to update link: ${errorMsg}`, "error");
        }
      } catch (err) {
        this.addNotification("Network error. Please check your connection.", "error");
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
          this.addNotification("Link deleted successfully", "success", 3000);
        } else {
          const errorText = await response.text();
          let errorMsg = "";
          try {
            const error = JSON.parse(errorText);
            errorMsg = error.message || errorText || response.statusText;
          } catch (e) {
            errorMsg = errorText || response.statusText;
          }
          this.addNotification(`Failed to delete link: ${errorMsg}`, "error");
        }
      } catch (err) {
        this.addNotification("Network error while deleting. Please try again.", "error");
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
      // Close dropdown after selection
      this.foldersExpanded = false;
      this.folderSearchTerm = "";
      // Close sidebar on mobile after selection
      if (window.innerWidth <= 768) {
        this.showSidebar = false;
      }
    },
    toggleFoldersDropdown() {
      this.foldersExpanded = !this.foldersExpanded;
      // Clear search when closing
      if (!this.foldersExpanded) {
        this.folderSearchTerm = "";
      }
    },
    closeFoldersDropdown() {
      this.foldersExpanded = false;
      this.folderSearchTerm = "";
    },
    handleClickOutside(event) {
      // Close dropdown if clicking outside
      if (this.foldersExpanded && this.$refs.foldersDropdown && !this.$refs.foldersDropdown.contains(event.target)) {
        this.closeFoldersDropdown();
      }
    },
    clearSearch() {
      this.searchTerm = "";
      this.currentPage = 1;
    },
    clearFilters() {
      this.searchTerm = "";
      this.selectedFolder = "";
      this.currentPage = 1;
    },
    handleEscapeKey(event) {
      if (event.key === 'Escape') {
        if (this.modalIsActive) {
          this.toggleModal();
        } else if (this.foldersExpanded) {
          this.closeFoldersDropdown();
        } else if (this.showFolderSuggestions) {
          this.showFolderSuggestions = false;
        }
      }
    },
    handleKeyboardShortcuts(event) {
      // Ctrl/Cmd + K - Focus search
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        const searchInput = document.querySelector('.search-input');
        if (searchInput) searchInput.focus();
      }
      // Ctrl/Cmd + N - New link
      if ((event.ctrlKey || event.metaKey) && event.key === 'n') {
        event.preventDefault();
        if (!this.modalIsActive) {
          this.toggleModal('create');
        }
      }
    },
    handleDashboardClick(event) {
      // Close folder suggestions if clicking outside
      if (this.showFolderSuggestions && this.$refs.folderAutocomplete && !this.$refs.folderAutocomplete.contains(event.target)) {
        this.showFolderSuggestions = false;
      }
    },
    addNotification(message, type = 'success', duration = 5000) {
      const id = ++this.notificationIdCounter;
      const notification = { id, message, type, duration };
      this.notifications.push(notification);
      
      // Auto-remove after duration
      setTimeout(() => {
        this.removeNotification(id);
      }, duration);
    },
    removeNotification(id) {
      const index = this.notifications.findIndex(n => n.id === id);
      if (index > -1) {
        this.notifications.splice(index, 1);
      }
    },
    onFolderInput() {
      this.showFolderSuggestions = true;
      this.selectedSuggestionIndex = -1;
    },
    selectFolderSuggestion(folder) {
      this.model.folder = folder;
      this.showFolderSuggestions = false;
      this.selectedSuggestionIndex = -1;
    },
    navigateSuggestions(direction) {
      if (!this.showFolderSuggestions || this.filteredFolderSuggestions.length === 0) return;
      
      this.selectedSuggestionIndex += direction;
      
      if (this.selectedSuggestionIndex < 0) {
        this.selectedSuggestionIndex = this.filteredFolderSuggestions.length - 1;
      } else if (this.selectedSuggestionIndex >= this.filteredFolderSuggestions.length) {
        this.selectedSuggestionIndex = 0;
      }
    },
    selectSuggestion() {
      if (this.selectedSuggestionIndex >= 0 && this.selectedSuggestionIndex < this.filteredFolderSuggestions.length) {
        this.selectFolderSuggestion(this.filteredFolderSuggestions[this.selectedSuggestionIndex]);
      }
    },
    sortBy(column) {
      if (this.sortColumn === column) {
        // Toggle direction
        this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
      } else {
        this.sortColumn = column;
        this.sortDirection = 'asc';
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
      this.isLoading = true;
      try {
        const token = window.localStorage.getItem("cognitoIdentityToken");
        
        console.log('fetchLinks - Token check:', token ? 'Token exists' : 'No token', 'Length:', token?.length);
        
        if (!token || token === 'null') {
          this.addNotification("Please sign in to view your links.", "error");
          this.isLoading = false;
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
            this.addNotification("Session expired. Please sign out and sign in again.", "error");
          } else if (response.status === 404) {
            this.$store.commit("hydrateLinks", []);
          } else {
            this.addNotification("Failed to load links. Please try refreshing.", "error");
          }
        }
      } catch (err) {
        this.$store.commit("drainLinks");
        this.addNotification("Network error. Please check your connection.", "error");
      } finally {
        this.isLoading = false;
      }
    },
    logout() {
      localStorage.setItem("cognitoIdentityToken", null);
      localStorage.setItem("cognitoRefreshToken", null);
      const logOutUrl = `${authDomain}/logout?client_id=${clientId}&logout_uri=${redUrl}`;
      window.location.href = logOutUrl;
    },
    onSearchInput() {
      // Debounce search input
      if (this.searchDebounceTimer) {
        clearTimeout(this.searchDebounceTimer);
      }
      this.searchDebounceTimer = setTimeout(() => {
        // Reset to first page when searching
        this.currentPage = 1;
      }, 300);
    },

    async forceRefresh() {
      this.refreshing = true;
      
      try {
        // Clear current links first
        this.$store.commit("drainLinks");
        
        // Wait a moment then fetch
        await new Promise(resolve => setTimeout(resolve, 500));
        await this.fetchLinks();
        
        this.addNotification(`Refreshed! Found ${this.$store.state.links.length} links.`, "success", 3000);
        
        // Force Vue to update
        this.$forceUpdate();
        
      } catch (err) {
        console.error("Force refresh failed:", err);
        this.addNotification("Refresh failed. Please try again.", "error", 3000);
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
html, body {
  font-family: 'Helvetica Light', 'Helvetica Neue', Helvetica, Arial, sans-serif;
  font-size: 14px;
  font-weight: 300;
  line-height: 1.5;
  color: #000000;
  background-color: #FFFFFF;ground-color: #FFFFFF;
}

p, span, td, th, label {
  font-family: inherit;
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
  border: 1px solid #000000;
  border-radius: 30px;
  padding: 0.5rem;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.hamburger-btn svg {
  width: 24px;
  height: 24px;
  stroke: #000000;
  stroke-width: 2;
}

.hamburger-btn:focus {
  outline: 2px solid #000000;
  outline-offset: 2px;
}

/* ===== SIDEBAR ===== */
.sidebar-folders {
  height: 100vh;
  position: relative;
  padding: 1.5rem 1rem;
  background: #FFFFFF;
  border-right: none;
  overflow-y: auto;
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
  background: #FFFFFF;
  color: #000000;
  border: 1px solid #000000;
  border-radius: 30px;
  padding: 0.75rem 1.5rem;
  cursor: pointer;
  transition: opacity 0.2s ease, transform 0.2s ease;
  font-family: 'Helvetica Light', 'Helvetica Neue', Helvetica, Arial, sans-serif;
  font-size: 14px;
  font-weight: 300;
  margin-bottom: 0.5rem;
}

.folder-dropdown-toggle:hover {
  opacity: 0.9;
}

.folder-dropdown-toggle:focus {
  outline: 2px solid #000000;
  outline-offset: 2px;
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

.folder-dropdown-content {
  margin-top: 0.5rem;
  background: #FFFFFF;
  border: 1px solid #000000;
  border-radius: 30px;
  padding: 0.75rem;
}

.folder-search-wrapper {
  padding: 0 0 0.5rem 0;
}

.folder-search-input {
  width: 100%;
  background: #FFFFFF !important;
  color: #000000 !important;
  border: 1px solid #000000 !important;
  border-radius: 30px !important;
  padding: 0.5rem 1rem !important;
  font-family: 'Helvetica Light', 'Helvetica Neue', Helvetica, Arial, sans-serif !important;
  font-size: 13px !important;
  font-weight: 300 !important;
}

.folder-search-input::placeholder {
  color: #666666;
  font-size: 13px;
  font-weight: 300;
}

.folder-search-input:focus {
  outline: 2px solid #000000;
  outline-offset: 2px;
  border-color: #000000 !important;
  box-shadow: none !important;
}

.folder-dropdown-list {
  list-style: none;
  padding: 0;
  margin: 0;
  max-height: 300px;
  overflow-y: auto;
}

.folder-dropdown-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.6rem 1rem;
  cursor: pointer;
  color: #000000 !important;
  font-size: 13px;
  font-weight: 300;
  transition: background 0.2s ease;
  border-radius: 20px;
  margin-bottom: 0.25rem;
}

.folder-dropdown-item:hover {
  background: #F5F5F5;
}

.folder-dropdown-item.is-active {
  background: #000000;
  color: #FFFFFF !important;
}

.folder-dropdown-item.is-active .folder-name,
.folder-dropdown-item.is-active .folder-count {
  color: #FFFFFF !important;
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
  background: #FFFFFF !important;
  color: #000000 !important;
  border: 1px solid #000000 !important;
  border-radius: 30px !important;
  padding: 0.75rem 1.5rem;
  cursor: pointer;
  transition: opacity 0.2s ease, transform 0.2s ease;
  font-size: 14px;
  font-weight: 300;
}

.folder-btn:hover {
  opacity: 0.9;
}

.folder-btn.is-active {
  background: #000000 !important;
  color: #FFFFFF !important;
  border-color: #000000 !important;
}

.folder-btn.is-active .folder-name,
.folder-btn.is-active .folder-count {
  color: #FFFFFF !important;
}

.folder-btn:focus {
  outline: 2px solid #000000;
  outline-offset: 2px;
}

.folder-name {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: inherit;
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
  color: inherit;
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
  font-family: 'Helvetica Light', 'Helvetica Neue', Helvetica, Arial, sans-serif !important;
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
  outline: 2px solid #000000;
  outline-offset: 2px;
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
  transition: opacity 0.2s ease, transform 0.2s ease;
  font-family: 'Helvetica Light', 'Helvetica Neue', Helvetica, Arial, sans-serif;
  font-size: 14px;
  font-weight: 300;
}

.btn-standard:hover:not(:disabled) {
  opacity: 0.8;
}

.btn-standard:focus {
  outline: 2px solid #000000;
  outline-offset: 2px;
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
  border-radius: 30px;
  overflow: hidden;
  margin-bottom: 2rem;
}

.table {
  width: 100%;
  background: #FFFFFF;
  border-collapse: collapse;
  margin: 0;
  font-family: 'Helvetica Light', 'Helvetica Neue', Helvetica, Arial, sans-serif;
  font-size: 14px;
  font-weight: 300;
}

/* Column widths - narrow serial number column */
.table thead th:first-child,
.table tbody td:first-child {
  width: 60px;
  text-align: center;
}

.table thead th:nth-child(2),
.table tbody td:nth-child(2) {
  width: 15%;
}

.table thead th:nth-child(3),
.table tbody td:nth-child(3) {
  width: 30%;
}

.table thead th:nth-child(4),
.table tbody td:nth-child(4) {
  width: 15%;
}

.table thead th:nth-child(5),
.table tbody td:nth-child(5) {
  width: 20%;
}

.table thead th:last-child,
.table tbody td:last-child {
  width: 120px;
  text-align: center;
}

.table thead th {
  background: #FFFFFF;
  color: #000000;
  border-bottom: 1px solid #000000;
  border-right: 1px solid #000000;
  padding: 0.75rem 1rem;
  text-align: left;
  font-family: 'Helvetica Light', 'Helvetica Neue', Helvetica, Arial, sans-serif;
  font-size: 14px;
  font-weight: 300;
  white-space: nowrap;
}

/* Remove right border on last header cell */
.table thead th:last-child {
  border-right: none;
}

.table tbody td {
  color: #000000;
  border-bottom: 1px solid #000000;
  border-right: 1px solid #000000;
  padding: 0.75rem 1rem;
  font-family: 'Helvetica Light', 'Helvetica Neue', Helvetica, Arial, sans-serif;
  font-size: 14px;
  font-weight: 300;
  word-break: break-word;
  overflow-wrap: break-word;
}

/* Remove right border on last body cell */
.table tbody td:last-child {
  border-right: none;
}

/* Alternating row background colors */
.table tbody tr:nth-child(odd) td {
  background: #FFFFFF;
}

.table tbody tr:nth-child(even) td {
  background: #F5F5F5;
}

.table tbody tr:hover td {
  background: #E8E8E8 !important;
}

.wrap-text {
  word-break: break-word;
  white-space: normal;
  max-width: 300px;
  overflow-wrap: break-word;
}

.table a {
  color: #000000;
  text-decoration: underline;
  font-family: 'Helvetica Light', 'Helvetica Neue', Helvetica, Arial, sans-serif;
  font-size: 14px;
  font-weight: 300;
}

.table a:hover {
  opacity: 0.7;
}

/* ===== ACTION BUTTONS (ICON BUTTONS) ===== */
.action-buttons {
  white-space: nowrap;
  display: flex;
  gap: 0.5rem;
  align-items: center;
  justify-content: center;
}

.btn-action {
  background: #FFFFFF;
  color: #000000;
  border: none;
  border-radius: 30px;
  padding: 0.5rem 0.75rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: opacity 0.2s ease, transform 0.2s ease, background 0.2s ease, color 0.2s ease;
  font-size: 16px;
  line-height: 1;
  min-width: 32px;
  min-height: 32px;
}

.btn-action:hover {
  background: #000000;
  color: #FFFFFF;
  opacity: 0.9;
}

.btn-action:focus {
  outline: 2px solid #000000;
  outline-offset: 2px;
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
  transition: opacity 0.2s ease, transform 0.2s ease, background 0.2s ease, color 0.2s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.btn-copy:hover {
  background: #000000;
  color: #FFFFFF;
}

.btn-copy:focus {
  outline: 2px solid #000000;
  outline-offset: 2px;
}

.btn-copy i {
  font-size: 14px;
  display: block;
  line-height: 1;
}

/* ===== PAGINATION ===== */
.pagination {
  background: #FFFFFF;
  border: 1px solid transparent;
  padding: 1rem;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.pagination-list {
  display: flex;
  list-style: none;
  gap: 0.5rem;
  margin: 0;
  padding: 0;
  flex-wrap: wrap;
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
  transition: opacity 0.2s ease;
}

.pagination-link:hover:not(.is-current) {
  opacity: 0.8;
}

.pagination-link.is-current {
  background: #FFFFFF;
  color: #000000;
  border-color: #000000;
}

.pagination-link:focus {
  outline: 2px solid #000000;
  outline-offset: 2px;
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
  transition: opacity 0.2s ease;
}

.pagination-previous:hover:not(:disabled),
.pagination-next:hover:not(:disabled) {
  opacity: 0.8;
}

.pagination-previous:disabled,
.pagination-next:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-previous:focus,
.pagination-next:focus {
  outline: 2px solid #000000;
  outline-offset: 2px;
}

.pagination-ellipsis {
  padding: 0.5rem;
  color: #000000;
  font-size: 14px;
}

.pagination-wrapper {
  margin-bottom: 1rem;
}

.pagination-info {
  margin-left: auto;
  text-align: right;
  color: #000000;
  font-family: 'Helvetica Light', 'Helvetica Neue', Helvetica, Arial, sans-serif;
  font-size: 14px;
  font-weight: 300;
  background: #FFFFFF;
  border: 1px solid #000000;
  border-radius: 30px;
  padding: 0.5rem 1rem;
  display: inline-block;
  white-space: nowrap;
}

/* ===== MODAL ===== */
.modal-background {
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 2000;
}

.modal-content {
  z-index: 2001;
}

.modal-content .box {
  background: #FFFFFF;
  border: 1px solid #000000;
  border-radius: 30px;
  padding: 2rem;
}

.modal-content .box .subtitle {
  color: #000000;
  font-family: 'Helvetica Light', 'Helvetica Neue', Helvetica, Arial, sans-serif;
  font-size: 16px;
  font-weight: 300;
  margin-bottom: 1.5rem;
}

.modal-content .label {
  color: #000000;
  font-family: 'Helvetica Light', 'Helvetica Neue', Helvetica, Arial, sans-serif;
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
  font-family: 'Helvetica Light', 'Helvetica Neue', Helvetica, Arial, sans-serif;
  font-size: 14px;
  font-weight: 300;
  width: 100%;
}

.modal-content .input:focus {
  outline: none;
  border-color: #000000;
  box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.1);
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
  font-family: 'Helvetica Light', 'Helvetica Neue', Helvetica, Arial, sans-serif;
  font-size: 14px;
  font-weight: 300;
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
  border-radius: 30px;
  padding: 1rem;
  margin-bottom: 1rem;
  position: relative;
  font-family: 'Helvetica Light', 'Helvetica Neue', Helvetica, Arial, sans-serif;
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
  /* Mobile sidebar - slide-in drawer */
  .sidebar-folders {
    position: fixed;
    top: 0;
    left: 0;
    width: 280px;
    height: 100vh;
    z-index: 999;
    background: #F7F7F7;
    border-right: none;
    border-radius: 0 30px 30px 0;
    box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
    transform: translateX(-100%);
    transition: transform 0.3s ease;
    padding: 20px;
    overflow-y: auto;
  }
  
  .sidebar-folders:not(.is-hidden-mobile) {
    transform: translateX(0);
  }
  
  /* Mobile main content - 20px side padding */
  .dashboard {
    padding-left: 20px;
    padding-right: 20px;
    padding-top: 1rem;
    padding-bottom: 1rem;
  }
  
  .header-card {
    padding: 1rem;
  }
  
  .brand-title {
    font-size: 14px;
  }
  
  /* Tables scroll horizontally on mobile */
  .table-container,
  .table-wrapper {
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
  
  /* Ensure pagination info stays on same row */
  .pagination-info {
    margin-left: auto;
  }
}

@media screen and (max-width: 480px) {
  .dashboard {
    padding-left: 20px;
    padding-right: 20px;
    padding-top: 0.5rem;
    padding-bottom: 0.5rem;
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
  
  .pagination-info {
    font-size: 13px;
    padding: 0.4rem 0.8rem;
  }
}

/* ===== EMPTY STATES ===== */
.empty-state {
  text-align: center;
  padding: 2rem 1rem;
}

.empty-icon {
  width: 48px;
  height: 48px;
  stroke: #666666;
  margin: 0 auto 1rem;
  display: block;
}

.empty-text {
  color: #000000;
  font-size: 14px;
  font-weight: 300;
  margin-bottom: 0.5rem;
}

.empty-subtext {
  color: #666666;
  font-size: 13px;
  font-weight: 300;
  margin: 0;
}

.empty-state-large {
  text-align: center;
  padding: 4rem 2rem;
  background: #FFFFFF;
  border: 1px solid #000000;
  border-radius: 30px;
  margin-bottom: 2rem;
}

.empty-icon-large {
  width: 80px;
  height: 80px;
  stroke: #666666;
  margin: 0 auto 1.5rem;
  display: block;
}

.empty-title {
  color: #000000;
  font-size: 18px;
  font-weight: 300;
  margin-bottom: 0.75rem;
}

.empty-description {
  color: #666666;
  font-size: 14px;
  font-weight: 300;
  margin-bottom: 1.5rem;
}

/* ===== LOADING STATE ===== */
.loading-container {
  text-align: center;
  padding: 4rem 2rem;
  background: #FFFFFF;
  border: 1px solid #000000;
  border-radius: 30px;
  margin-bottom: 2rem;
}

.loading-spinner {
  width: 48px;
  height: 48px;
  border: 3px solid #F5F5F5;
  border-top-color: #000000;
  border-radius: 50%;
  margin: 0 auto 1rem;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-text {
  color: #666666;
  font-size: 14px;
  font-weight: 300;
  margin: 0;
}

/* ===== CLEAR SEARCH BUTTON ===== */
.has-icons-right {
  position: relative;
}

.clear-search-btn {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.2s ease;
}

.clear-search-btn:hover {
  opacity: 0.7;
}

.clear-search-btn svg {
  width: 16px;
  height: 16px;
  stroke: #666666;
  stroke-width: 2;
}

.clear-search-btn:focus {
  outline: 2px solid #000000;
  outline-offset: 2px;
  border-radius: 50%;
}

/* ===== TOAST NOTIFICATIONS ===== */
.toast-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 3000;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  max-width: 400px;
}

.toast-notification {
  background: #FFFFFF;
  border: 1px solid #000000;
  border-radius: 30px;
  padding: 1rem 1.25rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
  min-width: 300px;
}

.toast-success {
  border-color: #00AA00;
}

.toast-error {
  border-color: #FF0000;
}

.toast-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding-right: 2rem;
}

.toast-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.toast-success .toast-icon {
  stroke: #00AA00;
}

.toast-error .toast-icon {
  stroke: #FF0000;
}

.toast-message {
  color: #000000;
  font-size: 14px;
  font-weight: 300;
  flex: 1;
}

.toast-close {
  position: absolute;
  top: 50%;
  right: 0.75rem;
  transform: translateY(-50%);
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.2s ease;
}

.toast-close:hover {
  opacity: 0.7;
}

.toast-close svg {
  width: 14px;
  height: 14px;
  stroke: #666666;
  stroke-width: 2;
}

.toast-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 3px;
  background: #000000;
  width: 100%;
  animation: toast-progress linear forwards;
}

.toast-success .toast-progress {
  background: #00AA00;
}

.toast-error .toast-progress {
  background: #FF0000;
}

@keyframes toast-progress {
  from {
    width: 100%;
  }
  to {
    width: 0%;
  }
}

/* Toast animations */
.toast-enter-active {
  animation: toast-slide-in 0.3s ease-out;
}

.toast-leave-active {
  animation: toast-slide-out 0.3s ease-in;
}

@keyframes toast-slide-in {
  from {
    transform: translateX(400px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes toast-slide-out {
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(400px);
    opacity: 0;
  }
}

/* ===== FOLDER COUNT BADGES ===== */
.folder-count-badge {
  background: #F5F5F5;
  color: #000000;
  font-size: 12px;
  font-weight: 300;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  min-width: 24px;
  text-align: center;
  display: inline-block;
}

.folder-btn.is-active .folder-count-badge {
  background: rgba(255, 255, 255, 0.2);
  color: #FFFFFF;
}

.folder-dropdown-item.is-active .folder-count-badge {
  background: rgba(255, 255, 255, 0.2);
  color: #FFFFFF;
}

/* ===== FOLDER AUTOCOMPLETE ===== */
.folder-autocomplete-field {
  position: relative;
}

.folder-suggestions {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: #FFFFFF;
  border: 1px solid #000000;
  border-radius: 20px;
  margin-top: 0.5rem;
  max-height: 200px;
  overflow-y: auto;
  z-index: 100;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.folder-suggestion-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  cursor: pointer;
  transition: background 0.2s ease;
  color: #000000;
  font-size: 14px;
  font-weight: 300;
}

.folder-suggestion-item:first-child {
  border-radius: 20px 20px 0 0;
}

.folder-suggestion-item:last-child {
  border-radius: 0 0 20px 20px;
}

.folder-suggestion-item:hover,
.folder-suggestion-item.is-highlighted {
  background: #F5F5F5;
}

.suggestion-icon {
  width: 16px;
  height: 16px;
  stroke: #666666;
  flex-shrink: 0;
}

.suggestion-count {
  margin-left: auto;
  font-size: 12px;
  color: #666666;
  background: #F5F5F5;
  padding: 0.125rem 0.5rem;
  border-radius: 10px;
}

/* ===== STICKY TABLE HEADER ===== */
.sticky-header {
  position: sticky;
  top: 0;
  z-index: 10;
  background: #FFFFFF;
}

.sticky-header th {
  background: #FFFFFF !important;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

/* ===== SORTABLE TABLE HEADERS ===== */
.sortable {
  cursor: pointer;
  user-select: none;
  position: relative;
  transition: background 0.2s ease;
}

.sortable:hover {
  background: #F5F5F5 !important;
}

.sort-icon {
  display: inline-flex;
  align-items: center;
  margin-left: 0.25rem;
  vertical-align: middle;
}

.sort-icon svg {
  width: 14px;
  height: 14px;
  stroke: #000000;
}

/* ===== MOBILE RESPONSIVENESS FOR NEW FEATURES ===== */
@media screen and (max-width: 768px) {
  .toast-container {
    right: 10px;
    left: 10px;
    max-width: none;
  }
  
  .toast-notification {
    min-width: auto;
  }
  
  .folder-suggestions {
    max-height: 150px;
  }
}
</style>
