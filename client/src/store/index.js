// Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
//
// Permission is hereby granted, free of charge, to any person obtaining a copy of this
// software and associated documentation files (the "Software"), to deal in the Software
// without restriction, including without limitation the rights to use, copy, modify,
// merge, publish, distribute, sublicense, and/or sell copies of the Software, and to
// permit persons to whom the Software is furnished to do so.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
// INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
// PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
// HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
// SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    authorized: false,
    links: [],
    loading: false,
    error: null
  },
  mutations: {
    authorize(state){
      state.authorized = true;
    },
    deAuthorize(state) {
      state.authorized = false;
    },
    hydrateLinks(state, links) {
      state.links = links;
    },
    drainLinks(state){
      state.links.length = 0;
    },
    addLink(state, link){
      state.links.push(link);
    },
    removeLink(state, ind){
      state.links.splice(ind, 1);
    },
    updateLink(state, { link, ind }) {
      // Vue.set for reactivity
      Vue.set(state.links, ind, link);
    },
    setLoading(state, loading) {
      state.loading = loading;
    },
    setError(state, error) {
      state.error = error;
    }
  },
  getters: {
    isLoading: state => state.loading,
    error: state => state.error,
    links: state => state.links
  },
  actions: {
    async fetchLinks({ commit }) {
      commit('setLoading', true);
      commit('setError', null);
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(process.env.VUE_APP_API_ROOT + "/app", {
          headers: { Authorization: token }
        });
        commit('hydrateLinks', res.data || []);
      } catch (err) {
        commit('setError', err.response?.data || err.message);
      } finally {
        commit('setLoading', false);
      }
    },
    async createLink({ dispatch, commit }, link) {
      commit('setLoading', true);
      commit('setError', null);
      try {
        const token = localStorage.getItem("token");
        await axios.post(process.env.VUE_APP_API_ROOT + "/app", link, {
          headers: { Authorization: token }
        });
        await dispatch('fetchLinks');
      } catch (err) {
        commit('setError', err.response?.data || err.message);
      } finally {
        commit('setLoading', false);
      }
    },
    async updateLink({ dispatch, commit }, { id, data }) {
      commit('setLoading', true);
      commit('setError', null);
      try {
        const token = localStorage.getItem("token");
        await axios.put(process.env.VUE_APP_API_ROOT + `/app/${id}`, data, {
          headers: { Authorization: token }
        });
        await dispatch('fetchLinks');
      } catch (err) {
        commit('setError', err.response?.data || err.message);
      } finally {
        commit('setLoading', false);
      }
    },
    async deleteLink({ dispatch, commit }, id) {
      commit('setLoading', true);
      commit('setError', null);
      try {
        const token = localStorage.getItem("token");
        await axios.delete(process.env.VUE_APP_API_ROOT + `/app/${id}`, {
          headers: { Authorization: token }
        });
        await dispatch('fetchLinks');
      } catch (err) {
        commit('setError', err.response?.data || err.message);
      } finally {
        commit('setLoading', false);
      }
    }
  },
  modules: {
  }
})
