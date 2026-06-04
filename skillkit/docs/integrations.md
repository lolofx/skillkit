# Intégrations recommandées

| Intégration | Type | Apport | Setup |
|---|---|---|---|
| **RTK** ([rtk-ai/rtk](https://github.com/rtk-ai/rtk)) | Binaire Rust + hook global | −60 à −90 % de tokens sur bash/builds/tests (proxy qui compresse les sorties) | `rtk init --global` — une fois par machine, recommandé dans le quickstart |
| **context7** | MCP (`.mcp.json` livré) | Documentation à jour des librairies, évite les API hallucinées | Pré-configuré (`npx -y @upstash/context7-mcp`) — supprimer l'entrée de `.mcp.json` pour le désactiver |
| **Milan Jovanović .NET** | Skill externe (mcpmarket) | Bonnes pratiques clean architecture .NET | Voir ci-dessous |

## RTK

- Installation machine (pas par projet) : suivre le README du repo, puis `rtk init --global`.
- Vérifier après installation que la sortie de `dotnet test` est bien couverte par
  le proxy ; sinon, exclure cette commande de RTK pour que le hook `track-tests`
  reçoive la sortie complète.

## context7

- Livré pré-configuré dans `.mcp.json` à la racine.
- Usage type : demander la doc d'une librairie avant d'écrire du code qui s'en sert
  (« use context7 » dans le prompt si l'outil ne le déclenche pas seul).
- Nécessite Node.js (npx) sur le poste.

## Skill Milan Jovanović (.NET / clean architecture)

- Source : mcpmarket — skill de bonnes pratiques .NET alignées clean architecture.
- ⚠️ Le mécanisme exact d'installation (MCP vs copie de skill) est à vérifier au moment de l'installation — documenter ici la procédure retenue une fois validée.
- Complémentaire de `skillkit/guidelines/architecture.md` : nos guidelines priment en cas de divergence.
([Milan Jovanović .NET Skills](https://mcpmarket.com/tools/skills/milan-jovanovic-net-blog))
