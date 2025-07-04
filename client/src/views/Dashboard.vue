<template>
  <div class="columns">
    <!-- Sidebar: Folders -->
    <div class="column is-2 is-narrow sidebar-folders">
      <aside class="menu">
        <p class="menu-label">Folders</p>
        <ul class="menu-list">
          <li>
            <a :class="{ 'is-active': selectedFolder === '' }" @click="selectFolder('')" href="javascript:void(0);">All Folders</a>
          </li>
          <li v-for="folder in folderList" :key="folder">
            <a :class="{ 'is-active': selectedFolder === folder }" @click="selectFolder(folder)" href="javascript:void(0);">{{ folder }}</a>
          </li>
        </ul>
      </aside>
    </div>

    <!-- Main Dashboard -->
    <div class="column">
      <div class="dashboard">
        <div class="columns is-mobile">
          <div class="column"><h1 class="title">Shortcuts</h1></div>
          <div class="column is-5-desktop is-full-mobile">
            <input class="input" v-model="searchTerm" type="text" placeholder="Search shortcuts…" />
          </div>
          <div class="column is-2-desktop is-half-mobile">
            <button class="button is-info is-outlined is-fullwidth" @click="toggleModal('create')">New Shortcut</button>
          </div>
        </div>

        <!-- Table -->
        <table class="table is-fullwidth is-hoverable">
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
            <tr v-if="isLoading">
              <td colspan="8" class="has-text-centered">Loading...</td>
            </tr>
            <tr v-else-if="filteredLinks.length === 0">
              <td colspan="8" class="has-text-centered">No data</td>
            </tr>
            <tr v-for="(link, idx) in filteredLinks" :key="link.id">
              <td>{{ idx + 1 }}</td>
              <td>{{ link.id }}</td>
              <td>
                <a :href="link.url" target="_blank">{{ link.url }}</a>
              </td>
              <td>{{ link.folder }}</td>
              <td>{{ link.remark }}</td>
              <td>{{ link.owner }}</td>
              <td>{{ link.timestamp }}</td>
              <td>
                <button class="button is-small is-info" @click="editLink(link)">Edit</button>
                <button class="button is-small is-danger" @click="deleteLink(link.id)">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Error Message -->
        <div v-if="error" class="notification is-danger">{{ error }}</div>

        <!-- Modal for Create/Edit -->
        <div v-if="modalIsActive" class="modal is-active">
          <div class="modal-background" @click="toggleModal()"></div>
          <div class="modal-content">
            <div class="box">
              <h2 class="subtitle">{{ isEditMode ? 'Edit Shortcut' : 'New Shortcut' }}</h2>
              <form @submit.prevent="submitShortcut">
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
import { mapGetters } from "vuex";

export default {
  data() {
    return {
      searchTerm: "",
      modalIsActive: false,
      model: { id: "", url: "", folder: "", remark: "", owner: "" },
      isEditMode: false,
      selectedFolder: ""
    };
  },
  computed: {
    ...mapGetters(["links", "isLoading", "error"]),
    folderList() {
      const folders = this.links
        .map(l => (l.folder || "").trim())
        .filter(f => f)
        .filter((v, i, a) => a.indexOf(v) === i);
      return folders.sort();
    },
    filteredLinks() {
      let arr = this.links;
      if (this.selectedFolder)
        arr = arr.filter(link => (link.folder || "") === this.selectedFolder);
      if (this.searchTerm)
        arr = arr.filter(link =>
          link.id.includes(this.searchTerm) ||
          (link.url && link.url.includes(this.searchTerm)) ||
          (link.folder && link.folder.includes(this.searchTerm)) ||
          (link.remark && link.remark.includes(this.searchTerm)) ||
          (link.owner && link.owner.includes(this.searchTerm))
        );
      return arr;
    }
  },
  methods: {
    toggleModal(mode) {
      this.modalIsActive = !this.modalIsActive;
      if (!this.modalIsActive) {
        this.resetModel();
      }
      this.isEditMode = (mode === 'edit');
    },
    resetModel() {
      this.model = { id: "", url: "", folder: "", remark: "", owner: "" };
      this.isEditMode = false;
    },
    async submitShortcut() {
      if (this.isEditMode) {
        await this.$store.dispatch("updateLink", { id: this.model.id, data: this.model });
      } else {
        await this.$store.dispatch("createLink", this.model);
      }
      this.toggleModal();
    },
    editLink(link) {
      this.model = { ...link };
      this.isEditMode = true;
      this.modalIsActive = true;
    },
    async deleteLink(id) {
      if (confirm("Delete this shortcut?")) {
        await this.$store.dispatch("deleteLink", id);
      }
    },
    selectFolder(folder) {
      this.selectedFolder = folder;
    }
  },
  mounted() {
    this.$store.dispatch("fetchLinks");
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
