# Architecture — le socle

> **Quand charger ce fichier :** dès qu'on crée, déplace ou réorganise du code backend
> (nouveau module, nouveau use case, nouveau projet, refactor de structure).
>
> Ce socle est **obligatoire pour tout microservice**, quel que soit son profil domaine.
> La gradation DDD (aggregates, Value Objects, etc.) est décrite à part : `skillkit/guidelines/ddd.md`.

## 1. Hexagonal par les dépendances, pas par les dossiers

L'architecture hexagonale est une **règle de dépendance**, pas une arborescence :

```
Domain  ←  Application  ←  Infrastructure
                        ←  Api
```

- **Domain** : logique métier pure. Zéro dépendance technique — pas d'ORM, pas de client
  HTTP, pas de framework. C'est le centre de l'hexagone.
- **Application** : cas d'usage (commands, queries, handlers). Orchestre le domaine,
  dépend du domaine uniquement.
- **Infrastructure** : implémentations techniques (persistence, services externes).
  Dépend du domaine et de l'application — jamais l'inverse.
- **Api** : point d'entrée (endpoints HTTP, messaging…). Dispatch vers l'application,
  zéro logique métier.

Les **ports** (interfaces, ex. `IOrderRepository`) sont définis **côté domaine**,
implémentés **côté infrastructure**. Le domaine dit ce dont il a besoin ;
l'infrastructure fournit.

> Domain et Application peuvent vivre dans un seul projet ou deux — `PROJECT.md` le précise.
> Ce qui compte, c'est le **sens des dépendances**, jamais le nombre de `.csproj`.

## 2. Découpage MÉTIER / USE CASE — jamais technique

**Interdit** : organiser le code par rôle technique. Pas de dossier `Ports/`, `Adapters/`,
`Services/`, `Interfaces/`, `Helpers/` à la racine d'un module.

**Obligatoire** : organiser par **module métier**, puis par **use case**.
Cette règle est identique en clean architecture ou en hexa — c'est le même socle.

```
❌ INTERDIT                          ✅ ATTENDU
src/                                 src/
  Ports/                               Orders/
    IOrderRepository.cs                  Domain/
    IInvoiceRepository.cs                Persistence/      ← IOrderRepository
  Adapters/                              UseCases/
    OrderRepository.cs                     CreateOrder/    ← Command + Handler + Validator
  Services/                                ConfirmOrder/
    OrderService.cs                        GetOrder/       ← Query + Handler
                                         Invoicing/
                                           ...
```

Question test : « où vit la règle métier X ? » → la réponse doit être un **dossier métier**
(`Orders/Domain/`), jamais un dossier technique (`Services/`).

## 3. Structure de référence d'un module

À adapter aux chemins déclarés dans `PROJECT.md`. Structure générique :

```
{App}.Domain/                    ← domaine + application (ajuster si séparés)
  {Module}/
    Domain/                      ← logique métier (contenu selon profil — voir ddd.md)
    Models/                      ← DTOs de sortie
    Persistence/                 ← interfaces I{X}Repository (zéro dépendance ORM)
    UseCases/
      Create{X}/                 ← Command + Handler + Validator
      Get{X}/                    ← Query + Handler
    Mappings/                    ← configuration de mapping

{App}.Infrastructure/
  {Module}/
    Entities/                    ← entités ORM (distinctes du domaine — voir ddd.md)
    Configuration/               ← mapping tables/colonnes, index
    Mappings/                    ← extensions de conversion
    {X}Repository.cs             ← implémentation du port

{App}.Api/
  {Module}/
    ConfigureModule.cs           ← enregistrement du module + groupes de routes
    {X}Endpoints.cs

{App}.Tests/
  {Module}/                      ← miroir de la structure use case
```

## 4. Flux typique d'une requête

1. **Api** reçoit la requête → construit un Command/Query → dispatch (mediator ou équivalent).
2. **Handler** (Application) orchestre : charge via le port, appelle le domaine, persiste.
3. **Domaine** applique les règles métier (selon le profil — voir `skillkit/guidelines/ddd.md`).
4. **Infrastructure** implémente le port : conversion ORM, accès DB, services externes.
5. Le résultat remonte (`Result<T>` ou équivalent projet) → l'Api le convertit en réponse HTTP.

Jamais de raccourci : un endpoint n'appelle pas un repository directement,
un handler ne porte pas de logique HTTP, un repository ne porte pas de règle métier.

## 5. Checklist socle (toujours vérifiée, quel que soit le profil)

- [ ] Le domaine n'importe aucune dépendance technique (ORM, HTTP, framework).
- [ ] Les dépendances vont vers le domaine, jamais depuis le domaine.
- [ ] Les ports sont définis côté domaine, implémentés côté infrastructure.
- [ ] Le découpage est métier/use case — aucun dossier technique à la racine d'un module.
- [ ] Un handler = une action métier précise.
- [ ] Zéro logique métier dans les endpoints et les repositories.
- [ ] Les tests unitaires du domaine et des handlers tournent sans infrastructure.
