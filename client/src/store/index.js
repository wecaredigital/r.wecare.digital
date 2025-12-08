import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    authorized: false,
    loading: true,
    links: [],
    dataLoaded: false
  },

  mutations: {
    authorize(state) {
      state.authorized = true;
    },
    deAuthorize(state) {
      state.authorized = false;
      state.links = [];
      state.dataLoaded = false;
    },
    setLoading(state, loading) {
      state.loading = loading;
    },
    hydrateLinks(state, links) {
      state.links = Array.isArray(links) ? links : [];
      state.dataLoaded = true;
      console.log('Store: hydrateLinks called with', links.length, 'items');
    },
    drainLinks(state) {
      state.links = [];
      state.dataLoaded = false;
    },
    addLink(state, link) {
      // Check if link already exists to prevent duplicates
      const existingIndex = state.links.findIndex(l => l.id === link.id);
      if (existingIndex === -1) {
        state.links.push(link);
        console.log('Store: addLink - added new link', link.id);
      } else {
        // Update existing link
        Vue.set(state.links, existingIndex, link);
        console.log('Store: addLink - updated existing link', link.id);
      }
    },
    removeLink(state, ind) {
      if (ind >= 0 && ind < state.links.length) {
        const removedLink = state.links[ind];
        state.links.splice(ind, 1);
        console.log('Store: removeLink - removed link', removedLink.id);
      }
    },
    updateLink(state, { link, ind }) {
      if (ind >= 0 && ind < state.links.length) {
        Vue.set(state.links, ind, link);
        console.log('Store: updateLink - updated link', link.id);
      }
    },
    setDataLoaded(state, loaded) {
      state.dataLoaded = loaded;
    }
  },

  getters: {
    getLinkById: (state) => (id) => {
      return state.links.find(link => link.id === id);
    }
  }
});
