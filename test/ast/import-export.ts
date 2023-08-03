// import from
import { A } from './xxx' // ImportDeclaration - ImportSpecifier
import A from './xxx' // ImportDeclaration - ImportDefaultSpecifier
import * as A from './xxx' // ImportDeclaration - ImportNamespaceSpecifier
import './xxx' // ImportDeclaration , has no specifiers
import A = require('./xxx') // TsImportEqualsDeclaration

// export from
export { ass } from './xxx3' // ExportNamedDeclaration - ExportSpecifier
export { ass as A } from './xxx3' // ExportNamedDeclaration - ExportSpecifier
export * as xxx from './xxx2' // ExportNamedDeclaration - ExportNamespaceSpecifier
export * from './xxx1' // ExportAllDeclaration

// Statements with interference
const c = ''
export { c } // ExportNamedDeclaration , source === null
export const m = 1 // ExportDeclaration - VariableDeclaration

// some import might be scss or img
import styles from './index.scss'
import pic from './a.png'
