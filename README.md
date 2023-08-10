# MOBIUS

make find all circular dependency in typescript easy

support:

- now only support typescript witch use import instead of require()
- typescript alias
- auto ignore typescript import type

# usage

## cli

### install

```shell
npm i -g @yukinotech/mobius
```

### find circular dependency

```shell
mobius run [my-project-dir-path] -t [my-project-tsconfig.json-path]
```

e.g

```shell
cd my-project //  my-project is a typescript project
mobius run ./ -t ./tsconfig.json -m typescript
```

### get help from cli

```shell
mobius help [command]
```

e.g

```shell
=> mobius help run

Usage: mobius run [options] <codeDirPath>

Run a script

Options:
  -d, --debug                    Enable debugging
  -e, --exclude <exclude files>  exclude file
  -t, --tsConfigPath <path>      Path to tsconfig.json
  -m, --mode <mode type>         mode type "typescript"|"commonjs"|"esm"
  -s, --thread <threads>         thread number
  -h, --help                     display help for command
```

### some tips for using cli

#### mixed project

In most projects, apart from the source code, there are many non-source code components, such as tests.

Here is an example: `./src` contains `TypeScript` code and `./test` contains `commonjs` code.

```
my-node-project/
│
├─ src/
│  ├─ index.ts
│  ├─ utils/
│  │  ├─ helper.ts
│  │  └─ constants.ts
│  └─ routes/
│     ├─ api.ts
│     └─ web.ts
│
├─ test/
│  ├─ unit/
│  │  ├─ test-helper.js
│  │  └─ index.test.js
│  └─ integration/
│     ├─ api.test.js
│     └─ web.test.js
│
├─ package.json
├─ tsconfig.json
├─ README.md
└─ .gitignore
```

Usually, we just want to check whether there are circular dependencies in the source code

In reference to the example above: it is preferable to set &lt;codeDirPath&gt; as `./my-node-project/src`, if you just want to check only within the source code. And since `./src` contains `TypeScript` code. You can use cli like this:

```shell
cd my-node-project
mobius run ./src -t ./tsconfig.json -m typescript
```

Just run for src can be more faster.

And for `./test`，if you also want to to check whether there are circular dependencies in it,just run

```shell
cd my-node-project
mobius run ./test -m commonjs
```

If the -m parameter is not provided like just use `mobius run ./` in project like this, the program might produce confusing results.

#### for typescript

##### why tsconfig.json is import

Q: why need a tsconfig.json?
A: because typescript may have alias for path just like

tsconfig.json

```json
"paths": {
  "components/*": ["components/*"]
}
```

According to the tsconfig.json, the program can determine that the actual path of `@components/bridge` is `project-path/components/bridge`

```ts
import bridge from '@components/bridge'
```

##### How to avoid circular dependency interference caused by having only type files

A file which only import and export `type` and `interface` can be ignored in a circular dependency loop

You can use import type to ignore just like

```ts
import type { Locale } from './locale/interface'
```

instead of

```ts
import { Locale } from './locale/interface'
```

mobius will ignore files that are only imported for type definitions

Perhaps mobius might support automatic inference in the future, but this could significantly increase the program's overhead.

Another way to ignore is to add ignore file with `-e` to exclude files.

```ts
mobius run ./ -t tsconfig.json -e ./src/interface.ts,./src/components/interface.ts
```

## module

```shell
npm i @yukinotech/mobius
```

```ts
import mobius from '@yukinotech/mobius'

const main = async() => {
  const circleList = await mobius({
    tsConfigPath: '/Users/xxxx/workspace/project-name/tsconfig.json'
    projectDir: '/Users/xxxx/workspace/project-name'
    threadNum: 6 // make run with multiple thread
    mode: 'typescript',
    exclude: ['/Users/xxxx/workspace/project-name/test','/Users/xxxx/workspace/project-name/script']
  })
}
```

# RoadMap

- optimizing CLI interaction
- auto find and analysis tsconfig
- support nodejs esm
- -e support glob token
