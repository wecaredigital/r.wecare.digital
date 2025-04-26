<template>
  <div class="dashboard">
    <div class="columns is-mobile">
      <div class="column">
        <h1 class="title">Shortcuts</h1>
      </div>
      <div class="column is-2-desktop is-half-mobile">
        <button
          class="button is-info is-outlined is-fullwidth"
          v-on:click="toggleModal('create')"
        >
          New Shortcut
        </button>
      </div>
    </div>

    <!-- Table view with SL No and Remarks -->
    <table class="table is-fullwidth is-striped">
      <thead>
        <tr>
          <th>SL No</th>
          <th>ID</th>
          <th>URL</th>
          <th>Created</th>
          <th>Remarks</th>
          <th class="has-text-centered">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(link, i) in links" :key="link.id">
          <td>{{ i + 1 }}</td>
          <td>{{ link.id }}</td>
          <td class="is-clipped" :title="link.url">{{ link.url }}</td>
          <td><time>{{ link.timestamp | formatDate }}</time></td>
          <td>{{ link.remark || '' }}</td>
          <td class="has-text-centered">
            <a v-on:click="toggleModal('edit', link, i)" href="#">Edit</a>
            &nbsp;|&nbsp;
            <a v-on:click="deleteLink(link.id, i)" href="#">Delete</a>
            &nbsp;|&nbsp;
            <a
              href="javascript:void(0);"
              v-on:click="copyToClipboard(apiUrl + '/' + link.id)"
            >
              Copy
            </a>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Edit/Create Modal -->
    <div class="modal" v-bind:class="{ 'is-active': modalIsActive }">
      <div class="modal-background"></div>
      <div class="modal-card">
        <header class="modal-card-head">
          <p class="modal-card-title">
            <span v-if="modalTypeCreate">Create</span>
            <span v-else>Update</span> Sliplink
          </p>
          <button
            class="delete"
            v-on:click="toggleModal()"
            aria-label="close"
          ></button>
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

          <!-- Remark field -->
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

          <p class="is-italic has-text-info is-size-7" v-if="!modalTypeCreate">
            Note: Updates take a minimum of 5 minutes to propagate. You may also
            need to clear your local cache.
          </p>
        </section>
        <footer class="modal-card-foot">
          <button
            v-if="modalTypeCreate"
            v-on:click="createLink()"
            class="button is-success"
          >
            Create
          </button>
          <button v-else v-on:click="updateLink()" class="button is-success">
            Update
          </button>
          <button class="button" v-on:click="toggleModal()">Cancel</button>
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
      modalIsActive: false,
      model: {
        id: "",
        url: "",
        remark: ""
      },
      currentLink: {},
      currentIndex: 0,
      modalTypeCreate: true,
    };
  },
  created() {
    this.fetchData();
  },
  computed: {
    ...mapState(["links"]),
  },
  methods: {
    toggleModal(type, link = null, ind = 0) {
      this.model.id = "";
      this.model.url = "";
      this.model.remark = "";
      this.modalTypeCreate = type === "create";
      this.modalIsActive = !this.modalIsActive;

      if (type === "edit") {
        this.currentLink = link;
        this.currentIndex = ind;
        this.model.id = link.id;
        this.model.url = link.url;
        this.model.remark = link.remark || "";
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
      const payload = {
        id: this.model.id,
        url: this.model.url
      };
      axios
        .post(`${this.apiUrl}/app`, payload, {
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
          console.log(`POST to ${this.apiUrl}/app caught error ${err}`);
          alert("SlipLink cannot be created. Bad format.");
        });
    },
    updateLink() {
      this.currentLink.url = this.model.url;
      this.currentLink.remark = this.model.remark;
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
      navigator.clipboard
        .writeText(text)
        .then(() => alert("Link copied to clipboard!"))
        .catch(() => alert("Failed to copy link."));
    },
  },
};
</script>
