# MOBIUS

make find all circular dependency in typescript easy

# usage

## cli

```
npm i -g @mobius/mobius
```

```
mobius run [my-project-dir-path] -t [my-project-tsconfig.json-path]
```

e.g

```
mobius run my-project-dir -t my-project-dir/tsconfig.json
```

## module

```
npm i @mobius/mobius
```

```ts
import mobius from '@mobius/mobius'

const main = async()=>{
  const circleList = await mobius({
    tsConfigPath: 'tsConfigPath'
    projectDir: 'projectDirPath'
    threadNum: 6 // make run with multiple thread，if your project is huge , default value is 4
  })
}
```
