# Contexte projet

<!-- Une ligne : ce que fait ce projet et qui l'utilise.
     Devs et agents s'en servent pour cadrer reviews et explications. -->
{ex. : Outils de gestion financière personnel.}

## Type projet

<!-- Pilote l'installation partielle via --target.
     backend = shared+backend ; frontend = shared+frontend ; fullstack = tout. -->
- Type : {backend | frontend | fullstack}

## Stack

<!-- Tout ce qu'un agent doit connaître pour adapter sa sortie : langage,
     frameworks, base, librairies de test. Supprimer les lignes inutiles. -->
- Backend : {langage / framework + version — ex. : C# / .NET 10}
- Frontend : {framework + version — ex. : Angular 21, ou « aucun »}
- Base de données : {moteur — ex. : PostgresSql} / {ORM — ex. : EF Core 9}
- Tests : {frameworks — ex. : XUnit + Moq + Shoudly}

## Profil domaine

<!-- LE champ clé : pilote la gradation DDD (skillkit/guidelines/ddd.md).
     « simple » = CRUD/référentiel, entités simples, pas d'aggregate.
     « riche »  = aggregates, Value Objects, Result<T>, domain events.
     Déclinable par module/microservice si le profil n'est pas uniforme. -->
- Profil par défaut : {simple | riche}
- Par module (si différent) :
  - {ex. : Orders → riche}
  - {ex. : Referentials → simple}

## Outil SDD

<!-- Conventions de spec-driven development utilisées (voir specs/README.md). -->
- Outil : {conventions du kit | OpenSpec | spec-kit | BMAD}

## Gestion des erreurs

<!-- Comment les erreurs sont représentées et propagées. -->
- Pattern : {ex. : Result<T>, exceptions, ProblemDetails RFC 7807}
- Conventions : {ex. : Error.NotFound / Error.Validation / Error.Conflict}

## Conventions

<!-- Règles de nommage, stratégie d'ID, habitudes d'équipe qui dévient
     des défauts du framework. Ne lister que ce qui surprendrait un nouveau. -->
- Nommage : {ex. : tables SQL en snake_case, commands/queries en PascalCase}
- IDs : {ex. : Guid généré côté domaine / auto-incrément côté base}
- Classes : {ex. : handlers toujours internal sealed, pas de helper statique public}
- Autre : {ex. : pas d'AutoMapper — on utilise Mapster}

## Chemins

<!-- Où vivent les couches, relativement à la racine du repo. -->
- Domaine / Application : {ex. : src/MyApp.Domain}
- Infrastructure : {ex. : src/MyApp.Infrastructure}
- API / point d'entrée : {ex. : src/MyApp.Api}
- Tests : {ex. : src/MyApp.Tests}

## Notes d'équipe

<!-- Tout ce qui surprendrait un dev qui découvre la codebase : choix de
     librairies non évidents, contraintes, patterns à imposer ou éviter.
     Chaque puce est une consigne permanente appliquée sans qu'on la rappelle. -->
- {ex. : toujours injecter les dépendances — jamais de classe utilitaire statique}
- {ex. : les validators FluentValidation sont toujours internal sealed}
- {ex. : InternalsVisibleTo est configuré dans chaque .csproj pour les tests}
