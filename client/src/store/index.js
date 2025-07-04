import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    authorized: false,
    links: []
  },

  mutations: {
    authorize(state) {
      state.authorized = true;
    },
    deAuthorize(state) {
      state.authorized = false;
    },
    hydrateLinks(state, links) {
      state.links = links;
    },
    drainLinks(state) {
      state.links = [];
    },
    addLink(state, link) {
      state.links.push(link);
    },
    removeLink(state, ind) {
      state.links.splice(ind, 1);
    },
    updateLink(state, { link, ind }) {
      Vue.set(state.links, ind, link);
    }
  },

  getters: {
    getLinkById: (state) => (id) => {
      return state.links.find(link => link.id === id);
    }
  }
});
