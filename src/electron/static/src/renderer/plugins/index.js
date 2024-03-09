const cps = require.context('.', false, /\.vue$/);

export default {
  install: function (Vue, { store, i18n }) {
    cps.keys().forEach((key) => {
      const name = key.replace(/(\.\/|\.vue)/g, '');
      const constructor = Vue.extend({ ...cps(key).default, store, i18n });
      const ViewDom = new constructor();
      const tpl = ViewDom.$mount().$el;
      document.body.appendChild(tpl);
      Vue.prototype[`\$${name}`] = ViewDom.show;
    });
  },
};
