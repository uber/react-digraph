const SERVER_TYPE = 'servers';
const ENDPOINT_TYPE = 'endpoints';
const CUSTOM_TYPE = 'custom';
const SERVER_URL_MACROS = {
  [SERVER_TYPE]: ['interview', 'mlab', 'motion'],
  [ENDPOINT_TYPE]: {
    interview: ['invitations'],
    mlab: ['save_experience'],
    motion: ['messageBot'],
  },
};
const ENDPOINTS = Object.keys(SERVER_URL_MACROS[ENDPOINT_TYPE])
  .map(server => `${server}.${SERVER_URL_MACROS[ENDPOINT_TYPE][server]}`)
  .flat();
const URL_TYPES_DEFAULTS = {
  [ENDPOINT_TYPE]: `{{${ENDPOINTS[0]}}}`,
  [SERVER_TYPE]: `{{${SERVER_URL_MACROS[SERVER_TYPE][0]}}}/`,
  [CUSTOM_TYPE]: '',
};
const UNSUPPORTED_TYPES = [SERVER_TYPE]; // currently unsupported. Just need to add editor support.
const URL_TYPES = Object.keys(URL_TYPES_DEFAULTS).filter(
  t => !UNSUPPORTED_TYPES.includes(t)
);

export {
  SERVER_TYPE,
  ENDPOINT_TYPE,
  CUSTOM_TYPE,
  SERVER_URL_MACROS,
  ENDPOINTS,
  URL_TYPES_DEFAULTS,
  URL_TYPES,
};
