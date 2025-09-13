# FreeRADIUS REST integration templates

This folder contains example configuration snippets to route FreeRADIUS Auth/Acct to your billing app via HTTP (rlm_rest) and to define NAS clients.

Files:
- sites-enabled/default-rest-example: Example `authorize`, `accounting`, `post-auth` sections calling REST
- mods-available/rest: Example REST module pointing to your backend endpoints
- clients.conf.example: Example NAS client entry for MikroTik

Notes:
- Adjust URLs, secrets, and IP addresses as appropriate.
- Enable the rest module and include it in `sites-enabled/default`.
- Ensure your backend is reachable by the RADIUS server.
