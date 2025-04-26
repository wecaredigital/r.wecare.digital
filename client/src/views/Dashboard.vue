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

    <!-- Filtered table -->
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
        <tr
          v-for="(link, i) in filteredLinks"
          :key="link.id"
        >
          <td>{{ i + 1 }}</td>
          <td>{{ link.id }}</td>
          <td class="is-clipped" :title="link.url">{{ link.url }}</td>
          <td><time>{{ link.timestamp | formatDate }}</time></td>
          <!-- show remark if it exists, otherwise blank -->
          <td>{{ link.remark || '' }}</td>
          <td class="has-text-centered">
            <a @click="toggleModal('edit', link, i)" href="#">Edit</a>
            &nbsp;|&nbsp;
            <a @click="deleteLink(link.id, i)" href="#">Delete</a>
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

    <!-- Create / Update Modal (only ID & URL) -->
    <div class="modal" :class="{ 'is-active': modalIsActive }">
      <div class="modal-background"></div>
      <div class="modal-card">
        <header class="modal-card-head">
          <p class="modal-card-title">
            <span v-if="modalTypeCreate">Create</span>
            <span v-else>Update</span> Sliplink
          </p>
          <button
            class="delete"
            @click="toggleModal()"
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
                placeholder="URL (Ex: http://mylink.com)"
                required
              />
            </div>
          </div>
          <p
            class="is-italic has-text-info is-size-7"
            v-if="!modalTypeCreate"
          >
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
          <button
            v-else
            @click="updateLink()"
            class="button is-success"
          >
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
      model: {
        id: "",
        url: ""
      },
      currentLink: {},
      currentIndex: 0,
      modalTypeCreate: true,
    };
  },
  computed: {
    ...mapState(["links"]),
    filteredLinks() {
      if (!this.searchTerm) return this.links;
      const term = this.searchTerm.toLowerCase();
      return this.links.filter((link) => {
        return (
          link.id.toLowerCase().includes(term) ||
          link.url.toLowerCase().includes(term) ||
          (link.remark && link.remark.toLowerCase().includes(term))
        );
      });
    }
  },
  created() {
    this.fetchData();
  },
  methods: {
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
      // only id & url, no remark
      const payload = {
        id: this.model.id,
        url: this.model.url
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
          } else {
            this.toggleModal();
            this.$store.commit("addLink", res.data);
          }
        })
        .catch((err) => {
          console.log(`POST to ${this.apiUrl}/app caught error`, err);
          alert("SlipLink cannot be created. Bad format.");
        });
    },
    updateLink() {
      // only url is sent—remark isn’t included
      this.currentLink.url = this.model.url;
      axios
        .put(`${this.apiUrl}/app/${this.currentLink.id}`, this.currentLink, {
          headers: {
            Authorization: window.localStorage.getItem(
              "cognitoIdentityToken"
            ),
          },
        })
        .then((res) => {
          if (res.status === 200) {
            this.toggleModal();
            this.$store.commit(
              "updateLink",
              res.data,
              this.currentIndex
            );
          } else {
            alert("There was an issue updating your SlipLink");
          }
        })
        .catch(() => {
          alert("There was an issue updating your SlipLink");
        });
    },
    deleteLink(id, ind) {
      if (
        confirm(`Are you sure you want to delete '${id}'?`)
      ) {
        axios
          .delete(`${this.apiUrl}/app/${id}`, {
            headers: {
              Authorization: window.localStorage.getItem(
                "cognitoIdentityToken"
              ),
            },
          })
          .then((res) => {
            if (res.status === 200) {
              this.$store.commit("removeLink", ind);
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
};
</script>
