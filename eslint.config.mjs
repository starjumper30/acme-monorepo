import nx from '@nx/eslint-plugin';

export default [
  ...nx.configs['flat/base'],
  ...nx.configs['flat/typescript'],
  ...nx.configs['flat/javascript'],
  {
    ignores: ['**/dist', '**/out-tsc'],
  },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    rules: {
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: true,
          allow: ['^.*/eslint(\\.base)?\\.config\\.[cm]?[jt]s$'],
          depConstraints: [
            {
              sourceTag: '*',
              onlyDependOnLibsWithTags: ['*'],
            },
            {
              sourceTag: 'type:util',
              onlyDependOnLibsWithTags: ['type:util'],
            },
            {
              sourceTag: 'type:ui',
              onlyDependOnLibsWithTags: ['type:ui', 'type:util'],
            },
            {
              sourceTag: 'type:frontend-data-access',
              onlyDependOnLibsWithTags: [
                'type:frontend-data-access',
                'type:util',
              ],
            },
            {
              sourceTag: 'type:frontend-feature',
              onlyDependOnLibsWithTags: [
                'type:frontend-feature',
                'type:frontend-data-access',
                'type:ui',
                'type:util',
              ],
            },
            {
              sourceTag: 'type:backend-data-access',
              onlyDependOnLibsWithTags: [
                'type:backend-data-access',
                'type:util',
              ],
            },
            {
              sourceTag: 'type:backend-feature',
              onlyDependOnLibsWithTags: [
                'type:backend-feature',
                'type:backend-data-access',
                'type:util',
              ],
            },
            {
              sourceTag: 'scope:shared',
              onlyDependOnLibsWithTags: ['scope:shared'],
            },
            {
              sourceTag: 'scope:movies',
              onlyDependOnLibsWithTags: ['scope:movies', 'scope:shared'],
            },
          ],
        },
      ],
    },
  },
];
