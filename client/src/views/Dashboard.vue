<template>
  <div class="columns">
    <!-- Sidebar -->
    <div class="column is-2 is-narrow sidebar-folders">
      <aside class="menu">
        <p class="menu-label">Folders</p>
        <ul class="menu-list">
          <li>
            <a :class="{ 'is-active': selectedFolder === '' }" @click="selectFolder('')" href="#">All Folders</a>
          </li>
          <li v-for="folder in folderList" :key="folder">
            <a :class="{ 'is-active': selectedFolder === folder }" @click="selectFolder(folder)" href="#">
              {{ folder }}
            </a>
          </li>
        </ul>
      </aside>
    </div>

    <!-- Main Content -->
    <div class="column">
      <div class="dashboard">

        <!-- Notification -->
        <div v-if="successMsg" class="notification is-success is-light">{{ successMsg }}</div>
        <div v-if="errorMsg" class="notification is-danger is-light">{{ errorMsg }}</div>

        <!-- Header -->
        <div class="columns is-mobile is-vcentered mb-4">
          <div class="column"><h1 class="title is-4">Shortcuts</h1></div>
          <div class="column is-5-desktop is-full-mobile">
            <input class="input" v-model="searchTerm" type="text" placeholder="Search shortcuts…" />
          </div>
          <div class="column is-2-desktop is-half-mobile">
            <button class="button is-info is-outlined is-fullwidth" @click="toggleModal('create')">
              <span class="icon"><i class="fas fa-plus"></i></span>
              <span>New</span>
            </button>
          </div>
        </div>

        <!-- Table -->
        <div v-if="isLoading" class="has-text-centered py-6">
          <button class="button is-loading is-info is-light">Loading links…</button>
        </div>
        <div class="table-container" v-else>
          <table class="table is-fullwidth is-striped is-hoverable is-size-7-mobile">
            <thead>
              <tr>
                <th>#</th>
                <th>ID</th>
                <th>URL</th>
                <th>Folder</th>
                <th>Remark</th>
                <th>Owner</th>
                <th>Timestamp</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(link, idx) in paginatedLinks" :key="link.id">
                <td>{{ idx + 1 + ((currentPage - 1) * pageSize) }}</td>
                <td>{{ link.id }}</td>
                <td>
                  <a :href="link.url" target="_blank">{{ link.url }}</a>
                  <button class="button is-small is-light ml-2" @click="copy(link.url)">
                    <span class="icon is-small"><i class="fas fa-copy"></i></span>
                  </button>
                </td>
                <td>{{ link.folder }}</td>
                <td>{{ link.remark }}</td>
                <td>{{ link.owner }}</td>
                <td><time :datetime="link.timestamp">{{ formatDate(link.timestamp) }}</time></td>
                <td>
                  <button class="button is-small is-info is-light mr-1" @click="editLink(link)">
                    <span class="icon"><i class="fas fa-edit"></i></span>
                  </button>
                  <button class="button is-small is-danger is-light" @click="deleteLink(link.id)">
                    <span class="icon"><i class="fas fa-trash"></i></span>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <nav class="pagination is-centered mt-4" role="navigation" v-if="filteredLinks.length > pageSize">
          <a class="pagination-previous" :disabled="currentPage === 1" @click="currentPage--">Previous</a>
          <a class="pagination-next" :disabled="currentPage * pageSize >= filteredLinks.length" @click="currentPage++">Next</a>
        </nav>

        <!-- Modal -->
        <div v-if="modalIsActive" class="modal is-active">
          <div class="modal-background" @click="toggleModal()"></div>
          <div class="modal-content" style="max-width: 600px; margin: auto;">
            <div class="box">
              <h2 class="subtitle">{{ isEditMode ? 'Edit Shortcut' : 'New Shortcut' }}</h2>
              <form @submit.prevent="createLink">
                <div class="field">
                  <label class="label">ID</label>
                  <div class="control">
                    <input class="input" v-model="model.id" :readonly="isEditMode" required />
                    <p v-if="isDuplicateId && !isEditMode" class="help is-danger">ID already exists.</p>
                  </div>
                </div>
                <div class="field">
                  <label class="label">URL</label>
                  <div class="control">
                    <input class="input" v-model="model.url" type="url" required />
                  </div>
                </div>
                <div class="field">
                  <label class="label">Folder</label>
                  <div class="control">
                    <input class="input" v-model="model.folder" />
                  </div>
                </div>
                <div class="field">
                  <label class="label">Remark</label>
                  <div class="control">
                    <input class="input" v-model="model.remark" />
                  </div>
                </div>
                <div class="field">
                  <label class="label">Owner</label>
                  <div class="control">
                    <input class="input" v-model="model.owner" />
                  </div>
                </div>
                <div class="field is-grouped">
                  <div class="control">
                    <button class="button is-link" type="submit" :disabled="isDuplicateId && !isEditMode">
                      {{ isEditMode ? 'Update' : 'Create' }}
                    </button>
                  </div>
                  <div class="control">
                    <button class="button" @click="toggleModal()" type="button">Cancel</button>
                  </div>
                </div>
              </form>
            </div>
          </div>
          <button class="modal-close is-large" @click="toggleModal()" aria-label="close"></button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      searchTerm: "",
      modalIsActive: false,
      model: { id: "", url: "", folder: "", remark: "", owner: "" },
      isEditMode: false,
      selectedFolder: "",
      currentPage: 1,
      pageSize: 500,
      isLoading: false,
      successMsg: null,
      errorMsg: null
    };
  },
  computed: {
    folderList() {
      const folders = this.$store.state.links.map(l => l.folder || "").filter(f => f).filter((v, i, a) => a.indexOf(v) === i);
      return folders.sort();
    },
    filteredLinks() {
      let arr = this.$store.state.links;
      if (this.selectedFolder) {
        arr = arr.filter(link => (link.folder || "") === this.selectedFolder);
      }
      if (this.searchTerm) {
        arr = arr.filter(link =>
          link.id.includes(this.searchTerm) ||
          (link.url && link.url.includes(this.searchTerm)) ||
          (link.folder && link.folder.includes(this.searchTerm)) ||
          (link.remark && link.remark.includes(this.searchTerm)) ||
          (link.owner && link.owner.includes(this.searchTerm))
        );
      }
      return arr;
    },
    paginatedLinks() {
      const start = (this.currentPage - 1) * this.pageSize;
      return this.filteredLinks.slice(start, start + this.pageSize);
    },
    isDuplicateId() {
      return this.$store.state.links.some(link => link.id === this.model.id);
    }
  },
  methods: {
    toggleModal(mode) {
      this.modalIsActive = !this.modalIsActive;
      if (!this.modalIsActive) this.resetModel();
      this.isEditMode = (mode === 'edit');
    },
    resetModel() {
      this.model = { id: "", url: "", folder: "", remark: "", owner: "" };
      this.isEditMode = false;
      this.successMsg = null;
      this.errorMsg = null;
    },
    formatDate(timestamp) {
      return new Date(timestamp).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", hour12: true });
    },
    async createLink() {
      const now = new Date();
      const istDate = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));

      const payload = {
        ...this.model,
        timestamp: istDate.toISOString()
      };

      try {
        const response = await fetch("https://xbj96ig388.execute-api.ap-south-1.amazonaws.com/Prod/app", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: window.localStorage.getItem("cognitoIdentityToken")
          },
          body: JSON.stringify(payload)
        });

        if (response.ok) {
          this.$store.commit("addLink", payload);
          this.toggleModal();
          this.successMsg = "Shortcut saved successfully.";
        } else {
          const error = await response.json();
          this.errorMsg = "Failed to save: " + (error.message || response.statusText);
        }
      } catch (err) {
        console.error("Error submitting link:", err);
        this.errorMsg = "Network error. See console.";
      }
    },
    async deleteLink(id) {
      if (!confirm("Are you sure you want to delete this shortcut?")) return;

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
          this.successMsg = "Shortcut deleted.";
        } else {
          this.errorMsg = "Failed to delete.";
        }
      } catch (err) {
        console.error("Delete error:", err);
        this.errorMsg = "Network error while deleting.";
      }
    },
    editLink(link) {
      this.model = { ...link };
      this.isEditMode = true;
      this.modalIsActive = true;
    },
    selectFolder(folder) {
      this.selectedFolder = folder;
    },
    copy(url) {
      navigator.clipboard.writeText(url)
        .then(() => (this.successMsg = "Copied to clipboard"))
        .catch(() => (this.errorMsg = "Copy failed"));
    },
    async fetchLinks() {
      this.isLoading = true;
      try {
        const response = await fetch("https://xbj96ig388.execute-api.ap-south-1.amazonaws.com/Prod/app", {
          headers: {
            Authorization: window.localStorage.getItem("cognitoIdentityToken")
          }
        });

        if (response.ok) {
          const data = await response.json();
          this.$store.commit("hydrateLinks", data);
        } else {
          this.$store.commit("drainLinks");
        }
      } catch (err) {
        console.error("Failed to fetch links:", err);
        this.$store.commit("drainLinks");
      }
      this.isLoading = false;
