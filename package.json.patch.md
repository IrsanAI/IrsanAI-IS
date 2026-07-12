# Root package.json -- add test scripts to "scripts":

"test":          "turbo test",
"test:coverage": "turbo test:coverage"

# Also add to turbo.json "tasks":
# "test": { "dependsOn": ["^build"], "cache": false }
