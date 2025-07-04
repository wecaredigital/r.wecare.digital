<template>
  <div class="columns">
    <!-- Sidebar: Folders -->
    <div class="column is-2 is-narrow sidebar-folders">
      <aside class="menu">
        <p class="menu-label">Folders</p>
        <ul class="menu-list">
          <li>
            <a
              :class="{ 'is-active': selectedFolder === '' }"
              @click="selectFolder('')"
              href="javascript:void(0);"
            >All Folders</a>
          </li>
          <li v-for="folder in folderList" :key="folder">
            <a
              :class="{ 'is-active': selectedFolder === folder }"
              @click="selectFolder(folder)"
              href="javascript:void(0);"
            >{{ folder }}</a>
          </li>
        </ul>
      </aside>
    </div>

    <!-- Main Dashboard -->
    <div class="column">
      <div class="dashboard">
        <!-- Header + Search + New Shortcut -->
        <div class="columns is-mobile">
          <div class="column"><h1 class="title">Shortcuts</h1></div>
          <div class="column is-5-desktop is-full-mobile">
            <input
              class="input"
              v-model="searchTerm"
              type="text"
              placeholder="Search shortcuts…"
            />
          </div>
          <div class="column is-2-desktop is-half-mobile">
            <button
              class="button is-info is-outlined is-fullwidth"
              @click="toggleModal('create')"
            >
              New Shortcut
            </button>
          </div>
        </div>

        <!-- Page indicator -->
        <div class="columns">
          <div class="column has-text-right">
            <strong>Page {{ currentPage }} of {{ totalPages }}</strong>
          </div>
        </div>

        <!-- Table -->
        <table class="table is-fullwidth is-striped">
          <thead>
            <tr>
              <th>SL No</th>
              <th>ID</th>
              <th class="url-cell">URL</th>
              <th>Created</th>
              <th>Folder</th>
              <th>Remarks</th>
              <th class="has-text-centered">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(link, idx) in paginatedLinks" :key="link.id">
              <td>{{ (currentPage-1)*pageSize + idx + 1 }}</td>
              <td>{{ link.id }}</td>
              <td class="is-clipped url-cell" :title="link.url">{{ link.url }}</td>
              <td><time>{{ formatDate(link.timestamp) }}</time></td>
              <td>{{ link.folder }}</td>
              <td>{{ link.remark }}</td>
              <td class="has-text-centered">
                <a @click="toggleModal('edit', link, globalIndex(idx))" href="#">Edit</a>
                &nbsp;|&nbsp;
                <a @click="deleteLink(link.id, globalIndex(idx))" href="#">Delete</a>
                &nbsp;|&nbsp;
                <a
                  href="javascript:void(0);"
                  @click="copyToClipboard(apiUrl + '/' + link.id)"
                >
                  Copy
                </a>
              </td>
            </tr>
            <tr v-if="paginatedLinks.length === 0">
              <td colspan="7" class="has-text-centered has-text-grey-light">
                No shortcuts found.
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Pagination controls -->
        <nav
          class="pagination is-centered"
          role="navigation"
          aria-label="pagination"
          v-if="totalPages > 1"
        >
          <a
            class="pagination-previous"
            :disabled="currentPage === 1"
            @click="gotoPage(currentPage - 1)"
          >
            Previous
          </a>
          <a
            class="pagination-next"
            :disabled="currentPage === totalPages"
            @click="gotoPage(currentPage + 1)"
          >
            Next
          </a>
          <ul class="pagination-list">
            <li v-for="n in totalPages" :key="n">
              <a
                class="pagination-link"
                :class="{ 'is-current': n === currentPage }"
                @click="gotoPage(n)"
              >
                {{ n }}
              </a>
            </li>
          </ul>
        </nav>

        <!-- Create / Update Modal -->
        <div class="modal" :class="{ 'is-active': modalIsActive }">
          <div class="modal-background"></div>
          <div class="modal-card">
            <header class="modal-card-head">
              <p class="modal-card-title">
                <span v-if="modalTypeCreate">Create</span>
                <span v-else>Update</span> Shortcut
              </p>
              <button class="delete" @click="toggleModal()" aria-label="close" />
            </header>
            <section class="modal-card-body">
              <!-- Short Link ID -->
              <div class="field">
                <div class="control">
                  <input
                    class="input"
                    v-model="model.id"
                    type="text"
                    placeholder="Short Link"
                    required
                    :disabled="!modalTypeCreate"
                  />
                </div>
              </div>

              <!-- URL -->
              <div class="field">
                <div class="control">
                  <input
                    class="input"
                    v-model="model.url"
                    type="text"
                    placeholder="URL (Ex: http://mylink.com)"
                    required
                  />
                </div>
              </div>

              <!-- Remark -->
              <div class="field">
                <div class="control">
                  <input
                    class="input"
                    v-model="model.remark"
                    type="text"
                    placeholder="Remark (optional)"
                  />
                </div>
              </div>

              <!-- Folder -->
              <div class="field">
                <div class="control">
                  <input
                    class="input"
                    v-model="model.folder"
                    type="text"
                    placeholder="Folder (optional)"
                  />
                </div>
              </div>

              <p
                class="is-italic has-text-info is-size-7"
                v-if="!modalTypeCreate"
              >
                Note: Updates take ~5 minutes to propagate.
              </p>
            </section>
            <footer class="modal-card-foot">
              <button
                v-if="modalTypeCreate"
                class="button is-success"
                @click="createLink()"
              >
                Create
              </button>
              <button
                v-else
                class="button is-success"
                @click="updateLink()"
              >
                Update
              </button>
              <button class="button" @click="toggleModal()">Cancel</button>
            </footer>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
import axios from "axios";

export default {
  name: "dashboard",
  data() {
    return {
      apiUrl: process.env.VUE_APP_API_ROOT,
      searchTerm: "",
      modalIsActive: false,
      model: { id: "", url: "", remark: "", folder: "" },
      currentLink: {},
      currentIndex: 0,
      modalTypeCreate: true,
      pageSize: 500,
      currentPage: 1,
      selectedFolder: "",
    };
  },
  computed: {
    ...mapState(["links"]),
    folderList() {
      // Only show non-empty, unique folders
      const folders = this.links
        .map(l => (l.folder || '').trim())
        .filter(f => f)
        .filter((v, i, a) => a.indexOf(v) === i);
      return folders.sort();
    },
    filteredLinks() {
      let links = this.links;
      if (this.selectedFolder) {
        links = links.filter(l => (l.folder || '').trim() === this.selectedFolder);
      }
      if (this.searchTerm) {
        const t = this.searchTerm.toLowerCase();
        links = links.filter((l) =>
          (l.id + l.url + l.remark + (l.folder || "")).toLowerCase().includes(t)
        );
      }
      return links;
    },
    totalPages() {
      return Math.max(1, Math.ceil(this.filteredLinks.length / this.pageSize));
    },
    paginatedLinks() {
      const start = (this.currentPage - 1) * this.pageSize;
      return this.filteredLinks.slice(start, start + this.pageSize);
    },
  },
  methods: {
    globalIndex(idx) {
      return (this.currentPage - 1) * this.pageSize + idx;
    },
    gotoPage(n) {
      if (n >= 1 && n <= this.totalPages) this.currentPage = n;
    },
    selectFolder(folder) {
      this.selectedFolder = folder;
      this.currentPage = 1; // Reset to first page on folder change
    },
    toggleModal(type, link = null, idx = 0) {
      this.model = { id: "", url: "", remark: "", folder: "" };
      this.modalTypeCreate = type === "create";
      this.modalIsActive = !this.modalIsActive;
      if (type === "edit") {
        this.currentLink = link;
        this.currentIndex = idx;
        Object.assign(this.model, link);
      }
    },
    fetchData() {
      axios
        .get(`${this.apiUrl}/app`, {
          headers: {
            Authorization: window.localStorage.getItem(
              "cognitoIdentityToken"
            ),
          },
        })
        .then((res) => this.$store.commit("hydrateLinks", res.data))
        .catch(() => this.$store.commit("drainLinks"));
    },
    createLink() {
      const payload = {
        id: this.model.id,
        url: this.model.url,
        remark: this.model.remark || "",
        folder: this.model.folder || "",
      };
      axios
        .post(`${this.apiUrl}/app`, payload, {
          headers: {
            Authorization: window.localStorage.getItem(
              "cognitoIdentityToken"
            ),
          },
        })
        .then((res) => {
          if (res.data.error) {
            alert(res.data.message);
            return;
          }
          // Make sure folder is updated from payload (if backend does not echo)
          this.$store.commit("addLink", { ...res.data, remark: payload.remark, folder: payload.folder });
          this.toggleModal();
          this.currentPage = this.totalPages;
        })
        .catch((err) =>
          alert(
            "Create failed: " + (err.response?.data?.message || err.message)
          )
        );
    },
    updateLink() {
      const payload = {
        url: this.model.url,
        remark: this.model.remark || "",
        folder: this.model.folder || "",
      };
      axios
        .put(`${this.apiUrl}/app/${this.currentLink.id}`, payload, {
          headers: {
            Authorization: window.localStorage.getItem(
              "cognitoIdentityToken"
            ),
          },
        })
        .then((res) => {
          this.$store.commit(
            "updateLink",
            { ...res.data, remark: payload.remark, folder: payload.folder },
            this.currentIndex
          );
          this.toggleModal();
        })
        .catch((err) =>
          alert(
            "Update failed: " + (err.response?.data?.message || err.message)
          )
        );
    },
    deleteLink(id, idx) {
      if (!confirm(`Delete '${id}'?`)) return;
      axios
        .delete(`${this.apiUrl}/app/${id}`, {
          headers: {
            Authorization: window.localStorage.getItem(
              "cognitoIdentityToken"
            ),
          },
        })
        .then(() => {
          this.$store.commit("removeLink", idx);
          if (this.currentPage > 1 && this.paginatedLinks.length === 0) {
            this.currentPage--;
          }
        })
        .catch((err) =>
          alert(
            "Delete failed: " + (err.response?.data?.message || err.message)
          )
        );
    },
    copyToClipboard(text) {
      navigator.clipboard
        .writeText(text)
        .then(() => alert("Copied!"))
        .catch(() => alert("Copy failed."));
    },
    formatDate(value) {
      if (!value) return "";
      if (typeof value === "number" && value > 1e12) {
        const date = new Date(value);
        return isNaN(date.getTime()) ? value : date.toLocaleString();
      }
      if (typeof value === "number" && value > 1e9) {
        const date = new Date(value * 1000);
        return isNaN(date.getTime()) ? value : date.toLocaleString();
      }
      if (typeof value === "string") {
        if (/^\d{14}$/.test(value)) {
          const y = value.substr(0,4), m = value.substr(4,2), d = value.substr(6,2);
          const H = value.substr(8,2), M = value.substr(10,2), S = value.substr(12,2);
          const date = new Date(`${y}-${m}-${d}T${H}:${M}:${S}Z`);
          return isNaN(date.getTime()) ? value : date.toLocaleString();
        }
        const date = new Date(value);
        return isNaN(date.getTime()) ? value : date.toLocaleString();
      }
      return value;
    },
  },
  watch: {
    searchTerm() {
      this.currentPage = 1;
    },
  },
  created() {
    this.fetchData();
  },
};
</script>

<style scoped>
.sidebar-folders {
  min-width: 180px;
  max-width: 240px;
  border-right: 1px solid #eee;
  padding-top: 1.5rem;
}
.menu-list .is-active {
  background: #f5f5f5;
  font-weight: bold;
}
.menu-label {
  font-size: 1.1em;
  margin-bottom: 0.5em;
}
.url-cell {
  max-width: 250px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
