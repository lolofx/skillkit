# Guidelines Angular

> **Quand charger ce fichier :** dès qu'on écrit ou modifie du code TypeScript/HTML Angular.

## 1. Signals — l'état réactif local

- **`signal<T>(valeur)`** pour tout état local mutable. Jamais `BehaviorSubject` pour de l'état synchrone.
- **`computed()`** pour toute valeur dérivée d'un ou plusieurs signaux. Pas d'appels de méthode dans les templates.
- **`effect()`** uniquement pour les effets de bord imperatives (analytics, intégrations DOM tierces).
  Un effet pour synchroniser deux signaux = conception incorrecte — utiliser `linkedSignal()`.
- **`toSignal(observable$)`** pour convertir un Observable en signal dans un composant.
  `takeUntilDestroyed()` si l'on conserve `subscribe()` dans un service.

```typescript
// ✅ Correct
readonly count = signal(0);
readonly doubled = computed(() => this.count() * 2);

// ❌ À éviter
count$ = new BehaviorSubject(0);
doubled$ = this.count$.pipe(map(c => c * 2));
```

## 2. Composants — architecture

- **Standalone obligatoire** : pas de `@NgModule`. Importer uniquement les dépendances utilisées dans le template.
- **`ChangeDetectionStrategy.OnPush`** sur chaque composant sans exception.
- **`inject()`** au lieu de l'injection par constructeur (moins verbeux, compatible avec les fonctions utilitaires).
- **`host: {}`** dans `@Component` au lieu de `@HostBinding` / `@HostListener`.

```typescript
@Component({
  selector: 'app-user',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink],
  template: `...`,
  host: { class: 'block' },
})
export class UserComponent {
  private userService = inject(UserService);
  readonly user = toSignal(this.userService.user$);
}
```

## 3. API modernes — entrées/sorties/two-way

- `input<T>()` / `input.required<T>()` au lieu de `@Input()`.
- `output<T>()` au lieu de `@Output()` + `EventEmitter`.
- `model<T>()` pour le two-way binding au lieu du couple `@Input()` + `@Output()`.

```typescript
// ✅ Correct
readonly value = input.required<string>();
readonly changed = output<string>();
readonly selected = model<boolean>(false);

// ❌ Obsolète
@Input() value!: string;
@Output() changed = new EventEmitter<string>();
```

## 4. Template — syntaxe de flux de contrôle

- `@if` / `@else` au lieu de `*ngIf`.
- `@for (item of items; track item.id)` au lieu de `*ngFor`. Le `track` doit discriminer par identifiant, pas `$index`.
- `@switch` au lieu de `*ngSwitch`.
- `@defer` pour les sections lourdes chargées hors du viewport.

```html
<!-- ✅ Correct -->
@if (user()) {
  <p>{{ user()!.name }}</p>
} @else {
  <p>Chargement…</p>
}

@for (item of items(); track item.id) {
  <app-item [item]="item" />
}

@defer (on viewport) {
  <app-heavy-chart />
}
```

## 5. Architecture composants — règle de séparation

Deux types de composants distincts :

| Type | Responsabilité | Injecte des services ? |
|---|---|---|
| **Smart** (container) | Orchestre l'état, appelle les services | ✅ Oui |
| **Presentational** | Affiche des données, émet des événements | ❌ Non |

Un composant qui fait les deux doit être découpé. Les composants presentational vivent dans `components/`,
les smart dans `pages/` ou `features/`.

## 6. Images

Toujours utiliser `NgOptimizedImage` pour les images statiques :

```html
<img ngSrc="photo.jpg" width="400" height="300" alt="Photo" priority />
```

## 7. Qualité TypeScript

- Pas de `any` explicite ni implicite — activer `noImplicitAny` dans `tsconfig.json`.
- Types union littéraux de préférence aux `string` génériques pour les valeurs contraintes.
- L'assertion non-null (`!`) doit toujours être accompagnée d'un commentaire.
- Interfaces pour tous les DTOs et modèles de domaine (pas d'objets anonymes).
- Éviter `?.` quand le type devrait être non-nullable — c'est souvent un problème de conception.
