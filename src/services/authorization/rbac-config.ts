import {AccessControl} from 'accesscontrol'

import {Roles} from '../types/domain/user-types'

export enum GrantActionEnum {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
}
export enum ResourceEnum {
  USERS = 'users',
  SUBSCRIPTIONS = 'subscriptions',
  TECHNICAL = 'technical',
  LOG = 'log',
}
export type Grant = {
  role: Roles
  resource:
    | ResourceEnum.USERS
    | ResourceEnum.SUBSCRIPTIONS
    | ResourceEnum.TECHNICAL
    | ResourceEnum.LOG
  action: `${GrantActionEnum}:${'own' | 'any'}`
  attributes: string
}

const grantAdminList = [
  //user
  {
    role: 'admin',
    resource: ResourceEnum.USERS,
    action: 'create:any',
    attributes: '*',
  },
  {
    role: 'admin',
    resource: ResourceEnum.USERS,
    action: 'read:any',
    attributes: '*',
  },
  {
    role: 'admin',
    resource: ResourceEnum.USERS,
    action: 'update:any',
    attributes: '*',
  },
  {
    role: 'admin',
    resource: ResourceEnum.USERS,
    action: 'delete:any',
    attributes: '*',
  },

  {
    role: 'admin',
    resource: ResourceEnum.SUBSCRIPTIONS,
    action: 'create:any',
    attributes: '*',
  },
  {
    role: 'admin',
    resource: ResourceEnum.SUBSCRIPTIONS,
    action: 'read:any',
    attributes: '*',
  },
  {
    role: 'admin',
    resource: ResourceEnum.SUBSCRIPTIONS,
    action: 'update:any',
    attributes: '*',
  },
  {
    role: 'admin',
    resource: ResourceEnum.SUBSCRIPTIONS,
    action: 'delete:any',
    attributes: '*',
  },
  // Technical permissions for admin
  {
    role: 'admin',
    resource: ResourceEnum.TECHNICAL,
    action: 'create:any',
    attributes: '*',
  },
  {
    role: 'admin',
    resource: ResourceEnum.TECHNICAL,
    action: 'read:any',
    attributes: '*',
  },
  {
    role: 'admin',
    resource: ResourceEnum.TECHNICAL,
    action: 'update:any',
    attributes: '*',
  },
  {
    role: 'admin',
    resource: ResourceEnum.TECHNICAL,
    action: 'delete:any',
    attributes: '*',
  },
  // Log permissions for admin
  {
    role: 'admin',
    resource: ResourceEnum.LOG,
    action: 'create:any',
    attributes: '*',
  },
  {
    role: 'admin',
    resource: ResourceEnum.LOG,
    action: 'read:any',
    attributes: '*',
  },
  {
    role: 'admin',
    resource: ResourceEnum.LOG,
    action: 'update:any',
    attributes: '*',
  },
  {
    role: 'admin',
    resource: ResourceEnum.LOG,
    action: 'delete:any',
    attributes: '*',
  },
] satisfies Grant[]

const grantUserList = [
  // user
  {
    role: 'user',
    resource: ResourceEnum.USERS,
    action: 'read:own',
    attributes: '*,!role',
  },
  {
    role: 'user',
    resource: ResourceEnum.USERS,
    action: 'read:any',
    attributes: '!role',
  },
  {
    role: 'user',
    resource: ResourceEnum.USERS,
    action: 'update:own',
    attributes: '*,!role',
  },

  {
    role: 'user',
    resource: ResourceEnum.SUBSCRIPTIONS,
    action: 'read:own',
    attributes: '*',
  },
  {
    role: 'user',
    resource: ResourceEnum.SUBSCRIPTIONS,
    action: 'update:own',
    attributes: '*',
  },
] satisfies Grant[]

const grantRedactorList = [
  //posts
] satisfies Grant[]

const grantModeratorList = [
  //posts
] satisfies Grant[]

const grantPublicList = [
  {
    role: 'public',
    resource: ResourceEnum.LOG,
    action: 'read:any',
    attributes: ['id', 'name'],
  },
]
const ac = new AccessControl([
  ...grantAdminList,
  ...grantUserList,
  ...grantPublicList,
  ...grantRedactorList,
  ...grantModeratorList,
])

export default ac
