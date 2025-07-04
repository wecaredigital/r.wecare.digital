<template>
  <div class="columns">
    <div class="column is-2 sidebar-folders">
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
      <section class="dashboard">
        <div v-if="successMsg" class="notification is-success is-light">{{ successMsg }}</div>
        <div v-if="errorMsg" class="notification is-danger is-light">{{ errorMsg }}</div>

        <div class="columns is-mobile is-vcentered mb-4">
          <div class="column"><h1 class="title is-4">Shortcuts</h1></div>
          <div class="column is-5">
            <input class="input" v-model="searchTerm" type="text" placeholder="Search shortcuts…" />
          </div>
          <div class="column is-2">
            <button class="button is-info is-outlined is-fullwidth" @click="toggleModal('create')">New</button>
          </div>
        </div>

        <table class="table is-fullwidth is-striped is-hoverable is-size-7">
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
                <button class="button is-small is-white ml-2" @click="copy(link.url)">
                  <span class="icon is-small"><i class="fas fa-copy"></i></span>
                </button>
              </td>
              <td>{{ link.folder }}</td>
              <td>{{ link.remark }}</td>
              <td>{{ link.owner }}</td>
              <td>{{ formatDate(link.timestamp) }}</td>
              <td>
                <button class="button is-small is-info is-light" @click="editLink(link)">Edit</button>
                <button class="button is-small is-danger is-light" @click="deleteLink(link.id)">Delete</button>
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
          <div class="modal-content" style="max-width: 600px; margin: auto;">
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
      </section>
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
      successMsg: null,
      errorMsg: null
    };
  },
  computed: {
    folderList() {
      const folders = this.$store.state.links.map(l => l.folder || "").filter(Boolean);
      return [...new Set(folders)].sort();
    },
    filteredLinks() {
      let links = this.$store.state.links;
      if (this.selectedFolder) {
        links = links.filter(link => link.folder === this.selectedFolder);
      }
      if (this.searchTerm) {
        const term = this.searchTerm.toLowerCase();
        links = links.filter(link =>
          link.id.toLowerCase().includes(term) ||
          (link.url && link.url.toLowerCase().includes(term)) ||
          (link.folder && link.folder.toLowerCase().includes(term)) ||
          (link.remark && link.remark.toLowerCase().includes(term)) ||
          (link.owner && link.owner.toLowerCase().includes(term))
        );
      }
      return links;
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
      this.isEditMode = mode === "edit";
      if (!this.modalIsActive) {
        this.model = { id: "", url: "", folder: "", remark: "", owner: "" };
        this.successMsg = null;
        this.errorMsg = null;
      }
    },
    formatDate(ts) {
      return new Date(ts).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
    },
    async createLink() {
      const date = new Date();
      const day = date.toLocaleString('en-IN', { day: '2-digit' });
      const month = date.toLocaleString('en-IN', { month: 'short' });
      const year = date.toLocaleString('en-IN', { year: 'numeric' });
      const time = date.toLocaleString('en-IN', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const timestamp = `${day}/${month}/${year}:${time} +0530`;

      const payload = { ...this.model, timestamp };

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
        alert("Network or server error.");
      }
    },
    async deleteLink(id) {
      if (!confirm("Delete this shortcut?")) return;
      try {
        const response = await fetch(`https://xbj96ig388.execute-api.ap-south-1.amazonaws.com/Prod/app/${id}`, {
          method: "DELETE",
          headers: {
            Authorization: window.localStorage.getItem("cognitoIdentityToken")
          }
        });

        if (response.ok) {
          const index = this.$store.state.links.findIndex(l => l.id === id);
          if (index > -1) this.$store.commit("removeLink", index);
        } else {
          alert("Delete failed.");
        }
      } catch (err) {
        console.error("Error deleting link:", err);
        alert("Server error.");
      }
    },
    editLink(link) {
      this.model = { ...link };
      this.toggleModal("edit");
    },
    selectFolder(folder) {
      this.selectedFolder = folder;
    },
    copy(url) {
      navigator.clipboard.writeText(url).then(() => {
        this.successMsg = "Copied!";
        setTimeout(() => (this.successMsg = null), 1500);
      });
    }
  }
};
</script>

<style scoped>
.sidebar-folders {
  border-right: 1px solid #eee;
  height: 100vh;
  overflow-y: auto;
  padding: 1rem;
  background-color: #fafafa;
}
.dashboard {
  padding: 2rem;
}
</style>
