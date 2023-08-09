# MOBIUS

make find all circular dependency in typescript easy

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
mobius run ./ -t ./tsconfig.json
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
  -t, --tsConfigPath <path>  Path to tsconfig.json
  -d, --debug                Enable debugging
  -s, --thread <threads>     thread number
  -h, --help                 display help for command
```

## module

```shell
npm i @yukinotech/mobius
```

```ts
import mobius from '@yukinotech/mobius'

const main = async()=>{
  const circleList = await mobius({
    tsConfigPath: '/Users/xxxx/workspace/project-name/tsconfig.json'
    projectDir: '/Users/xxxx/workspace/project-name'
    threadNum: 6 // make run with multiple thread
  })
}
```

# RoadMap

- optimizing CLI interaction
- auto find and analysis tsconfig
- support nodejs commonjs and esm
