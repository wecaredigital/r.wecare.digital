<template>
  <div class="columns is-mobile">
    <div class="column is-12-mobile is-2-tablet is-narrow sidebar-folders">
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

    <div class="column dashboard">
      <div v-if="successMsg" class="notification is-success is-light">{{ successMsg }}</div>

      <div class="columns is-multiline is-mobile mb-2">
        <div class="column is-12-mobile is-6-tablet is-4-desktop">
          <h1 class="title is-size-4-mobile is-size-3-tablet">Shortcuts</h1>
        </div>
        <div class="column is-12-mobile is-6-tablet is-4-desktop">
          <input class="input" v-model="searchTerm" type="text" placeholder="Search shortcuts…" />
        </div>
        <div class="column is-12-mobile is-12-tablet is-4-desktop">
          <button class="button is-info is-outlined is-fullwidth" @click="toggleModal('create')">New Shortcut</button>
        </div>
      </div>

      <!-- Pagination above table -->
      <nav class="pagination is-right mb-2">
        <a class="pagination-previous" :disabled="currentPage === 1" @click="currentPage--">Previous</a>
        <a class="pagination-next" :disabled="currentPage === totalPages || totalPages === 0" @click="currentPage++">Next</a>
        <ul class="pagination-list">
          <li v-for="page in totalPages || 1" :key="page">
            <a
              class="pagination-link"
              :class="{ 'is-current': currentPage === page }"
              @click="goToPage(page)"
            >{{ page }}</a>
          </li>
        </ul>
      </nav>
      <table class="table is-fullwidth is-striped has-border">
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
              <button class="button is-small is-info" @click="editLink(link)">Edit</button>
              <button class="button is-small is-danger" @click="deleteLink(link.id)">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>

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
                  <button class="button is-link" type="submit"
                    :disabled="!model.id || !model.url || (!isEditMode && idExists) || !isValidUrl(model.url)">
                    {{ isEditMode ? 'Update' : 'Create' }}
                  </button>
                </div>
                <div class="control">
                  <button class="button" type="button" @click="toggleModal()">Cancel</button>
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
      pageSize: 500,
      successMsg: null
    };
  },
  computed: {
    folderList() {
      const folders = this.$store.state.links.map(l => l.folder || "").filter(Boolean);
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
          (link.remark && link.remark.toLowerCase().includes(term))
        );
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
    idExists() {
      return this.$store.state.links.some(link => link.id === this.model.id);
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
        this.successMsg = "Copied!";
        setTimeout(() => (this.successMsg = null), 1000);
      });
    },
    copyShort(id) {
      const shortUrl = `https://r.wecare.digital/${id}`;
      navigator.clipboard.writeText(shortUrl).then(() => {
        this.successMsg = "Short URL copied!";
        setTimeout(() => (this.successMsg = null), 1000);
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

      const payload = { 
        ...this.model, 
        owner: "r@wecare.digital",
        timestamp: getISTTimestamp()
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
          const errorText = await response.text();
          let errorMsg = "";
          try {
            const error = JSON.parse(errorText);
            errorMsg = error.message || errorText || response.statusText;
          } catch (e) {
            errorMsg = errorText || response.statusText;
          }
          alert("Failed to save: " + errorMsg);
        }
      } catch (err) {
        alert("Network or server error.");
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
          this.successMsg = "Deleted!";
          setTimeout(() => (this.successMsg = null), 1500);
        } else {
          const errorText = await response.text();
          let errorMsg = "";
          try {
            const error = JSON.parse(errorText);
            errorMsg = error.message || errorText || response.statusText;
          } catch (e) {
            errorMsg = errorText || response.statusText;
          }
          alert("Delete failed: " + errorMsg);
        }
      } catch (err) {
        alert("Network error while deleting.");
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
    },
    goToPage(n) {
      this.currentPage = n;
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
        this.$store.commit("drainLinks");
        console.error("Failed to fetch links:", err);
      }
    }
  }, // <--- THIS COMMA closes the methods object!
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
  padding: 1rem;
}
.table {
  border-collapse: collapse;
  border: 1px solid #ccc;
  width: 100%;
}
.table th,
.table td {
  border: 1px solid #ccc !important;
  padding: 0.5rem;
  vertical-align: top;
}
.wrap-text {
  word-break: break-word;
  white-space: normal;
}
@media screen and (max-width: 768px) {
  .table thead {
    display: none;
  }
  .table tr {
    display: block;
    margin-bottom: 1rem;
  }
  .table td {
    display: flex;
    justify-content: space-between;
    padding: 0.5rem;
    word-break: break-word;
  }
}
</style>
