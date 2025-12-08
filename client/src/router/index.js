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
import VueRouter from 'vue-router'
import Landing from '../views/Landing.vue'
import Login from '../views/Login.vue'
import Dashboard from '../views/Dashboard.vue'
import store from '../store'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'landing',
    component: Landing,
    beforeEnter: (_to, _from, next) => {
      // If user is already authorized, redirect to dashboard
      if (store.state.authorized) {
        next('/dashboard')
      } else {
        next()
      }
    }
  },
  {
    path: '/login',
    name: 'login',
    component: Login,
    beforeEnter: (_to, _from, next) => {
      // If user is already authorized, redirect to dashboard
      if (store.state.authorized) {
        next('/dashboard')
      } else {
        next()
      }
    }
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: Dashboard,
    beforeEnter: (_to, _from, next) => {
      // Protect dashboard route - require authorization
      if (store.state.authorized) {
        next()
      } else {
        next('/')
      }
    }
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
