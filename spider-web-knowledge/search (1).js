// Controle de permissões dos agentes. Um agente nunca tem acesso irrestrito por padrão.
export const PERMISSIONS = ['READ', 'SEARCH', 'LINK', 'WRITE', 'DELETE', 'EXECUTE', 'ADMIN'];

export const PROFILES = {
  observer: ['READ', 'SEARCH'],
  researcher: ['READ', 'SEARCH', 'LINK'],
  editor: ['READ', 'SEARCH', 'LINK', 'WRITE'],
  administrator: ['READ', 'SEARCH', 'LINK', 'WRITE', 'DELETE', 'EXECUTE'],
};

export const can = (profile, perm) => (PROFILES[profile] || []).includes(perm);
