//export {GET, POST} from '@/lib/next-auth/next-auth'
import {toNextJsHandler} from 'better-auth/next-js'

import {auth} from '@/lib/better-auth/auth'
export const {POST, GET} = toNextJsHandler(auth)
