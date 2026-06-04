<!-- RÉFÉRENCE D'AUTHORING — pas un skill exécutable, jamais chargé en session.
     Copier les sections ci-dessous telles quelles dans le corps de chaque skill de review.
     Ce fichier sert uniquement à garder les formats synchronisés à l'écriture. -->

# Format de sortie des reviews

Format standard pour tous les skills de review. Inclus statiquement à l'authoring —
chaque skill de review embarque sa propre copie de ce contenu.

---

## Niveaux de sévérité

| Niveau | Libellé | Quand l'utiliser |
|---|---|---|
| 🔴 | Critique | À corriger absolument — bug d'exactitude, sécurité, risque de perte de données |
| 🟠 | Majeur | À corriger — problème significatif de design ou de maintenabilité |
| 🟡 | Mineur | Faible impact — nommage, style, petite amélioration structurelle |
| 🟢 | Suggestion | Optionnel — idée de refactor ou piste future |

---

## Bloc par constat

Utiliser ce format pour chaque constat :

```
{🔴|🟠|🟡|🟢} **{Titre court}**
Localisation : `{fichier:ligne — ou composant / fonction}`
Problème : {ce qui ne va pas et pourquoi c'est important}
Correction : {suggestion concrète et actionnable}
```

**Règles :**
- Un bloc par constat — ne pas regrouper des problèmes sans rapport.
- `Localisation` omissible si le problème est structurel (pas de ligne unique).
- `Correction` actionnable — jamais « envisager d'améliorer » ou « penser à refactorer ».

---

## Synthèse finale obligatoire

Chaque review se termine par ce bloc exact :

```
---
**Score : {X}/10**

**Top 3 à corriger :**
1. {constat le plus impactant — une ligne}
2. {deuxième — une ligne}
3. {troisième — une ligne}

**Ce qui fonctionne bien :**
- {point fort réel — jamais omis, même pour un fichier faible}
```

**Règles :**
- Le score reflète la santé globale du code, pas le nombre de constats.
- Le top 3 reprend des constats déjà listés — pas de nouveau problème ici.
- « Ce qui fonctionne bien » est obligatoire. À défaut de point fort, noter ce qui
  est au moins correct.
