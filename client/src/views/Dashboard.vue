<!-- Dashboard.vue -->

<template>
  <div class="dashboard">
    <div class="columns is-mobile">
      <div class="column">
        <h1 class="title">Shortcuts</h1>
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

    <!-- Search Bar -->
    <div class="field">
      <div class="control">
        <input
          class="input"
          type="text"
          placeholder="Search shortcuts..."
          v-model="searchQuery"
        />
      </div>
    </div>

    <!-- Table View -->
    <table class="table is-fullwidth is-hoverable">
      <thead>
        <tr>
          <th>Shortcut ID</th>
          <th>URL</th>
          <th>Created</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(link, i) in filteredLinks"
          :key="link.id"
          :class="{ 'has-background-light': i % 2 === 0 }"
        >
          <td>{{ link.id }}</td>
          <td class="text-clip" :title="link.url">{{ link.url }}</td>
          <td><time>{{ link.timestamp | formatDate }}</time></td>
          <td>
            <button class="button is-small is-info is-light" @click="toggleModal('edit', link, i)">Edit</button>
            <button class="button is-small is-danger is-light" @click="deleteLink(link.id, i)">Delete</button>
            <button class="button is-small is-primary is-light" @click="copyToClipboard(apiUrl + '/' + link.id)">Copy</button>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Modal -->
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
                placeholder="Url (Ex: http://mylink.com)"
                required
              />
            </div>
          </div>
          <p class="is-italic has-text-info is-size-7" v-if="!modalTypeCreate">
            Note: Updates take a minimum of 5 minutes to propagate. You may also
            need to clear your local cache.
          </p>
        </section>
        <footer class="modal-card-foot">
          <button
            v-if="modalTypeCreate"
            @click="createLink"
            class="button is-success"
          >
            Create
          </button>
          <button v-else @click="updateLink" class="button is-success">
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
  name: "Dashboard",
  data() {
    return {
      apiUrl: process.env.VUE_APP_API_ROOT,
      modalIsActive: false,
      model: {
        id: "",
        url: "",
      },
      currentLink: {},
      currentIndex: 0,
      modalTypeCreate: true,
      searchQuery: "",
    };
  },
  created() {
    this.fetchData();
  },
  computed: {
    ...mapState(["links"]),
    filteredLinks() {
      if (!this.searchQuery.trim()) {
        return this.links;
      }
      const query = this.searchQuery.toLowerCase();
      return this.links.filter(
        (link) =>
          link.id.toLowerCase().includes(query) ||
          link.url.toLowerCase().includes(query)
      );
    },
  },
  methods: {
    toggleModal(type, link = null, ind = 0) {
      this.model.id = this.model.url = "";
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
          headers: {
            Authorization: window.localStorage.getItem("cognitoIdentityToken"),
          },
        })
        .then((response) => this.$store.commit("hydrateLinks", response.data))
        .catch(() => this.$store.commit("drainLinks"));
    },
    createLink() {
      axios
        .post(`${this.apiUrl}/app`, this.model, {
          headers: {
            Authorization: window.localStorage.getItem("cognitoIdentityToken"),
          },
        })
        .then((response) => {
          if (response.data.error) {
            alert(response.data.message);
          } else {
            this.toggleModal();
            this.$store.commit("addLink", response.data);
          }
        })
        .catch((err) => {
          console.error(`POST to ${this.apiUrl}/app caught error`, err);
          alert("SlipLink cannot be created. Bad format.");
        });
    },
    updateLink() {
      this.currentLink.url = this.model.url;
      axios
        .put(`${this.apiUrl}/app/${this.currentLink.id}`, this.currentLink, {
          headers: {
            Authorization: window.localStorage.getItem("cognitoIdentityToken"),
          },
        })
        .then((response) => {
          if (response.status === 200) {
            this.toggleModal();
            this.$store.commit("updateLink", response.data, this.currentIndex);
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
            headers: {
              Authorization: window.localStorage.getItem("cognitoIdentityToken"),
            },
          })
          .then((response) => {
            if (response.status === 200) {
              this.$store.commit("removeLink", ind);
            } else {
              alert("There was an issue deleting your SlipLink");
            }
          })
          .catch((err) => {
            alert(err);
          });
      }
    },
    copyToClipboard(text) {
      navigator.clipboard.writeText(text)
        .then(() => {
          alert('Link copied to clipboard!');
        })
        .catch((err) => {
          console.error('Failed to copy text: ', err);
          alert('Failed to copy link.');
        });
    },
  },
};
</script>

<style scoped>
.text-clip {
  max-width: 300px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
</style>
