import Keycloak from 'keycloak-js';

const keycloak = new Keycloak({
  clientId: 'peopleportal-frontend',
  realm: 'peopleportal',
  url: import.meta.env.VITE_KEYCLOAK_URL || 'http://localhost:30080'
});

export default keycloak;
