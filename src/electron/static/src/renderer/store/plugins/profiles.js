export default function () {
  return (store) => {
    store.subscribe((mutation) => {
      const types = [
        'CHANGE_PROFILES',
        'CHANGE_PROFILES_INDEX',
        'CHANGE_PROFILE',
        'APPEND_PROFILE',
        'DELETE_PROFILE',
      ];
      if (types.includes(mutation.type)) {
        store.commit('SAVE_PROFILES');
      }
    });
  };
}
