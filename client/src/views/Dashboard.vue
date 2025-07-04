<template>
  <div class="columns">
    <div class="column is-2 is-narrow sidebar-folders">
      <aside class="menu">
        <p class="menu-label">Folders</p>
        <ul class="menu-list">
          <li>
            <a :class="{ 'is-active': selectedFolder === '' }" @click="selectFolder('')" href="#">All Folders</a>
          </li>
          <li v-for="folder in folderList" :key="folder">
            <a :class="{ 'is-active': selectedFolder === folder }" @click="selectFolder(folder)" href="#">{{ folder }}</a>
          </li>
        </ul>
      </aside>
    </div>

    <div class="column">
      <div class="dashboard">
        <div v-if="successMsg" class="notification is-success is-light">{{ successMsg }}</div>

        <div class="columns is-mobile">
          <div class="column"><h1 class="title">Shortcuts</h1></div>
          <div class="column is-5-desktop is-full-mobile">
            <input class="input" v-model="searchTerm" type="text" placeholder="Search shortcuts…" />
          </div>
          <div class="column is-2-desktop is-half-mobile">
            <button class="button is-info is-outlined is-fullwidth" @click="toggleModal('create')">New Shortcut</button>
          </div>
        </div>

        <table class="table is-fullwidth is-striped">
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
              <td>{{ idx + 1 + (currentPage - 1) * pageSize }}</td>
              <td>{{ link.id }}</td>
              <td>
                <a :href="link.url" target="_blank">{{ link.url }}</a>
                <button class="button is-small is-white ml-2" @click="copy(link.url)" title="Copy to clipboard">📋</button>
              </td>
              <td>{{ link.folder }}</td>
              <td>{{ link.remark }}</td>
              <td>{{ link.owner }}</td>
              <td>{{ formatDate(link.timestamp) }}</td>
              <td>
                <button class="button is-small is-info" @click="editLink(link)">Edit</button>
                <button class="button is-small is-danger" @click="deleteLink(link.id)">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>

        <nav class="pagination is-centered mt-4" v-if="filteredLinks.length > pageSize">
          <a class="pagination-previous" :disabled="currentPage === 1" @click="currentPage--">Previous</a>
          <a class="pagination-next" :disabled="currentPage * pageSize >= filteredLinks.length" @click="currentPage++">Next</a>
        </nav>

        <div v-if="modalIsActive" class="modal is-active">
          <div class="modal-background" @click="toggleModal()"></div>
          <div class="modal-content">
            <div class="box">
              <h2 class="subtitle">{{ isEditMode ? 'Edit Shortcut' : 'New Shortcut' }}</h2>
              <form @submit.prevent="createLink">
                <div class="field">
                  <label class="label">ID</label>
                  <div class="control">
                    <input class="input" v-model="model.id" :readonly="isEditMode" required />
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
                    <button class="button is-link" type="submit">{{ isEditMode ? 'Update' : 'Create' }}</button>
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
      successMsg: null
    };
  },
  computed: {
    folderList() {
      const folders = this.$store.state.links.map(l => l.folder || "").filter(f => f);
      return [...new Set(folders)].sort();
    },
    filteredLinks() {
      let arr = this.$store.state.links;
      if (this.selectedFolder) {
        arr = arr.filter(link => (link.folder || "") === this.selectedFolder);
      }
      if (this.searchTerm) {
        const term = this.searchTerm.toLowerCase();
        arr = arr.filter(link =>
          link.id.toLowerCase().includes(term) ||
          (link.url && link.url.toLowerCase().includes(term)) ||
          (link.folder && link.folder.toLowerCase().includes(term)) ||
          (link.remark && link.remark.toLowerCase().includes(term)) ||
          (link.owner && link.owner.toLowerCase().includes(term))
        );
      }
      return arr;
    },
    paginatedLinks() {
      const start = (this.currentPage - 1) * this.pageSize;
      return this.filteredLinks.slice(start, start + this.pageSize);
    }
  },
  watch: {
    selectedFolder() {
      this.currentPage = 1;
    },
    searchTerm() {
      this.currentPage = 1;
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
    },
    formatDate(timestamp) {
      const options = {
        timeZone: 'Asia/Kolkata',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      };
      const dateStr = new Date(timestamp).toLocaleString('en-GB', options);
      return dateStr.replace(',', '').replace(' at', ':') + ' +0530';
    },
    copy(url) {
      navigator.clipboard.writeText(url).then(() => {
        this.successMsg = "Copied!";
        setTimeout(() => (this.successMsg = null), 1000);
      }).catch(() => alert("Failed to copy."));
    },
    async createLink() {
      const now = new Date();
      const payload = {
        ...this.model,
        timestamp: now.toISOString()
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
        } else {
          const error = await response.json();
          alert("Failed to save: " + (error.message || response.statusText));
        }
      } catch (err) {
        console.error("Error submitting link:", err);
        alert("Network or server error. Check console.");
      }
    },
    editLink(link) {
      this.model = { ...link };
      this.toggleModal('edit');
    },
    deleteLink(id) {
      const ind = this.$store.state.links.findIndex(l => l.id === id);
      if (ind > -1) this.$store.commit("removeLink", ind);
    },
    selectFolder(folder) {
      this.selectedFolder = folder;
    },
    async fetchLinks() {
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
    }
  },
  created() {
    this.fetchLinks();
  }
};
</script>

<style scoped>
.sidebar-folders {
  border-right: 1px solid #eee;
  height: 100vh;
}
.dashboard {
  padding: 2rem;
}
</style>
