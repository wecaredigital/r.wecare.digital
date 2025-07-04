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
            <tr v-for="(link, idx) in filteredLinks" :key="link.id">
              <td>{{ idx + 1 }}</td>
              <td>{{ link.id }}</td>
              <td><a :href="link.url" target="_blank">{{ link.url }}</a></td>
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
      selectedFolder: ""
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
    },
    async createLink() {
      if (this.isEditMode) {
        this.$store.commit("updateLink", { link: this.model, ind: 0 }); // fallback
      } else {
        this.$store.commit("addLink", this.model);
      }
      this.toggleModal();
    },
    editLink(link) {
      this.model = { ...link };
      this.isEditMode = true;
      this.modalIsActive = true;
    },
    deleteLink(id) {
      const ind = this.$store.state.links.findIndex(l => l.id === id);
      if (ind > -1) this.$store.commit("removeLink", ind);
    },
    selectFolder(folder) {
      this.selectedFolder = folder;
    }
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
