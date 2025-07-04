import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    links: []  // stores all shortcuts
  },

  mutations: {
    addLink(state, link) {
      state.links.push(link);
    },
    updateLink(state, { link, ind }) {
      Vue.set(state.links, ind, link);
    },
    removeLink(state, index) {
      state.links.splice(index, 1);
    },
    hydrateLinks(state, links) {
      state.links = links;
    },
    drainLinks(state) {
      state.links = [];
    }
  },

  actions: {
    // Optional: you could move fetch/create/delete here for cleaner logic
  },

  getters: {
    getLinkById: (state) => (id) => {
      return state.links.find(link => link.id === id);
    }
  }
});
