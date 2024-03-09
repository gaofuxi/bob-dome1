import Vue from 'vue';
import Router from 'vue-router';

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/index',
      name: 'index-page',
      component: require('@/pages/Index').default,
      meta: {
        keepAlive: true
      }
    },
    {
      path: '/home',
      name: 'home-page',
      component: require('@/pages/Home').default,
      meta: {
        keepAlive: true
      },
      children: [
        {
          path: '/',
          name: 'main-page',
          component: require('@/pages/Main').default,
          meta: {
            keepAlive: true
          }
        },
        {
          path: '/proxy',
          name: 'proxy-page',
          component: require('@/pages/Proxy').default,
          meta: {
            keepAlive: false
          }
        },
        {
          path: '/user',
          name: 'user-page',
          component: require('@/pages/User').default,
          meta: {
            keepAlive: true
          }
        },
        {
          path: '/order',
          name: 'order-page',
          component: require('@/pages/Order').default,
          meta: {
            keepAlive: true
          }
        },
        {
          path: '/invite',
          name: 'invite-page',
          component: require('@/pages/Invite').default,
          meta: {
            keepAlive: true
          }
        },
        {
          path: '/setting',
          name: 'setting-page',
          component: require('@/pages/Setting').default,
          meta: {
            keepAlive: true
          }
        },
        {
          path: '/sub',
          name: 'sub-page',
          component: require('@/pages/Sub').default,
          meta: {
            keepAlive: true
          }
        },

        {
          path: '/language',
          name: 'language-page',
          component: require('@/pages/Language').default,
          meta: {
            keepAlive: true
          }
        },
		{
		  path: '/ticket-create',
		  name: 'ticket-create-page',
		  component: require('@/pages/TicketCreate').default,
		  meta: {
		    keepAlive: true
		  }
		},
      ]
    },
    {
      path: '/shop',
      name: 'shop-page',
      component: require('@/pages/Shop').default,
      meta: {
        keepAlive: true
      }
    },
    {
      path: '/ticket',
      name: 'ticket-page',
      component: require('@/pages/Ticket').default,
      meta: {
        keepAlive: true
      }
    },
    {
      path: '/ticket-chat',
      name: 'ticket-chat-page',
      component: require('@/pages/TicketChat').default
    },
    {
      path: '/extra-setting',
      name: 'extra-setting-page',
      component: require('@/pages/ExtraSetting').default,
      meta: {
        keepAlive: true
      }
    },
    {
      path: '*',
      redirect: '/home'
    }
  ],
  saveScrollPosition: true
});


const originalPush = Router.prototype.push
Router.prototype.push = function push(location) {
  return originalPush.call(this, location).catch(err => err)
}
