# package.json patch

Add this line to the `scripts` section in the root package.json:

```json
"validate:registry": "tsx --env-file=.env scripts/validate-registry.ts",
"validate:registry:verbose": "tsx --env-file=.env scripts/validate-registry.ts --verbose",
"validate:registry:fix": "tsx --env-file=.env scripts/validate-registry.ts --verbose --fix-hints"
```

Full scripts block after patch:

```json
"scripts": {
  "build":                    "turbo build",
  "dev":                      "turbo dev",
  "lint":                     "turbo lint",
  "type-check":               "turbo type-check",
  "clean":                    "turbo clean",
  "example":                  "tsx --env-file=.env examples/basic-usage.ts",
  "validate:registry":        "tsx --env-file=.env scripts/validate-registry.ts",
  "validate:registry:verbose":"tsx --env-file=.env scripts/validate-registry.ts --verbose",
  "validate:registry:fix":    "tsx --env-file=.env scripts/validate-registry.ts --verbose --fix-hints"
}
```
