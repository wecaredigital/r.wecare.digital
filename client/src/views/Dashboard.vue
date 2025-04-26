<template>
  <div class="dashboard">
    <!-- Header + Search + New Shortcut button -->
    <div class="columns is-mobile">
      <div class="column">
        <h1 class="title">Shortcuts</h1>
      </div>
      <div class="column is-6-desktop is-full-mobile">
        <div class="field">
          <div class="control">
            <input
              class="input"
              v-model="searchTerm"
              type="text"
              placeholder="Search shortcuts…"
            />
          </div>
        </div>
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

    <!-- Page indicator (always visible, even on page 1) -->
    <div class="columns">
      <div class="column has-text-right">
        <strong>Page {{ currentPage }} of {{ totalPages }}</strong>
      </div>
    </div>

    <!-- Paginated table -->
    <table class="table is-fullwidth is-striped">
      <thead>
        <tr>
          <th>SL No</th>
          <th>ID</th>
          <th>URL</th>
          <th>Created</th>
          <th class="has-text-centered">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(link, idx) in paginatedLinks" :key="link.id">
          <td>{{ (currentPage - 1) * pageSize + idx + 1 }}</td>
          <td>{{ link.id }}</td>
          <td class="is-clipped" :title="link.url">{{ link.url }}</td>
          <td><time>{{ link.timestamp | formatDate }}</time></td>
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
      </tbody>
    </table>

    <!-- Pagination controls (only if more than 1 page) -->
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

    <!-- Create / Update Modal (only ID & URL) -->
    <div class="modal" :class="{ 'is-active': modalIsActive }">
      <div class="modal-background"></div>
      <div class="modal-card">
        <header class="modal-card-head">
          <p class="modal-card-title">
            <span v-if="modalTypeCreate">Create</span>
            <span v-else>Update</span> Sliplink
          </p>
          <button class="delete" @click="toggleModal()" aria-label="close"></button>
        </header>
        <section class="modal-card-body">
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
          <p class="is-italic has-text-info is-size-7" v-if="!modalTypeCreate">
            Note: Updates take a minimum of 5 minutes to propagate. You may
            also need to clear your local cache.
          </p>
        </section>
        <footer class="modal-card-foot">
          <button
            v-if="modalTypeCreate"
            @click="createLink()"
            class="button is-success"
          >
            Create
          </button>
          <button v-else @click="updateLink()" class="button is-success">
            Update
          </button>
          <button class="button" @click="toggleModal()">Cancel</button>
        </footer>
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
      model: { id: "", url: "" },
      currentLink: {},
      currentIndex: 0,
      modalTypeCreate: true,
      pageSize: 500,
      currentPage: 1,
    };
  },
  computed: {
    ...mapState(["links"]),
    filteredLinks() {
      if (!this.searchTerm) return this.links;
      const term = this.searchTerm.toLowerCase();
      return this.links.filter((link) =>
        (link.id + link.url).toLowerCase().includes(term)
      );
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
    globalIndex(pageIdx) {
      return (this.currentPage - 1) * this.pageSize + pageIdx;
    },
    gotoPage(n) {
      if (n >= 1 && n <= this.totalPages) this.currentPage = n;
    },
    toggleModal(type, link = null, ind = 0) {
      this.model.id = "";
      this.model.url = "";
      this.modalTypeCreate = type === "create";
      this.modalIsActive = !this.modalIsActive;
      if (type === "edit") {
        this.currentLink = link;
        this.currentIndex = ind;
        this.model.id = link.id;
        this.model.url = link.url;
      }
    },
    fetchData() {
      axios
        .get(`${this.apiUrl}/app`, {
          headers: { Authorization: window.localStorage.getItem("cognitoIdentityToken") },
        })
        .then((res) => this.$store.commit("hydrateLinks", res.data))
        .catch(() => this.$store.commit("drainLinks"));
    },
    createLink() {
      const payload = { id: this.model.id, url: this.model.url };
      axios
        .post(`${this.apiUrl}/app`, payload, {
          headers: { Authorization: window.localStorage.getItem("cognitoIdentityToken") },
        })
        .then((res) => {
          if (res.data.error) {
            alert(res.data.message);
          } else {
            this.$store.commit("addLink", res.data);
            this.toggleModal();
            this.currentPage = this.totalPages;
          }
        })
        .catch((err) => {
          console.log(`POST to ${this.apiUrl}/app caught error`, err);
          alert("SlipLink cannot be created. Bad format.");
        });
    },
    updateLink() {
      this.currentLink.url = this.model.url;
      axios
        .put(`${this.apiUrl}/app/${this.currentLink.id}`, this.currentLink, {
          headers: { Authorization: window.localStorage.getItem("cognitoIdentityToken") },
        })
        .then((res) => {
          if (res.status === 200) {
            this.$store.commit("updateLink", res.data, this.currentIndex);
            this.toggleModal();
          } else {
            alert("There was an issue updating your SlipLink");
          }
        })
        .catch(() => {
          alert("There was an issue updating your SlipLink");
        });
    },
    deleteLink(id, ind) {
      if (confirm(`Are you sure you want to delete '${id}'?`)) {
        axios
          .delete(`${this.apiUrl}/app/${id}`, {
            headers: { Authorization: window.localStorage.getItem("cognitoIdentityToken") },
          })
          .then((res) => {
            if (res.status === 200) {
              this.$store.commit("removeLink", ind);
              // if you delete the last item on this page and it becomes empty, go back
              if (this.currentPage > 1 && this.paginatedLinks.length === 0) {
                this.currentPage--;
              }
            } else {
              alert("There was an issue deleting your SlipLink");
            }
          })
          .catch((err) => alert(err));
      }
    },
    copyToClipboard(text) {
      navigator.clipboard
        .writeText(text)
        .then(() => alert("Link copied to clipboard!"))
        .catch(() => alert("Failed to copy link."));
    },
  },
  created() {
    this.fetchData();
  },
};
</script>
