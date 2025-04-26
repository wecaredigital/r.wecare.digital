<template>
  <div class="dashboard">
    <!-- Header section -->
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

    <!-- Table view -->
    <div class="table-container">
      <table class="table is-fullwidth is-striped is-hoverable">
        <thead>
          <tr>
            <th>Sl No</th>
            <th>Short Link (ID)</th>
            <th>URL</th>
            <th>Created</th>
            <th>Remark</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(link, index) in links" :key="link.id">
            <td>{{ index + 1 }}</td>
            <td>{{ link.id }}</td>
            <td>
              <div class="text-clip" :title="link.url">{{ link.url }}</div>
            </td>
            <td>{{ link.timestamp | formatDate }}</td>
            <td>{{ link.remark || '-' }}</td>
            <td class="buttons">
              <button class="button is-small is-info" v-on:click="toggleModal('edit', link, index)">Edit</button>
              <button class="button is-small is-danger" v-on:click="deleteLink(link.id, index)">Delete</button>
              <button class="button is-small" v-on:click="copyToClipboard(apiUrl + '/' + link.id)">Copy</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Create/Edit Modal -->
    <div class="modal" :class="{ 'is-active': modalIsActive }">
      <div class="modal-background"></div>
      <div class="modal-card">
        <header class="modal-card-head">
          <p class="modal-card-title">
            <span v-if="modalTypeCreate">Create</span>
            <span v-else>Update</span> Sliplink
          </p>
          <button class="delete" v-on:click="toggleModal()" aria-label="close"></button>
        </header>

        <section class="modal-card-body">
          <div class="field">
            <div class="control">
              <input
                class="input"
                v-model="model.id"
                type="text"
                placeholder="Short Link ID"
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
                placeholder="URL (Ex: http://example.com)"
                required
              />
            </div>
          </div>

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
            Note: Updates take at least 5 minutes to propagate. You may also need to clear your local cache.
          </p>
        </section>

        <footer class="modal-card-foot">
          <button
            v-if="modalTypeCreate"
            class="button is-success"
            v-on:click="createLink()"
          >
            Create
          </button>
          <button
            v-else
            class="button is-success"
            v-on:click="updateLink()"
          >
            Update
          </button>
          <button class="button" v-on:click="toggleModal()">Cancel</button>
        </footer>
      </div>
    </div>
  </div>
</template>
